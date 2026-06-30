'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  useReactFlow,
  type Node,
  type Edge,
  type NodeTypes,
  BackgroundVariant,
  MarkerType,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { Search, RefreshCw, Layers, SlidersHorizontal, X } from 'lucide-react';
import { ZikronGraphNode, NODE_TYPE_CONFIG, type ZikronNodeData } from './GraphNode';
import { GraphFilters } from './GraphFilters';
import { GraphDetailDrawer } from './GraphDetailDrawer';
import {
  useGraph,
  type GraphNode as GNode,
  type GraphNodeType,
  type GraphEdgeType,
} from '@/hooks/queries/use-graph';

const nodeTypes: NodeTypes = { zikron: ZikronGraphNode };

const ALL_NODE_TYPES: GraphNodeType[] = ['note', 'inbox', 'list', 'reminder', 'collection', 'contact', 'tag'];
const ALL_EDGE_TYPES: GraphEdgeType[] = ['link', 'collection', 'tag'];

const EDGE_COLORS: Record<GraphEdgeType, string> = {
  link:       '#6366f1',
  collection: '#a855f7',
  tag:        '#f43f5e',
};

// ── Layout ────────────────────────────────────────────────────────────────────
// Cluster-grid: each node type gets its own region on a grid, nodes within a
// cluster are arranged in a tight grid. Much better than concentric rings —
// same-type nodes stay together, edges between types are shorter on average.

const NODE_W = 190;  // approximate rendered node width
const NODE_H = 36;   // approximate rendered node height
const COL_GAP = 30;  // horizontal gap between nodes in a cluster
const ROW_GAP = 20;  // vertical gap between nodes in a cluster
const CLUSTER_GAP = 120; // space between cluster bounding boxes

function computeLayout(nodes: GNode[]): Record<string, { x: number; y: number }> {
  // Group by type, preserve ALL_NODE_TYPES order
  const byType = new Map<GraphNodeType, GNode[]>();
  for (const t of ALL_NODE_TYPES) byType.set(t, []);
  for (const n of nodes) byType.get(n.nodeType)?.push(n);

  // For each type, compute a tight grid layout and the bounding-box size
  type Cluster = { nodes: GNode[]; cols: number; rows: number; w: number; h: number };
  const clusters: Cluster[] = [];

  for (const t of ALL_NODE_TYPES) {
    const ring = byType.get(t)!;
    if (ring.length === 0) continue;
    const cols = Math.max(1, Math.ceil(Math.sqrt(ring.length * 1.6)));
    const rows = Math.ceil(ring.length / cols);
    const w = cols * (NODE_W + COL_GAP) - COL_GAP;
    const h = rows * (NODE_H + ROW_GAP) - ROW_GAP;
    clusters.push({ nodes: ring, cols, rows, w, h });
  }

  // Place clusters in a grid of cluster columns
  const clusterCols = Math.ceil(Math.sqrt(clusters.length));
  let curX = 0;
  let curY = 0;
  let rowMaxH = 0;
  const clusterOrigins: { x: number; y: number }[] = [];

  clusters.forEach((cl, i) => {
    if (i > 0 && i % clusterCols === 0) {
      curX = 0;
      curY += rowMaxH + CLUSTER_GAP;
      rowMaxH = 0;
    }
    clusterOrigins.push({ x: curX, y: curY });
    curX += cl.w + CLUSTER_GAP;
    rowMaxH = Math.max(rowMaxH, cl.h);
  });

  // Center the whole layout at origin
  const totalW = clusterOrigins.reduce((mx, o, i) => Math.max(mx, o.x + clusters[i].w), 0);
  const totalH = curY + rowMaxH;
  const offsetX = -totalW / 2;
  const offsetY = -totalH / 2;

  const positions: Record<string, { x: number; y: number }> = {};

  clusters.forEach((cl, ci) => {
    const ox = clusterOrigins[ci].x + offsetX;
    const oy = clusterOrigins[ci].y + offsetY;
    cl.nodes.forEach((node, i) => {
      const col = i % cl.cols;
      const row = Math.floor(i / cl.cols);
      positions[node.id] = {
        x: ox + col * (NODE_W + COL_GAP),
        y: oy + row * (NODE_H + ROW_GAP),
      };
    });
  });

  return positions;
}

// ── Builders ──────────────────────────────────────────────────────────────────

function buildRFNodes(
  gnodes: GNode[],
  positions: Record<string, { x: number; y: number }>,
  highlighted: Set<string> | null,
): Node[] {
  return gnodes.map(n => ({
    id: n.id,
    type: 'zikron',
    position: positions[n.id] ?? { x: 0, y: 0 },
    data: {
      label: n.label,
      nodeType: n.nodeType,
      is_favorite: n.data.is_favorite,
      highlighted: highlighted ? highlighted.has(n.id) : false,
      dimmed: highlighted ? !highlighted.has(n.id) : false,
      ...n.data,
    } as ZikronNodeData,
  }));
}

