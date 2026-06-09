import { useEffect, useState, useCallback } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import { getLinkedMediaAssetIdsForContent } from "../../lib/admin/media";

interface AcervoItem {
  id: string;
  title: string;
  type: string;
  status: string;
  published_at: string | null;
  publish_at: string | null;
  slug: string;
  source_url?: string | null;
  content_md?: string | null;
  meta?: Record<string, unknown> | null;
}

const TYPE_LABELS: Record<string, string> = {
  artigo_cientifico: "Artigo Científico",
  noticia: "Notícia",
  materia: "Matéria",
  foto: "Foto",
  video: "Vídeo",
  documento: "Documento",
  relatorio_tecnico: "Relatório Técnico",
  memoria: "Memória",
  outro: "Outro",
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado",
  scheduled: "Agendado",
  archived: "Arquivado",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-slate-100 text-slate-600",
  published: "bg-emerald-100 text-emerald-700",
  scheduled: "bg-blue-100 text-blue-700",
  archived: "bg-rose-100 text-rose-700",
};

const PRESERVATION_LABELS: Record<string, string> = {
  all: "Tudo",
  preserved: "Preservada",
  link_only: "Só link externo",
  manual_text: "Texto manual",
  no_source: "Sem fonte",
};

const PRESERVATION_COLORS: Record<string, string> = {
  preserved: "bg-emerald-100 text-emerald-700",
  link_only: "bg-amber-100 text-amber-700",
  manual_text: "bg-blue-100 text-blue-700",
  no_source: "bg-slate-100 text-slate-600",
};

function isNewsType(type: string) {
  return type === "noticia" || type === "materia";
}

function getPreservationState(item: AcervoItem) {
  if (!isNewsType(item.type)) return null;
  const meta = item.meta && typeof item.meta === "object" && !Array.isArray(item.meta)
    ? item.meta as Record<string, unknown>
    : null;
  const sourceCapture = meta?.source_capture && typeof meta.source_capture === "object" && !Array.isArray(meta.source_capture)
    ? meta.source_capture as Record<string, unknown>
    : null;

  if (sourceCapture?.captured_at) return "preserved";
  if (item.source_url && item.content_md?.trim()) return "manual_text";
  if (item.source_url) return "link_only";
  return "no_source";
}

