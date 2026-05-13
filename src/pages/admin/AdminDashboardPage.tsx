import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

interface DashboardStats {
  acervo_published: number;
  acervo_drafts: number;
  blog_published: number;
  blog_drafts: number;
  reports_published: number;
  reports_drafts: number;
  events_upcoming: number;
  regs_recent: number;
  media_total: number;
}

interface Pendency {
  id: string;
  type: string;
  title: string;
  reason: string;
  link: string;
  severity: "critical" | "warning";
}

export function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    acervo_published: 0,
    acervo_drafts: 0,
    blog_published: 0,
    blog_drafts: 0,
    reports_published: 0,
    reports_drafts: 0,
    events_upcoming: 0,
    regs_recent: 0,
    media_total: 0
  });

  const [pendencies, setPendencies] = useState<Pendency[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  const loadDashboard = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    try {
      const now = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);

      const [
        { count: acervoPub },
        { count: acervoDraft },
        { count: blogPub },
        { count: blogDraft },
        { count: reportsPub },
        { count: reportsDraft },
        { count: eventsUp },
        { count: regsRecent },
        { count: mediaTotal },
        { data: mediaNoAlt },
        { data: acervoNoTags },
        { data: acervoNoSource },
        { data: oldDrafts },
        { data: reportsNoPdf },
        { data: eventsNoLoc },
        { data: recentUploads },
        { data: recentAcervo }
      ] = await Promise.all([
        supabase.from("acervo_items").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("acervo_items").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("blog_posts").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "published"),
        supabase.from("reports").select("*", { count: "exact", head: true }).eq("status", "draft"),
        supabase.from("events").select("*", { count: "exact", head: true }).gte("start_at", now.toISOString()),
        supabase.from("registrations").select("*", { count: "exact", head: true }).gte("created_at", sevenDaysAgo.toISOString()),
        supabase.from("media_assets").select("*", { count: "exact", head: true }),
        
        // Pendencies
        supabase.from("media_assets").select("id, title").or("alt_text.is.null,alt_text.eq.''").limit(5),
        supabase.from("acervo_items").select("id, title").or("tags.is.null,tags.eq.'{}'").eq("status", "published").limit(5),
        supabase.from("acervo_items").select("id, title").or("source.is.null,source.eq.''").eq("status", "published").limit(5),
        supabase.from("acervo_items").select("id, title").eq("status", "draft").lt("created_at", sevenDaysAgo.toISOString()).limit(5),
        supabase.from("reports").select("id, title").or("pdf_url.is.null,pdf_url.eq.''").eq("status", "published").limit(5),
        supabase.from("events").select("id, title").or("location_name.is.null,location_name.eq.''").eq("status", "published").limit(5),

        // Activity
        supabase.from("media_assets").select("id, title, created_at").order("created_at", { ascending: false }).limit(5),
        supabase.from("acervo_items").select("id, title, created_at, status").order("created_at", { ascending: false }).limit(5)
      ]);

      setStats({
        acervo_published: acervoPub || 0,
        acervo_drafts: acervoDraft || 0,
        blog_published: blogPub || 0,
        blog_drafts: blogDraft || 0,
        reports_published: reportsPub || 0,
        reports_drafts: reportsDraft || 0,
        events_upcoming: eventsUp || 0,
        regs_recent: regsRecent || 0,
        media_total: mediaTotal || 0
      });

      // Consolidar Pendências
      const p: Pendency[] = [];
      mediaNoAlt?.forEach(m => p.push({ id: m.id, type: "Mídia", title: m.title, reason: "Sem Alt-Text", link: "/admin/uploads", severity: "warning" }));
      acervoNoTags?.forEach(a => p.push({ id: a.id, type: "Acervo", title: a.title, reason: "Sem Tags", link: `/admin/acervo/${a.id}`, severity: "warning" }));
      acervoNoSource?.forEach(a => p.push({ id: a.id, type: "Acervo", title: a.title, reason: "Sem Fonte/Crédito", link: `/admin/acervo/${a.id}`, severity: "warning" }));
      oldDrafts?.forEach(a => p.push({ id: a.id, type: "Draft", title: a.title, reason: "Parado há +7 dias", link: `/admin/acervo/${a.id}`, severity: "critical" }));
      reportsNoPdf?.forEach(r => p.push({ id: r.id, type: "Relatório", title: r.title, reason: "Sem arquivo PDF", link: `/admin/relatorios/${r.id}`, severity: "critical" }));
      eventsNoLoc?.forEach(e => p.push({ id: e.id, type: "Evento", title: e.title, reason: "Sem Local definido", link: `/admin/agenda/${e.id}`, severity: "critical" }));
      
      setPendencies(p.slice(0, 10)); // Top 10 pendencies

      // Consolidar Atividade
      const activity = [
        ...(recentUploads?.map(u => ({ ...u, kind: "upload", icon: "☁️" })) || []),
        ...(recentAcervo?.map(a => ({ ...a, kind: "acervo", icon: a.status === 'published' ? "🚀" : "📝" })) || [])
      ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 10);

      setRecentActivity(activity);

    } catch (err) {
      console.error("[Dashboard] Erro:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboard();
  }, [loadDashboard]);

  const statCards = [
    { label: "Acervo", value: stats.acervo_published, sub: `${stats.acervo_drafts} rascunhos`, icon: "📚", color: "text-blue-600", bg: "bg-blue-50" },
    { label: "Blog", value: stats.blog_published, sub: `${stats.blog_drafts} rascunhos`, icon: "📰", color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Relatórios", value: stats.reports_published, sub: `${stats.reports_drafts} rascunhos`, icon: "📄", color: "text-indigo-600", bg: "bg-indigo-50" },
    { label: "Inscrições", value: stats.regs_recent, sub: "últimos 7 dias", icon: "👥", color: "text-amber-600", bg: "bg-amber-50" },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Painel Operacional</h1>
          <p className="text-slate-500 mt-1 font-medium italic">Visão geral e ações prioritárias para hoje.</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          Sistema Online
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <div key={card.label} className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4">
            <div className={`w-14 h-14 ${card.bg} rounded-2xl flex items-center justify-center text-3xl shadow-inner`}>
              {card.icon}
            </div>
            <div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{card.label}</p>
              <p className={`text-2xl font-black ${card.color}`}>{loading ? "..." : card.value}</p>
              <p className="text-[10px] font-bold text-slate-300 uppercase">{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Actions & Activity */}
        <div className="lg:col-span-8 space-y-8">
          {/* Quick Actions */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="p-2 bg-slate-900 text-white rounded-xl text-xs">⚡</span>
              Ações Rápidas
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
              <Link to="/admin/acervo/artigos/novo" className="flex flex-col items-center p-5 bg-slate-50 rounded-[1.5rem] hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200 shadow-sm">
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📄</span>
                <span className="text-[9px] font-black text-slate-600 uppercase text-center leading-tight">Novo Artigo</span>
              </Link>
              <Link to="/admin/blog/novo" className="flex flex-col items-center p-5 bg-slate-50 rounded-[1.5rem] hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200 shadow-sm">
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">✍️</span>
                <span className="text-[9px] font-black text-slate-600 uppercase text-center leading-tight">Nova Matéria</span>
              </Link>
              <Link to="/admin/relatorios/novo" className="flex flex-col items-center p-5 bg-slate-50 rounded-[1.5rem] hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200 shadow-sm">
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">📊</span>
                <span className="text-[9px] font-black text-slate-600 uppercase text-center leading-tight">Novo Relatório</span>
              </Link>
              <Link to="/admin/agenda/novo" className="flex flex-col items-center p-5 bg-slate-50 rounded-[1.5rem] hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200 shadow-sm">
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🗓️</span>
                <span className="text-[9px] font-black text-slate-600 uppercase text-center leading-tight">Novo Evento</span>
              </Link>
              <Link to="/admin/uploads" className="flex flex-col items-center p-5 bg-slate-50 rounded-[1.5rem] hover:bg-emerald-50 transition-all group border border-slate-100 hover:border-emerald-200 shadow-sm">
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">☁️</span>
                <span className="text-[9px] font-black text-slate-600 uppercase text-center leading-tight">Subir Arquivo</span>
              </Link>
              <Link to="/admin/acervo" className="flex flex-col items-center p-5 bg-slate-900 rounded-[1.5rem] hover:bg-slate-800 transition-all group shadow-xl">
                <span className="text-3xl mb-3 group-hover:scale-110 transition-transform">🔍</span>
                <span className="text-[9px] font-black text-white uppercase text-center leading-tight">Revisar Rascunhos</span>
              </Link>
            </div>
          </section>

          {/* Activity Feed */}
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
            <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="p-2 bg-slate-900 text-white rounded-xl text-xs">🕒</span>
              Atividade Recente
            </h2>
            <div className="space-y-4">
              {recentActivity.map((item, idx) => (
                <div key={`${item.id}-${idx}`} className="flex items-center justify-between p-5 bg-slate-50 rounded-[1.5rem] border border-slate-100 hover:bg-white hover:shadow-md transition-all group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center shadow-inner text-xl">
                      {item.icon}
                    </div>
                    <div>
                      <p className="text-sm font-black text-slate-900 line-clamp-1">{item.title}</p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                        {item.kind} • {new Date(item.created_at).toLocaleDateString("pt-BR")} às {new Date(item.created_at).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <Link to={item.kind === 'upload' ? '/admin/uploads' : `/admin/acervo/${item.id}`} className="p-3 bg-white text-slate-300 rounded-xl group-hover:text-emerald-600 group-hover:shadow-sm transition-all">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              ))}
              {recentActivity.length === 0 && <p className="text-center text-slate-400 italic font-medium py-10">Nenhuma atividade recente encontrada.</p>}
            </div>
          </section>
        </div>

        {/* Right Column: Pendencies */}
        <div className="lg:col-span-4 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-xl shadow-slate-100">
            <h2 className="text-lg font-black text-slate-900 mb-8 flex items-center gap-3">
              <span className="w-3 h-3 bg-rose-500 rounded-full animate-ping" />
              Pendências Críticas
            </h2>
            <div className="space-y-3">
              {loading ? (
                <div className="py-20 text-center text-slate-300 italic font-medium">Analisando dados...</div>
              ) : pendencies.length > 0 ? (
                pendencies.map((p, idx) => (
                  <Link 
                    key={`${p.id}-${idx}`} 
                    to={p.link} 
                    className={`flex flex-col p-5 rounded-[1.5rem] border transition-all group ${
                      p.severity === 'critical' ? 'bg-rose-50 border-rose-100 hover:bg-rose-100' : 'bg-amber-50 border-amber-100 hover:bg-amber-100'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                        p.severity === 'critical' ? 'bg-rose-600 text-white' : 'bg-amber-600 text-white'
                      }`}>
                        {p.type}
                      </span>
                      <svg className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                    <p className="text-sm font-black text-slate-900 line-clamp-1">{p.title}</p>
                    <p className={`text-[10px] font-bold mt-1 uppercase ${
                      p.severity === 'critical' ? 'text-rose-600' : 'text-amber-600'
                    }`}>
                      {p.reason}
                    </p>
                  </Link>
                ))
              ) : (
                <div className="text-center py-12 px-6">
                  <div className="text-4xl mb-4">🏆</div>
                  <p className="text-sm font-black text-emerald-600 uppercase tracking-widest leading-relaxed">Tudo em ordem!</p>
                  <p className="text-[10px] font-bold text-slate-400 mt-2 uppercase">Não há pendências pendentes para sua revisão.</p>
                </div>
              )}
            </div>
          </section>

          <section className="bg-slate-900 p-8 rounded-[2.5rem] shadow-2xl shadow-slate-300">
            <h2 className="text-lg font-black text-white mb-8 flex items-center gap-3">
              <span className="p-2 bg-emerald-500 text-white rounded-xl text-[10px]">📈</span>
              Métricas da Rede
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white text-sm font-black">Total de Mídias</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase">Armazenadas no Supabase</p>
                </div>
                <span className="text-2xl font-black text-white">{stats.media_total}</span>
              </div>
              <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                <div className="w-3/4 h-full bg-emerald-500 rounded-full" />
              </div>
              <div className="pt-4 border-t border-slate-800">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Estado da Nação: Operacional</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
