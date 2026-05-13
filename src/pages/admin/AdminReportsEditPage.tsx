import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, useLocation, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import { adminUploadMedia, formatAssetSize, getMediaAssetById, isImageAsset, type MediaAssetRecord } from "../../lib/admin/media";

const TYPES = [
  { value: "relatorio", label: "Relatório" },
  { value: "nota-tecnica", label: "Nota Técnica" },
  { value: "boletim", label: "Boletim" },
  { value: "anexo", label: "Anexo" },
];

function normalizeReportType(value: unknown): string {
  if (value === "nota técnica") return "nota-tecnica";
  if (typeof value === "string" && TYPES.some((option) => option.value === value)) return value;
  return "relatorio";
}

function toDbReportType(value: string): string {
  if (value === "nota-tecnica") return "nota técnica";
  return value;
}

const STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "archived", label: "Arquivado" },
];

export function AdminReportsEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const assetIdFromUrl = searchParams.get("assetId");
  const isNew = !id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [recentAssets, setRecentAssets] = useState<MediaAssetRecord[]>([]);
  const [selectedPdfAsset, setSelectedPdfAsset] = useState<MediaAssetRecord | null>(null);
  const [selectedCoverAsset, setSelectedCoverAsset] = useState<MediaAssetRecord | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [type, setType] = useState("relatorio");
  const [status, setStatus] = useState("published");
  const [year, setYear] = useState(new Date().getFullYear());
  const [publishedAt, setPublishedAt] = useState(new Date().toISOString().split("T")[0]);
  const [tags, setTags] = useState("");
  const [featured, setFeatured] = useState(false);
  const [pdfUrl, setPdfUrl] = useState("");
  const [pdfAssetId, setPdfAssetId] = useState("");
  const [coverUrl, setCoverUrl] = useState("");
  const [coverAssetId, setCoverAssetId] = useState("");

  const applyPdfAsset = (asset: MediaAssetRecord) => {
    setPdfAssetId(asset.id);
    setPdfUrl(asset.public_url);
    setSelectedPdfAsset(asset);
  };

  const applyCoverAsset = (asset: MediaAssetRecord) => {
    setCoverAssetId(asset.id);
    setCoverUrl(asset.public_url);
    setSelectedCoverAsset(asset);
  };

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    // Load Recent Assets
    const { data: assets } = await supabase
      .from("media_assets")
      .select("id, bucket, path, title, file_name, public_url, mime_type, size_bytes, alt_text, status, created_at")
      .order("created_at", { ascending: false });
    setRecentAssets(assets || []);

    if (!isNew) {
      const { data, error } = await supabase.from("reports").select("*").eq("id", id).single();
      if (error) {
        alert("Erro ao carregar relatório: " + error.message);
        navigate("/admin/relatorios");
        return;
      }
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setSummary(data.summary || "");
        setType(normalizeReportType(data.type || data.kind));
        setStatus(data.status);
        setYear(data.year);
        setPublishedAt(data.published_at || "");
        setTags(data.tags?.join(", ") || "");
        setFeatured(data.featured || false);
        setPdfUrl(data.pdf_url || "");
        setPdfAssetId(data.pdf_asset_id || "");
        setCoverUrl(data.cover_url || "");
        setCoverAssetId(data.cover_asset_id || "");

        const [pdfAsset, coverAsset] = await Promise.all([
          data.pdf_asset_id ? getMediaAssetById(data.pdf_asset_id) : Promise.resolve(null),
          data.cover_asset_id ? getMediaAssetById(data.cover_asset_id) : Promise.resolve(null),
        ]);

        setSelectedPdfAsset(pdfAsset);
        setSelectedCoverAsset(coverAsset);
      }
    }
    setLoading(false);
  }, [id, isNew, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    let active = true;

    async function applyAssetFromUrl() {
      if (!assetIdFromUrl) return;

      const asset = await getMediaAssetById(assetIdFromUrl);
      if (!active || !asset) return;

      setTitle((currentTitle) => currentTitle.trim() ? currentTitle : asset.title);

      if (asset.mime_type === "application/pdf") {
        applyPdfAsset(asset);
        return;
      }

      if (isImageAsset(asset)) {
        applyCoverAsset(asset);
      }
    }

    void applyAssetFromUrl();

    return () => {
      active = false;
    };
  }, [assetIdFromUrl]);

  // Slug Auto-gen
  useEffect(() => {
    if (isNew && title) {
      const generated = title
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");
      setSlug(generated);
    }
  }, [title, isNew]);

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>, isCover = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const asset = await adminUploadMedia({
        bucket: isCover ? "media" : "reports",
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        status: "published",
        altText: isCover ? `Capa do relatório: ${title}` : `Documento: ${title}`
      });
      
      if (isCover) {
        applyCoverAsset(asset);
      } else {
        applyPdfAsset(asset);
      }
      loadData();
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);

    // Validações
    if (!title.trim()) {
      alert("⚠️ O título é obrigatório.");
      setSaving(false);
      return;
    }

    if (status === "published") {
      if (!slug.trim()) {
        alert("⚠️ O slug da URL é obrigatório.");
        setSaving(false);
        return;
      }
      if (!pdfUrl) {
        alert("⚠️ Um documento PDF é obrigatório para publicação oficial.");
        setSaving(false);
        return;
      }
    }

    const payload = {
      title,
      slug,
      summary,
      type: toDbReportType(type),
      kind: type,
      status,
      year,
      published_at: publishedAt || null,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      featured,
      pdf_url: pdfUrl,
      pdf_asset_id: pdfAssetId || null,
      cover_url: coverUrl,
      cover_asset_id: coverAssetId || null,
    };

    try {
      if (isNew) {
        const { error } = await supabase.from("reports").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("reports").update(payload).eq("id", id);
        if (error) throw error;
      }
      if (status === "published") {
        setShowSuccess(true);
      } else {
        alert("🎉 Relatório salvo como rascunho!");
        navigate("/admin/relatorios");
      }
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-20 text-center text-slate-400 italic font-medium">Carregando editor...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isNew ? "Novo Relatório" : "Editar Relatório"}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Gestão de transparência e documentos técnicos.</p>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <Link 
              to={`/relatorios/${slug}`} 
              target="_blank"
              className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all flex items-center gap-2 border border-slate-200"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              Preview
            </Link>
          )}
          <button
            type="button"
            onClick={() => {
              const url = `${window.location.origin}/relatorios/${slug}`;
              navigator.clipboard.writeText(url);
              alert("Link público copiado!");
            }}
            className="p-2 text-slate-400 hover:text-emerald-600 transition-all"
            title="Copiar Link Público"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
            </svg>
          </button>
          <button 
            type="button" 
            onClick={() => navigate("/admin/relatorios")}
            className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
          >
            Sair
          </button>
          
          {status !== 'published' && (
            <button 
              type="submit" 
              onClick={() => setStatus('published')}
              disabled={saving}
              className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50 flex items-center gap-2"
            >
              {saving ? "Publicando..." : "🚀 Publicar Agora"}
            </button>
          )}

          {status === 'published' && (
            <button 
              type="submit"
              disabled={saving}
              className="px-10 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-xl shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {saving ? "Atualizando..." : "Salvar Alterações"}
            </button>
          )}

          {status !== 'draft' && (
            <button 
              type="submit"
              onClick={() => setStatus('draft')}
              disabled={saving}
              className="px-6 py-3 bg-white border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-all"
            >
              Mudar para Rascunho
            </button>
          )}

          {status === 'draft' && (
            <button 
              type="submit"
              disabled={saving}
              className="px-6 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-slate-800 transition-all"
            >
              Salvar Rascunho
            </button>
          )}

          {status !== 'archived' && (
            <button 
              type="submit"
              onClick={() => setStatus('archived')}
              disabled={saving}
              className="p-3 text-slate-400 hover:text-rose-500 transition-all"
              title="Arquivar Item"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl border border-emerald-100 text-center space-y-6 animate-in zoom-in duration-300">
            <div className="w-24 h-24 bg-emerald-500 text-white rounded-[2rem] flex items-center justify-center text-5xl mx-auto shadow-xl shadow-emerald-500/20">
              📄
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Relatório Publicado!</h3>
              <p className="text-slate-500 mt-2 font-medium">O documento técnico agora está disponível na biblioteca pública do portal SEMEAR.</p>
            </div>
            <div className="grid grid-cols-1 gap-3 pt-4">
              <Link 
                to={`/relatorios/${slug}`} 
                target="_blank"
                className="w-full py-4 bg-emerald-600 text-white font-black rounded-2xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Ver no Portal
              </Link>
              <button 
                onClick={() => navigate("/admin/relatorios")}
                className="w-full py-4 bg-slate-50 text-slate-600 font-bold rounded-2xl hover:bg-slate-100 transition-all"
              >
                Voltar para a Lista
              </button>
              <button 
                onClick={() => setShowSuccess(false)}
                className="w-full py-2 text-slate-400 font-bold text-xs uppercase tracking-widest hover:text-slate-600 transition-all"
              >
                Continuar Editando
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900 mb-2">Informações Gerais</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título do Documento</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-lg"
                  placeholder="Ex: Boletim de Monitoramento Semanal - Abr/2026"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Slug da URL</label>
                <div className="flex items-center gap-2 px-5 py-3 bg-slate-100/50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-mono text-xs">/relatorios/</span>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    required
                    className="flex-1 bg-transparent border-none p-0 focus:ring-0 font-mono text-xs text-slate-600 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resumo (Opcional)</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 font-medium"
                  placeholder="Breve descrição do que o leitor encontrará no documento..."
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Documento PDF</h2>
              <label className={`cursor-pointer px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs border border-emerald-100 hover:bg-emerald-100 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                {isUploading ? "Enviando..." : "+ Subir Novo PDF"}
                <input type="file" className="hidden" accept=".pdf" onChange={(e) => handleQuickUpload(e)} disabled={isUploading} />
              </label>
            </div>

            <div className="space-y-4">
              {pdfUrl ? (
                <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-rose-500 border border-slate-200 shadow-sm">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900 truncate max-w-md">{selectedPdfAsset?.file_name || pdfUrl.split('/').pop()}</p>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mt-1">{selectedPdfAsset?.mime_type || "application/pdf"} • {selectedPdfAsset?.size_bytes ? formatAssetSize(selectedPdfAsset.size_bytes) : "Tamanho indisponível"}</p>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => { setPdfUrl(""); setPdfAssetId(""); setSelectedPdfAsset(null); }}
                    className="p-2 text-slate-300 hover:text-rose-500 transition-all"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="p-10 border-2 border-dashed border-slate-100 rounded-2xl text-center">
                  <p className="text-sm font-bold text-slate-400">Nenhum documento selecionado.</p>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest mt-2">Selecione um arquivo PDF abaixo ou suba um novo</p>
                </div>
              )}

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3 pt-4 border-t border-slate-50">
                {recentAssets.filter(a => a.mime_type === "application/pdf").map(asset => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => applyPdfAsset(asset)}
                    className={`p-2 border-2 rounded-xl transition-all ${
                      pdfAssetId === asset.id ? "bg-emerald-50 border-emerald-500 shadow-md scale-105" : "bg-white border-slate-100 hover:border-emerald-200"
                    }`}
                  >
                    <svg className={`w-8 h-8 mx-auto ${pdfAssetId === asset.id ? 'text-emerald-500' : 'text-slate-200'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="text-[8px] font-black uppercase text-slate-400 mt-1 block truncate">{asset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Configurações</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Documento</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                >
                  {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status Editorial</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full px-5 py-3 border rounded-xl font-black transition-colors ${
                    status === "published" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-100"
                  }`}
                >
                  {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>

              <div className="flex items-center gap-4 p-4 bg-amber-50/30 rounded-2xl border border-amber-100">
                <input
                  type="checkbox"
                  id="featured"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-5 h-5 rounded border-amber-300 text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="featured" className="text-sm font-bold text-amber-900">Em Destaque no Portal</label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Ano</label>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Publicação</label>
                  <input
                    type="date"
                    value={publishedAt}
                    onChange={(e) => setPublishedAt(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Palavras-Chave</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="separadas por vírgula"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Capa</h2>
              <label className="cursor-pointer px-3 py-1 bg-slate-50 text-slate-400 rounded-lg font-black text-[10px] border border-slate-100 hover:bg-slate-100 transition-all uppercase tracking-widest">
                Upload
                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleQuickUpload(e, true)} disabled={isUploading} />
              </label>
            </div>
            <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 overflow-hidden relative group">
              {coverUrl ? (
                <>
                  <img src={coverUrl} alt="Capa" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => { setCoverUrl(""); setCoverAssetId(""); setSelectedCoverAsset(null); }}
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"
                    >
                      Remover
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <svg className="w-8 h-8 text-slate-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Selecione uma imagem de mídia</p>
                </div>
              )}
            </div>
            {coverUrl && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                <p className="text-sm font-black text-slate-900 break-all">{selectedCoverAsset?.file_name || selectedCoverAsset?.title || coverUrl.split('/').pop()}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{selectedCoverAsset?.mime_type || "image"} • {selectedCoverAsset?.size_bytes ? formatAssetSize(selectedCoverAsset.size_bytes) : "Tamanho indisponível"}</p>
              </div>
            )}
            <div className="grid grid-cols-4 gap-2">
              {recentAssets.filter(a => a.mime_type.startsWith("image/")).slice(0, 4).map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => applyCoverAsset(asset)}
                  className={`aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                    coverAssetId === asset.id ? "border-emerald-500 scale-105" : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
