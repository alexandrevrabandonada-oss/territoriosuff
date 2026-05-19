import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { supabase } from "../../lib/supabase/client";

type ActivityRow = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  status: string;
  created_at: string;
  meta: {
    kind?: string;
    instagram_url?: string;
    activity_date?: string;
    location?: string;
  } | null;
};

const STATUS_LABELS: Record<string, string> = {
  draft: "Rascunho",
  published: "Publicado"
};

export function AdminActivitiesListPage() {
  const [items, setItems] = useState<ActivityRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const loadItems = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    let query = supabase
      .from("conversations")
      .select("id, slug, title, excerpt, status, created_at, meta")
      .order("created_at", { ascending: false });

    if (search.trim()) {
      query = query.ilike("title", `%${search.trim()}%`);
    }

    const { data, error } = await query.limit(80);
    if (error) {
      alert("Erro ao carregar atividades: " + error.message);
    } else {
      setItems(((data || []) as ActivityRow[]).filter((item) => item.meta?.kind === "activity"));
    }
    setLoading(false);
  }, [search]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const handleDelete = async (id: string) => {
    if (!supabase || !window.confirm("Excluir esta atividade?")) return;
    const { error } = await supabase.from("conversations").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }
    void loadItems();
  };

  return (
    <div className="admin-list-page space-y-8 animate-in fade-in duration-500">
      <div className="admin-list-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Escuta e memória pública</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Conversas e atividades</h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">
            Cadastre registros de atividades com link do Instagram, texto editorial e contexto territorial.
          </p>
        </div>
        <Link to="/admin/atividades/novo" className="admin-command-cta">
          Nova atividade
        </Link>
      </div>

      <div className="admin-filter-bar flex flex-wrap items-end gap-4 p-6">
        <div className="min-w-[260px] flex-1">
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Busca</label>
          <input
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-3 font-bold"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Título da atividade..."
            type="search"
            value={search}
          />
        </div>
        <button
          type="button"
          onClick={() => void loadItems()}
          className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
        >
          Recarregar
        </button>
      </div>

      <div className="admin-table-shell overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Carregando atividades...</div>
        ) : items.length === 0 ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Nenhuma atividade cadastrada.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Atividades cadastradas com status, data e ações.</caption>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Atividade</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Instagram</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th scope="col" className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-6">
                      <p className="font-bold leading-snug text-slate-950">{item.title}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        {item.meta?.activity_date ? new Date(item.meta.activity_date).toLocaleDateString("pt-BR") : "Sem data"} {item.meta?.location ? `• ${item.meta.location}` : ""}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      {item.meta?.instagram_url ? (
                        <a className="text-xs font-black uppercase tracking-widest text-emerald-700 hover:underline" href={item.meta.instagram_url} rel="noopener noreferrer" target="_blank">
                          Abrir post
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">Sem link</span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {STATUS_LABELS[item.status] || item.status}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" className="rounded-xl p-2 text-slate-400 hover:text-slate-950" onClick={() => navigate(`/admin/atividades/${item.id}`)}>
                          Editar
                        </button>
                        <button type="button" className="rounded-xl p-2 text-slate-400 hover:text-rose-600" onClick={() => void handleDelete(item.id)}>
                          Excluir
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
