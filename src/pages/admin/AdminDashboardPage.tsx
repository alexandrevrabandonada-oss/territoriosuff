import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

interface DashboardStats {
  acervoPublished: number;
  draftsTotal: number;
  uploadsTotal: number;
  uploadsWithoutSourceUrl: number;
  reportsPublished: number;
  upcomingEvents: number;
  environmentalReportsNew: number;
  pressTotal: number;
  pressBacklog: number;
  pressWithoutSnapshot: number;
  pressPendingReview: number;
  pressStaleCaptures: number;
}

interface Pendency {
  id: string;
  area: string;
  title: string;
  reason: string;
  link: string;
  severity: "critical" | "warning";
}

interface ActivityItem {
  id: string;
  title: string;
  timestamp: string;
  meta: string;
  link: string;
  icon: string;
}

interface ActivityGroup {
  key: string;
  title: string;
  empty: string;
  items: ActivityItem[];
}

type PendingRecord = {
  id: string;
  title?: string | null;
  file_name?: string | null;
};

type RecentUploadRecord = {
  id: string;
  title?: string | null;
  file_name?: string | null;
  created_at: string;
};

type RecentPublishedRecord = {
  id: string;
  title: string;
  slug: string;
  published_at?: string | null;
  publish_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type RecentReportRecord = {
  id: string;
  title: string;
  updated_at?: string | null;
};

type RecentEventRecord = {
  id: string;
  title: string;
  created_at?: string | null;
};

type RecentEnvironmentalReportRecord = {
  id: string;
  reporter_name: string;
  category: string;
  created_at: string;
};

type PressDashboardRecord = {
  id: string;
  source_url?: string | null;
  content_md?: string | null;
  meta?: Record<string, unknown> | null;
};

const REPORT_CATEGORY_LABELS: Record<string, string> = {
  ar_fumaca: "Ar / Fumaça",
  residuos_lixo: "Lixo / Resíduos",
  agua_esgoto: "Água / Esgoto",
  desmatamento_poda: "Desmatamento / Poda",
  outros: "Outros",
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function dashboardTimestamp(...values: Array<string | null | undefined>): string {
  return values.find((value): value is string => typeof value === "string" && value.length > 0) ?? new Date(0).toISOString();
}

function getPressSourceCapture(meta: Record<string, unknown> | null | undefined) {
  if (!meta || typeof meta !== "object" || Array.isArray(meta)) return null;
  const candidate = meta.source_capture;
  if (!candidate || typeof candidate !== "object" || Array.isArray(candidate)) return null;
  return candidate as Record<string, unknown>;
}

function getPressPreservationState(item: PressDashboardRecord) {
  const meta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
    ? item.meta as Record<string, unknown>
    : null;
  const sourceCapture = getPressSourceCapture(meta);
  if (sourceCapture?.captured_at) return "preserved";
  if (item.source_url && item.content_md?.trim()) return "manual_text";
  if (item.source_url) return "link_only";
  return "no_source";
}

function hasPressSnapshot(item: PressDashboardRecord) {
  const meta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
    ? item.meta as Record<string, unknown>
    : null;
  const sourceCapture = getPressSourceCapture(meta);
  return typeof sourceCapture?.snapshot_url === "string" && sourceCapture.snapshot_url.trim().length > 0;
}

function getPressEditorialStatus(item: PressDashboardRecord) {
  const meta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
    ? item.meta as Record<string, unknown>
    : null;
  const candidate = meta?.editorial_preservation_status;
  if (candidate === "ready" || candidate === "needs_recapture" || candidate === "pending_review") return candidate;
  return "pending_review";
}

function getPressLastCaptureAt(item: PressDashboardRecord) {
  const meta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
    ? item.meta as Record<string, unknown>
    : null;
  const sourceCapture = getPressSourceCapture(meta);
  return typeof sourceCapture?.captured_at === "string" ? sourceCapture.captured_at : null;
}

function daysSince(value?: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const diffMs = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
}

function formatPercent(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    acervoPublished: 0,
    draftsTotal: 0,
    uploadsTotal: 0,
    uploadsWithoutSourceUrl: 0,
    reportsPublished: 0,
    upcomingEvents: 0,
    environmentalReportsNew: 0,
    pressTotal: 0,
    pressBacklog: 0,
    pressWithoutSnapshot: 0,
    pressPendingReview: 0,
    pressStaleCaptures: 0,
  });
  const [pendencies, setPendencies] = useState<Pendency[]>([]);
  const [activityGroups, setActivityGroups] = useState<ActivityGroup[]>([]);

  const loadDashboard = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      const now = new Date();
      const sevenDaysAgo = new Date(now);
      sevenDaysAgo.setDate(now.getDate() - 7);

      const [
        { count: acervoPublishedCount },
        { count: acervoDraftCount },
        { count: blogDraftCount },
        { count: reportsDraftCount },
        { count: uploadsTotalCount },
        { count: uploadsWithoutSourceUrlCount },
        { count: reportsPublishedCount },
        { count: upcomingEventsCount },
        { count: environmentalReportsNewCount },
        { data: publishedImagesNoAlt },
        { data: uploadsNoTitle },
        { data: oldAcervoDrafts },
        { data: reportsNoPdf },
        { data: publishedEventsNoLocation },
        { data: publishedPostsNoCover },
        { data: recentUploads },
        { data: recentAcervoPublished },
        { data: recentBlogPublished },
        { data: recentReportsEdited },
        { data: recentEventsCreated },
        { data: recentEnvironmentalReportsNew },
        { data: pressItems },
      ] = await Promise.all([
        supabase.from("acervo_items").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("acervo_items").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("media_assets").select("*", { count: "exact", head: true }),
        supabase.from("media_assets").select("*", { count: "exact", head: true }).or("source_url.is.null,source_url.eq.''"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("start_at", now.toISOString()).neq("status", "cancelled"),
        supabase.from("environmental_reports").select("*", { count: "exact", head: true }).eq("status", "new"),
        supabase
          .from("media_assets")
          .select("id, title, file_name")
          .ilike("mime_type", "image/%")
          .eq("status", "published")
          .or("alt_text.is.null,alt_text.eq.''")
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("media_assets")
          .select("id, title, file_name")
          .or("title.is.null,title.eq.''")
          .order("created_at", { ascending: false })
          .limit(4),
        supabase
          .from("acervo_items")
          .select("id, title")
          .eq("status", "draft")
          .lt("created_at", sevenDaysAgo.toISOString())
          .order("created_at", { ascending: true })
          .limit(4),
        supabase
          .from("reports")
          .select("id, title")
          .eq("status", "published")
          .or("pdf_url.is.null,pdf_url.eq.''")
          .order("updated_at", { ascending: false })
          .limit(4),
        supabase
          .from("events")
          .select("id, title")
          .eq("status", "published")
          .or("location.is.null,location.eq.'',location_name.is.null,location_name.eq.''")
          .order("start_at", { ascending: true })
          .limit(4),
        supabase
          .from("blog_posts")
          .select("id, title")
          .eq("status", "published")
          .or("cover_asset_id.is.null,cover_url.is.null,cover_url.eq.''")
          .order("publish_at", { ascending: false, nullsFirst: false })
          .limit(4),
        supabase
          .from("media_assets")
          .select("id, title, file_name, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("acervo_items")
          .select("id, title, slug, published_at, publish_at, updated_at")
          .eq("status", "published")
          .order("published_at", { ascending: false, nullsFirst: false })
          .order("updated_at", { ascending: false })
          .limit(4),
        supabase
          .from("blog_posts")
          .select("id, title, slug, published_at, publish_at, updated_at")
          .eq("status", "published")
          .order("publish_at", { ascending: false, nullsFirst: false })
          .order("updated_at", { ascending: false })
          .limit(4),
        supabase
          .from("reports")
          .select("id, title, updated_at")
          .order("updated_at", { ascending: false })
          .limit(5),
        supabase
          .from("events")
          .select("id, title, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("environmental_reports")
          .select("id, reporter_name, category, created_at")
          .eq("status", "new")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("acervo_items")
          .select("id, source_url, content_md, meta")
          .in("type", ["noticia", "materia"])
          .limit(200),
      ]);

      const pressRecords = (pressItems || []) as PressDashboardRecord[];
      const pressBacklog = pressRecords.filter((item) => {
        const state = getPressPreservationState(item);
        return state === "link_only" || state === "no_source";
      }).length;
      const pressWithoutSnapshot = pressRecords.filter((item) => {
        const state = getPressPreservationState(item);
        return state === "preserved" && !hasPressSnapshot(item);
      }).length;
      const pressPendingReview = pressRecords.filter((item) => getPressEditorialStatus(item) !== "ready").length;
      const pressStaleCaptures = pressRecords.filter((item) => {
        const captureAge = daysSince(getPressLastCaptureAt(item));
        return captureAge !== null && captureAge > 30;
      }).length;

      setStats({
        acervoPublished: acervoPublishedCount || 0,
        draftsTotal: (acervoDraftCount || 0) + (blogDraftCount || 0) + (reportsDraftCount || 0),
        uploadsTotal: uploadsTotalCount || 0,
        uploadsWithoutSourceUrl: uploadsWithoutSourceUrlCount || 0,
        reportsPublished: reportsPublishedCount || 0,
        upcomingEvents: upcomingEventsCount || 0,
        environmentalReportsNew: environmentalReportsNewCount || 0,
        pressTotal: pressRecords.length,
        pressBacklog,
        pressWithoutSnapshot,
        pressPendingReview,
        pressStaleCaptures,
      });

      const nextPendencies: Pendency[] = [];

      (recentEnvironmentalReportsNew as RecentEnvironmentalReportRecord[] | null | undefined)?.forEach((item) => {
        const catLabel = REPORT_CATEGORY_LABELS[item.category] || item.category;
        nextPendencies.push({
          id: `env-report-${item.id}`,
          area: "Relato Cidadão",
          title: `Ocorrência: ${catLabel}`,
          reason: `Relato novo pendente de triagem (por ${item.reporter_name})`,
          link: "/admin/relatos",
          severity: "critical",
        });
      });

      (publishedImagesNoAlt as PendingRecord[] | null | undefined)?.forEach((item) => {
        nextPendencies.push({
          id: `alt-${item.id}`,
          area: "Acessibilidade",
          title: item.title || item.file_name || "Imagem sem título",
          reason: "Imagem publicada sem alt_text",
          link: "/admin/uploads",
          severity: "critical",
        });
      });

      (uploadsNoTitle as PendingRecord[] | null | undefined)?.forEach((item) => {
        nextPendencies.push({
          id: `upload-${item.id}`,
          area: "Uploads",
          title: item.file_name || item.title || "Arquivo sem nome",
          reason: "Upload sem título amigável",
          link: "/admin/uploads",
          severity: "warning",
        });
      });

      (oldAcervoDrafts as PendingRecord[] | null | undefined)?.forEach((item) => {
        nextPendencies.push({
          id: `draft-${item.id}`,
          area: "Acervo",
          title: item.title || "Rascunho sem título",
          reason: "Rascunho parado há mais de 7 dias",
          link: `/admin/acervo/${item.id}`,
          severity: "critical",
        });
      });

      (reportsNoPdf as PendingRecord[] | null | undefined)?.forEach((item) => {
        nextPendencies.push({
          id: `report-${item.id}`,
          area: "Relatórios",
          title: item.title || "Relatório sem título",
          reason: "Relatório publicado sem PDF",
          link: `/admin/relatorios/${item.id}`,
          severity: "critical",
        });
      });

      (publishedEventsNoLocation as PendingRecord[] | null | undefined)?.forEach((item) => {
        nextPendencies.push({
          id: `event-${item.id}`,
          area: "Agenda",
          title: item.title || "Evento sem título",
          reason: "Evento publicado sem local",
          link: `/admin/agenda/${item.id}`,
          severity: "critical",
        });
      });

      (publishedPostsNoCover as PendingRecord[] | null | undefined)?.forEach((item) => {
        nextPendencies.push({
          id: `blog-${item.id}`,
          area: "Blog",
          title: item.title || "Post sem título",
          reason: "Post publicado sem capa",
          link: `/admin/blog/${item.id}`,
          severity: "critical",
        });
      });

      if ((uploadsWithoutSourceUrlCount || 0) > 0) {
        nextPendencies.push({
          id: "upload-provenance",
          area: "Uploads",
          title: `${uploadsWithoutSourceUrlCount} asset(s) sem link de origem`,
          reason: "Arquivos salvos sem rastreabilidade externa explícita",
          link: "/admin/uploads",
          severity: "warning",
        });
      }

      if (pressBacklog > 0) {
        nextPendencies.push({
          id: "press-backlog",
          area: "Imprensa",
          title: `${pressBacklog} item(ns) no backlog de captura`,
          reason: "Notícias e matérias ainda dependem de link externo ou estão sem fonte",
          link: "/admin/acervo/imprensa?queue=backlog",
          severity: "critical",
        });
      }

      if (pressWithoutSnapshot > 0) {
        nextPendencies.push({
          id: "press-snapshot",
          area: "Imprensa",
          title: `${pressWithoutSnapshot} preservada(s) sem snapshot`,
          reason: "Há matérias preservadas sem HTML bruto salvo",
          link: "/admin/acervo/imprensa?queue=preserved_without_snapshot",
          severity: "warning",
        });
      }

      if (pressStaleCaptures > 0) {
        nextPendencies.push({
          id: "press-stale",
          area: "Imprensa",
          title: `${pressStaleCaptures} captura(s) antiga(s)`,
          reason: "Há matérias com última captura acima de 30 dias",
          link: "/admin/acervo/imprensa?queue=stale",
          severity: "warning",
        });
      }

      setPendencies(nextPendencies.slice(0, 12));

      const publishedItems = [
        ...(((recentAcervoPublished as RecentPublishedRecord[] | null | undefined) || []).map((item) => ({
          id: `acervo-${item.id}`,
          title: item.title,
          timestamp: dashboardTimestamp(item.publish_at, item.published_at, item.updated_at),
          meta: "Acervo publicado",
          link: `/admin/acervo/${item.id}`,
          icon: "📚",
        }))),
        ...(((recentBlogPublished as RecentPublishedRecord[] | null | undefined) || []).map((item) => ({
          id: `blog-${item.id}`,
          title: item.title,
          timestamp: dashboardTimestamp(item.publish_at, item.published_at, item.updated_at),
          meta: "Post publicado",
          link: `/admin/blog/${item.id}`,
          icon: "✍️",
        }))),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      setActivityGroups([
        {
          key: "uploads",
          title: "Últimos uploads",
          empty: "Nenhum upload recente encontrado.",
          items: (((recentUploads as RecentUploadRecord[] | null | undefined) || []).map((item) => ({
            id: item.id,
            title: item.title || item.file_name || "Upload sem título",
            timestamp: item.created_at,
            meta: item.file_name || "Arquivo enviado",
            link: "/admin/uploads",
            icon: "☁️",
          }))),
        },
        {
          key: "published",
          title: "Últimos itens publicados",
          empty: "Nenhuma publicação recente encontrada.",
          items: publishedItems,
        },
        {
          key: "reports",
          title: "Últimos relatórios editados",
          empty: "Nenhum relatório editado recentemente.",
          items: (((recentReportsEdited as RecentReportRecord[] | null | undefined) || []).map((item) => ({
            id: item.id,
            title: item.title,
            timestamp: dashboardTimestamp(item.updated_at),
            meta: "Relatório atualizado",
            link: `/admin/relatorios/${item.id}`,
            icon: "📊",
          }))),
        },
        {
          key: "events",
          title: "Últimos eventos criados",
          empty: "Nenhum evento criado recentemente.",
          items: (((recentEventsCreated as RecentEventRecord[] | null | undefined) || []).map((item) => ({
            id: item.id,
            title: item.title,
            timestamp: dashboardTimestamp(item.created_at),
            meta: "Evento criado",
            link: `/admin/agenda/${item.id}`,
            icon: "🗓️",
          }))),
        },
      ]);
    } catch (err) {
      console.error("[Dashboard] Erro:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  const statCards = [
    { label: "Acervo publicado", value: stats.acervoPublished, sub: "Itens ativos no portal", icon: "📚", tone: "blue" },
    { label: "Rascunhos", value: stats.draftsTotal, sub: "Conteúdos pendentes", icon: "📝", tone: "amber" },
    { label: "Uploads totais", value: stats.uploadsTotal, sub: "Arquivos armazenados", icon: "☁️", tone: "emerald" },
    { label: "Uploads sem origem", value: stats.uploadsWithoutSourceUrl, sub: "Pedir revisão de procedência", icon: "🔗", tone: "violet" },
    { label: "Relatórios publicados", value: stats.reportsPublished, sub: "Biblioteca oficial", icon: "📄", tone: "indigo" },
    { label: "Eventos futuros", value: stats.upcomingEvents, sub: "Agenda viva", icon: "🗓️", tone: "rose" },
  ];

  const totalContent = stats.acervoPublished + stats.reportsPublished + stats.upcomingEvents;
  const pendingScore = pendencies.length + stats.draftsTotal + stats.environmentalReportsNew;
  const primaryActivity = activityGroups.find((group) => group.key === "uploads");
  const secondaryActivityGroups = activityGroups.filter((group) => group.key !== "uploads");

  return (
    <div className="admin-page space-y-8 animate-in fade-in duration-500">
      <div className="admin-command-hero">
        <div className="relative z-10 max-w-3xl">
          <span className="admin-command-eyebrow">Cockpit editorial</span>
          <h1 className="mt-5 text-4xl font-black tracking-tight text-white md:text-6xl">Central Operacional</h1>
          <p className="mt-4 max-w-2xl text-base font-medium leading-relaxed text-slate-300 md:text-lg">
            Controle publicações, pendências, uploads e agenda em uma visão executiva para operação diária do SEMEAR.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/admin/uploads" className="admin-command-cta">
              Novo upload
            </Link>
            <Link to="/admin/acervo" className="admin-command-ghost">
              Revisar acervo
            </Link>
            <Link to="/admin/acervo/imprensa" className="admin-command-ghost">
              Capturar matérias
            </Link>
          </div>
        </div>
        <div className="admin-command-board">
          <div>
            <span>Produção ativa</span>
            <strong>{loading ? "..." : totalContent}</strong>
            <small>publicações, relatórios e eventos</small>
          </div>
          <div>
            <span>Atenção editorial</span>
            <strong className={pendingScore > 0 ? "text-amber-200" : "text-emerald-200"}>{loading ? "..." : pendingScore}</strong>
            <small>itens para revisão</small>
          </div>
          <div className="admin-command-signal">
            <i />
            Visão consolidada em tempo real
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {statCards.map((card) => (
          <div key={card.label} className={`admin-kpi-card admin-kpi-${card.tone}`}>
            <div className="admin-kpi-icon">
              <span>{card.icon}</span>
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">{card.label}</p>
              <p className="mt-1 text-3xl font-black text-slate-950">{loading ? "..." : card.value}</p>
              <p className="mt-1 text-[10px] font-bold uppercase text-slate-400">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <section className="admin-panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="admin-eyebrow">Imprensa</span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Pulso da preservação</h2>
          </div>
          <Link to="/admin/acervo/imprensa" className="admin-command-ghost">
            Abrir fila de imprensa
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link to="/admin/acervo/imprensa?queue=backlog" className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 transition hover:-translate-y-0.5">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Backlog de captura</span>
            <strong className="mt-3 block text-3xl font-black text-amber-900">{loading ? "..." : stats.pressBacklog}</strong>
            <p className="mt-2 text-sm font-medium text-amber-900/80">
              Itens que ainda não estão preservados de forma robusta. {loading ? "..." : formatPercent(stats.pressBacklog, stats.pressTotal)}
            </p>
          </Link>
          <Link to="/admin/acervo/imprensa?queue=preserved_without_snapshot" className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 transition hover:-translate-y-0.5">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Sem snapshot</span>
            <strong className="mt-3 block text-3xl font-black text-violet-900">{loading ? "..." : stats.pressWithoutSnapshot}</strong>
            <p className="mt-2 text-sm font-medium text-violet-900/80">
              Matérias preservadas sem HTML bruto salvo. {loading ? "..." : formatPercent(stats.pressWithoutSnapshot, stats.pressTotal)}
            </p>
          </Link>
          <Link to="/admin/acervo/imprensa?editorial=pending_review" className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5 transition hover:-translate-y-0.5">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Revisão pendente</span>
            <strong className="mt-3 block text-3xl font-black text-sky-900">{loading ? "..." : stats.pressPendingReview}</strong>
            <p className="mt-2 text-sm font-medium text-sky-900/80">
              Itens ainda não marcados como preservação fechada. {loading ? "..." : formatPercent(stats.pressPendingReview, stats.pressTotal)}
            </p>
          </Link>
          <Link to="/admin/acervo/imprensa?queue=stale" className="rounded-[1.5rem] border border-blue-200 bg-blue-50 p-5 transition hover:-translate-y-0.5">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-blue-700">Capturas antigas</span>
            <strong className="mt-3 block text-3xl font-black text-blue-900">{loading ? "..." : stats.pressStaleCaptures}</strong>
            <p className="mt-2 text-sm font-medium text-blue-900/80">
              Matérias com última captura acima de 30 dias. {loading ? "..." : formatPercent(stats.pressStaleCaptures, stats.pressTotal)}
            </p>
          </Link>
        </div>
      </section>

      <section className="admin-panel p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <span className="admin-eyebrow">Uploads</span>
            <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Fila de qualificação</h2>
          </div>
          <Link to="/admin/uploads" className="admin-command-ghost">
            Abrir uploads
          </Link>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          <Link to="/admin/uploads?queue=without_origin" className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 transition hover:-translate-y-0.5">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Sem link de origem</span>
            <strong className="mt-3 block text-3xl font-black text-violet-900">{loading ? "..." : stats.uploadsWithoutSourceUrl}</strong>
            <p className="mt-2 text-sm font-medium text-violet-900/80">Assets que ainda precisam de URL original para rastreabilidade.</p>
          </Link>
          <Link to="/admin/uploads?queue=without_source_name" className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 transition hover:-translate-y-0.5">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Sem nome da fonte</span>
            <strong className="mt-3 block text-3xl font-black text-amber-900">Revisar</strong>
            <p className="mt-2 text-sm font-medium text-amber-900/80">Revisar veículo, instituição ou acervo de origem antes de publicar.</p>
          </Link>
          <Link to="/admin/uploads?queue=orphan" className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5 transition hover:-translate-y-0.5">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Assets órfãos</span>
            <strong className="mt-3 block text-3xl font-black text-sky-900">Abrir</strong>
            <p className="mt-2 text-sm font-medium text-sky-900/80">Arquivos sem uso em acervo, blog, relatório ou agenda.</p>
          </Link>
          <Link to="/admin/uploads?queue=ready_to_preserve" className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 transition hover:-translate-y-0.5">
            <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Prontos para preservar</span>
            <strong className="mt-3 block text-3xl font-black text-emerald-900">Abrir</strong>
            <p className="mt-2 text-sm font-medium text-emerald-900/80">Uploads já com procedência suficiente para virar matéria preservada.</p>
          </Link>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-5">
          <section className="admin-panel admin-priority-panel p-7">
            <div className="mb-7 flex items-start justify-between gap-4">
              <div>
                <span className="admin-eyebrow border-rose-200 bg-rose-50 text-rose-700">Prioridade</span>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Pendências críticas</h2>
              </div>
              <span className="admin-count-pill">{loading ? "..." : pendencies.length}</span>
            </div>

            {loading ? (
              <div className="py-20 text-center font-medium italic text-slate-300">Analisando pendências do dia...</div>
            ) : pendencies.length > 0 ? (
              <div className="space-y-3">
                {pendencies.map((pendency) => (
                  <div
                    key={pendency.id}
                    className={`admin-priority-row ${pendency.severity === "critical" ? "is-critical" : "is-warning"}`}
                  >
                    <div className="admin-priority-indicator" />
                    <div className="min-w-0 flex-1">
                      <span>{pendency.area}</span>
                      <p>{pendency.title}</p>
                      <small>{pendency.reason}</small>
                    </div>
                    <Link
                      to={pendency.link}
                      className="admin-priority-action"
                    >
                      Abrir
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-[2rem] border border-emerald-100 bg-emerald-50 px-6 py-12 text-center">
                <div className="mb-4 text-4xl">🏆</div>
                <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Tudo em ordem</p>
                <p className="mt-2 text-[10px] font-bold uppercase text-slate-400">Nenhuma pendência crítica encontrada.</p>
              </div>
            )}
          </section>

          <section className="admin-panel p-7">
            <div className="mb-7 flex items-center justify-between gap-4">
              <div>
                <span className="admin-eyebrow">Atalhos</span>
                <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Ações rápidas</h2>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/admin/acervo/artigos/novo" className="admin-action-tile group flex flex-col items-center p-5">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">📄</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Novo artigo científico</span>
              </Link>
              <Link to="/admin/blog/novo" className="admin-action-tile group flex flex-col items-center p-5">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">✍️</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Nova matéria</span>
              </Link>
              <Link to="/admin/relatorios/novo" className="admin-action-tile group flex flex-col items-center p-5">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">📊</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Novo relatório</span>
              </Link>
              <Link to="/admin/agenda/novo" className="admin-action-tile group flex flex-col items-center p-5">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">🗓️</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Novo evento</span>
              </Link>
              <Link to="/admin/uploads" className="admin-action-tile group flex flex-col items-center p-5">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">☁️</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Subir arquivo</span>
              </Link>
              <Link to="/admin/relatos" className="admin-action-tile group flex flex-col items-center p-5">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">📥</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Relatos Ambientais</span>
              </Link>
              <Link to="/admin/blog" className="admin-action-tile group flex flex-col items-center p-5">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">📰</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Gerenciar Blog</span>
              </Link>
              <Link to="/admin/acervo" className="group flex flex-col items-center rounded-[1.5rem] bg-slate-900 p-5 shadow-xl transition-all hover:bg-slate-800">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">🔍</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-white">Revisar rascunhos</span>
              </Link>
              <Link to="/admin/acervo/imprensa" className="admin-action-tile group flex flex-col items-center p-5">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">🗞️</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Capturar matérias</span>
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-8 lg:col-span-7">
          {primaryActivity && (
            <section className="admin-activity-feature">
              <div>
                <span className="admin-command-eyebrow">Fluxo de entrada</span>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white">{primaryActivity.title}</h2>
              </div>

              {loading ? (
                <div className="py-16 text-center font-medium italic text-white/55">Carregando atividade...</div>
              ) : primaryActivity.items.length > 0 ? (
                <div className="mt-7 space-y-3">
                  {primaryActivity.items.map((item) => (
                    <Link key={item.id} to={item.link} className="admin-activity-row-dark group">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-xl text-white shadow-inner">
                        {item.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p>{item.title}</p>
                        <small>{item.meta} • {formatTimestamp(item.timestamp)}</small>
                      </div>
                      <span>→</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="py-10 text-center font-medium italic text-white/60">{primaryActivity.empty}</p>
              )}
            </section>
          )}

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
            {secondaryActivityGroups.map((group) => (
              <section key={group.key} className="admin-panel p-6">
                <div className="mb-6">
                  <span className="admin-eyebrow">Atividade</span>
                  <h2 className="mt-3 text-xl font-black tracking-tight text-slate-950">{group.title}</h2>
                </div>

                {loading ? (
                  <div className="py-16 text-center font-medium italic text-slate-300">Carregando atividade...</div>
                ) : group.items.length > 0 ? (
                  <div className="space-y-3">
                    {group.items.map((item) => (
                      <div key={item.id} className="admin-row group flex items-center justify-between p-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-white text-lg shadow-inner">
                            {item.icon}
                          </div>
                          <div className="min-w-0">
                            <p className="line-clamp-1 text-sm font-black text-slate-900">{item.title}</p>
                            <p className="mt-1 line-clamp-1 text-[9px] font-bold uppercase tracking-widest text-slate-400">
                              {item.meta}
                            </p>
                          </div>
                        </div>
                        <Link to={item.link} className="rounded-xl bg-white p-2 text-slate-300 transition-all group-hover:text-emerald-600 group-hover:shadow-sm">
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                          </svg>
                        </Link>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="py-10 text-center font-medium italic text-slate-400">{group.empty}</p>
                )}
              </section>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
