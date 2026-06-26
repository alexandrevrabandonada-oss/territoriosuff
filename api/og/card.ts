import { createElement } from "react";
import { readFileSync } from "fs";
import path from "path";

type OgKind = "dados" | "blog" | "acervo" | "relatorios" | "dossies" | "boletim" | string;

type OgParams = {
  kind: OgKind;
  title: string;
  subtitle: string;
  footer: string;
  pm25?: string;
  pm10?: string;
  time?: string;
};

const DEFAULT_FOOTER = "SEMEAR • UFF • EMENDA PARLAMENTAR";
const WIDTH = 1200;
const HEIGHT = 630;
const LOGO_DATA_URI = `data:image/jpeg;base64,${readFileSync(
  path.join(process.cwd(), "public", "brand", "semear-preview-logo.jpg")
).toString("base64")}`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeText(value: unknown, maxLength: number) {
  return escapeHtml(String(value ?? "")).slice(0, maxLength);
}

function getKindLabel(kind: string) {
  switch (kind.toUpperCase()) {
    case "DADOS":
      return "DADOS EM TEMPO REAL";
    case "BLOG":
      return "BLOG";
    case "ACERVO":
      return "ACERVO";
    case "RELATORIOS":
      return "RELATORIOS";
    case "DOSSIES":
      return "DOSSIES";
    case "BOLETIM":
      return "BOLETIM";
    default:
      return "SEMEAR";
  }
}

function buildSvg(params: OgParams) {
  const safeTitle = normalizeText(params.title, 100);
  const safeSubtitle = normalizeText(params.subtitle, 180);
  const safeFooter = normalizeText(params.footer || DEFAULT_FOOTER, 100);
  const safeKind = escapeHtml(getKindLabel(params.kind));

  const metrics = params.kind.toUpperCase() === "DADOS" && params.pm25 && params.pm10 && params.time
    ? `
      <g transform="translate(86, 290)">
        <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#4C5C6B">PM2.5</text>
        <text x="0" y="70" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="900" fill="#15803D">${escapeHtml(params.pm25)} <tspan font-size="24" fill="#4C5C6B">µg/m³</tspan></text>
      </g>
      <g transform="translate(390, 290)">
        <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#4C5C6B">PM10</text>
        <text x="0" y="70" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="900" fill="#D4A514">${escapeHtml(params.pm10)} <tspan font-size="24" fill="#4C5C6B">µg/m³</tspan></text>
      </g>
      <g transform="translate(86, 480)">
        <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#4C5C6B">Atualizado</text>
        <text x="0" y="38" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800" fill="#11263B">${escapeHtml(params.time)}</text>
      </g>
    `
    : "";

  const subtitleBlock = safeSubtitle
    ? `
      <foreignObject x="86" y="250" width="1030" height="220">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, sans-serif; color: #4C5C6B; font-size: 28px; line-height: 1.4; font-weight: 500; display: flex; align-items: center;">
          <div style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${safeSubtitle}</div>
        </div>
      </foreignObject>
    `
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${safeTitle}</title>
  <desc id="desc">${safeSubtitle}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#F8FBFD" />
      <stop offset="0.58" stop-color="#EFF5FA" />
      <stop offset="1" stop-color="#E5F0FA" />
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(940 120) rotate(140) scale(540 340)">
      <stop stop-color="#00B7B1" stop-opacity="0.18" />
      <stop offset="1" stop-color="#00B7B1" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="accent" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(190 520) rotate(45) scale(420 220)">
      <stop stop-color="#A3D832" stop-opacity="0.22" />
      <stop offset="1" stop-color="#A3D832" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="coreA" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1034 112) rotate(90) scale(56)">
      <stop stop-color="#005DAA" stop-opacity="0.22" />
      <stop offset="1" stop-color="#005DAA" stop-opacity="0" />
    </radialGradient>
    <pattern id="seedTexture" width="14" height="14" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1" fill="rgba(0,93,170,0.14)" />
      <circle cx="10" cy="8" r="1" fill="rgba(0,183,177,0.14)" />
    </pattern>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="8" fill="#005DAA" />
  <circle cx="1000" cy="110" r="260" fill="url(#glow)" />
  <circle cx="210" cy="520" r="220" fill="url(#accent)" />
  <rect x="0" y="0" width="${WIDTH}" height="${HEIGHT}" fill="url(#seedTexture)" opacity="0.34" />
  <g transform="translate(86, 98)">
    <rect x="0" y="0" width="260" height="54" rx="18" fill="rgba(255,255,255,0.72)" stroke="rgba(0,93,170,0.18)" />
    <text x="24" y="35" font-family="Inter, Arial, sans-serif" font-size="20" font-weight="800" fill="#005DAA" letter-spacing="2">${safeKind}</text>
  </g>
  <g transform="translate(1000, 74)">
    <rect x="-14" y="-14" width="96" height="96" rx="28" fill="rgba(255,255,255,0.82)" stroke="rgba(0,93,170,0.18)" />
    <image href="${LOGO_DATA_URI}" x="-6" y="-6" width="80" height="80" preserveAspectRatio="xMidYMid meet" />
  </g>
  <foreignObject x="86" y="170" width="1030" height="120">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, sans-serif; display: flex; flex-direction: column; gap: 12px;">
      <div style="font-size: 64px; line-height: 1.08; font-weight: 900; color: #11263B; letter-spacing: -0.03em;">${safeTitle}</div>
    </div>
  </foreignObject>
  ${subtitleBlock}
  ${metrics}
  <g transform="translate(86, 572)">
    <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="#4C5C6B" letter-spacing="2">${safeFooter}</text>
  </g>
