import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

type PressItem = {
  id: string;
  title: string;
  slug: string;
  type: string;
  status: string;
  source_kind?: "acervo_item" | "media_asset";
  asset_id?: string | null;
  file_name?: string | null;
  source_name?: string | null;
  source_url?: string | null;
  content_md?: string | null;
  published_at?: string | null;
  updated_at?: string | null;
  meta?: Record<string, unknown> | null;
};

type PreservationState = "preserved" | "link_only" | "manual_text" | "no_source" | "candidate";
type Priority = "alta" | "media" | "baixa";
type QueueFilter = "all" | "backlog" | "stale" | "preserved" | "preserved_without_snapshot" | "no_source" | "manual_text" | "upload_candidates" | "recapture_ready" | "mixed_batch";
type AgeFilter = "all" | "missing" | "30" | "60" | "90";
type EditorialPreservationStatus = "pending_review" | "ready" | "needs_recapture";
type SortMode = "priority" | "capture_age" | "title";

const EDITORIAL_STATUS_LABELS: Record<EditorialPreservationStatus, string> = {
  pending_review: "Revisão pendente",
  ready: "Fechada",
  needs_recapture: "Recapturar",
};

const EDITORIAL_STATUS_STYLES: Record<EditorialPreservationStatus, string> = {
  pending_review: "bg-amber-100 text-amber-700",
  ready: "bg-emerald-100 text-emerald-700",
  needs_recapture: "bg-rose-100 text-rose-700",
};

const STATE_LABELS: Record<PreservationState, string> = {
  preserved: "Preservada",
  link_only: "Só link externo",
  manual_text: "Texto manual",
  no_source: "Sem fonte",
  candidate: "Pronta no upload",
};

const STATE_STYLES: Record<PreservationState, string> = {
  preserved: "bg-emerald-100 text-emerald-700",
  link_only: "bg-amber-100 text-amber-700",
  manual_text: "bg-blue-100 text-blue-700",
  no_source: "bg-slate-100 text-slate-600",
  candidate: "bg-violet-100 text-violet-700",
};

const PRIORITY_STYLES: Record<Priority, string> = {
  alta: "bg-rose-100 text-rose-700",
  media: "bg-amber-100 text-amber-700",
  baixa: "bg-emerald-100 text-emerald-700",
};

const SORT_LABELS: Record<SortMode, string> = {
  priority: "Prioridade",
  capture_age: "Idade da captura",
  title: "Título",
};

const SORT_TOGGLE_LABELS: Record<SortMode, string> = {
  priority: "Ordenar por prioridade",
  capture_age: "Ordenar por idade da captura",
  title: "Ordenar por título",
};

function getSourceCapture(meta: Record<string, unknown> | null | undefined) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const candidate = meta.source_capture;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  return candidate as Record<string, unknown>;
}

function getEditorialPreservationStatus(item: PressItem): EditorialPreservationStatus {
  const meta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
    ? item.meta as Record<string, unknown>
    : null;
  const candidate = meta?.editorial_preservation_status;
  if (candidate === "ready" || candidate === "needs_recapture" || candidate === "pending_review") return candidate;
  return "pending_review";
}

function hasSnapshot(item: PressItem) {
  const meta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
    ? item.meta as Record<string, unknown>
    : null;
  const sourceCapture = getSourceCapture(meta);
  return typeof sourceCapture?.snapshot_url === "string" && sourceCapture.snapshot_url.trim().length > 0;
}

function getPreservationState(item: PressItem): PreservationState {
  if (item.source_kind === "media_asset") return "candidate";

  const meta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
    ? item.meta as Record<string, unknown>
    : null;
  const sourceCapture = getSourceCapture(meta);

  if (sourceCapture?.captured_at) return "preserved";
  if (item.source_url && item.content_md?.trim()) return "manual_text";
  if (item.source_url) return "link_only";
  return "no_source";
}

