import { isAboveOmsThreshold } from "./airQuality";
import { assertSupabase } from "./supabase/client";

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

export async function getStationOverview(): Promise<StationOverview[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.rpc("get_station_overview");
    if (error) throw error;
    return (data ?? []) as StationOverview[];
  } catch (error) {
    throw toAppError("Falha ao buscar visão geral das estações", error);
  }
}

export type StationHealth = {
  station_id: string;
  code: string;
  name: string;
  is_online: boolean;
  health_status: 'ok' | 'degraded' | 'offline' | 'unknown';
  last_measurement_ts: string | null;
  last_seen_at: string;
};

export async function getStationHealth(): Promise<StationHealth[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.rpc("get_station_health");
    if (error) throw error;
    return (data ?? []) as StationHealth[];
  } catch (error) {
    throw toAppError("Falha ao buscar saúde das estações", error);
  }
}


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

function toAppError(scope: string, error: unknown): Error {
  const message =
    error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "Erro inesperado na comunicacao com o banco.";
  return new Error(`${scope}: ${message}`);
}

function isDemoRecord(row: Record<string, unknown>): boolean {
  const slug = typeof row.slug === "string" ? row.slug : "";
  const meta = row.meta && typeof row.meta === "object" && !Array.isArray(row.meta)
    ? row.meta as Record<string, unknown>
    : {};

  return slug.startsWith("demo-") || meta.demo === true || meta.demo === "true";
}

function parseCapacity(value: unknown): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  if (value < 0) return null;
  return Math.floor(value);
}

export async function listStations(): Promise<Station[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.from("stations").select("*").order("name", { ascending: true });
    if (error) throw error;
    return (data ?? []) as Station[];
  } catch (error) {
    throw toAppError("Falha ao listar estacoes", error);
  }
}

export async function getLatestMeasurements(stationId: string, limit = 20): Promise<Measurement[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("measurements")
      .select("*")
      .eq("station_id", stationId)
      .order("ts", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Measurement[];
  } catch (error) {
    throw toAppError("Falha ao listar medicoes", error);
  }
}

export async function getMeasurementsDownsampled(
  stationId: string,
  range: "24h" | "7d"
): Promise<DownsampledMeasurement[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.rpc("get_measurements_downsampled", {
      p_station_id: stationId,
      p_range: range
    });
    if (error) throw error;
    return (data ?? []) as DownsampledMeasurement[];
  } catch (error) {
    throw toAppError("Falha ao listar medicoes consolidadas", error);
  }
}

export async function listUpcomingEvents(): Promise<Event[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .order("start_at", { ascending: true })
      .limit(20);
    if (error) throw error;
    return (data ?? []) as Event[];
  } catch (error) {
    throw toAppError("Falha ao listar eventos", error);
  }
}

export async function getEventSummary(eventId: string): Promise<EventSummary | null> {
  try {
    const supabase = assertSupabase();
    const results = await Promise.all([
      supabase
        .from("events")
        .select("id, title, start_at, location, capacity")
        .eq("id", eventId)
        .maybeSingle(),
    ]);
    const { data, error } = results[0];
    if (error) throw error;
    return (data as EventSummary | null) ?? null;
  } catch (error) {
    throw toAppError("Falha ao carregar dados do evento", error);
  }
}

async function getEventRegistrationCount(eventId: string): Promise<number> {
  const supabase = assertSupabase();
  const { count, error } = await supabase
    .from("registrations")
    .select("*", { count: "exact", head: true })
    .eq("event_id", eventId);
  if (error) throw error;
  return count ?? 0;
}

export async function createRegistration(payload: RegistrationPayload): Promise<RegistrationResult> {
  try {
    if (!payload.consent_lgpd) {
      throw new Error("Para concluir a inscricao, voce precisa aceitar o consentimento LGPD.");
    }
    if (!payload.event_id) {
      throw new Error("Evento nao informado. Acesse a inscricao por um evento da agenda.");
    }

    const supabase = assertSupabase();
    const event = await getEventSummary(payload.event_id);
    if (!event) {
      throw new Error("Evento nao encontrado para inscricao.");
    }

    const capacity = parseCapacity(event.capacity);
    const currentCount = capacity === null ? 0 : await getEventRegistrationCount(payload.event_id);
    const registrationStatus: RegistrationResult["status"] =
      capacity !== null && currentCount >= capacity ? "waitlist" : "confirmed";

    const { error } = await supabase.from("registrations").insert({
      event_id: payload.event_id,
      name: payload.name,
      email: payload.email,
      whatsapp: payload.whatsapp,
      bairro: payload.bairro,
      consent_lgpd: true,
      status: registrationStatus
    });

    if (error) throw error;
    return { status: registrationStatus };
  } catch (error) {
    throw toAppError("Falha ao criar inscricao", error);
  }
}

// ─────────────────────────────────────────
// Acervo
// ─────────────────────────────────────────

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

