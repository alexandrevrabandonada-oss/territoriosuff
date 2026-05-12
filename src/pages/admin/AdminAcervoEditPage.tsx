import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";

const TYPES = [
  { value: "artigo_cientifico", label: "Artigo Científico" },
  { value: "noticia", label: "Notícia" },
  { value: "materia", label: "Matéria" },
  { value: "foto", label: "Foto" },
  { value: "video", label: "Vídeo" },
  { value: "documento", label: "Documento" },
  { value: "relatorio_tecnico", label: "Relatório Técnico" },
  { value: "memoria", label: "Memória" },
  { value: "outro", label: "Outro" },
];

const STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "scheduled", label: "Agendado" },
  { value: "archived", label: "Arquivado" },
];

export function AdminAcervoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [recentAssets, setRecentAssets] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [type, setType] = useState("artigo_cientifico");
  const [status, setStatus] = useState("draft");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [authors, setAuthors] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [tags, setTags] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [coverAssetId, setCoverAssetId] = useState("");
  const [media, setMedia] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    // Load Collections for dropdown
    const { data: colls } = await supabase.from("acervo_collections").select("id, title").order("title");
    setCollections(colls || []);

    // Load Recent Media Assets
    const { data: assets } = await supabase.from("media_assets").select("id, title, public_url, mime_type").order("created_at", { ascending: false }).limit(20);
    setRecentAssets(assets || []);

    if (!isNew) {
      const { data, error } = await supabase.from("acervo_items").select("*").eq("id", id).single();
      if (error) {
        alert("Erro ao carregar item: " + error.message);
        navigate("/admin/acervo");
        return;
      }
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setSummary(data.summary || "");
        setContentMd(data.content_md || "");
        setType(data.type);
        setStatus(data.status);
        setSourceName(data.source_name || "");
        setSourceUrl(data.source_url || "");
        setAuthors(data.authors || "");
        setPublishedAt(data.published_at || "");
        setPublishAt(data.publish_at || "");
        setTags(data.tags?.join(", ") || "");
        setCollectionId(data.related_collection_id || "");
        setCoverAssetId(data.cover_asset_id || "");
        setMedia(data.media || []);
      }
    }
    setLoading(false);
  }, [id, isNew, navigate]);

  useEffect(() => {
    loadData();
  }, [loadData]);

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

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) return;
    setSaving(true);

    const payload = {
      title,
      slug,
      summary,
      content_md: contentMd,
      type,
      status,
      source_name: sourceName,
      source_url: sourceUrl,
      authors,
      published_at: publishedAt || null,
      publish_at: publishAt || null,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      related_collection_id: collectionId || null,
      cover_asset_id: coverAssetId || null,
      media
    };

    try {
      if (isNew) {
        const { error } = await supabase.from("acervo_items").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("acervo_items").update(payload).eq("id", id);
        if (error) throw error;
      }
      alert("Item salvo com sucesso!");
      navigate("/admin/acervo");
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const addMediaAsset = (asset: any) => {
    if (media.some(m => m.id === asset.id)) return;
    setMedia([...media, { id: asset.id, title: asset.title, url: asset.public_url, type: asset.mime_type }]);
  };

  const removeMediaAsset = (assetId: string) => {
    setMedia(media.filter(m => m.id !== assetId));
  };

  if (loading) {
    return <div className="p-20 text-center text-slate-400 italic">Carregando editor...</div>;
  }

  return (
    <form onSubmit={handleSave} className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
            {isNew ? "Novo Item de Acervo" : "Editar Item"}
          </h1>
          <p className="text-slate-500 mt-1">Preencha os campos abaixo para gerenciar o conteúdo.</p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            type="button" 
            onClick={() => navigate("/admin/acervo")}
            className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 transition-all disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Informações Básicas</h2>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Título <span className="text-rose-500">*</span></label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Ex: Impacto das Queimadas na Saúde em 2024"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Slug (URL)</label>
              <input
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                required
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-xs"
                placeholder="url-amigavel-do-item"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Resumo (Summary)</label>
              <textarea
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl h-24"
                placeholder="Breve introdução sobre o item..."
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Conteúdo (Markdown)</label>
              <textarea
                value={contentMd}
                onChange={(e) => setContentMd(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono text-sm h-64"
                placeholder="# Título do Conteúdo\n\nTexto formatado em markdown..."
              />
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Metadados Técnicos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Autores</label>
                <input
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Ex: Silva, J.; Oliveira, M."
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Data de Publicação Original</label>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Fonte (Nome)</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="Ex: Jornal Local / Portal UFF"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Link da Fonte (URL)</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Anexos e Mídias</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-6">
              {recentAssets.map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => addMediaAsset(asset)}
                  className="p-2 border rounded-xl hover:border-emerald-500 transition-all text-center space-y-1 group"
                >
                  <div className="aspect-square bg-slate-100 rounded-lg overflow-hidden border border-slate-200">
                    {asset.mime_type.startsWith("image/") ? (
                      <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex items-center justify-center h-full text-slate-300">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-500 truncate block group-hover:text-emerald-600 font-bold">{asset.title}</span>
                </button>
              ))}
            </div>

            <div className="border-t border-slate-100 pt-6 space-y-3">
              <h3 className="text-sm font-bold text-slate-700">Arquivos Vinculados</h3>
              {media.length === 0 ? (
                <p className="text-sm text-slate-400 italic">Nenhum arquivo anexado ainda.</p>
              ) : (
                <div className="space-y-2">
                  {media.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 bg-white rounded flex items-center justify-center text-slate-400 border border-slate-200">
                          {m.type?.startsWith("image/") ? (
                            <img src={m.url} alt="" className="w-full h-full object-cover rounded" />
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                          )}
                        </div>
                        <span className="text-sm font-bold text-slate-700 truncate">{m.title}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeMediaAsset(m.id)}
                        className="p-1 text-slate-300 hover:text-rose-500 transition-all"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Sidebar Controls */}
        <div className="space-y-6">
          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Configurações</h2>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tipo de Item</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                {TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Status Editorial</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className={`w-full px-4 py-2 border rounded-xl font-bold transition-colors ${
                  status === "published" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-slate-50 border-slate-200 text-slate-700"
                }`}
              >
                {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>

            {status === "scheduled" && (
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Agendar para</label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Dossiê / Coleção</label>
              <select
                value={collectionId}
                onChange={(e) => setCollectionId(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              >
                <option value="">Nenhuma</option>
                {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tags (vírgulas)</label>
              <input
                type="text"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                placeholder="saude, clima, uff"
              />
            </div>
          </section>

          <section className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Capa (Cover)</h2>
            <div className="aspect-video bg-slate-50 rounded-xl border border-slate-200 overflow-hidden relative group">
              {coverAssetId && recentAssets.find(a => a.id === coverAssetId) ? (
                <>
                  <img 
                    src={recentAssets.find(a => a.id === coverAssetId).public_url} 
                    alt="Capa" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => setCoverAssetId("")}
                      className="p-2 bg-rose-600 text-white rounded-lg font-bold text-xs"
                    >
                      Remover Capa
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-4 text-center">
                  <svg className="w-12 h-12 text-slate-200 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Nenhuma Capa Selecionada</p>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-2">
              {recentAssets.filter(a => a.mime_type.startsWith("image/")).slice(0, 8).map(asset => (
                <button
                  key={asset.id}
                  type="button"
                  onClick={() => setCoverAssetId(asset.id)}
                  className={`aspect-square rounded border-2 transition-all overflow-hidden ${
                    coverAssetId === asset.id ? "border-emerald-500 scale-105 shadow-md" : "border-transparent hover:border-slate-300"
                  }`}
                >
                  <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
            <p className="text-[10px] text-slate-400 italic text-center">Selecione uma imagem acima para definir como capa.</p>
          </section>
        </div>
      </div>
    </form>
  );
}
