'use client';

import { useRef, useState, useCallback } from 'react';
import { X, ZoomIn, ZoomOut, RotateCcw, Pencil, Trash2 } from 'lucide-react';
import { ProfileAvatar } from './ProfileAvatar';

interface ProfilePictureModalProps {
  open: boolean;
  onClose: () => void;
  avatarUrl?: string | null;
  name?: string | null;
  email?: string | null;
  onChangePicture: () => void;
  onDeletePicture: () => void;
  isDeleting?: boolean;
}

const MIN_ZOOM = 0.5;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.25;

export function ProfilePictureModal({
  open,
  onClose,
  avatarUrl,
  name,
  email,
  onChangePicture,
  onDeletePicture,
  isDeleting,
}: ProfilePictureModalProps) {
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const dragStart = useRef<{ mx: number; my: number; ox: number; oy: number } | null>(null);

  const resetView = useCallback(() => { setZoom(1); setOffset({ x: 0, y: 0 }); }, []);

  function handleWheel(e: React.WheelEvent) {
    e.preventDefault();
    setZoom(z => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, z - e.deltaY * 0.001)));
  }

  function handleMouseDown(e: React.MouseEvent) {
    if (zoom <= 1) return;
    setDragging(true);
    dragStart.current = { mx: e.clientX, my: e.clientY, ox: offset.x, oy: offset.y };
  }

  function handleMouseMove(e: React.MouseEvent) {
    if (!dragging || !dragStart.current) return;
    setOffset({
      x: dragStart.current.ox + e.clientX - dragStart.current.mx,
      y: dragStart.current.oy + e.clientY - dragStart.current.my,
    });
  }

  function handleMouseUp() { setDragging(false); dragStart.current = null; }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) { resetView(); onClose(); } }}
    >
      <div className="relative bg-card border border-border rounded-2xl shadow-2xl flex flex-col max-w-sm w-full overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0">
          <h3 className="text-sm font-semibold text-foreground">Profile Picture</h3>
          <button
            type="button"
            onClick={() => { resetView(); onClose(); }}
            aria-label="Close"
            className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Image area */}
        <div
          className="relative bg-muted/40 flex items-center justify-center overflow-hidden"
          style={{ height: 280 }}
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={avatarUrl}
              alt={name ?? 'Profile picture'}
              draggable={false}
              style={{
                transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
                transition: dragging ? 'none' : 'transform 0.15s ease',
                cursor: zoom > 1 ? (dragging ? 'grabbing' : 'grab') : 'default',
                userSelect: 'none',
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
              }}
            />
          ) : (
            <ProfileAvatar name={name} email={email} size="xl" />
          )}
        </div>

        {/* Zoom controls */}
        {avatarUrl && (
          <div className="flex items-center justify-center gap-2 px-4 py-2 border-t border-border bg-muted/20">
            <button
              type="button"
              onClick={() => setZoom(z => Math.max(MIN_ZOOM, z - ZOOM_STEP))}
              aria-label="Zoom out"
              disabled={zoom <= MIN_ZOOM}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ZoomOut size={15} />
            </button>
            <span className="text-xs text-muted-foreground tabular-nums w-10 text-center">
              {Math.round(zoom * 100)}%
            </span>
            <button
              type="button"
              onClick={() => setZoom(z => Math.min(MAX_ZOOM, z + ZOOM_STEP))}
              aria-label="Zoom in"
              disabled={zoom >= MAX_ZOOM}
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30 transition-colors"
            >
              <ZoomIn size={15} />
            </button>
            <button
              type="button"
              onClick={resetView}
              aria-label="Reset zoom"
              className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw size={13} />
            </button>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 px-4 py-3 border-t border-border">
          <button
            type="button"
            onClick={() => { resetView(); onClose(); onChangePicture(); }}
            className="flex-1 flex items-center justify-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Pencil size={13} />
            Change picture
          </button>
          {avatarUrl && (
            <button
              type="button"
              onClick={onDeletePicture}
              disabled={isDeleting}
              className="flex items-center justify-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border border-border text-destructive hover:bg-destructive/10 disabled:opacity-50 transition-colors"
            >
              <Trash2 size={13} />
              {isDeleting ? 'Removing…' : 'Delete'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
