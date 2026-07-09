import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import { runDevContrastAudit } from "./lib/contrastAudit";
import { initObservability } from "./lib/observability";
import "./index.css";

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

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
