import Image from "next/image";
import { brand } from "@/content/brand";

/** Full wordmark (temporary typographic version until the supplied files are added). */
export function Wordmark({ sub = true }: { sub?: boolean }) {
  if (brand.wordmark) {
    return (
      <Image
        src={brand.wordmark.src}
        width={brand.wordmark.width}
        height={brand.wordmark.height}
        alt="KYNDE Motion"
        className="brand-img"
        style={{ width: "auto", height: 34 }}
        priority
      />
    );
  }
  return (
    <span className="brand-text">
      <strong>KYNDE Motion</strong>
      {sub && <span>Creative Production &amp; Digital Studio</span>}
    </span>
  );
}

/** Compact monogram (placeholder "KM" mark until the supplied monogram is added). */
export function Monogram({ size = 26 }: { size?: number }) {
  if (brand.monogram) {
    return <Image src={brand.monogram.src} width={size} height={size} alt="" aria-hidden="true" />;
  }
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <text x="16" y="21.5" textAnchor="middle" fontFamily="Inter Tight Variable, Inter, sans-serif" fontWeight="700" fontSize="14" letterSpacing="-0.5" fill="#00C2E8">KM</text>
    </svg>
  );
}
