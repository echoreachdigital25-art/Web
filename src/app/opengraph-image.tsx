import { ImageResponse } from "next/og";

export const alt = "KYNDE Motion — Make Your Brand Impossible to Ignore.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: "radial-gradient(120% 90% at 50% 0%, #16406f 0%, #0B1F3A 45%, #050B16 100%)",
          color: "#fff",
        }}
      >
        <div style={{ display: "flex", fontSize: 30, fontWeight: 700, letterSpacing: -1 }}>
          KYNDE Motion
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Make Your Brand</div>
          <div style={{ fontSize: 86, fontWeight: 700, letterSpacing: -4, lineHeight: 1 }}>Impossible to Ignore.</div>
          <div style={{ marginTop: 28, fontSize: 28, color: "#00C2E8" }}>Creative Production & Digital Studio</div>
        </div>
      </div>
    ),
    size,
  );
}