export function AdminAcervoListPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [items, setItems] = useState<AcervoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [filterType, setFilterType] = useState(searchParams.get("type") || "");
  const [filterStatus, setFilterStatus] = useState(searchParams.get("status") || "");
  const [filterPreservation, setFilterPreservation] = useState(searchParams.get("preservation") || "all");
  const navigate = useNavigate();

  useEffect(() => {
    setSearchTerm(searchParams.get("q") || "");
    setFilterType(searchParams.get("type") || "");
    setFilterStatus(searchParams.get("status") || "");
    setFilterPreservation(searchParams.get("preservation") || "all");
  }, [searchParams]);

  const applyFiltersToUrl = useCallback((next: {
    q?: string;
    type?: string;
    status?: string;
    preservation?: string;
  }) => {
    const params = new URLSearchParams();
    if (next.q) params.set("q", next.q);
    if (next.type) params.set("type", next.type);
    if (next.status) params.set("status", next.status);
    if (next.preservation && next.preservation !== "all") params.set("preservation", next.preservation);
    setSearchParams(params);
  }, [setSearchParams]);

  const loadItems = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    let query = supabase
      .from("acervo_items")
      .select("id, title, type, status, published_at, publish_at, slug, source_url, content_md, meta")
      .order("created_at", { ascending: false });

    if (searchTerm) {
      query = query.ilike("title", `%${searchTerm}%`);
    }
    if (filterType) {
      query = query.eq("type", filterType);
    }
    if (filterStatus) {
      query = query.eq("status", filterStatus);
    }

    const { data, error } = await query.limit(50);

    if (error) {
      console.error("[Acervo] Erro ao carregar:", error);
    } else {
      const nextItems = (data || []) as AcervoItem[];
      setItems(
        filterPreservation === "all"
          ? nextItems
          : nextItems.filter((item) => getPreservationState(item) === filterPreservation),
      );
    }
    setLoading(false);
  }, [searchTerm, filterType, filterStatus, filterPreservation]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleDelete = async (id: string) => {
    if (!supabase) return;

    const linkedAssetIds = await getLinkedMediaAssetIdsForContent("acervo", id);
    if (linkedAssetIds.length > 0) {
      alert(`Exclusão bloqueada: este item do acervo possui ${linkedAssetIds.length} asset(s) vinculado(s). Revise os arquivos no editor do item ou em /admin/uploads antes de excluir.`);
      return;
    }

    if (!confirm("Tem certeza que deseja excluir este item?")) return;
    
    const { error } = await supabase.from("acervo_items").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      loadItems();
    }
  };

  const newsItems = items.filter((item) => isNewsType(item.type));
  const preservedCount = newsItems.filter((item) => getPreservationState(item) === "preserved").length;
  const linkOnlyCount = newsItems.filter((item) => getPreservationState(item) === "link_only").length;
  const noSourceCount = newsItems.filter((item) => getPreservationState(item) === "no_source").length;

  return (
    <div className="admin-list-page space-y-8 animate-in fade-in duration-500">
      <div className="admin-list-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Biblioteca viva</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Acervo SEMEAR</h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">Gestão de conteúdos técnicos, históricos, científicos e editoriais do projeto.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link 
            to="/admin/acervo/artigos/novo"
            className="admin-command-ghost"
          >
            <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            Novo Artigo (Wizard)
          </Link>
          <Link 
            to="/admin/acervo/novo"
            className="admin-command-cta"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Novo Item
          </Link>
          <Link
            to="/admin/acervo/imprensa"
            className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-black uppercase tracking-wide text-amber-800 transition hover:bg-amber-100"
          >
            Abrir backlog de captura
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-400">Matérias preservadas</span>
          <strong className="mt-3 block text-3xl font-black text-slate-900">{preservedCount}</strong>
          <p className="mt-2 text-sm font-medium text-slate-500">Itens de imprensa com captura registrada e cópia arquivada no portal.</p>
        </div>
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Dependem do link</span>
          <strong className="mt-3 block text-3xl font-black text-amber-900">{linkOnlyCount}</strong>
          <p className="mt-2 text-sm font-medium text-amber-800/80">Notícias e matérias ainda sem captura preservada no acervo.</p>
          <Link to="/admin/acervo/imprensa" className="mt-4 inline-block text-xs font-black uppercase tracking-wide text-amber-800 underline underline-offset-2">
            Ver fila de imprensa
          </Link>
        </div>
        <div className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-slate-500">Sem fonte</span>
          <strong className="mt-3 block text-3xl font-black text-slate-900">{noSourceCount}</strong>
          <p className="mt-2 text-sm font-medium text-slate-600">Itens editoriais que ainda precisam de link de origem para rastreabilidade.</p>
          <button
            type="button"
            onClick={() => applyFiltersToUrl({ q: searchTerm, type: filterType, status: filterStatus, preservation: "no_source" })}
            className="mt-4 text-xs font-black uppercase tracking-wide text-slate-700 underline underline-offset-2"
          >
            Revisar sem fonte
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="admin-filter-bar flex flex-wrap items-end gap-4 p-6">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Busca</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              const value = e.target.value;
              setSearchTerm(value);
              applyFiltersToUrl({
                q: value,
                type: filterType,
                status: filterStatus,
                preservation: filterPreservation,
              });
            }}
            placeholder="Título do item..."
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20 transition-all"
          />
        </div>

        <div className="w-48">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Tipo</label>
          <select
            value={filterType}
            onChange={(e) => {
              const value = e.target.value;
              setFilterType(value);
              applyFiltersToUrl({
                q: searchTerm,
                type: value,
                status: filterStatus,
                preservation: filterPreservation,
              });
            }}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Todos</option>
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Status</label>
          <select
            value={filterStatus}
            onChange={(e) => {
              const value = e.target.value;
              setFilterStatus(value);
              applyFiltersToUrl({
                q: searchTerm,
                type: filterType,
                status: value,
                preservation: filterPreservation,
              });
            }}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="">Todos</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </div>

        <div className="w-52">
          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Preservação</label>
          <select
            value={filterPreservation}
            onChange={(e) => {
              const value = e.target.value;
              setFilterPreservation(value);
              applyFiltersToUrl({
                q: searchTerm,
                type: filterType,
                status: filterStatus,
                preservation: value,
              });
            }}
            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-emerald-500/20"
          >
            {Object.entries(PRESERVATION_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>

        <button 
          onClick={() => loadItems()}
          className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
          title="Recarregar"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      {/* Tabela */}
      <div className="admin-table-shell overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400 italic">Carregando acervo...</div>
        ) : items.length === 0 ? (
          <div className="p-20 text-center text-slate-400 italic">Nenhum item encontrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <caption className="sr-only">Itens do acervo administrativo filtrados, com tipo, status, data e ações.</caption>
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Título</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Preservação</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Data</th>
                  <th scope="col" className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <p className="font-bold text-slate-900 line-clamp-1">{item.title}</p>
                      <p className="text-xs text-slate-400 font-mono mt-0.5">/{item.slug}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-600">{TYPE_LABELS[item.type] || item.type}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${STATUS_COLORS[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getPreservationState(item) ? (
                        <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded-full ${PRESERVATION_COLORS[getPreservationState(item) as keyof typeof PRESERVATION_COLORS]}`}>
                          {PRESERVATION_LABELS[getPreservationState(item) as keyof typeof PRESERVATION_LABELS]}
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">Não se aplica</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-slate-500">
                        {item.published_at
                          ? new Date(item.published_at).toLocaleDateString("pt-BR")
                          : item.publish_at
                            ? new Date(item.publish_at).toLocaleDateString("pt-BR")
                            : "--"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right space-x-2">
                      <Link 
                        to={`/acervo/item/${item.slug}`} 
                        target="_blank"
                        className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
                        title="Ver no portal"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </Link>
                      <button 
                        onClick={() => navigate(`/admin/acervo/${item.id}`)}
                        className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      {getPreservationState(item) === "link_only" && (
                        <button
                          onClick={() => navigate(`/admin/acervo/${item.id}`)}
                          className="p-2 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Capturar matéria"
                        >
                          <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v8m4-4H8m13 0A9 9 0 113 12a9 9 0 0118 0z" />
                          </svg>
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                        title="Excluir"
                      >
                        <svg className="w-5 h-5 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
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