function buildRFEdges(gedges: { id: string; source: string; target: string; edgeType: GraphEdgeType }[], activeEdgeTypes: GraphEdgeType[]): Edge[] {
  return gedges
    .filter(e => activeEdgeTypes.includes(e.edgeType))
    .map(e => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'smoothstep',
      animated: e.edgeType === 'link',
      style: {
        stroke: EDGE_COLORS[e.edgeType],
        strokeWidth: e.edgeType === 'link' ? 2 : 1.5,
        opacity: 0.75,
      },
      markerEnd: e.edgeType === 'link'
        ? { type: MarkerType.ArrowClosed, color: EDGE_COLORS[e.edgeType], width: 10, height: 10 }
        : undefined,
    }));
}

// ── Inner component (needs ReactFlowProvider ancestor) ────────────────────────

function GraphInner({ miniMode }: { miniMode: boolean }) {
  const { setCenter, fitView } = useReactFlow();

  const [activeNodeTypes, setActiveNodeTypes] = useState<GraphNodeType[]>(ALL_NODE_TYPES);
  const [activeEdgeTypes, setActiveEdgeTypes] = useState<GraphEdgeType[]>(ALL_EDGE_TYPES);
  const [showFilters, setShowFilters] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedNode, setSelectedNode] = useState<GNode | null>(null);
  const [highlighted, setHighlighted] = useState<Set<string> | null>(null);

  const filters = useMemo(() => ({
    types: activeNodeTypes.length < ALL_NODE_TYPES.length ? activeNodeTypes : undefined,
    edgeTypes: activeEdgeTypes.length < ALL_EDGE_TYPES.length ? activeEdgeTypes : undefined,
  }), [activeNodeTypes, activeEdgeTypes]);

  const { data: graphData, isLoading, refetch } = useGraph(filters);

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({});

  // Rebuild nodes/edges whenever data or filters change
  useEffect(() => {
    if (!graphData) return;
    const filtered = graphData.nodes.filter(n => activeNodeTypes.includes(n.nodeType));
    const newLayout = computeLayout(filtered);
    // Merge: keep user-dragged positions, compute only new nodes
    for (const id of Object.keys(newLayout)) {
      if (!positionsRef.current[id]) positionsRef.current[id] = newLayout[id];
    }
    setNodes(buildRFNodes(filtered, positionsRef.current, highlighted));
    setEdges(buildRFEdges(graphData.edges, activeEdgeTypes));
  }, [graphData, activeNodeTypes, activeEdgeTypes, highlighted, setNodes, setEdges]);

  // Persist positions after drag
  const onNodeDragStop = useCallback((_evt: unknown, node: Node) => {
    positionsRef.current[node.id] = node.position;
  }, []);

  // Search: highlight + fly to first match
  useEffect(() => {
    if (!graphData || !search.trim()) { setHighlighted(null); return; }
    const q = search.trim().toLowerCase();
    const matched = new Set(graphData.nodes.filter(n => n.label.toLowerCase().includes(q)).map(n => n.id));
    setHighlighted(matched.size > 0 ? matched : null);
    if (matched.size > 0) {
      const pos = positionsRef.current[[...matched][0]];
      if (pos) setTimeout(() => setCenter(pos.x + NODE_W / 2, pos.y + NODE_H / 2, { zoom: 1.4, duration: 500 }), 80);
    }
  }, [search, graphData, setCenter]);

  function toggleNodeType(t: GraphNodeType) {
    setActiveNodeTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }
  function toggleEdgeType(t: GraphEdgeType) {
    setActiveEdgeTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t]);
  }

  function handleNodeClick(_: React.MouseEvent, node: Node) {
    const raw = graphData?.nodes.find(n => n.id === node.id);
    if (!raw) return;
    setSelectedNode(raw);
    const connected = new Set([raw.id, ...( graphData?.edges ?? []).flatMap(e =>
      e.source === raw.id ? [e.target] : e.target === raw.id ? [e.source] : []
    )]);
    setHighlighted(connected);
  }

  function handlePaneClick() {
    setSelectedNode(null);
    setHighlighted(null);
  }

  const neighborCount = useMemo(() => {
    if (!selectedNode || !graphData) return 0;
    return graphData.edges.filter(e => e.source === selectedNode.id || e.target === selectedNode.id).length;
  }, [selectedNode, graphData]);

  function centerOnSelected() {
    if (!selectedNode) return;
    const pos = positionsRef.current[selectedNode.id];
    if (pos) setCenter(pos.x + NODE_W / 2, pos.y + NODE_H / 2, { zoom: 1.4, duration: 500 });
  }

  function highlightNeighbors() {
    if (!selectedNode || !graphData) return;
    const connected = new Set([selectedNode.id, ...graphData.edges.flatMap(e =>
      e.source === selectedNode.id ? [e.target] : e.target === selectedNode.id ? [e.source] : []
    )]);
    setHighlighted(connected);
  }

  // ── Mini mode ──────────────────────────────────────────────────────────────
  if (miniMode) {
    return (
      <div className="w-full h-full">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <RefreshCw size={14} className="animate-spin text-muted-foreground" />
          </div>
        ) : nodes.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-xs text-muted-foreground/50">No connections yet</p>
          </div>
        ) : (
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.3 }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag={false}
            zoomOnScroll={false}
            preventScrolling={false}
            proOptions={{ hideAttribution: true }}
          >
            <Background variant={BackgroundVariant.Dots} gap={20} size={1} color="hsl(0,0%,70%)" />
          </ReactFlow>
        )}
      </div>
    );
  }

  // ── Full mode ──────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-full bg-background">
      {/* ── Floating toolbar ── */}
      <div className="absolute top-3 left-3 right-3 z-20 flex items-center gap-2 pointer-events-none">

        {/* Filter toggle */}
        <button
          type="button"
          onClick={() => setShowFilters(v => !v)}
          title="Filters"
          className={`pointer-events-auto shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-medium shadow-sm transition-colors
            ${showFilters
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:text-foreground'}`}
        >
          <SlidersHorizontal size={13} />
          <span className="hidden sm:inline">Filters</span>
          {(activeNodeTypes.length < ALL_NODE_TYPES.length || activeEdgeTypes.length < ALL_EDGE_TYPES.length) && (
            <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 sm:ml-0.5" />
          )}
        </button>

        {/* Search */}
        <div className="pointer-events-auto flex-1 flex items-center gap-2 bg-card border border-border rounded-xl shadow-sm px-3 py-2">
          <Search size={13} className="text-muted-foreground shrink-0" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search nodes…"
            className="flex-1 text-xs bg-transparent outline-none text-foreground placeholder:text-muted-foreground/50"
          />
          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              aria-label="Clear search"
              className="text-muted-foreground hover:text-foreground"
            >
              <X size={12} />
            </button>
          )}
        </div>

        {/* Refresh */}
        <button
          type="button"
          onClick={() => { positionsRef.current = {}; refetch(); }}
          title="Refresh"
          className="pointer-events-auto shrink-0 p-2 rounded-xl bg-card border border-border shadow-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
        </button>
      </div>

      {/* ── Floating filter panel ── */}
      {showFilters && (
        <GraphFilters
          activeNodeTypes={activeNodeTypes}
          activeEdgeTypes={activeEdgeTypes}
          onNodeTypeToggle={toggleNodeType}
          onEdgeTypeToggle={toggleEdgeType}
          totalNodes={nodes.length}
          totalEdges={edges.length}
          onClose={() => setShowFilters(false)}
        />
      )}

      {/* ── Floating detail drawer ── */}
      {selectedNode && (
        <GraphDetailDrawer
          nodeId={selectedNode.id}
          nodeType={selectedNode.nodeType}
          label={selectedNode.label}
          data={selectedNode.data}
          neighborCount={neighborCount}
          onClose={() => { setSelectedNode(null); setHighlighted(null); }}
          onCenter={centerOnSelected}
          onHighlightNeighbors={highlightNeighbors}
        />
      )}

      {/* ── Loading overlay ── */}
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 pointer-events-none">
          <div className="flex items-center gap-2.5 bg-card border border-border rounded-2xl px-5 py-3 shadow-lg">
            <RefreshCw size={14} className="animate-spin text-primary" />
            <span className="text-sm text-muted-foreground">Building graph…</span>
          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!isLoading && nodes.length === 0 && (
        <div className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none">
          <div className="text-center space-y-2">
            <Layers size={36} className="text-muted-foreground/20 mx-auto" />
            <p className="text-sm font-medium text-muted-foreground">Nothing to show</p>
            <p className="text-xs text-muted-foreground/50 max-w-56 mx-auto">
              Create links between items, add tags, or build collections to start seeing connections.
            </p>
          </div>
        </div>
      )}

      {/* ── ReactFlow canvas — takes full space, overlays above ── */}
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={handleNodeClick}
        onNodeDragStop={onNodeDragStop}
        onPaneClick={handlePaneClick}
        fitView
        fitViewOptions={{ padding: 0.12 }}
        minZoom={0.05}
        maxZoom={2.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={28}
          size={1}
          color="hsl(0,0%,70%)"
          className="opacity-30 dark:opacity-20"
        />
        <Controls
          showInteractive={false}
          className="[&>button]:!bg-card [&>button]:!border-border [&>button]:!text-muted-foreground [&>button:hover]:!text-foreground"
        />
        <MiniMap
          nodeColor={node => NODE_TYPE_CONFIG[(node.data as ZikronNodeData)?.nodeType]?.hex ?? '#888'}
          maskColor="rgba(0,0,0,0.06)"
          className="!bg-card !border !border-border !rounded-xl !shadow-sm"
        />
      </ReactFlow>
    </div>
  );
}

// ── Public export ─────────────────────────────────────────────────────────────

export function GraphCanvas({ miniMode = false }: { miniMode?: boolean }) {
  return (
    <ReactFlowProvider>
      <GraphInner miniMode={miniMode} />
    </ReactFlowProvider>
  );
}
