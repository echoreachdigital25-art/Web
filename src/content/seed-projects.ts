import type { NewProject } from "@/lib/db/schema";

/**
 * Initial portfolio entries, created from the five supplied videos.
 * Titles are neutral working titles — no client names, results or
 * responsibilities have been assumed. Edit everything in the dashboard.
 */
const m = (slug: string, file: string) => `/media/work/${slug}/${file}`;

function gallery(slug: string, title: string, n: number[]) {
  return n.map((i) => ({ url: m(slug, `still-${i}.webp`), alt: `Frame from ${title}` }));
}

export const seedProjects: NewProject[] = [
  {
    slug: "colombia-in-bricks",
    title: "Colombia in Bricks",
    category: "brand-films",
    summary:
      "An animated travel film that tours Colombia’s cities and landscapes — Bogotá, Cali, Cartagena and San Andrés — reimagined as a playful brick-built world.",
    orientation: "landscape" as const,
    featured: true,
    sortOrder: 1,
  },
  {
    slug: "body-glow-creator-ad",
    title: "Body Glow Creator Ad",
    category: "ugc-ai-video-ads",
    summary:
      "A vertical, creator-style advertisement for a body shimmer: a direct-to-camera introduction, close product moments and on-skin application, cut for short-form social placements.",
    orientation: "portrait" as const,
    featured: true,
    sortOrder: 2,
  },
  {
    slug: "clean-energy-brand-film",
    title: "Clean Energy Futures",
    category: "brand-films",
    summary:
      "A brand film on sustainable buildings and energy, moving through solar, heat-pump, EV-charging and smart-infrastructure scenes to present a cleaner way to power the places we live and work.",
    orientation: "landscape" as const,
    featured: true,
    sortOrder: 3,
  },
  {
    slug: "conversational-commerce-explainer",
    title: "Conversational Commerce",
    category: "product-explainers",
    summary:
      "An explainer for a conversational AI product built for ecommerce support teams, pairing lifestyle footage with clean interface animation to walk through customer conversations and order actions.",
    orientation: "landscape" as const,
    featured: true,
    sortOrder: 4,
  },
  {
    slug: "supply-chain-explainer",
    title: "Supply Chain Intelligence",
    category: "product-explainers",
    summary:
      "A product explainer for a supply-chain software platform, combining logistics footage, interface views and animated data overlays to show how teams can plan ahead and anticipate disruption.",
    orientation: "landscape" as const,
    featured: false,
    sortOrder: 5,
  },
].map((p) => ({
  ...p,
  status: "published" as const,
  publishedAt: new Date(),
  videoSource: "file" as const,
  videoUrl: m(p.slug!, "video.mp4"),
  previewUrl: m(p.slug!, "preview.mp4"),
  thumbnailUrl: m(p.slug!, "poster.webp"),
  thumbnailAlt: `Still frame from ${p.title}`,
  gallery: gallery(p.slug!, p.title!, p.slug === "body-glow-creator-ad" ? [1, 2, 3] : [1, 2, 3, 4]),
}));
