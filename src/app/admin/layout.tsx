import type { Metadata } from "next";
import "./admin.css";

export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · KYNDE Dashboard" },
  robots: { index: false, follow: false, nocache: true },
};

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return <div className="admin-root">{children}</div>;
}
