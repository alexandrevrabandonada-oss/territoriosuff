type InstagramEmbedProps = {
  title: string;
  url: string;
  variant?: "default" | "article";
};

function getInstagramEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();
    if (hostname !== "instagram.com" && hostname !== "www.instagram.com") return null;

    const match = parsed.pathname.match(/\/(p|reel|tv)\/([^/?#]+)/);
    if (!match) return null;

    return `https://www.instagram.com/${match[1]}/${match[2]}/embed/captioned/`;
  } catch {
    return null;
  }
}

export function InstagramEmbed({ title, url, variant = "default" }: InstagramEmbedProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const embedUrl = getInstagramEmbedUrl(url);

  if (!embedUrl) {
    return (
      <a className="instagram-card-fallback" href={url} rel="noopener noreferrer" target="_blank">
        Abrir publicação no Instagram
      </a>
    );
  }

  return (
    <div className={`instagram-embed-shell ${variant === "article" ? "instagram-embed-shell-article" : ""}`}>
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-slate-900">
        <p className="text-sm font-bold">Publicação do Instagram: {title}</p>
        <p className="mt-1 text-xs leading-relaxed text-slate-700">
          O conteúdo incorporado é opcional e pode conter elementos de terceiros sem descrição textual completa.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {!isLoaded ? (
            <button
              type="button"
              className="min-h-11 rounded-xl bg-slate-900 px-4 py-2 text-xs font-black text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
              onClick={() => setIsLoaded(true)}
            >
              Carregar publicação incorporada
            </button>
          ) : null}
          <a
            className="inline-flex min-h-11 items-center rounded-xl border border-slate-300 px-4 py-2 text-xs font-black text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-600 focus:ring-offset-2"
            href={url}
            rel="noopener noreferrer"
            target="_blank"
          >
            Abrir no Instagram
          </a>
        </div>
      </div>
      {isLoaded ? (
        <iframe
          allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          className={`instagram-embed-frame ${variant === "article" ? "instagram-embed-frame-article" : ""}`}
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox"
          src={embedUrl}
          title={`Publicação do Instagram: ${title}`}
        />
      ) : null}
    </div>
  );
}
import { useState } from "react";
