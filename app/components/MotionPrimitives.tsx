'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';

// Measure the inner content, never the animated wrapper, to avoid resize loops.
export function AutoHeight({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) {
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number>();
  useEffect(() => {
    if (!content.current) return;
    const observer = new ResizeObserver(([entry]) => {
      setHeight(entry.borderBoxSize[0]?.blockSize ?? entry.contentRect.height);
    });
    observer.observe(content.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div className={`motion-height ${className}`} style={{ height }}>
      <div ref={content}>{children}</div>
    </div>
  );
}

export function Disclosure({
  open,
  children,
  id,
}: {
  open: boolean;
  children: ReactNode;
  id: string;
}) {
  return (
    <div
      className="motion-disclosure"
      data-open={open}
      inert={!open}
      aria-hidden={!open}
      id={id}
    >
      <div>{children}</div>
    </div>
  );
}
