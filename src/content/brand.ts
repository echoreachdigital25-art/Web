/**
 * Logo configuration.
 *
 * Transparent PNGs extracted from the supplied logo images (which had dark
 * backgrounds). Replace with vector/transparent originals when available:
 *   1. Export transparent PNG (or SVG) files and place them in /public/brand/
 *   2. Set `wordmark` / `monogram` below to their paths and pixel dimensions.
 *   3. Replace src/app/icon.svg (favicon) with the monogram.
 * See README → "Logo assets".
 */
export const brand: {
  wordmark: { src: string; width: number; height: number } | null;
  monogram: { src: string; width: number; height: number } | null;
} = {
  wordmark: { src: "/brand/kynde-motion-wordmark.png", width: 1241, height: 235 },
  monogram: { src: "/brand/km-monogram-cyan.png", width: 508, height: 244 },
};
