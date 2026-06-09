import { createClient } from "@supabase/supabase-js";

const BLOCK_TAGS = new Set(["p", "div", "section", "article", "main", "br", "li", "ul", "ol", "blockquote", "h1", "h2", "h3", "h4", "h5", "h6"]);

function decodeHtmlEntities(input: string) {
  const named: Record<string, string> = {
    amp: "&",
    lt: "<",
    gt: ">",
    quot: "\"",
    apos: "'",
    nbsp: " ",
    ndash: "-",
    mdash: "-",
    hellip: "...",
    rsquo: "'",
    lsquo: "'",
    rdquo: "\"",
    ldquo: "\"",
    copy: "©",
  };

  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (_match, entity) => {
    if (entity.startsWith("#x") || entity.startsWith("#X")) {
      const code = Number.parseInt(entity.slice(2), 16);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    }
    if (entity.startsWith("#")) {
      const code = Number.parseInt(entity.slice(1), 10);
      return Number.isFinite(code) ? String.fromCodePoint(code) : "";
    }
    return named[entity] ?? "";
  });
}

function stripInlineTags(html: string) {
  return decodeHtmlEntities(
    html
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/?(strong|b)>/gi, "**")
      .replace(/<\/?(em|i)>/gi, "*")
      .replace(/<a [^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi, (_m, href, label) => {
        const text = decodeHtmlEntities(label.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim());
        return text ? `[${text}](${href})` : href;
      })
      .replace(/<[^>]+>/g, " ")
      .replace(/\s+/g, " ")
      .trim(),
  );
}

function sanitizeHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, "")
    .replace(/<(svg|iframe|canvas|form|button|nav|footer|header|aside)[\s\S]*?<\/\1>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");
}

function getMetaContent(html: string, key: string) {
  const patterns = [
    new RegExp(`<meta[^>]+property=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+name=["']${key}["'][^>]+content=["']([^"']+)["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+property=["']${key}["'][^>]*>`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']+)["'][^>]+name=["']${key}["'][^>]*>`, "i"),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1]) return decodeHtmlEntities(match[1].trim());
  }

  return "";
}

function getTagContent(html: string, tag: string) {
  const match = html.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, "i"));
  return match?.[1] ? stripInlineTags(match[1]) : "";
}

function pickContentRoot(html: string) {
  const roots = [
    /<article[\s\S]*?<\/article>/i,
    /<main[\s\S]*?<\/main>/i,
    /<body[\s\S]*?<\/body>/i,
  ];

  for (const pattern of roots) {
    const match = html.match(pattern);
    if (match?.[0]) return match[0];
  }

  return html;
}

function extractSegments(html: string) {
  const cleaned = sanitizeHtml(pickContentRoot(html));
  const segments: string[] = [];
  const pattern = /<(h[1-6]|p|li|blockquote|figcaption|time|div|section)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(cleaned))) {
    const tag = match[1].toLowerCase();
    const text = stripInlineTags(match[2]);
    if (!text || text.length < 25) continue;

    if (tag.startsWith("h")) {
      const depth = Number.parseInt(tag.slice(1), 10);
      const prefix = depth <= 2 ? "##" : "###";
      segments.push(`${prefix} ${text}`);
      continue;
    }

    if (tag === "li") {
      segments.push(`- ${text}`);
      continue;
    }

    if (tag === "blockquote") {
      segments.push(`> ${text}`);
      continue;
    }

    if (BLOCK_TAGS.has(tag)) {
      segments.push(text);
    }
  }

  if (segments.length > 3) return segments;

  const fallback = stripInlineTags(cleaned)
    .split(/\n{2,}/)
    .map((item) => item.trim())
    .filter((item) => item.length >= 60);

  return fallback;
}

function normalizeMarkdown(lines: string[]) {
  const unique: string[] = [];
  for (const line of lines) {
    const normalized = line.replace(/\s+/g, " ").trim();
    if (!normalized) continue;
    if (unique[unique.length - 1] === normalized) continue;
    unique.push(normalized);
  }

  return unique.join("\n\n").replace(/\n{3,}/g, "\n\n").trim();
}

function wordCount(text: string) {
  return text.split(/\s+/).filter(Boolean).length;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

function coercePublishedAt(raw: string) {
  if (!raw) return null;
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
}

export default async function handler(req: any, res: any) {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const rawUrl = typeof req.body?.url === "string" ? req.body.url.trim() : "";
  if (!rawUrl) {
    return res.status(400).json({ error: "Informe a URL da matéria." });
  }

  let url: URL;
  try {
    url = new URL(rawUrl);
  } catch {
    return res.status(400).json({ error: "URL inválida." });
  }

  if (!["http:", "https:"].includes(url.protocol)) {
    return res.status(400).json({ error: "A URL precisa usar http ou https." });
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);
    const response = await fetch(url.toString(), {
      headers: {
        "user-agent": "SEMEAR Archive Bot/1.0",
        accept: "text/html,application/xhtml+xml",
      },
      redirect: "follow",
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (!response.ok) {
      return res.status(400).json({ error: `Não foi possível acessar a matéria (${response.status}).` });
    }

    const html = await response.text();
    const title = getMetaContent(html, "og:title") || getTagContent(html, "title") || getTagContent(html, "h1");
    const sourceName = getMetaContent(html, "og:site_name") || url.hostname.replace(/^www\./, "");
    const publishedAt =
      coercePublishedAt(getMetaContent(html, "article:published_time")) ||
      coercePublishedAt(getMetaContent(html, "og:published_time")) ||
      coercePublishedAt(getMetaContent(html, "publish-date")) ||
      coercePublishedAt(getTagContent(html, "time"));

    const excerpt =
      getMetaContent(html, "description") ||
      getMetaContent(html, "og:description") ||
      "";

    const markdown = normalizeMarkdown(extractSegments(html));
    if (!markdown || markdown.length < 280) {
      return res.status(422).json({
        error: "A página foi acessada, mas não foi possível extrair texto suficiente para preservar a matéria.",
      });
    }

    let snapshot: null | { path: string; publicUrl: string; mimeType: string; sizeBytes: number } = null;
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

    if (supabaseUrl && serviceRoleKey) {
      try {
        const supabase = createClient(supabaseUrl, serviceRoleKey);
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const fileBase = slugify(title || url.hostname || "materia") || "materia";
        const fileName = `${fileBase}_${Date.now()}.html`;
        const path = `captures/${year}/${month}/${fileName}`;
        const htmlBuffer = Buffer.from(html, "utf-8");

        const { error: uploadError } = await supabase.storage.from("acervo").upload(path, htmlBuffer, {
          contentType: "text/html; charset=utf-8",
          cacheControl: "31536000",
          upsert: false,
        });

        if (!uploadError) {
          const { data } = supabase.storage.from("acervo").getPublicUrl(path);
          snapshot = {
            path,
            publicUrl: data.publicUrl,
            mimeType: "text/html",
            sizeBytes: htmlBuffer.byteLength,
          };
        }
      } catch {
        snapshot = null;
      }
    }

    return res.status(200).json({
      url: response.url || url.toString(),
      title,
      sourceName,
      publishedAt,
      excerpt,
      markdown,
      capturedAt: new Date().toISOString(),
      wordCount: wordCount(markdown),
      domain: url.hostname.replace(/^www\./, ""),
      snapshot,
    });
  } catch (error: any) {
    const message =
      error?.name === "AbortError"
        ? "Tempo esgotado ao tentar capturar a matéria."
        : error?.message || "Falha inesperada ao capturar a matéria.";

    return res.status(500).json({ error: message });
  }
}
