"use client";

import { useRef, type ReactNode, type CSSProperties } from "react";

/**
 * Gentle pointer-based 3D tilt for desktop pointers. Disabled for touch input
 * and when the visitor prefers reduced motion.
 */
export function Tilt({ children, className, max = 6, style, as: Tag = "div" }: { children: ReactNode; className?: string; max?: number; style?: CSSProperties; as?: "div" | "article" | "li" }) {
  const ref = useRef<HTMLElement>(null);
  const ok = () =>
    window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
    !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const onMove = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el || e.pointerType !== "mouse" || !ok()) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(1000px) rotateX(${(-y * max).toFixed(2)}deg) rotateY(${(x * max).toFixed(2)}deg)`;
  };
  const reset = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <Tag
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ref={ref as any}
      className={className}
      style={{ transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1)", ...style }}
      onPointerMove={onMove}
      onPointerLeave={reset}
    >
      {children}
    </Tag>
  );
}
