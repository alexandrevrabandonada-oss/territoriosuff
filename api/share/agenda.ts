import { createClient } from '@supabase/supabase-js';

function escapeHtml(value: string) {
    return value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

export default async function handler(req: any, res: any) {
    const { eventId } = req.query;

    if (!eventId) {
        return res.redirect('/agenda');
    }

    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
        return res.redirect(`/agenda/${encodeURIComponent(String(eventId))}`);
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data: event, error } = await supabase
        .from('events')
        .select('title, start_at, location, location_name, description, registration_enabled')
        .eq('id', eventId)
        .single();

    if (error || !event) {
        return res.redirect('/agenda');
    }

    const date = new Date(event.start_at).toLocaleString('pt-BR');
    const title = `${event.title} | Agenda SEMEAR`;
    const location = event.location_name || event.location || 'Local a definir';
    const description = `${date} em ${location}. ${event.description || ''}`.slice(0, 160);
    const image = 'https://semear-pwa.vercel.app/icons/icon-512.png';
    const targetPath = `/agenda/${encodeURIComponent(String(eventId))}`;
    const url = `https://semear-pwa.vercel.app${targetPath}`;

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
  <meta http-equiv="refresh" content="0; url=${escapeHtml(targetPath)}">
</head>
<body>
  <p>Redirecionando para a agenda...</p>
</body>
</html>
  `.trim();

    res.setHeader('Content-Type', 'text/html');
    return res.status(200).send(html);
}
