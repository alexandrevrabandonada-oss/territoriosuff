import { createClient } from '@supabase/supabase-js';
import { escapeHtml } from './_html';

function getHostUrl(req: any) {
  const host = req.headers['x-forwarded-host'] || req.headers.host || 'semear-pwa.vercel.app';
  const protocol = req.headers['x-forwarded-proto'] || 'https';
  return `${protocol}://${host}`;
}

export default async function handler(req: any, res: any) {
  const { slug } = req.query;

  if (!slug) {
    return res.redirect('/');
  }
  const safeSlug = encodeURIComponent(String(slug));

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.redirect(`/acervo/item/${safeSlug}`);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // --- Share Analytics (Privacy-Safe) ---
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
    const salt = process.env.SHARE_HASH_SALT || 'default-salt-change-me';

    // Simple SHA-256 hash helper (Node.js crypto)
    const crypto = await import('node:crypto');
    const ipHash = crypto.createHash('sha256').update(`${ip}${salt}`).digest('hex');

    await supabase.from('share_events').insert({
      kind: 'acervo',
      slug,
      referrer: req.headers['referer'] || null,
      user_agent: req.headers['user-agent'] || null,
      ip_hash: ipHash
    });
  } catch (err) {
    console.error('[ShareAnalytics] Failed to log event:', err);
  }

  const { data: item, error } = await supabase
    .from('acervo_items')
    .select('title, excerpt, cover_url, cover_thumb_url, source_name, published_at, created_at, meta')
    .eq('slug', slug)
    .single();

  if (error || !item) {
    return res.redirect(`/acervo/item/${safeSlug}`);
  }

  const hostUrl = getHostUrl(req);
  const title = `${item.title} | Acervo SEMEAR`;
  const description = item.excerpt || 'Consulte este item no Acervo Digital SEMEAR.';

  let subtitleText = description;
  let year = '';

  if (item.published_at) {
    year = new Date(item.published_at).getFullYear().toString();
  } else if (item.meta && typeof item.meta === 'object' && 'year' in item.meta) {
    year = String((item.meta as any).year);
  } else if (item.created_at) {
    year = new Date(item.created_at).getFullYear().toString();
  }

  if (item.source_name && year) {
    subtitleText = `${item.source_name} • ${year}`;
  } else if (item.source_name) {
    subtitleText = item.source_name;
  } else if (year && !item.excerpt) {
    subtitleText = `Publicado em ${year}`;
  }

  const safeTitle = encodeURIComponent(item.title);
  const safeSubtitle = encodeURIComponent(subtitleText);

  const image = item.cover_thumb_url || `${hostUrl}/api/og/card?kind=acervo&title=${safeTitle}&subtitle=${safeSubtitle}`;
  const url = `${hostUrl}/acervo/item/${safeSlug}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${escapeHtml(url)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${escapeHtml(url)}">
  <meta property="twitter:title" content="${escapeHtml(title)}">
  <meta property="twitter:description" content="${escapeHtml(description)}">
  <meta property="twitter:image" content="${escapeHtml(image)}">

  <!-- Redirect -->
  <meta http-equiv="refresh" content="0; url=/acervo/item/${safeSlug}">
</head>
<body>
  <p>Redirecionando para o acervo...</p>
</body>
</html>
  `.trim();

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
