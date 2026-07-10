import { useEffect } from "react";

import { DEFAULT_SOCIAL_IMAGE, getCanonicalUrl } from "../content/siteMetadata";

interface MetadataProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
  type?: "website" | "article";
}

function setMetaTag(attributeName: "name" | "property", attributeValue: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(`meta[${attributeName}="${attributeValue}"]`);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attributeName, attributeValue);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function usePageMetadata({
  title,
  description,
  image,
  url,
  type = "website"
}: MetadataProps) {
  useEffect(() => {
    if (!title) return;
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      const resolvedTitle = title.includes("SEMEAR") ? title : `${title} | SEMEAR`;
      const resolvedUrl = url || getCanonicalUrl(window.location.pathname);
      const resolvedImage = image || DEFAULT_SOCIAL_IMAGE;

      document.title = resolvedTitle;
      if (description) setMetaTag("name", "description", description);
      setMetaTag("property", "og:type", type);
      setMetaTag("property", "og:title", resolvedTitle);
      if (description) setMetaTag("property", "og:description", description);
      setMetaTag("property", "og:image", resolvedImage);
      setMetaTag("property", "og:url", resolvedUrl);
      setMetaTag("name", "twitter:card", "summary_large_image");
      setMetaTag("name", "twitter:title", resolvedTitle);
      if (description) setMetaTag("name", "twitter:description", description);
      setMetaTag("name", "twitter:image", resolvedImage);
      setMetaTag("name", "twitter:url", resolvedUrl);

      let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.rel = "canonical";
        document.head.appendChild(canonical);
      }
      canonical.href = resolvedUrl;
    });

    return () => {
      cancelled = true;
    };
  }, [title, description, image, url, type]);
}
