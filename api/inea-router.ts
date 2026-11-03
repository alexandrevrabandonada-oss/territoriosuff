import handler0 from "../server/air/inea/summary.js";
import handler1 from "../server/air/inea/stations.js";
import handler2 from "../server/air/inea/latest.js";
import handler3 from "../server/air/inea/observability.js";
import handler4 from "../server/air/inea/export-catalog.js";
import handler5 from "../server/air/inea/export-manifest.js";
import handler6 from "../server/air/inea/stations-metadata.js";
import handler7 from "../server/air/inea/classification-days.js";
import handler8 from "../server/air/inea/timeseries.js";
import handler9 from "../server/air/inea/export.js";
import handler10 from "../server/air/inea/analytics/data-gaps.js";
import handler11 from "../server/air/inea/analytics/degraded-days.js";
import handler12 from "../server/air/inea/analytics/monthly-profile.js";
import handler13 from "../server/air/inea/analytics/station-ranking.js";
import handler14 from "../server/air/inea/analytics/controller-frequency.js";

type ApiHandler = (request: any, response: any) => Promise<unknown> | unknown;

// Preserve the legacy endpoints and their original handlers/response contracts.
// Explicit whitelist: never resolve arbitrary user-controlled module paths.
const routes: Record<string, ApiHandler> = {
  "summary": handler0,
  "stations": handler1,
  "latest": handler2,
  "observability": handler3,
  "export-catalog": handler4,
  "export-manifest": handler5,
  "stations-metadata": handler6,
  "classification-days": handler7,
  "timeseries": handler8,
  "export": handler9,
  "analytics/data-gaps": handler10,
  "analytics/degraded-days": handler11,
  "analytics/monthly-profile": handler12,
  "analytics/station-ranking": handler13,
  "analytics/controller-frequency": handler14
};

export default async function router(request: any, response: any) {
  const endpoint = request.query?.endpoint;
  if (typeof endpoint !== "string" || !Object.prototype.hasOwnProperty.call(routes, endpoint)) {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    return response.status(404).json({ error: "Rota não encontrada." });
  }
  return await routes[endpoint](request, response);
}
