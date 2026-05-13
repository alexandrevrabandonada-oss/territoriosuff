import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

interface Report {
  id: string;
  title: string;
  slug: string;
  type: string;
  kind?: string | null;
  status: string;
  year: number;
  featured: boolean;
  published_at: string;
  pdf_url: string;
}

const TYPE_LABELS: Record<string, string> = {
  relatorio: "Relatório",
  "nota-tecnica": "Nota Técnica",
  boletim: "Boletim",
  anexo: "Anexo",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  archived: "bg-rose-100 text-rose-700",
};

function normalizeReportType(value: unknown): string {
  if (value === "nota técnica") return "nota-tecnica";
  if (typeof value === "string" && value.length > 0) return value;
  return "relatorio";
}

export function AdminReportsListPage() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const navigate = useNavigate();

  const loadReports = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    let query = supabase
      .from("reports")
      .select("id, title, slug, type, kind, status, year, featured, published_at, pdf_url")
      .order("published_at", { ascending: false });

    if (searchTerm) {
      query = query.or(`title.ilike.%${searchTerm}%,slug.ilike.%${searchTerm}%`);
    }
    if (filterYear) {
      query = query.eq("year", parseInt(filterYear));
    }
    if (filterStatus) {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query;

    if (error) {
      console.error("[Reports] Erro ao carregar:", error);
    } else {
      const normalized = ((data || []) as Report[]).filter((report) => {
        if (!filterType) return true;
        return normalizeReportType(report.type || report.kind) === filterType;
      }).map((report) => ({
        ...report,
        type: normalizeReportType(report.type || report.kind),
      }));

      setReports(normalized);
    }
    setLoading(false);
  }, [searchTerm, filterType, filterYear, filterStatus]);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    alert("Link do PDF copiado!");
  };

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm("Tem certeza que deseja excluir este relatório?")) return;
    
    const { error } = await supabase.from("reports").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      loadReports();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Relatórios Oficiais</h1>
          <p className="text-slate-500 mt-1 font-medium">Gestão de documentos técnicos, notas e boletins.</p>
        </div>
        <Link 
          to="/admin/relatorios/novo"
          className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] uppercase tracking-widest text-xs"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Relatório
        </Link>
      </div>

      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Busca por título</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Filtrar relatórios..."
            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 font-bold"
          />
        </div>

        <div className="w-48">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tipo</label>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
          >
            <option value="">Todos</option>
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="w-32">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ano</label>
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
          >
            <option value="">Todos</option>
            {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => loadReports()}
          className="p-3 text-slate-400 hover:text-emerald-600 transition-colors"
          title="Recarregar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl shadow-slate-200/40 overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Carregando documentos...</div>
        ) : reports.length === 0 ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Nenhum relatório encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Documento</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Tipo / Ano</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                  <th className="px-8 py-5 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {reports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-3">
                        {report.featured && (
                          <span className="w-2 h-2 bg-amber-400 rounded-full animate-pulse" title="Em Destaque" />
                        )}
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-bold text-slate-900 leading-snug">{report.title}</p>
                            {!report.pdf_url && (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[8px] font-black uppercase rounded-md border border-rose-100 flex items-center gap-1">
                                <svg className="w-2.5 h-2.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Sem PDF
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] font-mono text-slate-400 mt-1 uppercase tracking-tighter">/{report.slug}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="text-xs font-black text-slate-500 uppercase tracking-widest">{TYPE_LABELS[report.type] || report.type}</span>
                      <p className="text-[10px] font-bold text-slate-400 mt-1">{report.year}</p>
                    </td>
                    <td className="px-8 py-6">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border ${STATUS_COLORS[report.status]}`}>
                        {STATUS_LABELS[report.status]}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => copyLink(report.pdf_url)}
                          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                          title="Copiar Link do PDF"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                          </svg>
                        </button>
                        <Link 
                          to={`/relatorios/${report.slug}`} 
                          target="_blank"
                          className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                          title="Ver Página Pública"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                        </Link>
                        <button 
                          onClick={() => navigate(`/admin/relatorios/${report.id}`)}
                          className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                          title="Editar"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button 
                          onClick={() => handleDelete(report.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                          title="Excluir"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