function daysSince(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function getLastCaptureAt(item: PressItem) {
  const meta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
    ? item.meta as Record<string, unknown>
    : null;
  const sourceCapture = getSourceCapture(meta);
  return typeof sourceCapture?.captured_at === "string" ? sourceCapture.captured_at : null;
}

function getPriority(item: PressItem): Priority {
  const state = getPreservationState(item);
  const isPublished = item.status === "published";
  const captureAge = daysSince(getLastCaptureAt(item));

  if (state === "candidate" && isPublished) return "alta";
  if (state === "candidate") return "media";
  if (state === "no_source") return "alta";
  if (state === "link_only" && isPublished) return "alta";
  if (state === "link_only") return "media";
  if (state === "manual_text") return "media";
  if (captureAge !== null && captureAge > 30) return "media";
  return "baixa";
}

function formatDateTime(value?: string | null) {
  if (!value) return "--";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "--";
  return date.toLocaleString("pt-BR");
}

function matchesQueueFilter(item: PressItem, filter: QueueFilter) {
  const state = getPreservationState(item);
  const captureAge = daysSince(getLastCaptureAt(item));
  const isMediaCandidate = item.source_kind === "media_asset" && Boolean(item.asset_id) && Boolean(item.source_url);
  const isRecaptureReady = item.source_kind !== "media_asset"
    && Boolean(item.source_url)
    && (state === "link_only" || state === "manual_text" || state === "preserved" || getPriority(item) !== "baixa");
  const isMixedBatch = Boolean(item.source_url)
    && (state === "candidate" || state === "link_only" || state === "no_source" || getPriority(item) !== "baixa");

  if (filter === "all") return true;
  if (filter === "backlog") return state === "candidate" || state === "link_only" || state === "no_source";
  if (filter === "stale") return captureAge !== null && captureAge > 30;
  if (filter === "preserved") return state === "preserved";
  if (filter === "preserved_without_snapshot") return state === "preserved" && !hasSnapshot(item);
  if (filter === "no_source") return state === "no_source";
  if (filter === "manual_text") return state === "manual_text";
  if (filter === "upload_candidates") return isMediaCandidate;
  if (filter === "recapture_ready") return isRecaptureReady;
  if (filter === "mixed_batch") return isMixedBatch;
  return true;
}

function matchesAgeFilter(item: PressItem, filter: AgeFilter) {
  const captureAge = daysSince(getLastCaptureAt(item));

  if (filter === "all") return true;
  if (filter === "missing") return captureAge === null;
  if (filter === "30") return captureAge !== null && captureAge > 30;
  if (filter === "60") return captureAge !== null && captureAge > 60;
  if (filter === "90") return captureAge !== null && captureAge > 90;
  return true;
}

function formatPercent(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

function escapeCsv(value: string | number | null | undefined) {
  const normalized = String(value ?? "");
  if (/[",;\n]/.test(normalized)) {
    return `"${normalized.replace(/"/g, "\"\"")}"`;
  }
  return normalized;
}

function buildTimestampSuffix() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}_${hour}-${minute}`;
}

function buildCandidateCaptureLink(assetId: string, type: string) {
  return `/admin/acervo/novo?assetId=${assetId}&type=${type}&autocapture=1`;
}

export function AdminPressPreservationPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<PressItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [queueFilter, setQueueFilter] = useState<QueueFilter>((searchParams.get("queue") as QueueFilter) || "all");
  const [priorityFilter, setPriorityFilter] = useState<"all" | Priority>((searchParams.get("priority") as "all" | Priority) || "all");
  const [ageFilter, setAgeFilter] = useState<AgeFilter>((searchParams.get("age") as AgeFilter) || "all");
  const [editorialStatusFilter, setEditorialStatusFilter] = useState<"all" | EditorialPreservationStatus>((searchParams.get("editorial") as "all" | EditorialPreservationStatus) || "all");
  const [sortMode, setSortMode] = useState<SortMode>((searchParams.get("sort") as SortMode) || "priority");
  const navigate = useNavigate();

  useEffect(() => {
    setQueueFilter((searchParams.get("queue") as QueueFilter) || "all");
    setPriorityFilter((searchParams.get("priority") as "all" | Priority) || "all");
    setAgeFilter((searchParams.get("age") as AgeFilter) || "all");
    setEditorialStatusFilter((searchParams.get("editorial") as "all" | EditorialPreservationStatus) || "all");
    setSortMode((searchParams.get("sort") as SortMode) || "priority");
  }, [searchParams]);

  const applyFiltersToUrl = useCallback((next: {
    queue?: QueueFilter;
    priority?: "all" | Priority;
    age?: AgeFilter;
    editorial?: "all" | EditorialPreservationStatus;
    sort?: SortMode;
  }) => {
    const params = new URLSearchParams();
    if (next.queue && next.queue !== "all") params.set("queue", next.queue);
    if (next.priority && next.priority !== "all") params.set("priority", next.priority);
    if (next.age && next.age !== "all") params.set("age", next.age);
    if (next.editorial && next.editorial !== "all") params.set("editorial", next.editorial);
    if (next.sort && next.sort !== "priority") params.set("sort", next.sort);
    setSearchParams(params);
  }, [setSearchParams]);

  const clearFilters = useCallback(() => {
    setSearchParams(new URLSearchParams());
  }, [setSearchParams]);

  const loadItems = useCallback(async () => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    setLoading(true);

    const [{ data: acervoData, error: acervoError }, { data: mediaData, error: mediaError }] = await Promise.all([
      supabase
        .from("acervo_items")
        .select("id, title, slug, type, status, source_name, source_url, content_md, published_at, updated_at, meta, cover_asset_id, media")
        .in("type", ["noticia", "materia"])
        .order("published_at", { ascending: false, nullsFirst: false })
        .order("updated_at", { ascending: false })
        .limit(100),
      supabase
        .from("media_assets")
        .select("id, title, file_name, acervo_content_type, status, source_name, source_url, created_at")
        .in("acervo_content_type", ["noticia", "materia"])
        .not("source_name", "is", null)
        .neq("source_name", "")
        .not("source_url", "is", null)
        .neq("source_url", "")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);

    if (acervoError || mediaError) {
      console.error("[AdminPressPreservation] Erro ao carregar:", acervoError || mediaError);
      setItems([]);
    } else {
      const pressItems = (acervoData || []).map((row: any) => ({
        id: row.id,
        title: row.title,
        slug: row.slug,
        type: row.type,
        status: row.status,
        source_kind: "acervo_item" as const,
        source_name: row.source_name,
        source_url: row.source_url,
        content_md: row.content_md,
        published_at: row.published_at,
        updated_at: row.updated_at,
        meta: row.meta,
        asset_id: row.cover_asset_id || null,
      }));

      const linkedAssetIds = new Set<string>();
      (acervoData || []).forEach((row: any) => {
        if (typeof row.cover_asset_id === "string" && row.cover_asset_id) {
          linkedAssetIds.add(row.cover_asset_id);
        }
        if (Array.isArray(row.media)) {
          row.media.forEach((entry: any) => {
            const assetId = typeof entry?.id === "string" ? entry.id : null;
            if (assetId) linkedAssetIds.add(assetId);
          });
        }
      });

      const mediaCandidates = (mediaData || [])
        .filter((asset: any) => !linkedAssetIds.has(asset.id))
        .map((asset: any) => ({
          id: `asset:${asset.id}`,
          asset_id: asset.id,
          title: asset.title || asset.file_name || "Asset editorial",
          slug: "",
          file_name: asset.file_name || "",
          type: asset.acervo_content_type || "noticia",
          status: asset.status || "draft",
          source_kind: "media_asset" as const,
          source_name: asset.source_name,
          source_url: asset.source_url,
          content_md: null,
          published_at: asset.created_at,
          updated_at: asset.created_at,
          meta: null,
        }));

      setItems([...(pressItems as PressItem[]), ...(mediaCandidates as PressItem[])]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const preservedCount = items.filter((item) => getPreservationState(item) === "preserved").length;
  const backlogCount = items.filter((item) => ["link_only", "no_source"].includes(getPreservationState(item))).length;
  const preservedWithoutSnapshotCount = items.filter((item) => getPreservationState(item) === "preserved" && !hasSnapshot(item)).length;
  const sourceCoverageCount = items.filter((item) => Boolean(item.source_url?.trim())).length;
  const capturedCoverageCount = items.filter((item) => getPreservationState(item) === "preserved").length;
  const snapshotCoverageCount = items.filter((item) => hasSnapshot(item)).length;
  const editorialReadyCount = items.filter((item) => getEditorialPreservationStatus(item) === "ready").length;
  const missingSourceCount = items.filter((item) => !item.source_url?.trim()).length;
  const missingCaptureCount = items.filter((item) => getPreservationState(item) !== "preserved").length;
  const missingSnapshotCount = items.filter((item) => !hasSnapshot(item)).length;
  const pendingEditorialCount = items.filter((item) => getEditorialPreservationStatus(item) !== "ready").length;
  const staleCount = items.filter((item) => {
    const captureAge = daysSince(getLastCaptureAt(item));
    return captureAge !== null && captureAge > 30;
  }).length;

  const rankedItems = [...items].sort((left, right) => {
    const priorityWeight: Record<Priority, number> = { alta: 0, media: 1, baixa: 2 };
    const leftPriority = getPriority(left);
    const rightPriority = getPriority(right);
    const leftAge = daysSince(getLastCaptureAt(left)) ?? 9999;
    const rightAge = daysSince(getLastCaptureAt(right)) ?? 9999;

    if (sortMode === "title") {
      return left.title.localeCompare(right.title, "pt-BR");
    }

    if (sortMode === "capture_age") {
      const ageDiff = rightAge - leftAge;
      if (ageDiff !== 0) return ageDiff;
      return priorityWeight[leftPriority] - priorityWeight[rightPriority];
    }

    const priorityDiff = priorityWeight[leftPriority] - priorityWeight[rightPriority];
    if (priorityDiff !== 0) return priorityDiff;
    return rightAge - leftAge;
  });

  const filteredItems = rankedItems.filter((item) => {
    const priority = getPriority(item);
    return matchesQueueFilter(item, queueFilter)
      && matchesAgeFilter(item, ageFilter)
      && (editorialStatusFilter === "all" || getEditorialPreservationStatus(item) === editorialStatusFilter)
      && (priorityFilter === "all" || priority === priorityFilter);
  });

  const nextPendingItem = rankedItems.find((item) => {
    const state = getPreservationState(item);
    return state === "candidate" || state === "link_only" || state === "no_source" || getPriority(item) === "alta";
  });

  const topPendingItems = rankedItems.filter((item) => {
    const state = getPreservationState(item);
    return state === "candidate" || state === "link_only" || state === "no_source" || getPriority(item) !== "baixa";
  }).slice(0, 5);

  const topPendingItemsWithSource = rankedItems.filter((item) => {
    const state = getPreservationState(item);
    return Boolean(item.source_url) && (state === "candidate" || state === "link_only" || state === "no_source" || getPriority(item) !== "baixa");
  }).slice(0, 3);

  const topUploadCandidatesWithSource = rankedItems.filter((item) => {
    return item.source_kind === "media_asset" && Boolean(item.asset_id) && Boolean(item.source_url);
  }).slice(0, 3);

  const topExistingItemsWithSource = rankedItems.filter((item) => {
    const state = getPreservationState(item);
    return item.source_kind !== "media_asset" && Boolean(item.source_url) && (state === "link_only" || state === "manual_text" || state === "preserved" || getPriority(item) !== "baixa");
  }).slice(0, 3);

  const openBatch = useCallback((batchItems: PressItem[]) => {
    batchItems.forEach((item) => {
      const href = item.source_kind === "media_asset" && item.asset_id
        ? buildCandidateCaptureLink(item.asset_id, item.type || "noticia")
        : `/admin/acervo/${item.id}?autocapture=1`;
      window.open(href, "_blank", "noopener,noreferrer");
    });
  }, []);

  const uploadCandidatesCount = rankedItems.filter((item) => item.source_kind === "media_asset" && Boolean(item.asset_id) && Boolean(item.source_url)).length;
  const existingRecaptureCount = rankedItems.filter((item) => {
    const state = getPreservationState(item);
    return item.source_kind !== "media_asset" && Boolean(item.source_url) && (state === "link_only" || state === "manual_text" || state === "preserved" || getPriority(item) !== "baixa");
  }).length;
  const mixedBatchCount = rankedItems.filter((item) => {
    const state = getPreservationState(item);
    return Boolean(item.source_url) && (state === "candidate" || state === "link_only" || state === "no_source" || getPriority(item) !== "baixa");
  }).length;

  const setSortModeInUrl = useCallback((nextSort: SortMode) => {
    applyFiltersToUrl({
      queue: queueFilter,
      priority: priorityFilter,
      age: ageFilter,
      editorial: editorialStatusFilter,
      sort: nextSort,
    });
  }, [applyFiltersToUrl, queueFilter, priorityFilter, ageFilter, editorialStatusFilter]);

  const focusBatchQueue = useCallback((nextQueue: QueueFilter) => {
    applyFiltersToUrl({
      queue: nextQueue,
      priority: "all",
      age: "all",
      editorial: "all",
      sort: "priority",
    });
  }, [applyFiltersToUrl]);

  const exportCsv = useCallback((rowsSource: PressItem[], filenamePrefix: string) => {
    const header = [
      "id",
      "origem_fila",
      "asset_id",
      "titulo",
      "slug",
      "tipo",
      "status_publicacao",
      "estado_preservacao",
      "prioridade",
      "status_editorial",
      "tem_link",
      "tem_captura",
      "tem_snapshot",
      "ultima_captura",
      "idade_captura_dias",
      "fonte",
      "url_origem",
    ];

    const rows = rowsSource.map((item) => {
      const state = getPreservationState(item);
      const priority = getPriority(item);
      const editorialStatus = getEditorialPreservationStatus(item);
      const lastCaptureAt = getLastCaptureAt(item);
      const captureAge = daysSince(lastCaptureAt);

      return [
        item.id,
        item.source_kind || "acervo_item",
        item.asset_id || "",
        item.title,
        item.slug,
        item.type,
        item.status,
        state,
        priority,
        editorialStatus,
        item.source_url?.trim() ? "sim" : "nao",
        state === "preserved" ? "sim" : "nao",
        hasSnapshot(item) ? "sim" : "nao",
        lastCaptureAt || "",
        captureAge ?? "",
        item.source_name || "",
        item.source_url || "",
      ].map(escapeCsv).join(";");
    });

    const csvContent = [header.join(";"), ...rows].join("\n");
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${filenamePrefix}-${buildTimestampSuffix()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, []);

  return (
    <div className="admin-list-page space-y-8 animate-in fade-in duration-500">
      <div className="admin-list-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Governança editorial</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Preservação de Imprensa</h1>
          <p className="mt-3 max-w-3xl text-base font-medium text-slate-300">
            Monitore notícias e matérias do acervo, priorize o backlog de captura e acompanhe a idade da última preservação.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/admin/acervo?preservation=link_only" className="admin-command-ghost">
            Ver lista filtrada
          </Link>
          <button
            type="button"
            onClick={() => exportCsv(rankedItems, "fila-preservacao-imprensa-total")}
            className="admin-command-ghost"
          >
            Exportar total
          </button>
          <button
            type="button"
            onClick={() => exportCsv(filteredItems, "fila-preservacao-imprensa-filtrada")}
            className="admin-command-ghost"
          >
            Exportar filtrado
          </button>
          {nextPendingItem ? (
            <button
              type="button"
              onClick={() => navigate(
                nextPendingItem.source_kind === "media_asset" && nextPendingItem.asset_id
                  ? buildCandidateCaptureLink(nextPendingItem.asset_id, nextPendingItem.type || "noticia")
                  : `/admin/acervo/${nextPendingItem.id}`,
              )}
              className="admin-command-ghost"
            >
              Abrir próximo pendente
            </button>
          ) : null}
          <button type="button" onClick={() => loadItems()} className="admin-command-cta">
            Atualizar fila
          </button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Itens preservados</span>
          <strong className="mt-3 block text-3xl font-black text-slate-900">{preservedCount}</strong>
          <p className="mt-2 text-sm font-medium text-slate-500">Matérias com captura formal registrada no portal.</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Backlog de captura</span>
          <strong className="mt-3 block text-3xl font-black text-amber-900">{backlogCount}</strong>
          <p className="mt-2 text-sm font-medium text-amber-800/80">Itens que ainda dependem de link externo ou sequer têm fonte registrada.</p>
        </div>
        <div className="rounded-[1.5rem] border border-blue-200 bg-blue-50 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">Capturas antigas</span>
          <strong className="mt-3 block text-3xl font-black text-blue-900">{staleCount}</strong>
          <p className="mt-2 text-sm font-medium text-blue-900/80">Itens com última captura acima de 30 dias, candidatos a recaptura.</p>
        </div>
        <div className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Sem snapshot HTML</span>
          <strong className="mt-3 block text-3xl font-black text-violet-900">{preservedWithoutSnapshotCount}</strong>
          <p className="mt-2 text-sm font-medium text-violet-900/80">Itens preservados em Markdown, mas ainda sem cópia bruta HTML salva.</p>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Operação em lote</span>
        <h2 className="mt-2 text-xl font-black text-slate-900">Volumes prontos por tipo de ação</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <button
            type="button"
            onClick={() => focusBatchQueue("upload_candidates")}
            className={`rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5 ${queueFilter === "upload_candidates" ? "border-violet-400 bg-violet-100 shadow-sm" : "border-violet-200 bg-violet-50"}`}
          >
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Uploads prontos</span>
            <strong className="mt-2 block text-2xl font-black text-violet-900">{uploadCandidatesCount}</strong>
            <p className="mt-1 text-sm font-medium text-violet-900/80">Assets editoriais com procedência suficiente para criar item e capturar.</p>
          </button>
          <button
            type="button"
            onClick={() => focusBatchQueue("recapture_ready")}
            className={`rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5 ${queueFilter === "recapture_ready" ? "border-slate-400 bg-slate-100 shadow-sm" : "border-slate-200 bg-slate-50"}`}
          >
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-700">Para recaptura</span>
            <strong className="mt-2 block text-2xl font-black text-slate-900">{existingRecaptureCount}</strong>
            <p className="mt-1 text-sm font-medium text-slate-600">Itens já existentes no acervo que devem abrir em modo de recaptura.</p>
          </button>
          <button
            type="button"
            onClick={() => focusBatchQueue("mixed_batch")}
            className={`rounded-2xl border px-4 py-4 text-left transition hover:-translate-y-0.5 ${queueFilter === "mixed_batch" ? "border-emerald-400 bg-emerald-100 shadow-sm" : "border-emerald-200 bg-emerald-50"}`}
          >
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Lote misto</span>
            <strong className="mt-2 block text-2xl font-black text-emerald-900">{mixedBatchCount}</strong>
            <p className="mt-1 text-sm font-medium text-emerald-900/80">Visão combinada para atacar criação e recaptura na mesma passada.</p>
          </button>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Cobertura da preservação</span>
            <h2 className="mt-2 text-xl font-black text-slate-900">Quanto da fila já está de fato protegido</h2>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Base atual: <span className="font-black text-slate-900">{items.length}</span> notícia(s) e matéria(s)
          </p>
        </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Com link</span>
              <strong className="mt-2 block text-2xl font-black text-slate-900">{sourceCoverageCount}</strong>
            <p className="mt-1 text-sm font-medium text-slate-500">Fonte externa registrada para rastreabilidade. {formatPercent(sourceCoverageCount, items.length)}</p>
            </div>
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-4">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Com captura</span>
            <strong className="mt-2 block text-2xl font-black text-emerald-900">{capturedCoverageCount}</strong>
            <p className="mt-1 text-sm font-medium text-emerald-900/80">Texto preservado formalmente no portal. {formatPercent(capturedCoverageCount, items.length)}</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Com snapshot</span>
            <strong className="mt-2 block text-2xl font-black text-violet-900">{snapshotCoverageCount}</strong>
            <p className="mt-1 text-sm font-medium text-violet-900/80">HTML bruto salvo para memória mais robusta. {formatPercent(snapshotCoverageCount, items.length)}</p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Revisão fechada</span>
            <strong className="mt-2 block text-2xl font-black text-sky-900">{editorialReadyCount}</strong>
            <p className="mt-1 text-sm font-medium text-sky-900/80">Itens já validados pela curadoria editorial. {formatPercent(editorialReadyCount, items.length)}</p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
        <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Gargalos da fila</span>
        <h2 className="mt-2 text-xl font-black text-slate-900">O que ainda segura a preservação completa</h2>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-4">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Sem link</span>
            <strong className="mt-2 block text-2xl font-black text-slate-900">{missingSourceCount}</strong>
            <p className="mt-1 text-sm font-medium text-slate-500">Itens sem URL de origem. {formatPercent(missingSourceCount, items.length)}</p>
          </div>
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Sem captura</span>
            <strong className="mt-2 block text-2xl font-black text-amber-900">{missingCaptureCount}</strong>
            <p className="mt-1 text-sm font-medium text-amber-900/80">Ainda dependem de texto manual ou link externo. {formatPercent(missingCaptureCount, items.length)}</p>
          </div>
          <div className="rounded-2xl border border-violet-200 bg-violet-50 px-4 py-4">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Sem snapshot</span>
            <strong className="mt-2 block text-2xl font-black text-violet-900">{missingSnapshotCount}</strong>
            <p className="mt-1 text-sm font-medium text-violet-900/80">Ainda sem HTML bruto salvo. {formatPercent(missingSnapshotCount, items.length)}</p>
          </div>
          <div className="rounded-2xl border border-sky-200 bg-sky-50 px-4 py-4">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Revisão pendente</span>
            <strong className="mt-2 block text-2xl font-black text-sky-900">{pendingEditorialCount}</strong>
            <p className="mt-1 text-sm font-medium text-sky-900/80">Curadoria ainda não marcou como fechada. {formatPercent(pendingEditorialCount, items.length)}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.6fr)_minmax(320px,0.9fr)]">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Refinar fila</span>
              <h2 className="mt-2 text-xl font-black text-slate-900">Operar por prioridade, estado e idade</h2>
              <p className="mt-2 text-sm font-medium text-slate-500">
                Use os filtros para separar backlog, recapturas antigas e casos sem fonte registrada.
              </p>
            </div>
            <p className="text-sm font-semibold text-slate-500">
              Exibindo <span className="text-slate-900">{filteredItems.length}</span> de <span className="text-slate-900">{rankedItems.length}</span> itens
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {queueFilter !== "all" ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-700">Fila: {queueFilter}</span>
            ) : null}
            {priorityFilter !== "all" ? (
              <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-bold text-amber-700">Prioridade: {priorityFilter}</span>
            ) : null}
            {ageFilter !== "all" ? (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-700">Idade: {ageFilter}</span>
            ) : null}
            {editorialStatusFilter !== "all" ? (
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-bold text-violet-700">Editorial: {EDITORIAL_STATUS_LABELS[editorialStatusFilter]}</span>
            ) : null}
            <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">Ordenação: {SORT_LABELS[sortMode]}</span>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            <label className="space-y-2">
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Fila</span>
              <select
                value={queueFilter}
                onChange={(event) => applyFiltersToUrl({
                  queue: event.target.value as QueueFilter,
                  priority: priorityFilter,
                  age: ageFilter,
                  editorial: editorialStatusFilter,
                  sort: sortMode,
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
              >
                <option value="all">Tudo</option>
                <option value="backlog">Backlog de captura</option>
                <option value="stale">Capturas antigas</option>
                <option value="preserved">Somente preservadas</option>
                <option value="preserved_without_snapshot">Preservadas sem snapshot</option>
                <option value="no_source">Sem fonte</option>
                <option value="manual_text">Texto manual</option>
                <option value="upload_candidates">Uploads prontos</option>
                <option value="recapture_ready">Para recaptura</option>
                <option value="mixed_batch">Lote misto</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Prioridade</span>
              <select
                value={priorityFilter}
                onChange={(event) => applyFiltersToUrl({
                  queue: queueFilter,
                  priority: event.target.value as "all" | Priority,
                  age: ageFilter,
                  editorial: editorialStatusFilter,
                  sort: sortMode,
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
              >
                <option value="all">Todas</option>
                <option value="alta">Alta</option>
                <option value="media">Média</option>
                <option value="baixa">Baixa</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Idade da captura</span>
              <select
                value={ageFilter}
                onChange={(event) => applyFiltersToUrl({
                  queue: queueFilter,
                  priority: priorityFilter,
                  age: event.target.value as AgeFilter,
                  editorial: editorialStatusFilter,
                  sort: sortMode,
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
              >
                <option value="all">Qualquer idade</option>
                <option value="missing">Sem captura</option>
                <option value="30">Acima de 30 dias</option>
                <option value="60">Acima de 60 dias</option>
                <option value="90">Acima de 90 dias</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Status editorial</span>
              <select
                value={editorialStatusFilter}
                onChange={(event) => applyFiltersToUrl({
                  queue: queueFilter,
                  priority: priorityFilter,
                  age: ageFilter,
                  editorial: event.target.value as "all" | EditorialPreservationStatus,
                  sort: sortMode,
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
              >
                <option value="all">Todos</option>
                <option value="pending_review">Revisão pendente</option>
                <option value="ready">Fechada</option>
                <option value="needs_recapture">Recapturar</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Ordenar por</span>
              <select
                value={sortMode}
                onChange={(event) => applyFiltersToUrl({
                  queue: queueFilter,
                  priority: priorityFilter,
                  age: ageFilter,
                  editorial: editorialStatusFilter,
                  sort: event.target.value as SortMode,
                })}
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700 outline-none transition focus:border-emerald-400 focus:bg-white"
              >
                <option value="priority">Prioridade</option>
                <option value="capture_age">Idade da captura</option>
                <option value="title">Título</option>
              </select>
            </label>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
            >
              Limpar filtros
            </button>
            {topUploadCandidatesWithSource.length > 0 ? (
              <button
                type="button"
                onClick={() => openBatch(topUploadCandidatesWithSource)}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-700"
              >
                Abrir 3 uploads prontos
              </button>
            ) : null}
            {topExistingItemsWithSource.length > 0 ? (
              <button
                type="button"
                onClick={() => openBatch(topExistingItemsWithSource)}
                className="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white transition hover:bg-slate-800"
              >
                Abrir 3 para recaptura
              </button>
            ) : null}
            {topPendingItemsWithSource.length > 0 ? (
              <button
                type="button"
                onClick={() => openBatch(topPendingItemsWithSource)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
              >
                Abrir lote misto
              </button>
            ) : null}
          </div>
        </div>

        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-950 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300/80">Próximos da fila</span>
          <h2 className="mt-2 text-xl font-black text-white">O que abrir primeiro</h2>
          <p className="mt-2 text-sm font-medium text-slate-300">
            Sequência rápida para atacar backlog e recapturas mais sensíveis.
          </p>

          <div className="mt-5 space-y-3">
            {topPendingItems.length === 0 ? (
              <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-sm font-medium text-slate-300">
                Nenhum item pendente ou envelhecido na fila principal.
              </div>
            ) : topPendingItems.map((item, index) => {
              const state = getPreservationState(item);
              const priority = getPriority(item);
              const captureAge = daysSince(getLastCaptureAt(item));

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigate(
                    item.source_kind === "media_asset" && item.asset_id
                      ? buildCandidateCaptureLink(item.asset_id, item.type || "noticia")
                      : `/admin/acervo/${item.id}`,
                  )}
                  className="flex w-full items-start justify-between gap-4 rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-left transition hover:border-emerald-400/40 hover:bg-white/10"
                >
                  <div className="min-w-0">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-300/80">
                      #{index + 1} • {STATE_LABELS[state]}
                    </p>
                    <p className="mt-2 line-clamp-2 text-sm font-bold text-white">{item.title}</p>
                    <p className="mt-1 text-xs font-medium text-slate-300">
                      {item.source_name || "Sem fonte"} • {captureAge === null ? "Sem captura" : `${captureAge} dia(s) desde a última captura`}
                    </p>
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${PRIORITY_STYLES[priority]}`}>
                    {priority}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="admin-table-shell overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400 italic">Carregando fila de preservação...</div>
        ) : filteredItems.length === 0 ? (
          <div className="p-20 text-center text-slate-400 italic">Nenhuma notícia ou matéria encontrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <button
                      type="button"
                      onClick={() => setSortModeInUrl("title")}
                      className={`inline-flex items-center gap-2 transition ${sortMode === "title" ? "text-slate-900" : "hover:text-slate-700"}`}
                      title={SORT_TOGGLE_LABELS.title}
                    >
                      Item
                      {sortMode === "title" ? <span className="text-[10px] text-emerald-600">ativo</span> : null}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Estado</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <button
                      type="button"
                      onClick={() => setSortModeInUrl("priority")}
                      className={`inline-flex items-center gap-2 transition ${sortMode === "priority" ? "text-slate-900" : "hover:text-slate-700"}`}
                      title={SORT_TOGGLE_LABELS.priority}
                    >
                      Prioridade
                      {sortMode === "priority" ? <span className="text-[10px] text-emerald-600">ativo</span> : null}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Última captura</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    <button
                      type="button"
                      onClick={() => setSortModeInUrl("capture_age")}
                      className={`inline-flex items-center gap-2 transition ${sortMode === "capture_age" ? "text-slate-900" : "hover:text-slate-700"}`}
                      title={SORT_TOGGLE_LABELS.capture_age}
                    >
                      Idade
                      {sortMode === "capture_age" ? <span className="text-[10px] text-emerald-600">ativo</span> : null}
                    </button>
                  </th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredItems.map((item) => {
                  const state = getPreservationState(item);
                  const priority = getPriority(item);
                  const lastCaptureAt = getLastCaptureAt(item);
                  const captureAge = daysSince(lastCaptureAt);
                  const editorialStatus = getEditorialPreservationStatus(item);
                  const isMediaCandidate = item.source_kind === "media_asset" && Boolean(item.asset_id);
                  const editorHref = isMediaCandidate && item.asset_id
                    ? buildCandidateCaptureLink(item.asset_id, item.type || "noticia")
                    : `/admin/acervo/${item.id}`;
                  const snapshotMissing = state === "preserved" && !hasSnapshot(item);
                  const isCriticalNoSource = priority === "alta" && state === "no_source";
                  const isCriticalNoSnapshot = priority === "alta" && snapshotMissing;
                  const rowTone = isCriticalNoSource
                    ? "bg-rose-50/70"
                    : isCriticalNoSnapshot
                      ? "bg-violet-50/70"
                      : "";

                  return (
                    <tr key={item.id} className={`group transition-colors hover:bg-slate-50/50 ${rowTone}`}>
                      <td className="px-6 py-4">
                        <p className="font-bold text-slate-900">{item.title}</p>
                        <p className="mt-1 text-xs font-medium text-slate-500">
                          {item.source_name || "Sem fonte"} • {isMediaCandidate ? (item.file_name || "asset editorial") : `/${item.slug}`}
                        </p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {isMediaCandidate ? (
                            <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-700">
                              Veio do upload
                            </span>
                          ) : null}
                          <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${EDITORIAL_STATUS_STYLES[editorialStatus]}`}>
                            {EDITORIAL_STATUS_LABELS[editorialStatus]}
                          </span>
                          {isCriticalNoSource ? (
                            <span className="rounded-full bg-rose-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-rose-700">
                              Alta sem link
                            </span>
                          ) : null}
                          {snapshotMissing ? (
                            <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-700">
                              Sem snapshot
                            </span>
                          ) : null}
                          {isCriticalNoSnapshot ? (
                            <span className="rounded-full bg-violet-100 px-2 py-1 text-[10px] font-bold uppercase tracking-widest text-violet-700">
                              Alta sem snapshot
                            </span>
                          ) : null}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${STATE_STYLES[state]}`}>
                          {STATE_LABELS[state]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`rounded-full px-2 py-1 text-[10px] font-bold uppercase tracking-widest ${PRIORITY_STYLES[priority]}`}>
                          {priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {formatDateTime(lastCaptureAt)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-600">
                        {captureAge === null ? "Sem captura" : `${captureAge} dia(s)`}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          {!isMediaCandidate ? (
                            <Link
                              to={`/acervo/item/${item.slug}`}
                              target="_blank"
                              className="p-2 text-slate-400 transition-colors hover:text-emerald-600"
                              title="Ver no portal"
                            >
                              <svg className="inline h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </Link>
                          ) : null}
                          <button
                            type="button"
                            onClick={() => navigate(editorHref)}
                            className="p-2 text-slate-400 transition-colors hover:text-amber-600"
                            title={isMediaCandidate ? "Criar item e capturar matéria" : state === "preserved" ? "Recapturar ou revisar" : "Capturar matéria"}
                          >
                            <svg className="inline h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8m13 0A9 9 0 113 12a9 9 0 0118 0z" />
                            </svg>
                          </button>
                          {item.source_url ? (
                            <button
                              type="button"
                              onClick={() => navigate(isMediaCandidate && item.asset_id ? buildCandidateCaptureLink(item.asset_id, item.type || "noticia") : `/admin/acervo/${item.id}?autocapture=1`)}
                              className="p-2 text-slate-400 transition-colors hover:text-emerald-600"
                              title={isMediaCandidate ? "Criar item com autocaptura" : "Abrir editor e recapturar automaticamente"}
                            >
                              <svg className="inline h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m14.356 2A8.001 8.001 0 005.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-13.357-2m13.357 2H15" />
                              </svg>
                            </button>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
