import type {
  AcervoCollection,
  AcervoItem,
  AcervoYearIndex,
  BlogPost,
  ClimateCorridor,
  ClimateCorridorWithLinks,
  CollectionWithItems,
  Conversation,
  ConversationComment,
  EnvironmentalReport,
  Event,
  EventSummary,
  ListAcervoParams,
  ListBlogParams,
  ListReportsParams,
  RegistrationPayload,
  RegistrationResult,
  ReportDocument
} from "./core";
import { getSupabase, isPublishTimeReached, parseCapacity, toAppError } from "./core";

export type {
  AcervoCollection,
  AcervoItem,
  AcervoKind,
  AcervoYearIndex,
  BlogPost,
  ClimateCorridor,
  ClimateCorridorWithLinks,
  CollectionWithItems,
  Conversation,
  ConversationComment,
  EnvironmentalReport,
  Event,
  EventSummary,
  ListAcervoParams,
  ListBlogParams,
  ListReportsParams,
  RegistrationPayload,
  RegistrationResult,
  ReportDocument,
  ReportKind
} from "./core";

export type CreateConversationCommentPayload = {
  conversation_id: string;
  name: string;
  body: string;
  honeypot?: string;
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

function isDemoRecord(row: Record<string, unknown>): boolean {
  const slug = typeof row.slug === "string" ? row.slug : "";
  const meta = row.meta && typeof row.meta === "object" && !Array.isArray(row.meta)
    ? row.meta as Record<string, unknown>
    : {};

  return slug.startsWith("demo-") || meta.demo === true || meta.demo === "true";
}

export async function listUpcomingEvents(): Promise<Event[]> {
  try {
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
    const { data, error } = await supabase
      .from("events")
      .select("id, title, start_at, location, capacity")
      .eq("id", eventId)
      .maybeSingle();
    if (error) throw error;
    return (data as EventSummary | null) ?? null;
  } catch (error) {
    throw toAppError("Falha ao carregar dados do evento", error);
  }
}

async function getEventRegistrationCount(eventId: string): Promise<number> {
  const supabase = await getSupabase();
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

    const supabase = await getSupabase();
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

export async function listAcervoItems(params: ListAcervoParams = {}): Promise<AcervoItem[]> {
  try {
    const { kind, q, tag, year, featured, source_type, limit = 50, offset = 0 } = params;
    const supabase = await getSupabase();

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
    const supabase = await getSupabase();
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

export async function getAcervoYearIndex(): Promise<AcervoYearIndex[]> {
  try {
    const supabase = await getSupabase();
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
      const rowYear = typeof row.year === "number"
        ? row.year
        : typeof row.published_at === "string"
          ? new Date(row.published_at).getFullYear()
          : NaN;
      if (!Number.isFinite(rowYear)) continue;
      totals.set(rowYear, (totals.get(rowYear) ?? 0) + 1);
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
    const supabase = await getSupabase();
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
    kind: ((row.type ?? row.kind) as AcervoItem["kind"]) ?? "link",
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
              : undefined
        }))
        .filter((item) => Boolean(item.url))
      : null,
    created_at: typeof row.created_at === "string" ? row.created_at : ""
  };
}

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
    status: (row.status as BlogPost["status"]) ?? "draft",
    created_at: typeof row.created_at === "string" ? row.created_at : "",
    category: typeof row.category === "string" ? row.category : null,
    author_name: typeof row.author_name === "string" ? row.author_name : null
  };
}

async function hydrateBlogPostAssets(post: BlogPost): Promise<BlogPost> {
  if (!post.cover_asset_id) return post;

  const supabase = await getSupabase();
  const { data, error } = await supabase
    .from("media_assets")
    .select("id, public_url")
    .eq("id", post.cover_asset_id)
    .maybeSingle();

  if (error) throw error;
  if (!data?.public_url) return post;

  return {
    ...post,
    cover_url: data.public_url
  };
}

async function hydrateBlogPostListAssets(posts: BlogPost[]): Promise<BlogPost[]> {
  const assetIds = Array.from(new Set(
    posts
      .filter((post) => post.cover_asset_id && !post.cover_url)
      .map((post) => post.cover_asset_id as string)
  ));

  if (assetIds.length === 0) return posts;

  const supabase = await getSupabase();
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
    cover_url: post.cover_asset_id ? (assetUrlById.get(post.cover_asset_id) || post.cover_url) : post.cover_url
  }));
}

