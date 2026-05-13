import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import { adminUploadMedia } from "../../lib/admin/media";

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
  const [assetSearch, setAssetSearch] = useState("");

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

  // Quick Upload State
  const [isUploading, setIsUploading] = useState(false);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    const [{ data: colls }, { data: assets }] = await Promise.all([
      supabase.from("acervo_collections").select("id, title").order("title"),
      supabase.from("media_assets")
        .select("id, title, public_url, mime_type")
        .ilike("title", `%${assetSearch}%`)
        .order("created_at", { ascending: false })
        .limit(12)
    ]);

    setCollections(colls || []);
    setRecentAssets(assets || []);

    if (!isNew && loading) { // Only load item once
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
  }, [id, isNew, navigate, assetSearch]);

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

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const asset = await adminUploadMedia({
        bucket: "acervo",
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        status: "published",
        altText: `Anexo de ${title}`
      });
      
      addMediaAsset(asset);
      // Reload recent assets to show the new one
      loadData();
    } catch (err: any) {
      alert("Erro no upload: " + err.message);
    } finally {
      setIsUploading(false);
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
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            {isNew ? "Novo Item de Acervo" : "Editar Item"}
          </h1>
          <p className="text-slate-500 mt-1 font-medium">Gestão descentralizada de conhecimento SEMEAR.</p>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <Link 
              to={`/acervo/item/${slug}`} 
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
            onClick={() => navigate("/admin/acervo")}
            className="px-6 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl transition-all"
          >
            Cancelar
          </button>
          <button 
            type="submit" 
            disabled={saving}
            className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl shadow-lg shadow-emerald-600/20 transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {saving ? "Salvando..." : "Salvar Agora"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Form */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-xl font-black text-slate-900 mb-2">Conteúdo Principal</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título do Item</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-lg"
                  placeholder="Ex: Análise de Poluição em Volta Redonda"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Slug da URL</label>
                <div className="flex items-center gap-2 px-5 py-3 bg-slate-100/50 rounded-xl border border-slate-200">
                  <span className="text-slate-400 font-mono text-xs">/acervo/item/</span>
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
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Resumo Executivo</label>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl h-28 font-medium"
                  placeholder="Breve introdução sobre o item..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Corpo do Texto (Markdown)</label>
                <textarea
                  value={contentMd}
                  onChange={(e) => setContentMd(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-sm h-80"
                  placeholder="# Introdução\n\nTexto formatado..."
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-xl font-black text-slate-900">Fontes & Autores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Autor(es)</label>
                <input
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="Ex: Silva, J.; Oliveira, M."
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data Original</label>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Veículo / Fonte</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="Ex: Portal G1 / UFF"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link Externo</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="https://..."
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Anexos & Mídias</h2>
              <label className={`cursor-pointer px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs border border-emerald-100 hover:bg-emerald-100 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                {isUploading ? "Enviando..." : "+ Novo Upload"}
                <input type="file" className="hidden" onChange={handleQuickUpload} disabled={isUploading} />
              </label>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <svg className="w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar mídias existentes..." 
                  className="bg-transparent border-none p-0 focus:ring-0 text-sm font-bold flex-1"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {recentAssets.map(asset => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => addMediaAsset(asset)}
                    className="p-1.5 border-2 border-transparent rounded-xl hover:border-emerald-500 transition-all bg-slate-50 group relative"
                  >
                    <div className="aspect-square bg-white rounded-lg overflow-hidden border border-slate-200">
                      {asset.mime_type.startsWith("image/") ? (
                        <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-6">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Arquivos Vinculados ({media.length})</h3>
              {media.length === 0 ? (
                <p className="text-sm text-slate-400 italic py-4 text-center">Nenhum arquivo anexado.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {media.map(m => (
                    <div key={m.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-2xl border border-slate-100 group">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-slate-400 border border-slate-200 flex-shrink-0 overflow-hidden">
                          {m.type?.startsWith("image/") ? (
                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-black uppercase">PDF</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{m.title}</p>
                          <button 
                            type="button" 
                            onClick={() => setCoverAssetId(m.id)}
                            className={`text-[9px] font-black uppercase tracking-widest ${coverAssetId === m.id ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
                          >
                            {coverAssetId === m.id ? '★ Capa Atual' : '☆ Definir como Capa'}
                          </button>
                        </div>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => removeMediaAsset(m.id)}
                        className="p-2 text-slate-300 hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
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
          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Configurações</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de Item</label>
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

              {status === "scheduled" && (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Agendar Para</label>
                  <input
                    type="datetime-local"
                    value={publishAt}
                    onChange={(e) => setPublishAt(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Coleção / Dossiê</label>
                <select
                  value={collectionId}
                  onChange={(e) => setCollectionId(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                >
                  <option value="">Nenhuma</option>
                  {collections.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
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

          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Capa do Item</h2>
            <div className="aspect-[4/3] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 overflow-hidden relative group">
              {coverAssetId && (media.find(m => m.id === coverAssetId) || recentAssets.find(a => a.id === coverAssetId)) ? (
                <>
                  <img 
                    src={media.find(m => m.id === coverAssetId)?.url || recentAssets.find(a => a.id === coverAssetId)?.public_url} 
                    alt="Capa" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => setCoverAssetId("")}
                      className="px-4 py-2 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest"
                    >
                      Remover Capa
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-slate-200 shadow-sm mb-3">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                    Clique em uma estrela ao lado de um anexo para definir como capa
                  </p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
