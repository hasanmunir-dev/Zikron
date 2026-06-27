'use client';

import Masonry from 'react-masonry-css';

const BREAKPOINTS = {
  default: 3, // large screens (≥1024px)
  1023: 2,    // tablet (640–1023px)
  639: 1,     // mobile (<640px)
};

interface MasonryGridProps {
  children: React.ReactNode;
  className?: string;
}

export function MasonryGrid({ children, className }: MasonryGridProps) {
  return (
    <Masonry
      breakpointCols={BREAKPOINTS}
      className={`masonry-grid${className ? ` ${className}` : ''}`}
      columnClassName="masonry-grid-column"
    >
      {children}
    </Masonry>
  );
}

export function MasonrySkeleton({ count = 8 }: { count?: number }) {
  return (
    <MasonryGrid>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-4 space-y-2.5 animate-pulse">
          <div className="h-4 w-3/4 rounded bg-muted" />
          <div className="h-3 w-full rounded bg-muted" />
          {i % 3 !== 0 && <div className="h-3 w-2/3 rounded bg-muted" />}
          {i % 4 === 0 && <div className="h-3 w-full rounded bg-muted" />}
          {i % 4 === 0 && <div className="h-3 w-3/4 rounded bg-muted" />}
          {i % 4 === 1 && <div className="h-3 w-1/2 rounded bg-muted" />}
          {i % 5 === 0 && <div className="h-3 w-full rounded bg-muted" />}
          {i % 5 === 0 && <div className="h-3 w-2/3 rounded bg-muted" />}
        </div>
      ))}
    </MasonryGrid>
  );
}
