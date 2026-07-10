import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { runDevContrastAudit } from "./lib/contrastAudit";
import { initObservability } from "./lib/observability";
import "./index.css";
import "./styles/home.css";

const stylesheetActivationEvents = ["keydown", "pointerdown", "touchstart"] as const;
let deferredStylesheetTimer: number | undefined;

function activateDeferredStylesheets() {
  if (deferredStylesheetTimer !== undefined) {
    window.clearTimeout(deferredStylesheetTimer);
    deferredStylesheetTimer = undefined;
  }
  for (const eventName of stylesheetActivationEvents) {
    window.removeEventListener(eventName, activateDeferredStylesheets);
  }
  document.querySelectorAll<HTMLLinkElement>('link[data-deferred-stylesheet="true"]').forEach((stylesheet) => {
    const href = stylesheet.dataset.href;
    if (href) stylesheet.href = href;
    stylesheet.rel = "stylesheet";
    stylesheet.removeAttribute("as");
    stylesheet.removeAttribute("data-deferred-stylesheet");
    stylesheet.removeAttribute("data-href");
  });
}

if (document.querySelector('link[data-deferred-stylesheet="true"]')) {
  for (const eventName of stylesheetActivationEvents) {
    window.addEventListener(eventName, activateDeferredStylesheets, { once: true, passive: true });
  }
  deferredStylesheetTimer = window.setTimeout(activateDeferredStylesheets, 15_000);
}

initObservability();
runDevContrastAudit();

if (import.meta.env.PROD) {
  const loadVitals = () => {
    void import("./lib/webVitals").then(({ initWebVitals }) => initWebVitals());
  };
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(loadVitals, { timeout: 3000 });
  } else {
    globalThis.setTimeout(loadVitals, 1500);
  }
}

const root = document.getElementById("root") as HTMLElement;

function HydrationReady({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    root.dataset.hydrated = "true";
  }, []);

  return children;
}

const application = (
  <React.StrictMode>
    <BrowserRouter>
      <HydrationReady>
        <App />
      </HydrationReady>
    </BrowserRouter>
  </React.StrictMode>
);

if (root.hasChildNodes()) {
  ReactDOM.hydrateRoot(root, application);
} else {
  ReactDOM.createRoot(root).render(application);
}