function rowToAcervoItem(row: Record<string, unknown>): AcervoItem {
  const meta = row.meta && typeof row.meta === "object" && !Array.isArray(row.meta)
    ? (row.meta as Record<string, unknown>)
    : {};
  const rowMedia = Array.isArray(row.media)
    ? row.media
    : Array.isArray(meta.media)
      ? meta.media
      : null;

  return {
    id: String(row.id ?? ""),
    kind: ((row.type ?? row.kind) as AcervoKind) ?? "link",
    title: String(row.title ?? "Sem título"),
    slug: String(row.slug ?? ""),
    excerpt: typeof row.summary === "string"
      ? row.summary
      : typeof row.excerpt === "string"
        ? row.excerpt
        : null,
    content_md: typeof row.content_md === "string" ? row.content_md : null,
    cover_url: typeof row.cover_url === "string" ? row.cover_url : null,
    cover_thumb_url: typeof row.cover_thumb_url === "string" ? row.cover_thumb_url : null,
    cover_small_url: typeof row.cover_small_url === "string" ? row.cover_small_url : null,
    source_name: typeof row.source_name === "string" ? row.source_name : null,
    source_url: typeof row.source_url === "string" ? row.source_url : null,
    published_at: typeof row.published_at === "string" ? row.published_at : null,
    publish_at: typeof row.publish_at === "string" ? row.publish_at : null,
    year: typeof row.year === "number" ? row.year : null,
    city: typeof row.city === "string" ? row.city : "Volta Redonda",
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    meta,
    curator_note: typeof row.curator_note === "string" ? row.curator_note : null,
    authors: typeof row.authors === "string" ? row.authors : null,
    doi: typeof row.doi === "string" ? row.doi : null,
    featured: Boolean(row.featured),
    source_type: typeof row.source_type === "string" ? row.source_type : null,
    media: rowMedia
      ? rowMedia
        .filter((item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item))
        .map((item) => ({
          url: typeof item.url === "string"
            ? item.url
            : typeof item.public_url === "string"
              ? item.public_url
              : "",
          type: typeof item.type === "string"
            ? item.type
            : typeof item.mime_type === "string"
              ? item.mime_type
              : "application/octet-stream",
          title: typeof item.title === "string"
            ? item.title
            : typeof item.file_name === "string"
              ? item.file_name
              : undefined,
        }))
        .filter((item) => Boolean(item.url))
      : null,
    created_at: typeof row.created_at === "string" ? row.created_at : ""
  };
}

export async function listAcervoItems(params: ListAcervoParams = {}): Promise<AcervoItem[]> {
  try {
    const { kind, q, tag, year, featured, source_type, limit = 50, offset = 0 } = params;
    const supabase = assertSupabase();

    let query = supabase
      .from("acervo_items")
      .select("id, type, title, slug, summary, cover_url, cover_thumb_url, cover_small_url, source_name, source_url, authors, published_at, publish_at, year, city, tags, meta, featured, source_type, created_at")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (kind) query = query.eq("type", kind);
    if (year) query = query.eq("year", year);
    if (featured !== undefined) query = query.eq("featured", featured);
    if (source_type) query = query.eq("source_type", source_type);
    if (tag) query = query.contains("tags", [tag]);
    if (q) query = query.textSearch("search_vec", q, { config: "portuguese", type: "websearch" });

    const { data, error } = await query;
    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[])
      .filter((row) => !isDemoRecord(row))
      .map(rowToAcervoItem)
      .filter((item) => isPublishTimeReached(item.publish_at));
  } catch (error) {
    throw toAppError("Falha ao listar itens do acervo", error);
  }
}

export async function listFeaturedAcervo(limit = 6): Promise<AcervoItem[]> {
  return listAcervoItems({ featured: true, limit });
}

export async function getAcervoBySlug(slug: string): Promise<AcervoItem | null> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("acervo_items")
      .select("id, type, title, slug, summary, content_md, source_name, source_url, published_at, publish_at, year, city, tags, meta, media, curator_note, authors, doi, featured, source_type, created_at")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    if (isDemoRecord(data as Record<string, unknown>)) return null;
    const item = rowToAcervoItem(data as Record<string, unknown>);
    if (!isPublishTimeReached(item.publish_at)) return null;
    return item;
  } catch (error) {
    throw toAppError("Falha ao carregar item do acervo", error);
  }
}

export type AcervoYearIndex = {
  year: number;
  total: number;
};

export async function getAcervoYearIndex(): Promise<AcervoYearIndex[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("acervo_items")
      .select("slug, meta, year, published_at, publish_at")
      .eq("status", "published")
      .order("year", { ascending: false, nullsFirst: false });
    if (error) throw error;
    const totals = new Map<number, number>();
    for (const row of (data || []) as Record<string, unknown>[]) {
      if (isDemoRecord(row)) continue;
      const publishAt = typeof row.publish_at === "string" ? row.publish_at : null;
      if (!isPublishTimeReached(publishAt)) continue;
      const year = typeof row.year === "number"
        ? row.year
        : typeof row.published_at === "string"
          ? new Date(row.published_at).getFullYear()
          : NaN;
      if (!Number.isFinite(year)) continue;
      totals.set(year, (totals.get(year) ?? 0) + 1);
    }
    return Array.from(totals.entries())
      .sort(([a], [b]) => b - a)
      .map(([year, total]) => ({ year, total }));
  } catch (error) {
    throw toAppError("Falha ao carregar indice da linha do tempo", error);
  }
}

export async function getAcervoByYear(year: number, limit = 200): Promise<AcervoItem[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("acervo_items")
      .select("id, type, title, slug, summary, cover_url, cover_thumb_url, cover_small_url, source_name, source_url, published_at, publish_at, year, city, tags, meta, featured, source_type, created_at")
      .eq("status", "published")
      .eq("year", year)
      .order("published_at", { ascending: false, nullsFirst: false })
      .limit(limit);
    if (error) throw error;
    return ((data || []) as Record<string, unknown>[])
      .filter((row) => !isDemoRecord(row))
      .map(rowToAcervoItem)
      .filter((item) => isPublishTimeReached(item.publish_at));
  } catch (error) {
    throw toAppError("Falha ao carregar itens da linha do tempo", error);
  }
}
// ─────────────────────────────────────────
// Blog
// ─────────────────────────────────────────

