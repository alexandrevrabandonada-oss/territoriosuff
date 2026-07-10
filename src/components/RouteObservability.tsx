import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

import { DEFAULT_SOCIAL_IMAGE, getCanonicalUrl, getSiteRouteMetadata } from "../content/siteMetadata";
import { trackNavigation } from "../lib/observability";

function getRouteAnnouncement(pathname: string): string {
  return getSiteRouteMetadata(pathname).title.split("|")[0].trim();
}

function setMetaContent(selector: string, attribute: "name" | "property", key: string, content: string) {
  let element = document.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement("meta");
    element.setAttribute(attribute, key);
    document.head.appendChild(element);
  }
  element.content = content;
}

export function RouteObservability() {
  const location = useLocation();
  const previousPathnameRef = useRef(location.pathname);

  useEffect(() => {
    const metadata = getSiteRouteMetadata(location.pathname);
    const canonicalUrl = getCanonicalUrl(location.pathname);

    trackNavigation(location.pathname);
    document.title = metadata.title;
    setMetaContent('meta[name="description"]', "name", "description", metadata.description);
    setMetaContent('meta[property="og:title"]', "property", "og:title", metadata.title);
    setMetaContent('meta[property="og:description"]', "property", "og:description", metadata.description);
    setMetaContent('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMetaContent('meta[property="og:image"]', "property", "og:image", DEFAULT_SOCIAL_IMAGE);
    setMetaContent('meta[name="twitter:title"]', "name", "twitter:title", metadata.title);
    setMetaContent('meta[name="twitter:description"]', "name", "twitter:description", metadata.description);
    setMetaContent('meta[name="twitter:image"]', "name", "twitter:image", DEFAULT_SOCIAL_IMAGE);

    let canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement("link");
      canonical.rel = "canonical";
      document.head.appendChild(canonical);
    }
    canonical.href = canonicalUrl;

    if (previousPathnameRef.current !== location.pathname) {
      const main = document.getElementById("main-content");
      if (main) {
        window.setTimeout(() => main.focus({ preventScroll: true }), 0);
      }
    }

    previousPathnameRef.current = location.pathname;
  }, [location.pathname]);

  return (
    <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
      {getRouteAnnouncement(location.pathname)}
    </div>
  );
}
