/**
 * Portfolio categories. Only categories that contain at least one published
 * project are shown publicly — empty ones stay hidden automatically.
 */
export const categories = [
  { slug: "ugc-ai-video-ads", label: "UGC & AI Video Ads" },
  { slug: "product-commercials", label: "Product Commercials" },
  { slug: "brand-films", label: "Brand Films" },
  { slug: "product-explainers", label: "Product Explainers" },
  { slug: "website-design", label: "Website Design" },
  { slug: "shopify-ecommerce", label: "Shopify & E-commerce" },
  { slug: "digital-campaigns", label: "Digital Campaigns" },
] as const;

export type CategorySlug = (typeof categories)[number]["slug"];

export const categorySlugs = categories.map((c) => c.slug) as [CategorySlug, ...CategorySlug[]];

export function categoryLabel(slug: string) {
  return categories.find((c) => c.slug === slug)?.label ?? slug;
}
