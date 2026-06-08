import { trackApiError } from '../observability';
import { assertSupabase as assertSupabaseClient } from '../supabase/client';

export const assertSupabase = assertSupabaseClient;

export type Station = {
  id: string;
  name: string;
  [key: string]: unknown;
};

export type Measurement = {
  id: string;
  station_id: string;
  ts: string;
  [key: string]: unknown;
};

export type DownsampledMeasurement = {
  bucket_ts: string;
  pm25: number | null;
  pm10: number | null;
  temp: number | null;
  humidity: number | null;
  quality_flag: string | null;
};

export type StationOverview = {
  station_id: string;
  code: string;
  name: string;
  bairro: string;
  last_seen_at: string;
  is_online: boolean;
  last_ts: string | null;
  pm25: number | null;
  pm10: number | null;
  temp: number | null;
  humidity: number | null;
};

export type StationHealth = {
  station_id: string;
  code: string;
  name: string;
  is_online: boolean;
  health_status: "ok" | "degraded" | "offline" | "unknown";
  last_measurement_ts: string | null;
  last_seen_at: string;
};

export type Event = {
  id: string;
  title: string;
  start_at: string;
  status?: string;
  [key: string]: unknown;
};

export type EventSummary = {
  id: string;
  title: string;
  start_at: string;
  location?: string | null;
  capacity?: number | null;
};

export type RegistrationPayload = {
  event_id: string;
  name: string;
  email: string;
  whatsapp: string;
  bairro: string;
  consent_lgpd: boolean;
};

export type RegistrationResult = {
  status: "confirmed" | "waitlist";
};

export type AcervoKind =
  | "artigo_cientifico"
  | "noticia"
  | "materia"
  | "midia"
  | "foto"
  | "video"
  | "documento"
  | "relatorio_tecnico"
  | "memoria"
  | "outro"
  | "paper"
  | "news"
  | "photo"
  | "report"
  | "link";

export type AcervoItem = {
  id: string;
  kind: AcervoKind;
  title: string;
  slug: string;
  excerpt: string | null;
  content_md: string | null;
  cover_url: string | null;
  cover_thumb_url: string | null;
  cover_small_url: string | null;
  source_name: string | null;
  source_url: string | null;
  published_at: string | null;
  publish_at: string | null;
  year: number | null;
  city: string;
  tags: string[];
  meta: Record<string, unknown>;
  curator_note: string | null;
  authors: string | null;
  doi: string | null;
  featured: boolean;
  source_type: string | null;
  media: Array<{ url: string; type: string; title?: string }> | null;
  created_at: string;
};

export type ListAcervoParams = {
  kind?: AcervoKind;
  q?: string;
  tag?: string;
  year?: number;
  featured?: boolean;
  source_type?: string;
  limit?: number;
  offset?: number;
};

export type AcervoYearIndex = {
  year: number;
  total: number;
};

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string | null;
  cover_url: string | null;
  cover_asset_id?: string | null;
  cover_thumb_url: string | null;
  cover_small_url: string | null;
  tags: string[];
  published_at: string | null;
  publish_at: string | null;
  status: "draft" | "scheduled" | "published" | "archived";
  category: string | null;
  author_name: string | null;
  created_at: string;
};

export type ListBlogParams = {
  q?: string;
  tag?: string;
  limit?: number;
  offset?: number;
  includeScheduled?: boolean;
};

export type ReportKind = "relatorio" | "nota-tecnica" | "boletim" | "anexo";

export type ReportDocument = {
  id: string;
  slug: string;
  title: string;
  summary: string | null;
  published_at: string | null;
  year: number | null;
  kind: ReportKind;
  featured: boolean;
  pdf_url: string | null;
  pdf_asset_id?: string | null;
  cover_url: string | null;
  cover_asset_id?: string | null;
  cover_thumb_url: string | null;
  tags: string[];
  created_at: string;
};

export type ListReportsParams = {
  year?: number;
  kind?: ReportKind;
  tag?: string;
  q?: string;
  limit?: number;
};

export type TransparencyLink = {
  id: string;
  title: string;
  url: string;
  kind: "portal" | "processo" | "nota" | "arquivo";
  created_at: string;
};

export type Expense = {
  id: string;
  occurred_on: string;
  vendor: string;
  description: string;
  category: string;
  amount_cents: number;
  document_url: string | null;
  meta: Record<string, unknown>;
  created_at: string;
};

export type TransparencySummary = {
  total_cents: number;
  by_category: Record<string, number>;
  count: number;
};

