import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { SafeMarkdown } from "../../components/SafeMarkdown";
import { supabase } from "../../lib/supabase/client";
import { adminUploadMedia, formatAssetSize, getMediaAssetById, isImageAsset, isPdfAsset, validateAdminUploadFile, type MediaAssetRecord } from "../../lib/admin/media";

const CATEGORIES = [
  "Notícias",
  "Saúde Ambiental",
  "Eventos",
  "Monitoramento",
  "Comunidade",
  "Institucional",
];

const STATUSES = [
  { value: "draft", label: "Rascunho" },
  { value: "published", label: "Publicado" },
  { value: "scheduled", label: "Agendado" },
  { value: "archived", label: "Arquivado" },
];

function toLocalDateTimeInput(value: string | null | undefined): string {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60_000);
  return localDate.toISOString().slice(0, 16);
}

export function AdminBlogEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const assetIdFromUrl = searchParams.get("assetId");
  const isNew = !id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [recentAssets, setRecentAssets] = useState<MediaAssetRecord[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [assetSearch, setAssetSearch] = useState("");
  const [selectedCoverAsset, setSelectedCoverAsset] = useState<MediaAssetRecord | null>(null);
  const [attachmentAsset, setAttachmentAsset] = useState<MediaAssetRecord | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [summary, setSummary] = useState("");
  const [contentMd, setContentMd] = useState("");
  const [category, setCategory] = useState("Notícias");
  const [status, setStatus] = useState("draft");
  const [authorName, setAuthorName] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [tags, setTags] = useState("");
  const [coverAssetId, setCoverAssetId] = useState("");

  const applyCoverAsset = (asset: MediaAssetRecord) => {
    setCoverAssetId(asset.id);
    setSelectedCoverAsset(asset);
  };

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

    const [{ data: assets }] = await Promise.all([
      supabase.from("media_assets")
        .select("id, bucket, path, title, file_name, public_url, mime_type, size_bytes, alt_text, status, created_at")
        .ilike("title", `%${assetSearch}%`)
        .order("created_at", { ascending: false })
        .limit(12)
    ]);
    
    setRecentAssets(assets || []);

    if (isNew && assetIdFromUrl) {
      const asset = await getMediaAssetById(assetIdFromUrl);
      if (asset) {
        if (!title) setTitle(asset.title);
        if (isImageAsset(asset)) {
          applyCoverAsset(asset);
        } else if (isPdfAsset(asset)) {
          setAttachmentAsset(asset);
        }
      }
    }

    if (!isNew && loading) {
      const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();
      if (error) {
        alert("Erro ao carregar matéria: " + error.message);
        navigate("/admin/blog");
        return;
      }
      if (data) {
        setTitle(data.title);
        setSlug(data.slug);
        setSummary(data.summary || "");
        setContentMd(data.content_md || "");
        setCategory(data.category || "Notícias");
        setStatus(data.status);
        setAuthorName(data.author_name || "");
        setPublishAt(toLocalDateTimeInput(data.publish_at || data.published_at));
        setTags(data.tags?.join(", ") || "");
        setCoverAssetId(data.cover_asset_id || "");
        if (data.cover_asset_id) {
          const coverAsset = await getMediaAssetById(data.cover_asset_id);
          setSelectedCoverAsset(coverAsset);
        }
      }
    }
    setLoading(false);
  }, [id, isNew, navigate, assetSearch, assetIdFromUrl]);

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

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      validateAdminUploadFile(file);
      const asset = await adminUploadMedia({
        bucket: file.type === "application/pdf" ? "blog" : "media",
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        status: "published",
        altText: `Capa da matéria: ${title || file.name}`
      });

      if (isImageAsset(asset)) {
        applyCoverAsset(asset);
      } else if (isPdfAsset(asset)) {
        setAttachmentAsset(asset);
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

    const coverAsset = selectedCoverAsset || recentAssets.find((asset) => asset.id === coverAssetId) || null;
    const normalizedPublishAt = publishAt ? new Date(publishAt).toISOString() : null;

    // Alertas de validação
    if (status === "published") {
      if (!title.trim()) {
        alert("⚠️ O título é obrigatório.");
        return;
      }
      if (!summary.trim()) {
        alert("⚠️ O resumo é obrigatório para publicação.");
        return;
      }
      if (!contentMd.trim()) {
        alert("⚠️ O corpo da matéria não pode estar vazio.");
        return;
      }

      if (!coverAsset) {
        const shouldContinueWithoutCover = window.confirm("Nenhuma capa foi selecionada. A capa e recomendada para a publicacao no portal. Deseja publicar mesmo assim?");
        if (!shouldContinueWithoutCover) {
          return;
        }
      }

      if (coverAsset && !coverAsset.alt_text?.trim()) {
        alert("♿ Erro de Acessibilidade: A imagem de capa selecionada não possui texto alternativo. Por favor, ajuste no banco de mídias antes de publicar.");
        setSaving(false);
        return;
      }
    }

    setSaving(true);
    const attachmentBlock = attachmentAsset && !contentMd.includes(attachmentAsset.public_url)
      ? `\n\n## Anexo\n\n[📄 ${attachmentAsset.title}](${attachmentAsset.public_url})`
      : "";
    const payload = {
      title,
      slug,
      summary,
      content_md: `${contentMd}${attachmentBlock}`,
      category,
      status,
      author_name: authorName,
      publish_at: normalizedPublishAt,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      cover_asset_id: coverAssetId || null,
      published_at: status === "published" ? (normalizedPublishAt || new Date().toISOString()) : null
    };

    try {
      if (isNew) {
        const { error } = await supabase.from("blog_posts").insert(payload);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);
        if (error) throw error;
      }
      if (status === "published") {
        setShowSuccess(true);
      } else {
        alert("🎉 Matéria salva como rascunho com sucesso!");
        navigate("/admin/blog");
      }
    } catch (err: any) {
      alert("Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-20 text-center text-slate-400 italic font-medium">Carregando editor...</div>;

  return (
    <form onSubmit={handleSave} className="admin-editor-page space-y-8 animate-in fade-in duration-500 pb-24">
      <div className="admin-editor-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div className="flex items-center gap-4">
          <button 
            type="button" 
            onClick={() => navigate("/admin/blog")}
            className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <span className="admin-command-eyebrow">Redação editorial</span>
            <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
              {isNew ? "Nova Matéria" : "Editar Matéria"}
            </h1>
            <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">Redação e curadoria de conteúdo editorial.</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <Link 
              to={`/blog/${slug}`} 
              target="_blank"
              className="admin-command-ghost"
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
              const url = `${window.location.origin}/blog/${slug}`;
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
            onClick={() => navigate("/admin/blog")}
            className="admin-command-ghost"
          >
            Sair
          </button>
          
          {status !== 'published' && (
            <button 
              type="submit" 
              onClick={() => setStatus('published')}
              disabled={saving}
              className="admin-command-cta disabled:opacity-50"
            >
              {saving ? "Publicando..." : "🚀 Publicar Agora"}
            </button>
          )}

          {status === 'published' && (
            <button 
              type="submit"
              disabled={saving}
              className="admin-command-cta disabled:opacity-50"
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
        <div className="fixed right-4 top-4 z-50 w-full max-w-md animate-in slide-in-from-top-4 fade-in duration-300">
          <div className="rounded-[2rem] border border-emerald-100 bg-white p-5 shadow-2xl shadow-emerald-500/10">
            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-emerald-500 text-2xl text-white shadow-lg shadow-emerald-500/20">
                ✍️
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Publicado</p>
                    <h3 className="mt-1 text-lg font-black text-slate-900">Matéria visível no portal</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowSuccess(false)}
                    className="rounded-xl p-2 text-slate-300 transition-all hover:bg-slate-50 hover:text-slate-500"
                    title="Fechar aviso"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <p className="mt-2 text-sm font-medium text-slate-500">O post foi publicado e ja pode ser acessado na area publica do blog.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/blog/${slug}`}
                    target="_blank"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    Ver no portal
                  </Link>
                  <button
                    type="button"
                    onClick={() => navigate("/admin/blog")}
                    className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-slate-600 transition-all hover:bg-slate-100"
                  >
                    Voltar para a lista
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-black text-slate-900">Corpo Editorial</h2>
              <button 
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${
                  showPreview ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-500 hover:bg-slate-200"
                }`}
              >
                {showPreview ? "Editor" : "Ver Preview"}
              </button>
            </div>
            
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título da Notícia</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold text-xl"
                  placeholder="Ex: Novo Avanço no Monitoramento da Qualidade do Ar"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest">Resumo (Lide)</label>
                  <span className={`text-[10px] font-bold ${summary.length > 280 ? 'text-rose-500' : 'text-slate-400'}`}>
                    {summary.length} / 280 caracteres
                  </span>
                </div>
                <textarea
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl h-28 font-medium italic text-slate-600"
                  placeholder="Introdução rápida que aparece nos cards de listagem e topo da matéria..."
                />
              </div>

              <div className="relative">
                <div className={`grid gap-4 ${showPreview ? "xl:grid-cols-2" : "grid-cols-1"}`}>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Conteúdo Markdown</label>
                    <textarea
                      value={contentMd}
                      onChange={(e) => setContentMd(e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-sm h-[600px] shadow-inner"
                      placeholder="# Comece aqui...\n\nUse Markdown para formatar seu texto."
                    />
                  </div>

                  {showPreview && (
                    <div className="bg-slate-50 rounded-2xl p-8 border border-slate-100 h-[600px] overflow-y-auto prose prose-slate prose-emerald max-w-none shadow-inner">
                      <h1 className="font-black text-slate-900 mb-4">{title || "Título da Matéria"}</h1>
                      <p className="lead font-bold text-slate-500 mb-8">{summary || "Resumo da matéria"}</p>
                      <SafeMarkdown text={contentMd} className="markdown-content" />
                      <p className="text-[10px] text-slate-300 italic mt-20 border-t pt-4">Preview simplificado do conteúdo em tempo real.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <h2 className="text-xl font-black text-slate-900">Configurações</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Categoria</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Autor da Matéria</label>
                <input
                  type="text"
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="Ex: Equipe de Comunicação"
                />
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

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data de Publicação</label>
                <input
                  type="datetime-local"
                  value={publishAt}
                  onChange={(e) => setPublishAt(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                />
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {status === "scheduled" ? "A materia sera liberada no horario definido." : "Se vazio, a publicacao usa o momento do salvamento."}
                </p>
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tags (vírgulas)</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="saude, clima, uff"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Slug Personalizado</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-100 rounded-xl border-none font-mono text-xs font-bold text-slate-500"
                />
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Imagem de Capa</h2>
              <label className={`cursor-pointer px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs border border-emerald-100 hover:bg-emerald-100 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                {isUploading ? "Enviando..." : "+ Novo Upload"}
                <input type="file" className="hidden" accept=".pdf,image/*" onChange={handleQuickUpload} disabled={isUploading} />
              </label>
            </div>
            
            <div className="aspect-video bg-slate-50 rounded-2xl border-2 border-dashed border-slate-100 overflow-hidden relative group">
              {coverAssetId && (selectedCoverAsset || recentAssets.find(a => a.id === coverAssetId)) ? (
                <>
                  <img 
                    src={(selectedCoverAsset || recentAssets.find(a => a.id === coverAssetId))?.public_url} 
                    alt="Capa" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      type="button" 
                      onClick={() => { setCoverAssetId(""); setSelectedCoverAsset(null); }}
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
                    Selecione uma imagem abaixo ou suba uma nova para a capa
                  </p>
                </div>
              )}
            </div>
            {coverAssetId && (selectedCoverAsset || recentAssets.find(a => a.id === coverAssetId)) && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                {(() => {
                  const asset = selectedCoverAsset || recentAssets.find(a => a.id === coverAssetId);
                  if (!asset) return null;
                  return (
                    <>
                      <p className="text-sm font-black text-slate-900 break-all">{asset.file_name || asset.title}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{asset.mime_type} • {asset.size_bytes ? formatAssetSize(asset.size_bytes) : "Tamanho indisponível"}</p>
                    </>
                  );
                })()}
              </div>
            )}

            {!coverAssetId && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-900">
                Capa recomendada: a publicacao pode seguir sem imagem, mas os cards do portal ficam melhores com uma capa definida.
              </div>
            )}

            <div className="rounded-[2rem] border border-slate-100 bg-slate-50 p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Documento Anexo</h3>
                  <p className="mt-1 text-xs font-bold text-slate-500">O PDF selecionado entra como anexo da matéria no momento de salvar.</p>
                </div>
                {attachmentAsset && (
                  <button
                    type="button"
                    onClick={() => setAttachmentAsset(null)}
                    className="rounded-xl border border-rose-100 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-rose-600 transition-all hover:bg-rose-50"
                  >
                    Remover Anexo
                  </button>
                )}
              </div>

              {attachmentAsset ? (
                <div className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-rose-500">
                    <svg className="h-7 w-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-black text-slate-900 break-all">{attachmentAsset.file_name || attachmentAsset.title}</p>
                    <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{attachmentAsset.mime_type} • {attachmentAsset.size_bytes ? formatAssetSize(attachmentAsset.size_bytes) : "Tamanho indisponível"}</p>
                  </div>
                </div>
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-4 py-6 text-center text-xs font-bold text-slate-400">Nenhum PDF selecionado.</p>
              )}

              <div className="grid grid-cols-4 gap-2">
                {recentAssets.filter((asset) => isPdfAsset(asset)).map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => setAttachmentAsset(asset)}
                    className={`rounded-xl border-2 p-3 text-center transition-all ${attachmentAsset?.id === asset.id ? "border-emerald-500 bg-emerald-50 shadow-md" : "border-slate-100 bg-white hover:border-emerald-200"}`}
                  >
                    <svg className={`mx-auto h-8 w-8 ${attachmentAsset?.id === asset.id ? "text-emerald-500" : "text-slate-300"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    <span className="mt-2 block truncate text-[8px] font-black uppercase tracking-widest text-slate-400">{asset.title}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input 
                  type="text" 
                  placeholder="Buscar imagens..." 
                  className="bg-transparent border-none p-0 focus:ring-0 text-xs font-bold flex-1"
                  value={assetSearch}
                  onChange={(e) => setAssetSearch(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-4 gap-2">
                {recentAssets.filter(a => a.mime_type.startsWith("image/")).map(asset => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => applyCoverAsset(asset)}
                    className={`aspect-square rounded-lg border-2 transition-all overflow-hidden ${
                      coverAssetId === asset.id ? "border-emerald-500 scale-105 shadow-md" : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </form>
  );
}