export type BlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  content_md: string | null;
  cover_url: string | null;
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

function isPublishTimeReached(publishAt: string | null): boolean {
  if (!publishAt) return true;
  return new Date(publishAt).getTime() <= Date.now();
}


export type ListBlogParams = {
  q?: string;
  tag?: string;
  limit?: number;
  offset?: number;
  includeScheduled?: boolean;
};

function rowToBlogPost(row: Record<string, unknown>): BlogPost {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? "Sem título"),
    excerpt: typeof row.summary === "string" ? row.summary : null,
    content_md: typeof row.content_md === "string" ? row.content_md : null,
    cover_url: typeof row.cover_url === "string" ? row.cover_url : null,
    cover_asset_id: typeof row.cover_asset_id === "string" ? row.cover_asset_id : null,
    cover_thumb_url: typeof row.cover_thumb_url === "string" ? row.cover_thumb_url : null,
    cover_small_url: typeof row.cover_small_url === "string" ? row.cover_small_url : null,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    published_at: typeof row.published_at === "string" ? row.published_at : null,
    publish_at: typeof row.publish_at === "string" ? row.publish_at : null,
    status: (row.status as any) ?? "draft",
    created_at: typeof row.created_at === "string" ? row.created_at : "",
    category: typeof row.category === "string" ? row.category : null,
    author_name: typeof row.author_name === "string" ? row.author_name : null
  };
}

async function hydrateBlogPostAssets(post: BlogPost): Promise<BlogPost> {
  if (!post.cover_asset_id) return post;

  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, public_url")
    .eq("id", post.cover_asset_id)
    .maybeSingle();

  if (error) throw error;

  if (!data?.public_url) return post;

  return {
    ...post,
    cover_url: data.public_url,
  };
}

async function hydrateBlogPostListAssets(posts: BlogPost[]): Promise<BlogPost[]> {
  const assetIds = Array.from(new Set(
    posts
      .filter((post) => post.cover_asset_id && !post.cover_url)
      .map((post) => post.cover_asset_id as string)
  ));

  if (assetIds.length === 0) return posts;

  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, public_url")
    .in("id", assetIds);

  if (error) throw error;

  const assetUrlById = new Map<string, string>();
  (data || []).forEach((asset: any) => {
    if (typeof asset?.id === "string" && typeof asset?.public_url === "string") {
      assetUrlById.set(asset.id, asset.public_url);
    }
  });

  return posts.map((post) => ({
    ...post,
    cover_url: post.cover_asset_id ? (assetUrlById.get(post.cover_asset_id) || post.cover_url) : post.cover_url,
  }));
}

export async function listBlogPosts(params: ListBlogParams = {}): Promise<BlogPost[]> {
  try {
    const { q, tag, limit = 50, offset = 0, includeScheduled: _includeScheduled = false } = params;
    const supabase = assertSupabase();

    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, summary, cover_url, cover_thumb_url, cover_small_url, tags, published_at, publish_at, status, created_at, category, author_name")
      .eq("status", "published")
      .order("published_at", { ascending: false, nullsFirst: false })
      .range(offset, offset + limit - 1);

    if (tag) query = query.contains("tags", [tag]);
    if (q) {
      query = query.ilike("title", `%${q}%`);
    }

    const { data, error } = await query;
    if (error) throw error;
    const posts = ((data ?? []) as Record<string, unknown>[])
      .filter((row) => !isDemoRecord(row))
      .map(rowToBlogPost)
      .filter((post) => isPublishTimeReached(post.publish_at));
    return hydrateBlogPostListAssets(posts);
  } catch (error) {
    throw toAppError("Falha ao listar posts do blog", error);
  }
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    if (isDemoRecord(data as Record<string, unknown>)) return null;
    const post = rowToBlogPost(data as Record<string, unknown>);
    if (!isPublishTimeReached(post.publish_at)) return null;
    return hydrateBlogPostAssets(post);
  } catch (error) {
    throw toAppError("Falha ao carregar post do blog", error);
  }
}

// ─────────────────────────────────────────
// Relatorios
// ─────────────────────────────────────────

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

function normalizeReportKind(value: unknown): ReportKind {
  if (value === "nota técnica") return "nota-tecnica";

  return (["relatorio", "nota-tecnica", "boletim", "anexo"].includes(String(value))
    ? String(value)
    : "relatorio") as ReportKind;
}

function rowToReportDocument(row: Record<string, unknown>): ReportDocument {
  const kind = normalizeReportKind(row.type ?? row.kind);

  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? "Sem titulo"),
    summary: typeof row.summary === "string" ? row.summary : null,
    published_at: typeof row.published_at === "string" ? row.published_at : null,
    year: typeof row.year === "number" ? row.year : null,
    kind,
    featured: Boolean(row.featured),
    pdf_url: typeof row.pdf_url === "string" ? row.pdf_url : null,
    pdf_asset_id: typeof row.pdf_asset_id === "string" ? row.pdf_asset_id : null,
    cover_url: typeof row.cover_url === "string" ? row.cover_url : null,
    cover_asset_id: typeof row.cover_asset_id === "string" ? row.cover_asset_id : null,
    cover_thumb_url: typeof row.cover_thumb_url === "string" ? row.cover_thumb_url : null,
    tags: Array.isArray(row.tags) ? (row.tags as string[]) : [],
    created_at: typeof row.created_at === "string" ? row.created_at : ""
  };
}

