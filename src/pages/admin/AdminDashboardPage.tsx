import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

interface DashboardStats {
  acervo_total: number;
  acervo_drafts: number;
  acervo_scheduled: number;
  blog_total: number;
  blog_drafts: number;
  media_total: number;
  media_no_alt: number;
  events_upcoming: number;
  regs_total: number;
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    acervo_total: 0,
    acervo_drafts: 0,
    acervo_scheduled: 0,
    blog_total: 0,
    blog_drafts: 0,
    media_total: 0,
    media_no_alt: 0,
    events_upcoming: 0,
    regs_total: 0
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const loadDashboard = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      const [
        { count: acervoTotal },
        { count: acervoDrafts },
        { count: acervoScheduled },
        { count: blogTotal },
        { count: blogDrafts },
        { count: mediaTotal },
        { count: mediaNoAlt },
        { count: eventsUpcoming },
        { count: regsTotal },
        { data: recentItems }
      ] = await Promise.all([
        supabase.from("acervo_items").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("acervo_items").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("acervo_items").select("*", { count: "exact", head: true }).eq("status", "scheduled"),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("media_assets").select("*", { count: "exact", head: true }),
        supabase.from("media_assets").select("*", { count: "exact", head: true }).or("alt_text.is.null,alt_text.eq.''"),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("start_at", new Date().toISOString()),
        supabase.from("registrations").select("*", { count: "exact", head: true }),
        supabase.from("acervo_items").select("id, title, created_at, type").order("created_at", { ascending: false }).limit(5)
      ]);

      setStats({
        acervo_total: acervoTotal || 0,
        acervo_drafts: acervoDrafts || 0,
        acervo_scheduled: acervoScheduled || 0,
        blog_total: blogTotal || 0,
        blog_drafts: blogDrafts || 0,
        media_total: mediaTotal || 0,
        media_no_alt: mediaNoAlt || 0,
        events_upcoming: eventsUpcoming || 0,
        regs_total: regsTotal || 0
      });

      setRecentActivity(recentItems || []);
    } catch (err) {
      console.error("[Dashboard] Erro ao carregar dados:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const cards = [
    { label: "Acervo Público", value: stats.acervo_total, icon: "📚", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Blog Ativo", value: stats.blog_total, icon: "📰", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Mídias Totais", value: stats.media_total, icon: "🖼️", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Próximos Eventos", value: stats.events_upcoming, icon: "📅", color: "text-rose-600", bg: "bg-rose-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Administrativo</h1>
        <p className="text-slate-500 mt-1">Gestão operacional do Portal SEMEAR.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-12 h-12 ${card.bg} ${card.icon ? "" : "bg-slate-100"} rounded-xl flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className={`text-2xl font-black ${card.color}`}>{loading ? "..." : card.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Quick Actions & Activity */}
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Ações Rápidas</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              <Link to="/admin/acervo/artigos/novo" className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📄</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase text-center">Novo Artigo</span>
              </Link>
              <Link to="/admin/blog/novo" className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">✍️</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase text-center">Nova Matéria</span>
              </Link>
              <Link to="/admin/agenda/novo" className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🗓️</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase text-center">Novo Evento</span>
              </Link>
              <Link to="/admin/uploads" className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">☁️</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase text-center">Subir Arquivo</span>
              </Link>
              <Link to="/admin/acervo/novo" className="flex flex-col items-center p-4 bg-slate-50 rounded-2xl hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200">
                <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📚</span>
                <span className="text-[10px] font-bold text-slate-600 uppercase text-center">Novo Acervo</span>
              </Link>
            </div>
          </section>

          {/* Activity Feed */}
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-6">Atividade Recente</h2>
            <div className="space-y-4">
              {recentActivity.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                      {item.type === "artigo_cientifico" ? "📄" : "📚"}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-medium">Cadastrado em {new Date(item.created_at).toLocaleDateString("pt-BR")}</p>
                    </div>
                  </div>
                  <Link to={`/admin/acervo/${item.id}`} className="p-2 text-slate-400 hover:text-emerald-600">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-center text-slate-400 italic py-4">Nenhuma atividade recente encontrada.</p>}
            </div>
          </section>
        </div>

        {/* Pendencies & Stats Sidebar */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              Pendências Críticas
            </h2>
            <div className="space-y-3">
              {stats.media_no_alt > 0 && (
                <Link to="/admin/uploads" className="flex items-center justify-between p-4 bg-rose-50 border border-rose-100 rounded-2xl group transition-all">
                  <span className="text-sm font-bold text-rose-700">{stats.media_no_alt} Imagens sem Alt-text</span>
                  <svg className="w-4 h-4 text-rose-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              {stats.acervo_drafts > 0 && (
                <Link to="/admin/acervo" className="flex items-center justify-between p-4 bg-amber-50 border border-amber-100 rounded-2xl group transition-all">
                  <span className="text-sm font-bold text-amber-700">{stats.acervo_drafts} Rascunhos no Acervo</span>
                  <svg className="w-4 h-4 text-amber-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              )}
              {stats.acervo_scheduled > 0 && (
                <div className="flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-2xl">
                  <span className="text-sm font-bold text-blue-700">{stats.acervo_scheduled} Itens Agendados</span>
                  <span className="text-xl">🕒</span>
                </div>
              )}
              {stats.media_no_alt === 0 && stats.acervo_drafts === 0 && (
                <div className="text-center py-8">
                  <span className="text-3xl block mb-2">🎉</span>
                  <p className="text-sm font-bold text-emerald-600">Nenhuma pendência pendente!</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-slate-900 p-8 rounded-3xl shadow-xl shadow-slate-200">
            <h2 className="text-lg font-bold text-white mb-6">Comunidade</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Total de Inscrições</span>
                <span className="text-xl font-black text-white">{stats.regs_total}</span>
              </div>
              <div className="w-full h-1 bg-slate-800 rounded-full overflow-hidden">
                <div className="w-2/3 h-full bg-emerald-500 rounded-full" />
              </div>
              <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Ritmo da Semana: Estável</p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
