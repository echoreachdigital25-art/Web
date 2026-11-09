export const site = {
  name: "KYNDE Motion",
  positioning: "Independent Creative Production & Digital Studio",
  tagline: "Make Your Brand Impossible to Ignore.",
  description:
    "We create compelling visual experiences, build powerful digital platforms and implement intelligent marketing solutions that help ambitious brands stand out and grow.",
  url: (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
  ).replace(/\/$/, ""),
  email: "flowsyncdigital@gmail.com",
  whatsapp: { display: "+234 915 161 0452", href: "https://wa.me/2349151610452" },
  instagram: { handle: "@kynde_motion", href: "https://www.instagram.com/kynde_motion/" },
  linkedin: { label: "LinkedIn", href: "https://www.linkedin.com/in/samuelademola2" },
  regions: ["USA", "UK", "Europe", "Canada", "Australia", "Middle East"],
  sectors: [
    "Beauty",
    "Skincare",
    "Fragrance",
    "Fashion",
    "Food & Beverage",
    "Wellness",
    "Technology",
    "SaaS",
    "Real Estate",
    "Professional Services",
  ],
} as const;

export const nav = [
  { href: "/", label: "Home" },
  { href: "/work", label: "Our Work" },
  { href: "/services", label: "Services" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
] as const;
