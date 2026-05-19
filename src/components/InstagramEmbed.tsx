type InstagramEmbedProps = {
  title: string;
  url: string;
};

function getInstagramEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "instagram.com" && hostname !== "www.instagram.com") return null;

    const match = parsed.pathname.match(/\/(p|reel|tv)\/([^/?#]+)/);
    if (!match) return null;

    return `https://www.instagram.com/${match[1]}/${match[2]}/embed`;
  } catch {
    return null;
  }
}

export function InstagramEmbed({ title, url }: InstagramEmbedProps) {
  const embedUrl = getInstagramEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a className="instagram-card-fallback" href={url} rel="noopener noreferrer" target="_blank">
        Abrir publicação no Instagram
      </a>
    );
  }

  return (
    <div className="instagram-embed-shell">
      <iframe
        allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
        className="instagram-embed-frame"
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
        src={embedUrl}
        title={`Publicação do Instagram: ${title}`}
      />
    </div>
  );
}