export type OpsKPI = {
  total_measurements: number;
  inserted_count: number;
  duplicated_count: number;
  total_push_alerts: number;
  published_events_count: number;
  published_acervo_items_count: number;
  published_blog_posts_count: number;
  published_content_items_count: number;
  scheduled_acervo_items_count: number;
  scheduled_blog_posts_count: number;
  scheduled_content_items_count: number;
};

export type StationKPI = {
  station_code: string;
  station_name: string;
  measurements_count: number;
  above_threshold_24h: number;
};

export type SystemStatus = {
  monitoring: {
    stations_count: number;
    measurements_24h: number;
    latest_measurement: {
      ts: string;
      station_name: string;
    } | null;
  };
  content: {
    upcoming_events: EventSummary[];
    latest_acervo: AcervoItem[];
    latest_blog: BlogPost[];
    reports_published_month: number;
  };
  transparency: TransparencySummary & {
    current_month_total_cents: number;
    current_month_by_category: Record<string, number>;
    current_month_count: number;
    last_7d_total_cents: number;
    last_7d_by_category: Record<string, number>;
    last_7d_count: number;
  };
  social: {
    total_7d: number;
    by_kind: Record<string, number>;
    top_slugs: { kind: string; slug: string; count: number }[];
  };
  alerts: {
    total_7d: number;
    top_stations: { station_code: string; count: number }[];
    top_pollutants: { pollutant: string; count: number }[];
  };
  network_health: {
    ok: number;
    degraded: number;
    offline: number;
    unknown: number;
  };
  operations: {
    kpis: OpsKPI;
    station_metrics: StationKPI[];
  };
};

export interface SearchResultItem {
  kind: "acervo" | "blog" | "report";
  title: string;
  slug: string;
  excerpt: string;
  score: number;
  url: string;
}

export interface AcervoCollection {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_url: string | null;
  cover_thumb_url: string | null;
  cover_small_url: string | null;
  tags: string[];
  featured?: boolean;
  position?: number;
  created_at: string;
}

export interface CollectionWithItems extends AcervoCollection {
  items: AcervoItem[];
}

export type Conversation = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body_md: string | null;
  status: "draft" | "published";
  meta?: {
    kind?: "conversation" | "activity";
    instagram_url?: string;
    activity_date?: string;
    location?: string;
    [key: string]: unknown;
  } | null;
  created_at: string;
};

export type ConversationComment = {
  id: string;
  conversation_id: string;
  name: string;
  body: string;
  is_hidden: boolean;
  created_at: string;
};

export type ClimateCorridor = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  geometry_json: any | null;
  featured: boolean;
  cover_url: string | null;
  note_md: string | null;
  position: number;
  created_at: string;
  meta: any;
};

export type ClimateCorridorLink = {
  corridor_id: string;
  item_kind: "station" | "acervo" | "blog" | "event";
  item_ref: string;
  position: number;
};

export type ClimateCorridorWithLinks = ClimateCorridor & {
  links: ClimateCorridorLink[];
};

export type EnvironmentalReport = {
  id: string;
  reporter_name: string;
  reporter_email: string | null;
  reporter_phone: string | null;
  category: string;
  description: string;
  location: string;
  image_url: string | null;
  status: "new" | "reviewed" | "resolved" | "archived";
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
};

export function toAppError(scope: string, error: unknown): Error {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "Erro inesperado na comunicacao com o banco.";
  trackApiError(scope, error);
  return new Error(`${scope}: ${message}`);
}

export function parseCapacity(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0) return null;
  return Math.floor(value);
}

export function isPublishTimeReached(publishAt: string | null): boolean {
  if (!publishAt) return true;
  return new Date(publishAt).getTime() <= Date.now();
}

export function toSafeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function normalizeOpsKpi(raw?: Partial<OpsKPI> | null): OpsKPI {
  return {
    total_measurements: toSafeNumber(raw?.total_measurements),
    inserted_count: toSafeNumber(raw?.inserted_count),
    duplicated_count: toSafeNumber(raw?.duplicated_count),
    total_push_alerts: toSafeNumber(raw?.total_push_alerts),
    published_events_count: toSafeNumber(raw?.published_events_count),
    published_acervo_items_count: toSafeNumber(raw?.published_acervo_items_count),
    published_blog_posts_count: toSafeNumber(raw?.published_blog_posts_count),
    published_content_items_count: toSafeNumber(raw?.published_content_items_count),
    scheduled_acervo_items_count: toSafeNumber(raw?.scheduled_acervo_items_count),
    scheduled_blog_posts_count: toSafeNumber(raw?.scheduled_blog_posts_count),
    scheduled_content_items_count: toSafeNumber(raw?.scheduled_content_items_count)
  };
}
