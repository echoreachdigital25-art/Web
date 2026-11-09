import "./globals.css";
import type { Metadata } from "next";
import { NotFoundContent } from "@/components/NotFoundContent";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = { title: "Page not found", robots: { index: false } };

/** Global 404 for URLs that match no route. */
export default function GlobalNotFound() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <NotFoundContent />
      </main>
      <SiteFooter />
    </>
  );
}
