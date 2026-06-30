'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';

export type GraphNodeType = 'note' | 'inbox' | 'list' | 'reminder' | 'collection' | 'contact' | 'tag';
export type GraphEdgeType = 'link' | 'collection' | 'tag';

export interface GraphNode {
  id: string;
  nodeType: GraphNodeType;
  label: string;
  data: {
    is_favorite?: boolean;
    is_archived?: boolean;
    color?: string;
    status?: string;
    email?: string;
    url?: string;
  };
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  edgeType: GraphEdgeType;
  relationship?: string;
}

export interface GraphData {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface GraphFilters {
  types?: GraphNodeType[];
  edgeTypes?: GraphEdgeType[];
}

export function useGraph(filters?: GraphFilters) {
  const params = new URLSearchParams();
  if (filters?.types?.length) params.set('types', filters.types.join(','));
  if (filters?.edgeTypes?.length) params.set('edgeTypes', filters.edgeTypes.join(','));
  const qs = params.toString();

  return useQuery<GraphData>({
    queryKey: ['graph', filters],
    queryFn: () => api.get(`/api/graph${qs ? `?${qs}` : ''}`),
    staleTime: 2 * 60 * 1000,
  });
}

export function useGraphNeighbors(type: string, id: string, enabled = false) {
  return useQuery<{ neighborIds: string[]; edges: GraphEdge[] }>({
    queryKey: ['graph-neighbors', type, id],
    queryFn: () => api.get(`/graph/neighbors/${type}/${id}`),
    enabled,
    staleTime: 60 * 1000,
  });
}

export function useAdminGraphStats() {
  return useQuery({
    queryKey: ['admin', 'graph', 'stats'],
    queryFn: () => api.get('/graph/admin/stats'),
    staleTime: 5 * 60 * 1000,
  });
}
