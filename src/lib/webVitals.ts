import { onCLS, onINP, onLCP, type Metric } from "web-vitals";

import { trackWebVital } from "./observability";

function report(metric: Metric) {
  trackWebVital(metric.name, metric.value, metric.rating);
}

export function initWebVitals() {
  onCLS(report, { reportAllChanges: true });
  onINP(report, { reportAllChanges: true });
  onLCP(report, { reportAllChanges: true });
}