</svg>`;
}

async function tryBuildPng(params: OgParams): Promise<Uint8Array | null> {
  try {
    const { ImageResponse } = await import("@vercel/og");

    const png = new ImageResponse(
      createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
            color: "#11263B",
            background: "linear-gradient(135deg, #F8FBFD 0%, #EFF5FA 58%, #E5F0FA 100%)",
            fontFamily: "Inter, Arial, sans-serif",
            overflow: "hidden"
          }
        },
        createElement("div", {
          style: {
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 80% 18%, rgba(0,183,177,0.16), transparent 36%), radial-gradient(circle at 18% 82%, rgba(163,216,50,0.2), transparent 30%)"
          }
        }),
        createElement("div", {
          style: {
            position: "absolute",
            inset: 0,
            backgroundImage: "radial-gradient(circle at 11% 32%, rgba(0,93,170,0.12) 0 1px, transparent 2px), radial-gradient(circle at 47% 54%, rgba(0,183,177,0.1) 0 1px, transparent 2px), radial-gradient(circle at 84% 68%, rgba(163,216,50,0.12) 0 1px, transparent 2px)",
            backgroundSize: "88px 88px"
          }
        }),
        createElement("div", {
          style: {
            position: "absolute",
            inset: 0,
            borderTop: "8px solid #005DAA"
          }
        }),
        createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              padding: "72px 86px",
              width: "100%",
              position: "relative"
            }
          },
          createElement(
            "div",
            {
              style: {
                display: "inline-flex",
                alignItems: "center",
                alignSelf: "flex-start",
                padding: "14px 22px",
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.72)",
                border: "1px solid rgba(0,93,170,0.18)",
                color: "#005DAA",
                fontSize: 20,
                fontWeight: 800,
                letterSpacing: 2
              }
            },
            getKindLabel(params.kind)
          ),
          createElement(
            "div",
            {
              style: {
                marginTop: 26,
                fontSize: 64,
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#11263B",
                maxWidth: 1060
              }
            },
            params.title
          ),
          params.subtitle
            ? createElement(
                "div",
                {
                  style: {
                    marginTop: 24,
                    fontSize: 30,
                    lineHeight: 1.35,
                    color: "#4C5C6B",
                    maxWidth: 1040,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }
                },
                params.subtitle
              )
            : null,
          params.kind.toUpperCase() === "DADOS" && params.pm25 && params.pm10 && params.time
            ? createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 48,
                    marginTop: 48
                  }
                },
                createElement(
                  "div",
                  { style: { display: "flex", flexDirection: "column" } },
                  createElement(
                    "div",
                    { style: { fontSize: 24, color: "#4C5C6B", textTransform: "uppercase", fontWeight: 800, letterSpacing: 2 } },
                    "PM2.5"
                  ),
                  createElement(
                    "div",
                    { style: { fontSize: 58, fontWeight: 900, color: "#15803D", marginTop: 10 } },
                    params.pm25,
                    createElement("span", { style: { fontSize: 24, color: "#4C5C6B", marginLeft: 10 } }, "µg/m³")
                  )
                ),
                createElement(
                  "div",
                  { style: { display: "flex", flexDirection: "column" } },
                  createElement(
                    "div",
                    { style: { fontSize: 24, color: "#4C5C6B", textTransform: "uppercase", fontWeight: 800, letterSpacing: 2 } },
                    "PM10"
                  ),
                  createElement(
                    "div",
                    { style: { fontSize: 58, fontWeight: 900, color: "#D4A514", marginTop: 10 } },
                    params.pm10,
                    createElement("span", { style: { fontSize: 24, color: "#4C5C6B", marginLeft: 10 } }, "µg/m³")
                  )
                )
              )
            : null,
          params.kind.toUpperCase() === "DADOS" && params.time
            ? createElement(
                "div",
                { style: { marginTop: 28, fontSize: 24, fontWeight: 800, color: "#4C5C6B" } },
                `Atualizado: ${params.time}`
              )
            : null,
          createElement(
            "div",
            {
              style: {
                marginTop: "auto",
                paddingTop: 48,
                fontSize: 18,
                fontWeight: 800,
                color: "#4C5C6B",
                letterSpacing: 2
              }
            },
            params.footer || DEFAULT_FOOTER
          ),
          createElement("div", {
            style: {
              position: "absolute",
              right: 68,
              top: 54,
              width: 96,
              height: 96,
              borderRadius: 28,
              background: "rgba(255,255,255,0.82)",
              border: "1px solid rgba(0,93,170,0.18)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }
          },
          createElement("img", {
            src: LOGO_DATA_URI,
            alt: "Logo do projeto SEMEAR",
            width: 80,
            height: 80,
            style: {
              objectFit: "contain"
            }
          }))
        )
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        headers: {
          "Cache-Control": "public, max-age=86400, immutable"
        }
      }
    );

    return new Uint8Array(await png.arrayBuffer());
  } catch (error) {
    console.warn("[og/card] PNG render unavailable, falling back to SVG:", error);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const { kind = "SEMEAR", title = "", subtitle = "", footer = "", pm25, pm10, time } = req.query;

  const params: OgParams = {
    kind: String(kind),
    title: String(title),
    subtitle: String(subtitle),
    footer: String(footer || DEFAULT_FOOTER),
    pm25: typeof pm25 === "string" ? pm25 : undefined,
    pm10: typeof pm10 === "string" ? pm10 : undefined,
    time: typeof time === "string" ? time : undefined
  };

  const png = await tryBuildPng(params);
  if (png) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    return res.status(200).send(Buffer.from(png));
  }

  const svg = buildSvg(params);
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  return res.status(200).send(svg);
}