async function hydrateReportDocumentAssets(report: ReportDocument): Promise<ReportDocument> {
  const needsPdf = Boolean(report.pdf_asset_id);
  const needsCover = Boolean(report.cover_asset_id);

  if (!needsPdf && !needsCover) return report;

  const supabase = assertSupabase();
  const assetIds = [report.pdf_asset_id, report.cover_asset_id].filter((value): value is string => Boolean(value));
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, public_url")
    .in("id", assetIds);

  if (error) throw error;

  const assetUrlById = new Map<string, string>();
  (data || []).forEach((asset: any) => {
    if (typeof asset?.id === "string" && typeof asset?.public_url === "string") {
      assetUrlById.set(asset.id, asset.public_url);
    }
  });

  return {
    ...report,
    pdf_url: report.pdf_asset_id ? (assetUrlById.get(report.pdf_asset_id) || report.pdf_url) : report.pdf_url,
    cover_url: report.cover_asset_id ? (assetUrlById.get(report.cover_asset_id) || report.cover_url) : report.cover_url,
  };
}

async function hydrateReportDocumentListAssets(reports: ReportDocument[]): Promise<ReportDocument[]> {
  const assetIds = Array.from(new Set(
    reports.flatMap((report) => {
      const ids: string[] = [];
      if (report.cover_asset_id && !report.cover_url) ids.push(report.cover_asset_id);
      if (report.pdf_asset_id && !report.pdf_url) ids.push(report.pdf_asset_id);
      return ids;
    })
  ));

  if (assetIds.length === 0) return reports;

  const supabase = assertSupabase();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, public_url")
    .in("id", assetIds);

  if (error) throw error;

  const assetUrlById = new Map<string, string>();
  (data || []).forEach((asset: any) => {
    if (typeof asset?.id === "string" && typeof asset?.public_url === "string") {
      assetUrlById.set(asset.id, asset.public_url);
    }
  });

  return reports.map((report) => ({
    ...report,
    pdf_url: report.pdf_asset_id ? (assetUrlById.get(report.pdf_asset_id) || report.pdf_url) : report.pdf_url,
    cover_url: report.cover_asset_id ? (assetUrlById.get(report.cover_asset_id) || report.cover_url) : report.cover_url,
  }));
}

export async function listReports(params: ListReportsParams = {}): Promise<ReportDocument[]> {
  try {
    const { year, kind, tag, q, limit = 100 } = params;
    const supabase = assertSupabase();

    let query = supabase
      .from("reports")
      .select("*")
      .eq("status", "published")
      .order("featured", { ascending: false, nullsFirst: false })
      .order("published_at", { ascending: false, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (typeof year === "number") query = query.eq("year", year);
    if (tag) query = query.contains("tags", [tag]);
    if (q) {
      const term = q.trim();
      if (term) {
        query = query.or("title.ilike.%" + term + "%,summary.ilike.%" + term + "%");
      }
    }

    const { data, error } = await query;
    if (error) throw error;
    const reports = ((data || []) as Record<string, unknown>[])
      .map(rowToReportDocument)
      .filter((report) => !kind || report.kind === kind);
    return hydrateReportDocumentListAssets(reports);
  } catch (error) {
    throw toAppError("Falha ao listar relatorios", error);
  }
}

export async function listLatestReports(limit = 3): Promise<ReportDocument[]> {
  return listReports({ limit });
}

export async function getReportBySlug(slug: string): Promise<ReportDocument | null> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();
    if (error) throw error;
    if (!data) return null;
    const report = rowToReportDocument(data as Record<string, unknown>);
    return hydrateReportDocumentAssets(report);
  } catch (error) {
    throw toAppError("Falha ao carregar relatorio", error);
  }
}

export async function searchReports(q: string, limit = 10): Promise<ReportDocument[]> {
  try {
    return listReports({ q, limit });
  } catch (error) {
    throw toAppError("Falha ao buscar em relatórios", error);
  }
}

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

export async function listTransparencyLinks(): Promise<TransparencyLink[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("transparency_links")
      .select("*")
      .order("created_at", { ascending: true });
    if (error) throw error;
    return (data ?? []) as TransparencyLink[];
  } catch (error) {
    throw toAppError("Falha ao listar links de transparência", error);
  }
}

export async function listExpenses(limit = 100): Promise<Expense[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .order("occurred_on", { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data ?? []) as Expense[];
  } catch (error) {
    throw toAppError("Falha ao listar despesas", error);
  }
}

export type TransparencySummary = {
  total_cents: number;
  by_category: Record<string, number>;
  count: number;
};

export async function getTransparencySummary(): Promise<TransparencySummary> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("category, amount_cents");
    if (error) throw error;

    const summary: TransparencySummary = {
      total_cents: 0,
      by_category: {},
      count: (data ?? []).length
    };

    (data ?? []).forEach((row) => {
      const amount = Number(row.amount_cents);
      const cat = String(row.category);
      summary.total_cents += amount;
      summary.by_category[cat] = (summary.by_category[cat] ?? 0) + amount;
    });

    return summary;
  } catch (error) {
    throw toAppError("Falha ao calcular sumário de transparência", error);
  }
}
// ─────────────────────────────────────────
// Status do Sistema
// ─────────────────────────────────────────

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

