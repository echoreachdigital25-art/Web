/**
 * Logo configuration.
 *
 * The supplied logo files (KYNDE Motion wordmark + KM monogram) were not
 * available when this site was built, so a temporary typographic wordmark
 * and a plain "KM" placeholder mark are used. To switch to the real logo:
 *   1. Export transparent PNG (or SVG) files and place them in /public/brand/
 *   2. Set `wordmark` / `monogram` below to their paths and pixel dimensions.
 *   3. Replace src/app/icon.svg (favicon) with the monogram.
 * See README → "Logo assets".
 */
export const brand: {
  wordmark: { src: string; width: number; height: number } | null;
  monogram: { src: string; width: number; height: number } | null;
} = {
  wordmark: null, // e.g. { src: "/brand/kynde-motion-wordmark-white.png", width: 600, height: 160 }
  monogram: null, // e.g. { src: "/brand/km-monogram-cyan.png", width: 256, height: 256 }
};
