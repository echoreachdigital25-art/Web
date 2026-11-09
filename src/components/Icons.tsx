type P = { size?: number; className?: string };
const base = (size = 18) => ({ width: size, height: size, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const, "aria-hidden": true, focusable: "false" as const });

export const ArrowRight = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12h14M13 6l6 6-6 6" /></svg>
);
export const ArrowLeft = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
);
export const Play = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}><path d="M7 4.5v15l13-7.5z" fill="currentColor" /></svg>
);
export const Pause = ({ size = 14, className }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true" focusable="false" className={className}><path d="M6 4h4v16H6zM14 4h4v16h-4z" fill="currentColor" /></svg>
);
export const Close = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const Menu = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M4 8h16M4 16h16" /></svg>
);
export const Plus = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M12 5v14M5 12h14" /></svg>
);
export const Check = ({ size, className }: P) => (
  <svg {...base(size)} className={className}><path d="M5 12.5l4.5 4.5L19 7" /></svg>
);