function toSafeNumber(value: unknown): number {
  const parsed = typeof value === "number" ? value : Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeOpsKpi(raw?: Partial<OpsKPI> | null): OpsKPI {
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

export async function getOpsKpisMonth(year: number, month: number): Promise<OpsKPI> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.rpc("get_ops_kpis_month", {
      p_year: year,
      p_month: month
    });
    if (error) throw error;
    return normalizeOpsKpi(data?.[0]);
  } catch (error) {
    throw toAppError("Falha ao buscar KPIs mensais de operacao", error);
  }
}

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
    latest_acervo: any[];
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

export async function getSystemStatus(): Promise<SystemStatus> {
  try {
    const supabase = assertSupabase();

    const [{ count: stationsCount }, { count: measurements24h }] = await Promise.all([
      supabase.from("stations").select("*", { count: "exact", head: true }),
      supabase.from("measurements")
        .select("*", { count: "exact", head: true })
        .gt("ts", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    ]);

    const { data: latestM } = await supabase
      .from("measurements")
      .select("ts, station:stations(name)")
      .order("ts", { ascending: false })
      .limit(1)
      .maybeSingle();

    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const monthEnd = new Date(monthStart);
    monthEnd.setMonth(monthEnd.getMonth() + 1);

    const results = await Promise.all([
      supabase.from("events").select("id, title, start_at, location, capacity")
        .order("start_at", { ascending: true })
        .gt("start_at", new Date().toISOString())
        .limit(3),
      supabase.from("acervo_items").select("*").order("created_at", { ascending: false }).limit(3),
      listBlogPosts({ limit: 2 }),
      getTransparencySummary(),
      supabase.from("expenses")
        .select("category, amount_cents")
        .gte("occurred_on", monthStart.toISOString().slice(0, 10))
        .lt("occurred_on", monthEnd.toISOString().slice(0, 10)),
      supabase.from("reports")
        .select("*", { count: "exact", head: true })
        .gte("published_at", monthStart.toISOString().slice(0, 10))
        .lt("published_at", monthEnd.toISOString().slice(0, 10)),
      supabase.from("expenses")
        .select("category, amount_cents")
        .gte("occurred_on", sevenDaysAgo.slice(0, 10)),
      supabase.from("share_events")
        .select("*", { count: "exact", head: true })
        .gt("occurred_at", sevenDaysAgo),
      supabase.from("share_events")
        .select("kind")
        .gt("occurred_at", sevenDaysAgo),
      supabase.rpc("get_top_shared_items", { p_days: 7 }),
      supabase.from("push_events")
        .select("*", { count: "exact", head: true })
        .gt("ts", sevenDaysAgo),
      supabase.from("push_events")
        .select("station_code")
        .gt("ts", sevenDaysAgo),
      supabase.from("push_events")
        .select("pollutant")
        .gt("ts", sevenDaysAgo),
      supabase.from("measurements")
        .select("station_id, pm25, pm10, station:stations(code, name)")
        .gt("ts", new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()),
      supabase.rpc("get_station_health"),
      supabase.rpc("get_ops_kpis_7d"),
      supabase.rpc("get_station_kpis_7d")
    ]);

    const events = results[0];
    const acervo = results[1];
    const blog = results[2] as BlogPost[];
    const transparency = results[3] as TransparencySummary;
    const monthExpensesResult = results[4] as { data: Array<{ category: string; amount_cents: number }> };
    const reportsPublishedMonth = results[5] as { count: number };
    const sevenDaysExpensesResult = results[6] as { data: Array<{ category: string; amount_cents: number }> };
    const social7d = results[7] as { count: number };
    const socialKinds = results[8] as { data: Array<{ kind: string | null }> };
    const topShares = results[9] as { data: any[] };
    const alerts7d = results[10] as { count: number };
    const alertsStations = results[11] as { data: any[] };
    const alertsPollutants = results[12] as { data: any[] };
    const breaches24hResult = results[13] as { data: Array<{ station_id?: string; pm25?: number | null; pm10?: number | null; station?: { code?: string | null; name?: string | null } | Array<{ code?: string | null; name?: string | null }> | null }> };
    const stationHealthData = results[14] as { data: StationHealth[] };
    const opsKpiResult = results[15] as { data: OpsKPI[] };
    const stationKpiResult = results[16] as { data: StationKPI[] };

    const stationCounts = new Map<string, number>();
    (alertsStations.data || []).forEach((item: any) => {
      const code = item.station_code;
      stationCounts.set(code, (stationCounts.get(code) || 0) + 1);
    });
    const topStations = Array.from(stationCounts.entries())
      .map(([station_code, count]) => ({ station_code, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const socialByKind = (socialKinds.data || []).reduce((acc, item) => {
      const key = String(item.kind ?? "outros");
      acc[key] = (acc[key] ?? 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const pollutantCounts = new Map<string, number>();
    (alertsPollutants.data || []).forEach((item: any) => {
      const pol = item.pollutant;
      pollutantCounts.set(pol, (pollutantCounts.get(pol) || 0) + 1);
    });
    const topPollutants = Array.from(pollutantCounts.entries())
      .map(([pollutant, count]) => ({ pollutant, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3);

    const monthSummary = { total_cents: 0, by_category: {} as Record<string, number>, count: 0 };
    (monthExpensesResult.data || []).forEach((row) => {
      const amount = Number(row.amount_cents ?? 0);
      const cat = String(row.category ?? "outros");
      monthSummary.total_cents += amount;
      monthSummary.by_category[cat] = (monthSummary.by_category[cat] ?? 0) + amount;
      monthSummary.count += 1;
    });

    const sevenDaysSummary = { total_cents: 0, by_category: {} as Record<string, number>, count: 0 };
    (sevenDaysExpensesResult.data || []).forEach((row) => {
      const amount = Number(row.amount_cents ?? 0);
      const cat = String(row.category ?? "outros");
      sevenDaysSummary.total_cents += amount;
      sevenDaysSummary.by_category[cat] = (sevenDaysSummary.by_category[cat] ?? 0) + amount;
      sevenDaysSummary.count += 1;
    });

    const breachCountsByStationCode = new Map<string, number>();
    (breaches24hResult.data || []).forEach((row) => {
      const stationPayload = Array.isArray(row.station) ? row.station[0] : row.station;
      const stationCode = String(stationPayload?.code ?? "-");
      if (!isAboveOmsThreshold(row.pm25 ?? null, row.pm10 ?? null)) return;
      breachCountsByStationCode.set(stationCode, (breachCountsByStationCode.get(stationCode) || 0) + 1);
    });

    const networkHealth = { ok: 0, degraded: 0, offline: 0, unknown: 0 };
    (stationHealthData.data || []).forEach((health: StationHealth) => {
      const status = health.health_status as keyof typeof networkHealth;
      if (status in networkHealth) {
        networkHealth[status] += 1;
      }
    });

    return {
      monitoring: {
        stations_count: stationsCount || 0,
        measurements_24h: measurements24h || 0,
        latest_measurement: latestM ? {
          ts: String(latestM.ts),
          station_name: String((latestM.station as any)?.name || "N/A")
        } : null
      },
      content: {
        upcoming_events: (events.data ?? []) as EventSummary[],
        latest_acervo: ((acervo.data ?? []) as Record<string, unknown>[])
          .filter((item) => !isDemoRecord(item))
          .filter((item) => isPublishTimeReached(String(item.publish_at ?? "") || null)),
        latest_blog: blog.filter((post) => !String(post.slug ?? "").startsWith("demo-")),
        reports_published_month: reportsPublishedMonth.count || 0
      },
      transparency: {
        ...transparency,
        current_month_total_cents: monthSummary.total_cents,
        current_month_by_category: monthSummary.by_category,
        current_month_count: monthSummary.count,
        last_7d_total_cents: sevenDaysSummary.total_cents,
        last_7d_by_category: sevenDaysSummary.by_category,
        last_7d_count: sevenDaysSummary.count
      },
      social: {
        total_7d: social7d.count || 0,
        by_kind: socialByKind,
        top_slugs: (topShares.data || []) as { kind: string; slug: string; count: number }[]
      },
      alerts: {
        total_7d: alerts7d.count || 0,
        top_stations: topStations,
        top_pollutants: topPollutants
      },
      operations: {
        kpis: normalizeOpsKpi(opsKpiResult.data?.[0]),
        station_metrics: (stationKpiResult.data || []).map((row) => ({
          station_code: String(row.station_code ?? "-"),
          station_name: String(row.station_name ?? "Estação"),
          measurements_count: toSafeNumber(row.measurements_count),
          above_threshold_24h: toSafeNumber(breachCountsByStationCode.get(String(row.station_code ?? "-")) ?? 0)
        }))
      },
      network_health: networkHealth
    };
  } catch (error) {
    throw toAppError("Falha ao obter status do sistema", error);
  }
}

export async function searchAcervo(q: string, limit = 10): Promise<AcervoItem[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("acervo_items")
      .select("*")
      .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%`)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[])
      .filter((row) => !isDemoRecord(row))
      .map(rowToAcervoItem)
      .filter((item) => isPublishTimeReached(item.publish_at ?? null));
  } catch (error) {
    throw toAppError("Falha ao buscar no acervo", error);
  }
}

/**
 * Busca posts no blog pelo título ou conteúdo.
 */
export async function searchBlog(q: string, limit = 10): Promise<BlogPost[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("blog_posts")
      .select("*")
      .or(`title.ilike.%${q}%,content_md.ilike.%${q}%`)
      .order("published_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return ((data ?? []) as Record<string, unknown>[])
      .filter((row) => !isDemoRecord(row))
      .map(rowToBlogPost)
      .filter((post) => isPublishTimeReached(post.publish_at ?? null));
  } catch (error) {
    throw toAppError("Falha ao buscar no blog", error);
  }
}

/**
 * Busca gastos na transparência por fornecedor, descrição ou categoria.
 */
export async function searchTransparency(q: string, limit = 10): Promise<any[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("expenses")
      .select("*")
      .or(`vendor.ilike.%${q}%,description.ilike.%${q}%,category.ilike.%${q}%`)
      .order("occurred_on", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as any[];
  } catch (error) {
    throw toAppError("Falha ao buscar na transparência", error);
  }
}

/**
 * Busca eventos na agenda por título ou descrição.
 */
export async function searchEvents(q: string, limit = 10): Promise<Event[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("events")
      .select("*")
      .or(`title.ilike.%${q}%,description.ilike.%${q}%`)
      .order("start_at", { ascending: true })
      .limit(limit);

    if (error) throw error;
    return data as Event[];
  } catch (error) {
    throw toAppError("Falha ao buscar eventos", error);
  }
}

// ─────────────────────────────────────────
// Busca Global (FTS)
// ─────────────────────────────────────────

export interface SearchResultItem {
  kind: "acervo" | "blog" | "report";
  title: string;
  slug: string;
  excerpt: string;
  score: number;
  url: string;
}

export async function searchAll(q: string, limit = 30): Promise<SearchResultItem[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.rpc("search_all", {
      p_q: q,
      p_limit: limit
    });
    if (error) throw error;
    return (data || []) as SearchResultItem[];
  } catch (error) {
    throw toAppError("Falha ao realizar busca global", error);
  }
}

// ─────────────────────────────────────────
// Dossiês (Collections)
// ─────────────────────────────────────────

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

export async function listCollections({ limit = 50 } = {}): Promise<AcervoCollection[]> {
  try {
    const supabase = assertSupabase();
    // Order: featured first (true > false, so desc), then position asc (1, 2, 3), then created_at desc
    const { data, error } = await supabase
      .from("acervo_collections")
      .select("*")
      .order("featured", { ascending: false, nullsFirst: false })
      .order("position", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AcervoCollection[];
  } catch (error) {
    throw toAppError("Falha ao listar dossiês", error);
  }
}

export async function listFeaturedCollections(limit = 6): Promise<AcervoCollection[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("acervo_collections")
      .select("*")
      .eq("featured", true)
      .order("position", { ascending: true })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return (data || []) as AcervoCollection[];
  } catch (error) {
    throw toAppError("Falha ao listar dossiês em destaque", error);
  }
}

/**
 * Retorna as coleções (dossiês) em que um determinado item do acervo está incluído.
 */
export async function listCollectionsForItem(itemSlugOrId: string): Promise<AcervoCollection[]> {
  try {
    const supabase = assertSupabase();

    // Primeiro precisamos do ID do item se for slug
    let itemId = itemSlugOrId;
    if (!itemSlugOrId.includes("-")) { // Checagem simples pra uuid
      const { data: itemData, error: itemError } = await supabase
        .from("acervo_items")
        .select("id")
        .eq("slug", itemSlugOrId)
        .single();

      if (itemError) throw itemError;
      itemId = itemData.id;
    }

    const { data, error } = await supabase
      .from("acervo_collection_items")
      .select(`
        position,
        acervo_collections (*)
      `)
      .eq("item_id", itemId)
      .order("position", { ascending: true });

    if (error) throw error;

    // Extract the nested collections and assert type
    return (data?.map(d => d.acervo_collections) || []).filter(Boolean) as unknown as AcervoCollection[];
  } catch (error) {
    console.warn("Falha ao buscar coleções do item:", error);
    return []; // Return empty gracefully
  }
}

/**
 * Retorna até `limit` itens do acervo que compartilham dos mesmos dossiês do item fornecido.
 */
export async function getRelatedItemsByCollections(itemSlugOrId: string, limit = 6): Promise<AcervoItem[]> {
  try {
    const supabase = assertSupabase();

    let itemId = itemSlugOrId;
    if (!itemSlugOrId.includes("-")) {
      const { data: itemData, error: itemError } = await supabase
        .from("acervo_items")
        .select("id")
        .eq("slug", itemSlugOrId)
        .single();
      if (itemError) throw itemError;
      itemId = itemData.id;
    }

    // Pega as coleções deste item
    const { data: cols, error: errCols } = await supabase
      .from("acervo_collection_items")
      .select("collection_id")
      .eq("item_id", itemId);

    if (errCols) throw errCols;
    const colIds = (cols || []).map(c => c.collection_id);
    if (colIds.length === 0) return [];

    // Pega os itens dessas coleções ordenados por posição
    const { data: related, error: errRelated } = await supabase
      .from("acervo_collection_items")
      .select(`
        position,
        acervo_items (*)
      `)
      .in("collection_id", colIds)
      .neq("item_id", itemId)
      .order("position", { ascending: true })
      .limit(limit * 3); // Busca extra para permitr deduplicação

    if (errRelated) throw errRelated;

    // Deduplica os itens
    const uniqueItems = new Map<string, AcervoItem>();
    for (const row of (related || [])) {
      if (!row.acervo_items) continue;
      // Cast through any or unknown because Supabase relationships map identically
      const itemPayload = Array.isArray(row.acervo_items) ? row.acervo_items[0] : row.acervo_items;
      const item = rowToAcervoItem(itemPayload as unknown as Record<string, unknown>);
      if (!uniqueItems.has(item.id)) {
        uniqueItems.set(item.id, item);
      }
    }

    return Array.from(uniqueItems.values()).slice(0, limit);
  } catch (error) {
    console.warn("Falha ao buscar itens relacionados:", error);
    return [];
  }
}

export async function getCollectionBySlug(slug: string): Promise<CollectionWithItems> {
  try {
    const supabase = assertSupabase();
    const { data: collection, error: cError } = await supabase
      .from("acervo_collections")
      .select("*")
      .eq("slug", slug)
      .single();

    if (cError) throw cError;

    const { data: items, error: iError } = await supabase
      .from("acervo_collection_items")
      .select(`
        position,
        acervo_items (*)
      `)
      .eq("collection_id", collection.id)
      .order("position", { ascending: true });

    if (iError) throw iError;

    return {
      ...(collection as AcervoCollection),
      items: (items || []).map((rel: any) => rowToAcervoItem(rel.acervo_items))
    };
  } catch (error) {
    throw toAppError("Falha ao carregar dossiê", error);
  }
}

// ─────────────────────────────────────────
// Conversar (Conversations & Comments)
// ─────────────────────────────────────────

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

export async function listConversations(): Promise<Conversation[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return ((data || []) as Record<string, unknown>[])
      .filter((row) => !isDemoRecord(row)) as Conversation[];
  } catch (error) {
    throw toAppError("Falha ao listar rodas de conversa", error);
  }
}

export async function getConversationBySlug(slug: string): Promise<Conversation | null> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("conversations")
      .select("*")
      .eq("slug", slug)
      .eq("status", "published")
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;
    if (isDemoRecord(data as Record<string, unknown>)) return null;
    return data as Conversation;
  } catch (error) {
    throw toAppError("Falha ao carregar roda de conversa", error);
  }
}

export async function listConversationComments(conversationId: string): Promise<ConversationComment[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("conversation_comments")
      .select("*")
      .eq("conversation_id", conversationId)
      .eq("is_hidden", false)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return (data || []) as ConversationComment[];
  } catch (error) {
    throw toAppError("Falha ao listar comentários", error);
  }
}

export async function createConversationComment(payload: {
  conversation_id: string;
  name: string;
  body: string;
  honeypot?: string;
}): Promise<{ data: ConversationComment; status: string }> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.functions.invoke("submit-comment", {
      body: payload
    });

    if (error) throw error;
    return data;
  } catch (error) {
    throw toAppError("Falha ao publicar comentário", error);
  }
}

export async function reportConversationComment(commentId: string): Promise<{ success: boolean; hidden: boolean }> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase.functions.invoke("report-comment", {
      body: { comment_id: commentId }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    throw toAppError("Falha ao denunciar comentário", error);
  }
}

// ─────────────────────────────────────────
// Corredores Climáticos (Editorial Maps)
// ─────────────────────────────────────────

export type ClimateCorridor = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  geometry_json: any | null; // e.g. GeoJSON literal
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

export async function listCorridors(options?: { featuredOnly?: boolean }): Promise<ClimateCorridor[]> {
  try {
    const supabase = assertSupabase();
    let query = supabase
      .from("climate_corridors")
      .select("*")
      .order("position", { ascending: false })
      .order("created_at", { ascending: false });

    if (options?.featuredOnly) {
      query = query.eq("featured", true);
    }

    const { data, error } = await query;

    if (error) throw error;
    return ((data || []) as Record<string, unknown>[])
      .filter((row) => !isDemoRecord(row)) as ClimateCorridor[];
  } catch (error) {
    throw toAppError("Falha ao listar corredores climáticos", error);
  }
}

export async function listFeaturedCorridors(limit: number = 3): Promise<ClimateCorridor[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("climate_corridors")
      .select("*")
      .eq("featured", true)
      .order("position", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return ((data || []) as Record<string, unknown>[])
      .filter((row) => !isDemoRecord(row))
      .slice(0, limit) as ClimateCorridor[];
  } catch (error) {
    throw toAppError("Falha ao listar corredores em destaque", error);
  }
}

export async function getCorridorBySlug(slug: string): Promise<ClimateCorridorWithLinks | null> {
  try {
    const supabase = assertSupabase();
    const { data: corridor, error: corrError } = await supabase
      .from("climate_corridors")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (corrError) throw corrError;
    if (!corridor) return null;
    if (isDemoRecord(corridor as Record<string, unknown>)) return null;

    const { data: links, error: linksError } = await supabase
      .from("climate_corridor_links")
      .select("*")
      .eq("corridor_id", corridor.id)
      .order("item_kind", { ascending: true })
      .order("position", { ascending: true });

    if (linksError) throw linksError;

    return {
      ...(corridor as ClimateCorridor),
      links: (links || []) as ClimateCorridorLink[],
    };
  } catch (error) {
    throw toAppError("Falha ao carregar corredor climático", error);
  }
}

// ─────────────────────────────────────────
// Relatos Ambientais (Environmental Reports)
// ─────────────────────────────────────────

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

export type CreateEnvironmentalReportPayload = {
  reporter_name: string;
  reporter_email?: string | null;
  reporter_phone?: string | null;
  category: string;
  description: string;
  location: string;
  image_url?: string | null;
  created_at?: string;
};

export async function createEnvironmentalReport(payload: CreateEnvironmentalReportPayload): Promise<EnvironmentalReport> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("environmental_reports")
      .insert(payload)
      .select("*")
      .single();

    if (error) throw error;
    return data as EnvironmentalReport;
  } catch (error) {
    throw toAppError("Falha ao criar relato ambiental", error);
  }
}

export async function listEnvironmentalReports(): Promise<EnvironmentalReport[]> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("environmental_reports")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;
    return (data || []) as EnvironmentalReport[];
  } catch (error) {
    throw toAppError("Falha ao listar relatos ambientais", error);
  }
}

export async function updateEnvironmentalReport(
  id: string,
  payload: Partial<Pick<EnvironmentalReport, "status" | "admin_notes">>
): Promise<EnvironmentalReport> {
  try {
    const supabase = assertSupabase();
    const { data, error } = await supabase
      .from("environmental_reports")
      .update(payload)
      .eq("id", id)
      .select("*")
      .single();

    if (error) throw error;
    return data as EnvironmentalReport;
  } catch (error) {
    throw toAppError("Falha ao atualizar relato ambiental", error);
  }
}

export async function deleteEnvironmentalReport(id: string): Promise<void> {
  try {
    const supabase = assertSupabase();
    const { error } = await supabase
      .from("environmental_reports")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    throw toAppError("Falha ao excluir relato ambiental", error);
  }
}



















