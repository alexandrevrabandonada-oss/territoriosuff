import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

interface DashboardStats {
  acervoPublished: number;
  draftsTotal: number;
  uploadsTotal: number;
  reportsPublished: number;
  upcomingEvents: number;
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

function formatTimestamp(value: string): string {
  const date = new Date(value);
  return `${date.toLocaleDateString("pt-BR")} às ${date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
}

function dashboardTimestamp(...values: Array<string | null | undefined>): string {
  return values.find((value): value is string => typeof value === "string" && value.length > 0) ?? new Date(0).toISOString();
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    acervoPublished: 0,
    draftsTotal: 0,
    uploadsTotal: 0,
    reportsPublished: 0,
    upcomingEvents: 0,
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
        { count: reportsPublishedCount },
        { count: upcomingEventsCount },
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
      ] = await Promise.all([
        supabase.from("acervo_items").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("acervo_items").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("media_assets").select("*", { count: "exact", head: true }),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("start_at", now.toISOString()).neq("status", "cancelled"),
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
      ]);

      setStats({
        acervoPublished: acervoPublishedCount || 0,
        draftsTotal: (acervoDraftCount || 0) + (blogDraftCount || 0) + (reportsDraftCount || 0),
        uploadsTotal: uploadsTotalCount || 0,
        reportsPublished: reportsPublishedCount || 0,
        upcomingEvents: upcomingEventsCount || 0,
      });

      const nextPendencies: Pendency[] = [];

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
    { label: "Acervo publicado", value: stats.acervoPublished, sub: "Itens ativos no portal", icon: "📚", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Rascunhos", value: stats.draftsTotal, sub: "Conteúdos pendentes", icon: "📝", color: "text-amber-600", bg: "bg-amber-50" },
    { label: "Uploads totais", value: stats.uploadsTotal, sub: "Arquivos armazenados", icon: "☁️", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Relatórios publicados", value: stats.reportsPublished, sub: "Biblioteca oficial", icon: "📄", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Eventos futuros", value: stats.upcomingEvents, sub: "Agenda viva", icon: "🗓️", color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900">Central Operacional</h1>
          <p className="mt-1 font-medium italic text-slate-500">O que a equipe precisa resolver hoje.</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Visão consolidada do dia
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <div key={card.label} className="flex items-center gap-4 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
            <div className={`flex h-14 w-14 items-center justify-center rounded-2xl text-3xl shadow-inner ${card.bg}`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{card.label}</p>
              <p className={`text-2xl font-black ${card.color}`}>{loading ? "..." : card.value}</p>
              <p className="text-[10px] font-bold uppercase text-slate-300">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-4">
          <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-xl shadow-slate-100">
            <h2 className="mb-8 flex items-center gap-3 text-lg font-black text-slate-900">
              <span className="h-3 w-3 rounded-full bg-rose-500 animate-ping" />
              Pendências críticas
            </h2>

            {loading ? (
              <div className="py-20 text-center font-medium italic text-slate-300">Analisando pendências do dia...</div>
            ) : pendencies.length > 0 ? (
              <div className="space-y-3">
                {pendencies.map((pendency) => (
                  <div
                    key={pendency.id}
                    className={`rounded-[1.5rem] border p-5 transition-all ${pendency.severity === "critical"
                      ? "border-rose-100 bg-rose-50 hover:bg-rose-100"
                      : "border-amber-100 bg-amber-50 hover:bg-amber-100"
                    }`}
                  >
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest ${pendency.severity === "critical" ? "bg-rose-600 text-white" : "bg-amber-600 text-white"}`}>
                        {pendency.area}
                      </span>
                    </div>
                    <p className="line-clamp-1 text-sm font-black text-slate-900">{pendency.title}</p>
                    <p className={`mt-1 text-[10px] font-bold uppercase ${pendency.severity === "critical" ? "text-rose-600" : "text-amber-600"}`}>
                      {pendency.reason}
                    </p>
                    <Link
                      to={pendency.link}
                      className={`mt-4 block w-full rounded-xl py-2.5 text-center text-[10px] font-black uppercase tracking-widest text-white transition-all ${pendency.severity === "critical" ? "bg-rose-600 hover:bg-rose-700" : "bg-amber-600 hover:bg-amber-700"}`}
                    >
                      Corrigir agora
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

          <section className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
            <h2 className="mb-8 flex items-center gap-3 text-xl font-black text-slate-900">
              <span className="rounded-xl bg-slate-900 p-2 text-xs text-white">⚡</span>
              Ações rápidas
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
              <Link to="/admin/acervo/artigos/novo" className="group flex flex-col items-center rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">📄</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Novo artigo científico</span>
              </Link>
              <Link to="/admin/blog/novo" className="group flex flex-col items-center rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">✍️</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Nova matéria</span>
              </Link>
              <Link to="/admin/relatorios/novo" className="group flex flex-col items-center rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">📊</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Novo relatório</span>
              </Link>
              <Link to="/admin/agenda/novo" className="group flex flex-col items-center rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">🗓️</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Novo evento</span>
              </Link>
              <Link to="/admin/uploads" className="group flex flex-col items-center rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 shadow-sm transition-all hover:border-emerald-200 hover:bg-emerald-50">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">☁️</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-slate-600">Subir arquivo</span>
              </Link>
              <Link to="/admin/acervo" className="group flex flex-col items-center rounded-[1.5rem] bg-slate-900 p-5 shadow-xl transition-all hover:bg-slate-800">
                <span className="mb-3 text-3xl transition-transform group-hover:scale-110">🔍</span>
                <span className="text-center text-[9px] font-black uppercase leading-tight text-white">Revisar rascunhos</span>
              </Link>
            </div>
          </section>
        </div>

        <div className="space-y-8 lg:col-span-8">
          {activityGroups.map((group) => (
            <section key={group.key} className="rounded-[2.5rem] border border-slate-200 bg-white p-8 shadow-sm">
              <h2 className="mb-8 flex items-center gap-3 text-xl font-black text-slate-900">
                <span className="rounded-xl bg-slate-900 p-2 text-xs text-white">🕒</span>
                {group.title}
              </h2>

              {loading ? (
                <div className="py-16 text-center font-medium italic text-slate-300">Carregando atividade...</div>
              ) : group.items.length > 0 ? (
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.id} className="group flex items-center justify-between rounded-[1.5rem] border border-slate-100 bg-slate-50 p-5 transition-all hover:bg-white hover:shadow-md">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-xl shadow-inner">
                          {item.icon}
                        </div>
                        <div>
                          <p className="line-clamp-1 text-sm font-black text-slate-900">{item.title}</p>
                          <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                            {item.meta} • {formatTimestamp(item.timestamp)}
                          </p>
                        </div>
                      </div>
                      <Link to={item.link} className="rounded-xl bg-white p-3 text-slate-300 transition-all group-hover:text-emerald-600 group-hover:shadow-sm">
                        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
  );
}
