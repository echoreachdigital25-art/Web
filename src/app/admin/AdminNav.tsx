"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export function AdminNav({ unread }: { unread: number }) {
  const path = usePathname();
  const items = [
    { href: "/admin", label: "Projects", active: path === "/admin" || path.startsWith("/admin/projects") },
    { href: "/admin/enquiries", label: "Enquiries", active: path.startsWith("/admin/enquiries"), badge: unread },
  ];
  return (
    <nav aria-label="Dashboard">
      {items.map((i) => (
        <Link key={i.href} href={i.href} aria-current={i.active ? "page" : undefined}>
          {i.label}
          {i.badge ? (
            <span className="a-badge-count" aria-label={`${i.badge} unread`}>
              {i.badge}
            </span>
          ) : null}
        </Link>
      ))}
    </nav>
  );
}
