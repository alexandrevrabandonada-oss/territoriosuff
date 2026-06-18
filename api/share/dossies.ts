import { createClient } from '@supabase/supabase-js';

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

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.redirect(`/dossies/${slug}`);
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
            kind: 'dossies',
            slug,
            referrer: req.headers['referer'] || null,
            user_agent: req.headers['user-agent'] || null,
            ip_hash: ipHash
        });
    } catch (err) {
        console.error('[ShareAnalytics] Failed to log event:', err);
    }

    const { data: item, error } = await supabase
        .from('acervo_collections')
        .select('title, excerpt, cover_url, cover_thumb_url')
        .eq('slug', slug)
        .single();

    if (error || !item) {
        return res.redirect(`/dossies/${slug}`);
    }

    const title = `${item.title} | Dossiês SEMEAR`;
    const description = item.excerpt || 'Explore este dossiê curado pelo Acervo Digital SEMEAR.';

    const hostUrl = getHostUrl(req);
    const safeTitle = encodeURIComponent(item.title);
    const safeSubtitle = encodeURIComponent(description);

    const image = item.cover_thumb_url || `${hostUrl}/api/og/card?kind=dossies&title=${safeTitle}&subtitle=${safeSubtitle}`;
    const url = `${hostUrl}/dossies/${slug}`;

    const html = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${title}</title>
  <meta name="description" content="${description}">
  
  <!-- Open Graph / Facebook -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${url}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${image}">

  <!-- Twitter -->
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${url}">
  <meta property="twitter:title" content="${title}">
  <meta property="twitter:description" content="${description}">
  <meta property="twitter:image" content="${image}">

  <!-- Redirect -->
  <meta http-equiv="refresh" content="0; url=/dossies/${slug}">
</head>
<body>
  <p>Redirecionando para o dossiê...</p>
</body>
</html>
  `.trim();

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
}
