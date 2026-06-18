import { createClient } from "@supabase/supabase-js";

function getHostUrl(req: any) {
  const host = req.headers["x-forwarded-host"] || req.headers.host || "semear-pwa.vercel.app";
  const protocol = req.headers["x-forwarded-proto"] || "https";
  return `${protocol}://${host}`;
}

export default async function handler(req: any, res: any) {
  const { slug } = req.query;

  if (!slug) {
    return res.redirect("/relatorios");
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.redirect(`/relatorios/${slug}`);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  try {
    const rawIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "0.0.0.0";
    const ip = String(rawIp).split(",")[0].trim();
    const userAgent = req.headers["user-agent"] || null;
    const referrer = req.headers["referer"] || null;
    const salt = process.env.SHARE_HASH_SALT || "default-salt-change-me";

    const crypto = await import("node:crypto");
    const ipHash = crypto.createHash("sha256").update(`${ip}${salt}`).digest("hex");

    await supabase.from("share_events").insert({
      kind: "relatorios",
      slug,
      referrer,
      user_agent: userAgent,
      ip_hash: ipHash
    });
  } catch (error) {
    console.error("[share/relatorios] failed to log share event", error);
  }

  const { data: report, error } = await supabase
    .from("reports")
    .select("title, summary, cover_url, cover_thumb_url")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !report) {
    return res.redirect(`/relatorios/${slug}`);
  }

  const hostUrl = getHostUrl(req);
  const pageUrl = `${hostUrl}/relatorios/${slug}`;

  const title = `${report.title} | Relatorios SEMEAR`;
  const description = report.summary || "Consulte este relatorio tecnico oficial do SEMEAR.";
  const safeTitle = encodeURIComponent(report.title);
  const safeSubtitle = encodeURIComponent(description);
  const image = report.cover_thumb_url || `${hostUrl}/api/og/card?kind=relatorios&title=${safeTitle}&subtitle=${safeSubtitle}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">

  <meta property="og:type" content="article">
  <meta property="og:url" content="${pageUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">

  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${pageUrl}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${image}">

  <meta http-equiv="refresh" content="0; url=/relatorios/${slug}">
</head>
<body>
  <p>Redirecionando para relatorios...</p>
</body>
</html>
  `.trim();

  res.setHeader("Content-Type", "text/html");
  return res.status(200).send(html);
}
