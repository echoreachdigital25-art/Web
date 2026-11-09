import type { Metadata, Viewport } from "next";
import "@fontsource-variable/inter";
import "@fontsource-variable/inter-tight";
import { site } from "@/content/site";

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: "KYNDE Motion — Creative Production & Digital Studio",
    template: "%s — KYNDE Motion",
  },
  description: site.description,
  applicationName: "KYNDE Motion",
  openGraph: {
    type: "website",
    siteName: "KYNDE Motion",
    locale: "en_GB",
    url: "/",
    title: "KYNDE Motion — Make Your Brand Impossible to Ignore.",
    description: site.description,
  },
  twitter: {
    card: "summary_large_image",
    title: "KYNDE Motion — Make Your Brand Impossible to Ignore.",
    description: site.description,
  },
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#050B16",
  colorScheme: "dark",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