export async function listBlogPosts(params: ListBlogParams = {}): Promise<BlogPost[]> {
  try {
    const { q, tag, limit = 50, offset = 0 } = params;
    const supabase = await getSupabase();

    let query = supabase
      .from("blog_posts")
      .select("id, slug, title, summary, cover_url, cover_asset_id, cover_thumb_url, cover_small_url, tags, published_at, publish_at, status, created_at, category, author_name")
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
    const supabase = await getSupabase();
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

function normalizeReportKind(value: unknown): ReportDocument["kind"] {
  if (value === "nota técnica") return "nota-tecnica";

  return (["relatorio", "nota-tecnica", "boletim", "anexo"].includes(String(value))
    ? String(value)
    : "relatorio") as ReportDocument["kind"];
}

function rowToReportDocument(row: Record<string, unknown>): ReportDocument {
  return {
    id: String(row.id ?? ""),
    slug: String(row.slug ?? ""),
    title: String(row.title ?? "Sem titulo"),
    summary: typeof row.summary === "string" ? row.summary : null,
    published_at: typeof row.published_at === "string" ? row.published_at : null,
    year: typeof row.year === "number" ? row.year : null,
    kind: normalizeReportKind(row.type ?? row.kind),
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
  const assetIds = [report.pdf_asset_id, report.cover_asset_id].filter((value): value is string => Boolean(value));
  if (assetIds.length === 0) return report;

  const supabase = await getSupabase();
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
    cover_url: report.cover_asset_id ? (assetUrlById.get(report.cover_asset_id) || report.cover_url) : report.cover_url
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

  const supabase = await getSupabase();
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
    cover_url: report.cover_asset_id ? (assetUrlById.get(report.cover_asset_id) || report.cover_url) : report.cover_url
  }));
}

export async function listReports(params: ListReportsParams = {}): Promise<ReportDocument[]> {
  try {
    const { year, kind, tag, q, limit = 100 } = params;
    const supabase = await getSupabase();

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
    const supabase = await getSupabase();
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

export async function listCollections({ limit = 50 }: { limit?: number } = {}): Promise<AcervoCollection[]> {
  try {
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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

export async function listCollectionsForItem(itemSlugOrId: string): Promise<AcervoCollection[]> {
  try {
    const supabase = await getSupabase();

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

    const { data, error } = await supabase
      .from("acervo_collection_items")
      .select(`
        position,
        acervo_collections (*)
      `)
      .eq("item_id", itemId)
      .order("position", { ascending: true });

    if (error) throw error;
    return (data?.map((row: any) => row.acervo_collections) || []).filter(Boolean) as unknown as AcervoCollection[];
  } catch (error) {
    console.warn("Falha ao buscar coleções do item:", error);
    return [];
  }
}

export async function getRelatedItemsByCollections(itemSlugOrId: string, limit = 6): Promise<AcervoItem[]> {
  try {
    const supabase = await getSupabase();

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

    const { data: cols, error: errCols } = await supabase
      .from("acervo_collection_items")
      .select("collection_id")
      .eq("item_id", itemId);

    if (errCols) throw errCols;
    const colIds = (cols || []).map((c: any) => c.collection_id);
    if (colIds.length === 0) return [];

    const { data: related, error: errRelated } = await supabase
      .from("acervo_collection_items")
      .select(`
        position,
        acervo_items (*)
      `)
      .in("collection_id", colIds)
      .neq("item_id", itemId)
      .order("position", { ascending: true })
      .limit(limit * 3);

    if (errRelated) throw errRelated;

    const uniqueItems = new Map<string, AcervoItem>();
    for (const row of (related || []) as any[]) {
      if (!row.acervo_items) continue;
      const itemPayload = Array.isArray(row.acervo_items) ? row.acervo_items[0] : row.acervo_items;
      const item = rowToAcervoItem(itemPayload as Record<string, unknown>);
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
    const supabase = await getSupabase();
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

export async function listConversations(): Promise<Conversation[]> {
  try {
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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

export async function createConversationComment(
  payload: CreateConversationCommentPayload
): Promise<{ data: ConversationComment; status: string }> {
  try {
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
    const { data, error } = await supabase.functions.invoke("report-comment", {
      body: { comment_id: commentId }
    });

    if (error) throw error;
    return data;
  } catch (error) {
    throw toAppError("Falha ao denunciar comentário", error);
  }
}

export async function listCorridors(options?: { featuredOnly?: boolean }): Promise<ClimateCorridor[]> {
  try {
    const supabase = await getSupabase();
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

export async function listFeaturedCorridors(limit = 3): Promise<ClimateCorridor[]> {
  try {
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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
      links: (links || []) as ClimateCorridorWithLinks["links"]
    };
  } catch (error) {
    throw toAppError("Falha ao carregar corredor climático", error);
  }
}

export async function createEnvironmentalReport(
  payload: CreateEnvironmentalReportPayload
): Promise<EnvironmentalReport> {
  try {
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
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
    const supabase = await getSupabase();
    const { error } = await supabase
      .from("environmental_reports")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    throw toAppError("Falha ao excluir relato ambiental", error);
  }
}
