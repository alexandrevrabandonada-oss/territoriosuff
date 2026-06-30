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
    return res.redirect(`/blog/${safeSlug}`);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // --- Share Analytics (Privacy-Safe) ---
  try {
    const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || '0.0.0.0';
    const salt = process.env.SHARE_HASH_SALT || 'default-salt-change-me';

    const crypto = await import('node:crypto');
    const ipHash = crypto.createHash('sha256').update(`${ip}${salt}`).digest('hex');

    await supabase.from('share_events').insert({
      kind: 'blog',
      slug,
      referrer: req.headers['referer'] || null,
      user_agent: req.headers['user-agent'] || null,
      ip_hash: ipHash
    });
  } catch (err) {
    console.error('[ShareAnalytics] Failed to log event:', err);
  }

  const { data: post, error } = await supabase
    .from('blog_posts')
    .select('title, excerpt, cover_url, published_at, created_at')
    .eq('slug', slug)
    .single();

  if (error || !post) {
    return res.redirect(`/blog/${safeSlug}`);
  }

  const hostUrl = getHostUrl(req);
  const title = `${post.title} | Blog SEMEAR`;
  const description = post.excerpt || 'Leia este artigo no Blog SEMEAR.';

  let subtitleText = post.excerpt || 'Leia este artigo';
  let year = '';

  if (post.published_at) {
    year = new Date(post.published_at).getFullYear().toString();
  } else if (post.created_at) {
    year = new Date(post.created_at).getFullYear().toString();
  }

  if (year && !post.excerpt) {
    subtitleText = `Publicado em ${year}`;
  }

  const safeTitle = encodeURIComponent(post.title);
  const safeSubtitle = encodeURIComponent(subtitleText);

  const image = post.cover_url || `${hostUrl}/api/og/card?kind=blog&title=${safeTitle}&subtitle=${safeSubtitle}`;
  const url = `${hostUrl}/blog/${safeSlug}`;

  const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="article">
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
  <meta http-equiv="refresh" content="0; url=/blog/${safeSlug}">
</head>
<body>
  <p>Redirecionando para o blog...</p>
</body>
</html>
  `.trim();

  res.setHeader('Content-Type', 'text/html');
  return res.status(200).send(html);
}
