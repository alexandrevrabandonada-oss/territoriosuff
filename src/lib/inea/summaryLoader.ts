type SummaryPayload = Record<string, any>;

const summaryLoaders: Record<string, () => Promise<SummaryPayload>> = {
  "2013": () => import("../../../data/inea_weblakes_normalized/summary-2013.json").then((module) => module.default as SummaryPayload),
  "2014": () => import("../../../data/inea_weblakes_normalized/summary-2014.json").then((module) => module.default as SummaryPayload),
  "2015": () => import("../../../data/inea_weblakes_normalized/summary-2015.json").then((module) => module.default as SummaryPayload),
  "2016": () => import("../../../data/inea_weblakes_normalized/summary-2016.json").then((module) => module.default as SummaryPayload),
  "2017": () => import("../../../data/inea_weblakes_normalized/summary-2017.json").then((module) => module.default as SummaryPayload),
  "2018": () => import("../../../data/inea_weblakes_normalized/summary-2018.json").then((module) => module.default as SummaryPayload),
  "2019": () => import("../../../data/inea_weblakes_normalized/summary-2019.json").then((module) => module.default as SummaryPayload),
  "2020": () => import("../../../data/inea_weblakes_normalized/summary-2020.json").then((module) => module.default as SummaryPayload),
  "2021": () => import("../../../data/inea_weblakes_normalized/summary-2021.json").then((module) => module.default as SummaryPayload),
  "2022": () => import("../../../data/inea_weblakes_normalized/summary-2022.json").then((module) => module.default as SummaryPayload),
  "2023": () => import("../../../data/inea_weblakes_normalized/summary-2023.json").then((module) => module.default as SummaryPayload),
  "2024": () => import("../../../data/inea_weblakes_normalized/summary-2024.json").then((module) => module.default as SummaryPayload),
  "2025": () => import("../../../data/inea_weblakes_normalized/summary-2025.json").then((module) => module.default as SummaryPayload),
  "2026": () => import("../../../data/inea_weblakes_normalized/summary-2026.json").then((module) => module.default as SummaryPayload)
};

const summaryCache = new Map<string, SummaryPayload>();

export async function loadIneaSummaryYear(year: string): Promise<SummaryPayload | null> {
  if (summaryCache.has(year)) {
    return summaryCache.get(year) ?? null;
  }

  const loader = summaryLoaders[year];
  if (!loader) return null;

  const summary = await loader();
  summaryCache.set(year, summary);
  return summary;
}
