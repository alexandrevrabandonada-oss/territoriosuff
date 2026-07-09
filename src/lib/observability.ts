const STORAGE_KEY = "semear_observability_events_v1";
const MAX_EVENTS = 500;
const MAX_TEXT_LENGTH = 120;
const ERROR_EVENT_NAMES = new Set(["api_error", "runtime_error"]);
const ALLOWED_META_KEYS = new Set([
  "route",
  "source",
  "kind",
  "slug",
  "status",
  "code",
  "count",
  "year",
  "month",
  "rows",
  "name",
  "value",
  "rating",
  "label",
  "message",
  "reason"
]);

type ObservabilityEventName =
  | "navigation"
  | "share"
  | "csv_download"
  | "api_error"
  | "runtime_error"
  | "web_vital"
  | "offline_fallback";

type AllowedMetaValue = string | number | boolean | null | undefined;
export type ObservabilityMeta = Record<string, AllowedMetaValue>;

type StoredEvent = {
  ts: number;
  name: ObservabilityEventName;
  meta: Record<string, string | number | boolean>;
};

type ErrorSummary = {
  total: number;
  apiErrors: number;
  runtimeErrors: number;
};

let initialized = false;
let sentryPromise: Promise<typeof import("@sentry/react")> | null = null;

function loadSentry() {
  sentryPromise ??= import("@sentry/react");
  return sentryPromise;
}

function hasLocalStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function sanitizeText(value: unknown): string {
  const text = String(value ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/https?:\/\/\S+/gi, "[url]")
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[email]")
    .replace(/\s+/g, " ")
    .trim();
  if (!text) return "";
  return text.slice(0, MAX_TEXT_LENGTH);
}

function sanitizeRoute(value: unknown): string {
  const text = sanitizeText(value);
  if (!text) return "";
  return text.split("?")[0].split("#")[0];
}

function sanitizeMeta(meta?: ObservabilityMeta): Record<string, string | number | boolean> {
  if (!meta) return {};

  const sanitized: Record<string, string | number | boolean> = {};
  for (const [key, value] of Object.entries(meta)) {
    if (!ALLOWED_META_KEYS.has(key)) continue;
    if (value === undefined || value === null) continue;

    if (typeof value === "number" && Number.isFinite(value)) {
      sanitized[key] = value;
      continue;
    }

    if (typeof value === "boolean") {
      sanitized[key] = value;
      continue;
    }

    const text = key === "route" ? sanitizeRoute(value) : sanitizeText(value);
    if (text) sanitized[key] = text;
  }

  return sanitized;
}

function readStoredEvents(): StoredEvent[] {
  if (!hasLocalStorage()) return [];

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as StoredEvent[];
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((event) => event && typeof event.ts === "number" && typeof event.name === "string")
      .slice(-MAX_EVENTS);
  } catch {
    return [];
  }
}

function writeStoredEvents(events: StoredEvent[]) {
  if (!hasLocalStorage()) return;

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(events.slice(-MAX_EVENTS)));
  } catch {
    // Ignore persistence failures.
  }
}

function pushStoredEvent(name: ObservabilityEventName, meta: Record<string, string | number | boolean>) {
  const events = readStoredEvents();
  events.push({ ts: Date.now(), name, meta });
  writeStoredEvents(events);
}

function addBreadcrumb(name: ObservabilityEventName, meta: Record<string, string | number | boolean>) {
  if (!import.meta.env.VITE_SENTRY_DSN) return;
  void loadSentry().then((Sentry) => {
    Sentry.addBreadcrumb({
      category: "observability",
      message: name,
      level: name === "runtime_error" || name === "api_error" ? "error" : "info",
      data: meta
    });
  });
}

export function initObservability() {
  if (typeof window === "undefined" || initialized) return;
  initialized = true;

  if (import.meta.env.VITE_SENTRY_DSN) {
    void loadSentry().then((Sentry) => {
      Sentry.init({
        dsn: import.meta.env.VITE_SENTRY_DSN,
        environment: import.meta.env.MODE,
        release: import.meta.env.VITE_SENTRY_RELEASE || import.meta.env.VITE_VERCEL_GIT_COMMIT_SHA || undefined,
        sendDefaultPii: false,
        beforeSend(event) {
          if (event.user) {
            event.user = undefined;
          }
          if (event.request) {
            event.request = {
              url: event.request.url,
              method: event.request.method
            };
          }
          if (event.extra) {
            const sanitizedExtra: Record<string, unknown> = {};
            for (const [key, value] of Object.entries(event.extra)) {
              if (typeof value === "string") {
                sanitizedExtra[key] = sanitizeText(value);
              } else if (typeof value === "number" || typeof value === "boolean") {
                sanitizedExtra[key] = value;
              }
            }
            event.extra = sanitizedExtra;
          }
          return event;
        }
      });
    });
  }

  window.addEventListener("error", (event) => {
    logEvent("runtime_error", {
      source: "window",
      message: event.message || "Erro de runtime"
    });
  });

  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason instanceof Error ? event.reason.message : event.reason;
    logEvent("runtime_error", {
      source: "promise",
      message: sanitizeText(reason || "Promise rejeitada sem tratamento")
    });
  });
}

export function logEvent(name: ObservabilityEventName, meta?: ObservabilityMeta) {
  const sanitizedMeta = sanitizeMeta(meta);
  pushStoredEvent(name, sanitizedMeta);
  addBreadcrumb(name, sanitizedMeta);
}

export function trackNavigation(route: string) {
  logEvent("navigation", { route });
}

export function trackShare(kind: string, slug: string, source: string) {
  logEvent("share", { kind, slug, source });
}

export function trackCsvDownload(source: string, rows?: number) {
  logEvent("csv_download", { source, rows });
}

export function trackOfflineFallback(route: string) {
  logEvent("offline_fallback", { route });
}

export function trackWebVital(name: string, value: number, rating: string) {
  logEvent("web_vital", {
    name,
    value: Math.round(value * 1000) / 1000,
    rating,
    route: typeof window === "undefined" ? "" : window.location.pathname
  });
}

export function trackApiError(scope: string, error: unknown, meta?: ObservabilityMeta) {
  const message = error instanceof Error ? error.message : String(error ?? "Erro desconhecido");
  logEvent("api_error", {
    source: scope,
    message,
    ...meta
  });
}

export function getObservabilityErrorSummaryLast24h(): ErrorSummary {
  const cutoff = Date.now() - 24 * 60 * 60 * 1000;
  return readStoredEvents()
    .filter((event) => event.ts >= cutoff && ERROR_EVENT_NAMES.has(event.name))
    .reduce(
      (acc, event) => {
        acc.total += 1;
        if (event.name === "api_error") acc.apiErrors += 1;
        if (event.name === "runtime_error") acc.runtimeErrors += 1;
        return acc;
      },
      { total: 0, apiErrors: 0, runtimeErrors: 0 }
    );
}


