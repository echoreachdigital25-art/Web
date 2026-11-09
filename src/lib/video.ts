/** Parses and normalises supported video sources (shared by client and server). */
export type ParsedVideo =
  | { source: "youtube"; id: string; embedUrl: string }
  | { source: "vimeo"; id: string; embedUrl: string }
  | { source: "file"; url: string };

export function parseVideoUrl(input: string, ownPrefixes: string[] = ["/media/", "/uploads/"]): ParsedVideo | null {
  const raw = input.trim();
  if (!raw) return null;
  if (ownPrefixes.some((p) => raw.startsWith(p)) && /\.(mp4|webm)(\?.*)?$/i.test(raw)) return { source: "file", url: raw };
  let u: URL;
  try {
    u = new URL(raw);
  } catch {
    return null;
  }
  if (u.protocol !== "https:") return null;
  const host = u.hostname.replace(/^www\.|^m\./, "");
  if (host === "youtube.com" || host === "youtu.be" || host === "youtube-nocookie.com") {
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (u.pathname === "/watch") id = u.searchParams.get("v");
    else {
      const m = u.pathname.match(/^\/(?:embed|shorts|live)\/([^/?#]+)/);
      id = m?.[1] ?? null;
    }
    if (id && /^[\w-]{11}$/.test(id)) return { source: "youtube", id, embedUrl: `https://www.youtube-nocookie.com/embed/${id}?rel=0&modestbranding=1` };
    return null;
  }
  if (host === "vimeo.com" || host === "player.vimeo.com") {
    const m = u.pathname.match(/(?:\/video)?\/(\d{6,12})(?:\/([0-9a-f]{6,20}))?/);
    if (!m) return null;
    const hash = m[2] ?? u.searchParams.get("h");
    return { source: "vimeo", id: m[1], embedUrl: `https://player.vimeo.com/video/${m[1]}?dnt=1${hash ? `&h=${hash}` : ""}` };
  }
  if (/\.(mp4|webm)$/i.test(u.pathname)) return { source: "file", url: u.toString() };
  return null;
}
