import { NextResponse, type NextRequest } from "next/server";

/**
 * Fast redirect to the sign-in page when no session cookie is present.
 * This is a convenience only — every protected page, server action and API
 * route independently validates the session against the database.
 */
export function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  const has = req.cookies.has("__Host-kynde_admin") || req.cookies.has("kynde_admin");
  if (!has) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const url = req.nextUrl.clone();
    url.pathname = "/admin/login";
    url.search = `?next=${encodeURIComponent(pathname + search)}`;
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*", "/preview/:path*"],
};
