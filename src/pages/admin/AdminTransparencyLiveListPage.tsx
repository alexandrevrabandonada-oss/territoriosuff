import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { formatAssetSize, type MediaAssetRecord } from "../../lib/admin/media";
import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

type MonthlyReportRow = {
  id: string;
  month_key: string;
  month_label: string;
  source_asset_id: string | null;
  source_url: string | null;
  actions_count: number;
  hearings_count: number;
  territorial_coverage_pct: number;
  territorial_status: "critica" | "atencao" | "adequada";
  status: "draft" | "published" | "archived";
  updated_at: string;
};

const STATUS_LABELS: Record<MonthlyReportRow["status"], string> = {
  draft: "Rascunho",
  published: "Publicado",
  archived: "Arquivado"
};

const TERRITORIAL_LABELS: Record<MonthlyReportRow["territorial_status"], string> = {
  critica: "Cobertura crítica",
  atencao: "Cobertura parcial",
  adequada: "Cobertura adequada"
};

export function AdminTransparencyLiveListPage() {
  const [items, setItems] = useState<MonthlyReportRow[]>([]);
  const [recentPdfAssets, setRecentPdfAssets] = useState<MediaAssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [originFilter, setOriginFilter] = useState<"all" | "linked" | "unlinked">("all");
  const navigate = useNavigate();
  const latestItem = items[0] || null;

  const loadItems = useCallback(async () => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    setLoading(true);

    let query = supabase
      .from("transparency_live_reports")
      .select("id, month_key, month_label, source_asset_id, source_url, actions_count, hearings_count, territorial_coverage_pct, territorial_status, status, updated_at")
      .order("month_key", { ascending: false });

    if (search.trim()) {
      query = query.or(`month_label.ilike.%${search.trim()}%,month_key.ilike.%${search.trim()}%`);
    }

    if (status) {
      query = query.eq("status", status);
    }

    if (originFilter === "linked") {
      query = query.not("source_asset_id", "is", null);
    }

    if (originFilter === "unlinked") {
      query = query.is("source_asset_id", null);
    }

    const [{ data, error }, { data: assets, error: assetsError }] = await Promise.all([
      query.limit(60),
      supabase
        .from("media_assets")
        .select("id, bucket, path, public_url, file_name, mime_type, size_bytes, title, description, alt_text, credit, source, acervo_content_type, content_category, source_date, source_name, source_url, tags, status, created_at")
        .eq("mime_type", "application/pdf")
        .order("created_at", { ascending: false })
        .limit(8)
    ]);

    if (error) {
      alert("Erro ao carregar leituras mensais: " + error.message);
    } else {
      setItems((data || []) as MonthlyReportRow[]);
    }
    if (assetsError) {
      alert("Erro ao carregar PDFs recentes: " + assetsError.message);
    } else {
      setRecentPdfAssets((assets || []) as MediaAssetRecord[]);
    }
    setLoading(false);
  }, [originFilter, search, status]);

  useEffect(() => {
    void loadItems();
  }, [loadItems]);

  const linkedCount = items.filter((item) => Boolean(item.source_asset_id)).length;
  const unlinkedCount = items.filter((item) => !item.source_asset_id).length;

  const handleDelete = async (id: string) => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase || !window.confirm("Excluir este fechamento mensal?")) return;
    const { error } = await supabase.from("transparency_live_reports").delete().eq("id", id);
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
          <span className="admin-command-eyebrow">Transparência pública</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Transparência viva</h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">
            Fechamentos mensais das escutas e atividades, com alerta metodológico, prioridades e encaminhamentos públicos.
          </p>
        </div>
        <Link to="/admin/transparencia-viva/novo" className="admin-command-cta">
          Novo fechamento
        </Link>
      </div>

      <div className="admin-filter-bar flex flex-wrap items-end gap-4 p-6">
        <div className="min-w-[260px] flex-1">
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Busca</label>
          <input
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-3 font-bold"
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Mês, chave ou rótulo..."
            type="search"
            value={search}
          />
        </div>
        <div className="w-48">
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Status</label>
          <select
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-3 font-bold"
            onChange={(event) => setStatus(event.target.value)}
            value={status}
          >
            <option value="">Todos</option>
            <option value="draft">Rascunho</option>
            <option value="published">Publicado</option>
            <option value="archived">Arquivado</option>
          </select>
        </div>
        <div className="w-56">
          <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Rastreabilidade</label>
          <select
            className="w-full rounded-xl border border-slate-100 bg-slate-50 px-5 py-3 font-bold"
            onChange={(event) => setOriginFilter(event.target.value as "all" | "linked" | "unlinked")}
            value={originFilter}
          >
            <option value="all">Todos</option>
            <option value="linked">Com PDF-base</option>
            <option value="unlinked">Sem vínculo</option>
          </select>
        </div>
        <button
          type="button"
          onClick={() => void loadItems()}
          className="rounded-xl border border-slate-200 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-500 hover:border-emerald-300 hover:text-emerald-700"
        >
          Recarregar
        </button>
      </div>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.75rem] border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">Fechamentos visíveis</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{items.length}</p>
          <p className="mt-2 text-sm font-medium text-slate-600">Resultado atual após filtros.</p>
        </div>
        <div className="rounded-[1.75rem] border border-emerald-200 bg-emerald-50/70 p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-emerald-700">Com PDF-base</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{linkedCount}</p>
          <p className="mt-2 text-sm font-medium text-slate-600">Fechamentos com origem editorial rastreada.</p>
        </div>
        <div className="rounded-[1.75rem] border border-amber-200 bg-amber-50/70 p-5 shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-amber-700">Sem vínculo</p>
          <p className="mt-3 text-3xl font-black tracking-tight text-slate-950">{unlinkedCount}</p>
          <p className="mt-2 text-sm font-medium text-slate-600">Pendências de rastreabilidade editorial.</p>
        </div>
      </section>

      {latestItem ? (
        <section className="rounded-[2rem] border border-emerald-200 bg-emerald-50/80 p-6 shadow-sm">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">Continuidade editorial</p>
              <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Continuar mês atual</h2>
              <p className="mt-2 text-sm font-medium text-slate-700">
                O fechamento mais recente no painel é <strong>{latestItem.month_label}</strong>. Retome a edição por aqui quando o trabalho do mês ainda estiver em andamento.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link
                to={`/admin/transparencia-viva/${latestItem.id}`}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-emerald-700"
              >
                Continuar edição
              </Link>
              <Link
                to="/admin/transparencia-viva/novo"
                className="rounded-xl border border-emerald-300 bg-white px-4 py-3 text-xs font-black uppercase tracking-widest text-emerald-800 transition-colors hover:bg-emerald-100"
              >
                Abrir novo mês
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      <section className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-400">Criação acelerada</p>
            <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-950">Novo fechamento a partir de PDF</h2>
            <p className="mt-2 text-sm font-medium text-slate-600">
              Escolha um PDF recente para abrir o editor já pré-carregado, sem começar do zero.
            </p>
          </div>
          <Link to="/admin/transparencia-viva/novo" className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-500 transition-colors hover:border-violet-300 hover:text-violet-700">
            Abrir editor vazio
          </Link>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {recentPdfAssets.map((asset) => (
            <Link
              key={asset.id}
              to={`/admin/transparencia-viva/novo?assetId=${asset.id}`}
              className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-violet-300 hover:bg-violet-50/70"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">{asset.bucket}</p>
                  <p className="mt-2 line-clamp-2 text-sm font-bold text-slate-900">{asset.title || asset.file_name}</p>
                </div>
                <span className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[10px] font-black uppercase tracking-widest text-slate-500">PDF</span>
              </div>
              <p className="mt-3 truncate text-xs font-medium text-slate-500">{asset.file_name}</p>
              <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-slate-500">
                <span>{formatAssetSize(asset.size_bytes)}</span>
                <span className="font-black uppercase tracking-widest text-violet-700">Usar agora</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <div className="admin-table-shell overflow-hidden">
        {loading ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Carregando leituras mensais...</div>
        ) : items.length === 0 ? (
          <div className="p-20 text-center text-slate-400 italic font-medium">Nenhum fechamento mensal cadastrado.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">Fechamentos mensais de transparência viva com status, cobertura e ações.</caption>
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/50">
                  <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Mês</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Movimento</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Cobertura</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Origem</th>
                  <th scope="col" className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Status</th>
                  <th scope="col" className="px-8 py-5 text-right text-[10px] font-black uppercase tracking-widest text-slate-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {items.map((item) => (
                  <tr key={item.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="px-8 py-6">
                      <p className="font-bold text-slate-950">{item.month_label}</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{item.month_key}</p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">{item.actions_count} ações · {item.hearings_count} escutas</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Atualizado em {new Date(item.updated_at).toLocaleDateString("pt-BR")}
                      </p>
                    </td>
                    <td className="px-8 py-6">
                      <p className="text-sm font-black text-slate-900">{item.territorial_coverage_pct.toLocaleString("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 })}%</p>
                      <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{TERRITORIAL_LABELS[item.territorial_status]}</p>
                    </td>
                    <td className="px-8 py-6">
                      {item.source_asset_id ? (
                        <div className="space-y-2">
                          <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            PDF rastreado
                          </span>
                          {item.source_url ? (
                            <div>
                              <a
                                href={item.source_url}
                                target="_blank"
                                rel="noreferrer"
                                className="text-[10px] font-black uppercase tracking-widest text-slate-500 transition-colors hover:text-violet-700"
                              >
                                abrir origem
                              </a>
                            </div>
                          ) : null}
                        </div>
                      ) : (
                        <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-amber-700">
                          sem vínculo
                        </span>
                      )}
                    </td>
                    <td className="px-8 py-6">
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-slate-600">
                        {STATUS_LABELS[item.status]}
                      </span>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex justify-end gap-2">
                        <button type="button" className="rounded-xl p-2 text-slate-400 hover:text-slate-950" onClick={() => navigate(`/admin/transparencia-viva/${item.id}`)}>
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
