import { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { supabase } from "../../lib/supabase/client";
import { adminUploadMedia, formatAssetSize, getMediaAssetById, isImageAsset, validateAdminUploadFile, type MediaAssetRecord } from "../../lib/admin/media";

const TYPES = [
  { value: "artigo_cientifico", label: "Artigo Científico" },
  { value: "noticia", label: "Notícia" },
  { value: "materia", label: "Matéria" },
  { value: "midia", label: "Mídia" },
  { value: "foto", label: "Foto" },
  { value: "video", label: "Vídeo" },
  { value: "documento", label: "Documento Histórico" },
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

type AcervoMediaAsset = MediaAssetRecord & {
  url: string;
  type: string;
};

type AcervoMeta = {
  journal_or_institution?: string;
  thematic_area?: string;
  source_author?: string;
  media_subtype?: string;
  media_credit?: string;
  visual_description?: string;
  media_location?: string;
  document_context?: string;
  document_category?: string;
  editorial_context?: string;
  editorial_preservation_status?: "pending_review" | "ready" | "needs_recapture";
  source_capture?: {
    url: string;
    title?: string;
    source_name?: string;
    published_at?: string | null;
    excerpt?: string;
    content_format: "markdown";
    word_count?: number;
    domain?: string;
    captured_at: string;
    snapshot_url?: string;
    snapshot_path?: string;
    snapshot_mime_type?: string;
    snapshot_size_bytes?: number;
  };
  source_capture_history?: Array<{
    url: string;
    title?: string;
    source_name?: string;
    published_at?: string | null;
    excerpt?: string;
    content_format: "markdown";
    word_count?: number;
    domain?: string;
    captured_at: string;
    snapshot_url?: string;
    snapshot_path?: string;
    snapshot_mime_type?: string;
    snapshot_size_bytes?: number;
    replaced_live_copy?: boolean;
  }>;
};

type CapturedArticlePayload = {
  url: string;
  title: string;
  sourceName: string;
  publishedAt: string | null;
  excerpt: string;
  markdown: string;
  capturedAt: string;
  wordCount: number;
  domain: string;
  snapshot?: {
    path: string;
    publicUrl: string;
    mimeType: string;
    sizeBytes: number;
  } | null;
};

type CaptureDiffPreview = {
  currentSnippet: string;
  nextSnippet: string;
  currentLength: number;
  nextLength: number;
};

type CaptureFieldDiff = {
  label: string;
  currentValue: string;
  nextValue: string;
  changed: boolean;
};

function buildCaptureDiffPreview(currentText: string, nextText: string): CaptureDiffPreview {
  const currentLines = currentText.split(/\r?\n/);
  const nextLines = nextText.split(/\r?\n/);

  let start = 0;
  while (start < currentLines.length && start < nextLines.length && currentLines[start].trim() === nextLines[start].trim()) {
    start += 1;
  }

  let currentEnd = currentLines.length - 1;
  let nextEnd = nextLines.length - 1;
  while (currentEnd >= start && nextEnd >= start && currentLines[currentEnd].trim() === nextLines[nextEnd].trim()) {
    currentEnd -= 1;
    nextEnd -= 1;
  }

  return {
    currentSnippet: currentLines.slice(start, Math.min(currentEnd + 1, start + 12)).join("\n").trim() || "(sem trecho distinto encontrado)",
    nextSnippet: nextLines.slice(start, Math.min(nextEnd + 1, start + 12)).join("\n").trim() || "(sem trecho distinto encontrado)",
    currentLength: currentText.length,
    nextLength: nextText.length,
  };
}

function normalizeDiffValue(value: string | null | undefined) {
  return (value || "").trim();
}

function normalizeAcervoType(value: string | null | undefined, asset?: Partial<MediaAssetRecord> | null) {
  if (!value) return asset?.acervo_content_type || "artigo_cientifico";
  if (value === "documento_historico") return "documento";
  return value;
}

function normalizeMediaAsset(asset: Partial<MediaAssetRecord> & { id: string; title: string; public_url?: string; url?: string; mime_type?: string; type?: string }): AcervoMediaAsset {
  return {
    id: asset.id,
    bucket: asset.bucket || "",
    path: asset.path || "",
    public_url: asset.public_url || asset.url || "",
    file_name: asset.file_name || asset.title,
    mime_type: asset.mime_type || asset.type || "application/octet-stream",
    size_bytes: asset.size_bytes || 0,
    title: asset.title,
    description: asset.description || "",
    alt_text: asset.alt_text || "",
    credit: asset.credit || "",
    source: asset.source || "",
    tags: asset.tags || [],
    status: asset.status || "draft",
    created_at: asset.created_at,
    url: asset.url || asset.public_url || "",
    type: asset.type || asset.mime_type || "application/octet-stream",
  };
}

export function AdminAcervoEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const assetIdFromUrl = searchParams.get("assetId");
  const typeFromUrl = searchParams.get("type");
  const autoCaptureFromUrl = searchParams.get("autocapture") === "1";
  const isNew = !id;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [collections, setCollections] = useState<any[]>([]);
  const [recentAssets, setRecentAssets] = useState<MediaAssetRecord[]>([]);
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
  const [doi, setDoi] = useState("");
  const [publishedAt, setPublishedAt] = useState("");
  const [publishAt, setPublishAt] = useState("");
  const [tags, setTags] = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [coverAssetId, setCoverAssetId] = useState("");
  const [media, setMedia] = useState<AcervoMediaAsset[]>([]);
  const [meta, setMeta] = useState<AcervoMeta>({});
  const [isCapturingArticle, setIsCapturingArticle] = useState(false);
  const [captureFeedback, setCaptureFeedback] = useState<string | null>(null);
  const [applyCapturedMetadata, setApplyCapturedMetadata] = useState(false);
  const [pendingCapture, setPendingCapture] = useState<{
    markdown: string;
    sourceCapture: NonNullable<AcervoMeta["source_capture"]>;
    historyEntry: NonNullable<AcervoMeta["source_capture_history"]>[number];
    summary?: string;
    title?: string;
    sourceName?: string;
    publishedAt?: string | null;
    diff: CaptureDiffPreview;
  } | null>(null);

  // Quick Upload State
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [autoCaptureTriggered, setAutoCaptureTriggered] = useState(false);

  const loadData = useCallback(async () => {
    if (!supabase) return;
    setLoading(true);

      const [{ data: colls }, { data: assets }] = await Promise.all([
      supabase.from("acervo_collections").select("id, title").order("title"),
      supabase.from("media_assets")
        .select("id, bucket, path, title, file_name, public_url, mime_type, size_bytes, alt_text, status, created_at")
        .ilike("title", `%${assetSearch}%`)
        .order("created_at", { ascending: false })
        .limit(12)
    ]);

    setCollections(colls || []);
    setRecentAssets(assets || []);

      if (isNew && assetIdFromUrl) {
        const asset = await getMediaAssetById(assetIdFromUrl);
        if (asset) {
        setTitle((current) => current || asset.title);
        setType(normalizeAcervoType(typeFromUrl, asset));
        if (asset.source_name) setSourceName((current) => current || asset.source_name || "");
        if (asset.source_url) setSourceUrl((current) => current || asset.source_url || "");
        if (asset.source_date) setPublishedAt((current) => current || asset.source_date || "");
        addMediaAsset(asset);
        if (isImageAsset(asset)) {
          setCoverAssetId(asset.id);
        }
      }
    } else if (isNew && typeFromUrl) {
      setType(normalizeAcervoType(typeFromUrl));
    }

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
        setDoi(data.doi || "");
        setPublishedAt(data.published_at || "");
        setPublishAt(data.publish_at || "");
        setTags(data.tags?.join(", ") || "");
        setCollectionId(data.related_collection_id || "");
        setCoverAssetId(data.cover_asset_id || "");
        setMedia((data.media || []).map((item: any) => normalizeMediaAsset(item)));
        setMeta((data.meta && typeof data.meta === "object") ? data.meta : {});
      }
    }
    setLoading(false);
  }, [id, isNew, navigate, assetSearch, assetIdFromUrl, typeFromUrl]);

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
      if (!summary.trim()) {
        alert("⚠️ O resumo é obrigatório para publicação.");
        setSaving(false);
        return;
      }
      if (!type) {
        alert("⚠️ O tipo do item é obrigatório.");
        setSaving(false);
        return;
      }
      if (["artigo_cientifico", "noticia", "documento", "relatorio_tecnico"].includes(type) && !sourceName.trim()) {
        alert("⚠️ A fonte é obrigatória para este tipo de conteúdo.");
        setSaving(false);
        return;
      }
      if (type === "artigo_cientifico" && !authors.trim()) {
        alert("⚠️ Informe os autores do artigo científico antes de publicar.");
        setSaving(false);
        return;
      }

      // Validação de Alt Text para Capa e todos os Anexos que sejam imagem
      const imagesToValidate = media.filter(m => m.type?.startsWith("image/") || m.mime_type?.startsWith("image/"));
      const invalidImage = imagesToValidate.find(img => !img.alt_text?.trim());
      
      if (invalidImage) {
        alert(`♿ Erro de Acessibilidade: A imagem "${invalidImage.title}" não possui texto alternativo. Por favor, ajuste os metadados antes de publicar.`);
        setSaving(false);
        return;
      }

      const selectedCover = recentAssets.find(a => a.id === coverAssetId) || media.find(m => m.id === coverAssetId);
      if (selectedCover && selectedCover.mime_type?.startsWith("image/") && !selectedCover.alt_text?.trim()) {
        alert("♿ Erro de Acessibilidade: A imagem de capa não possui texto alternativo. Por favor, ajuste os metadados da imagem antes de publicar.");
        setSaving(false);
        return;
      }
    }

    const normalizedSourceType = type === "artigo_cientifico"
      ? "cientifico"
      : type === "noticia" || type === "materia"
        ? "imprensa"
        : type === "relatorio_tecnico"
          ? "institucional"
          : type === "midia"
            ? "audiovisual"
            : type === "documento"
              ? "historico"
              : null;

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
      doi: doi || null,
      published_at: publishedAt || null,
      publish_at: publishAt || null,
      source_type: normalizedSourceType,
      tags: tags.split(",").map(t => t.trim()).filter(Boolean),
      related_collection_id: collectionId || null,
      cover_asset_id: coverAssetId || null,
      meta,
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

      if (status === "published") {
        setShowSuccess(true);
      } else {
        alert("🎉 Alterações salvas como rascunho!");
        navigate("/admin/acervo");
      }
    } catch (err: any) {
      console.error("[Acervo] Erro ao salvar:", err);
      alert("❌ Erro ao salvar: " + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleQuickUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      validateAdminUploadFile(file);
      const asset = await adminUploadMedia({
        bucket: "acervo",
        file,
        title: file.name.replace(/\.[^/.]+$/, ""),
        status: "published",
        altText: `Anexo de ${title}`,
        acervoContentType: type === "documento" ? "documento" : type,
        contentCategory: "acervo"
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

  const addMediaAsset = (asset: Partial<MediaAssetRecord> & { id: string; title: string; public_url?: string; url?: string; mime_type?: string; type?: string }) => {
    const normalizedAsset = normalizeMediaAsset(asset);
    if (media.some((mediaItem) => mediaItem.id === normalizedAsset.id)) return;
    setMedia((currentMedia) => [...currentMedia, normalizedAsset]);
    if (!coverAssetId && isImageAsset(normalizedAsset)) {
      setCoverAssetId(normalizedAsset.id);
    }
  };

  const updateMeta = (key: keyof AcervoMeta, value: string) => {
    setMeta((current) => ({ ...current, [key]: value }));
  };

  const isMediaType = type === "midia" || type === "foto" || type === "video" || type === "memoria";
  const isScientificType = type === "artigo_cientifico";
  const isNewsType = type === "noticia" || type === "materia";
  const isHistoricalDocument = type === "documento";
  const sourceCapture = meta.source_capture;
  const sourceCaptureHistory = Array.isArray(meta.source_capture_history) ? meta.source_capture_history : [];
  const pendingMetadataDiffs: CaptureFieldDiff[] = pendingCapture ? [
    {
      label: "Título",
      currentValue: normalizeDiffValue(title),
      nextValue: normalizeDiffValue(pendingCapture.title),
      changed: normalizeDiffValue(title) !== normalizeDiffValue(pendingCapture.title),
    },
    {
      label: "Resumo",
      currentValue: normalizeDiffValue(summary),
      nextValue: normalizeDiffValue(pendingCapture.summary),
      changed: normalizeDiffValue(summary) !== normalizeDiffValue(pendingCapture.summary),
    },
    {
      label: "Fonte",
      currentValue: normalizeDiffValue(sourceName),
      nextValue: normalizeDiffValue(pendingCapture.sourceName),
      changed: normalizeDiffValue(sourceName) !== normalizeDiffValue(pendingCapture.sourceName),
    },
    {
      label: "Data original",
      currentValue: normalizeDiffValue(publishedAt),
      nextValue: normalizeDiffValue(pendingCapture.publishedAt || ""),
      changed: normalizeDiffValue(publishedAt) !== normalizeDiffValue(pendingCapture.publishedAt || ""),
    },
  ] : [];

  const formatCaptureDate = (value?: string | null) => {
    if (!value) return "";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleString("pt-BR");
  };

  const handleCaptureArticle = async () => {
    if (!sourceUrl.trim()) {
      alert("Informe o link da matéria antes de capturar.");
      return;
    }

    setIsCapturingArticle(true);
    setCaptureFeedback(null);

    try {
      const response = await fetch("/api/acervo/capture-article", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: sourceUrl.trim() }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data?.error || "Falha ao capturar a matéria.");
      }

      const captured = data as CapturedArticlePayload;
      const nextSourceCapture: NonNullable<AcervoMeta["source_capture"]> = {
        url: captured.url || sourceUrl.trim(),
        title: captured.title || sourceCapture?.title,
        source_name: captured.sourceName || sourceCapture?.source_name || sourceName || undefined,
        published_at: captured.publishedAt || sourceCapture?.published_at || null,
        excerpt: captured.excerpt || sourceCapture?.excerpt,
        content_format: "markdown",
        word_count: captured.wordCount,
        domain: captured.domain,
        captured_at: captured.capturedAt,
        snapshot_url: captured.snapshot?.publicUrl || sourceCapture?.snapshot_url,
        snapshot_path: captured.snapshot?.path || sourceCapture?.snapshot_path,
        snapshot_mime_type: captured.snapshot?.mimeType || sourceCapture?.snapshot_mime_type,
        snapshot_size_bytes: captured.snapshot?.sizeBytes || sourceCapture?.snapshot_size_bytes,
      };
      const nextHistoryEntry = {
        ...nextSourceCapture,
        replaced_live_copy: true,
      };

      if (contentMd.trim() && contentMd.trim() !== captured.markdown.trim()) {
        setApplyCapturedMetadata(false);
        setPendingCapture({
          markdown: captured.markdown,
          sourceCapture: nextSourceCapture,
          historyEntry: nextHistoryEntry,
          summary: captured.excerpt,
          title: captured.title,
          sourceName: captured.sourceName,
          publishedAt: captured.publishedAt,
          diff: buildCaptureDiffPreview(contentMd, captured.markdown),
        });
        setCaptureFeedback("Nova captura pronta para revisão antes de substituir o texto preservado.");
        return;
      }

      setContentMd(captured.markdown);
      setSourceUrl(captured.url || sourceUrl.trim());
      if (!sourceName.trim() && captured.sourceName) setSourceName(captured.sourceName);
      if (!publishedAt && captured.publishedAt) setPublishedAt(captured.publishedAt);
      if (!summary.trim() && captured.excerpt) setSummary(captured.excerpt);
      if (!title.trim() && captured.title) setTitle(captured.title);

      setMeta((current) => ({
        ...current,
        source_capture: nextSourceCapture,
        source_capture_history: [
          nextHistoryEntry,
          ...(Array.isArray(current.source_capture_history) ? current.source_capture_history : []),
        ].slice(0, 8),
      }));

      setCaptureFeedback("Matéria capturada e preservada no corpo do item.");
    } catch (error: any) {
      setCaptureFeedback(error?.message || "Falha ao capturar a matéria.");
    } finally {
      setIsCapturingArticle(false);
    }
  };

  const applyPendingCapture = () => {
    if (!pendingCapture) return;
    setContentMd(pendingCapture.markdown);
    if (applyCapturedMetadata) {
      if (pendingCapture.sourceName) setSourceName(pendingCapture.sourceName);
      if (pendingCapture.publishedAt) setPublishedAt(pendingCapture.publishedAt);
      if (typeof pendingCapture.summary === "string") setSummary(pendingCapture.summary);
      if (pendingCapture.title) setTitle(pendingCapture.title);
    } else {
      if (!sourceName.trim() && pendingCapture.sourceName) setSourceName(pendingCapture.sourceName);
      if (!publishedAt && pendingCapture.publishedAt) setPublishedAt(pendingCapture.publishedAt);
      if (!summary.trim() && pendingCapture.summary) setSummary(pendingCapture.summary);
      if (!title.trim() && pendingCapture.title) setTitle(pendingCapture.title);
    }
    setMeta((current) => ({
      ...current,
      source_capture: pendingCapture.sourceCapture,
      source_capture_history: [
        pendingCapture.historyEntry,
        ...(Array.isArray(current.source_capture_history) ? current.source_capture_history : []),
      ].slice(0, 8),
    }));
    setPendingCapture(null);
    setApplyCapturedMetadata(false);
    setCaptureFeedback(applyCapturedMetadata ? "Nova captura aplicada com metadados capturados." : "Nova captura aplicada ao texto preservado.");
  };

  const keepCurrentTextWithPendingCapture = () => {
    if (!pendingCapture) return;
    setMeta((current) => ({
      ...current,
      source_capture: pendingCapture.sourceCapture,
      source_capture_history: [
        { ...pendingCapture.historyEntry, replaced_live_copy: false },
        ...(Array.isArray(current.source_capture_history) ? current.source_capture_history : []),
      ].slice(0, 8),
    }));
    setPendingCapture(null);
    setApplyCapturedMetadata(false);
    setCaptureFeedback("Nova captura registrada no histórico, mas o texto preservado atual foi mantido.");
  };

  const removeMediaAsset = (assetId: string) => {
    setMedia(media.filter(m => m.id !== assetId));
    if (coverAssetId === assetId) setCoverAssetId("");
  };

  const moveMedia = (index: number, direction: 'up' | 'down') => {
    const newMedia = [...media];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newMedia.length) return;
    
    [newMedia[index], newMedia[targetIndex]] = [newMedia[targetIndex], newMedia[index]];
    setMedia(newMedia);
  };

  useEffect(() => {
    if (!autoCaptureFromUrl || autoCaptureTriggered || loading || isNew) return;
    if (!isNewsType || !sourceUrl.trim() || isCapturingArticle) return;
    setAutoCaptureTriggered(true);
    void handleCaptureArticle();
  }, [
    autoCaptureFromUrl,
    autoCaptureTriggered,
    loading,
    isNew,
    isNewsType,
    sourceUrl,
    isCapturingArticle,
  ]);

  if (loading) {
    return <div className="p-20 text-center text-slate-400 italic">Carregando editor...</div>;
  }

  return (
    <form onSubmit={handleSave} className="admin-editor-page space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="admin-editor-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Curadoria do acervo</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">
            {isNew ? "Novo Item de Acervo" : "Editar Item"}
          </h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">Gestão descentralizada de conhecimento SEMEAR.</p>
        </div>
        <div className="flex items-center gap-3">
          {!isNew && (
            <Link 
              to={`/acervo/item/${slug}`} 
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
              const url = `${window.location.origin}/acervo/item/${slug}`;
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
            onClick={() => navigate("/admin/acervo")}
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
                ✨
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black uppercase tracking-widest text-emerald-600">Publicado</p>
                    <h3 className="mt-1 text-lg font-black text-slate-900">Item visível no portal</h3>
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
                <p className="mt-2 text-sm font-medium text-slate-500">Seu item do Acervo foi publicado com sucesso e já pode ser consultado publicamente.</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link
                    to={`/acervo/item/${slug}`}
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
                    onClick={() => navigate("/admin/acervo")}
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

      {pendingCapture && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm">
          <div className="max-h-[90vh] w-full max-w-6xl overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
            <div className="border-b border-slate-200 px-8 py-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-amber-600">Revisar recaptura</span>
                  <h2 className="mt-2 text-2xl font-black text-slate-950">Comparar texto atual com nova captura</h2>
                  <p className="mt-2 text-sm font-medium text-slate-500">Revise o trecho alterado antes de substituir a cópia preservada.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setPendingCapture(null)}
                  className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                >
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="grid gap-0 overflow-auto md:grid-cols-2">
              <div className="border-b border-slate-200 p-6 md:border-b-0 md:border-r">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-slate-900">Texto atual</h3>
                  <span className="text-xs font-bold text-slate-400">{pendingCapture.diff.currentLength} caracteres</span>
                </div>
                <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-slate-50 p-4 text-sm leading-relaxed text-slate-700">
                  {pendingCapture.diff.currentSnippet}
                </pre>
              </div>
              <div className="p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h3 className="text-sm font-black uppercase tracking-wide text-emerald-800">Nova captura</h3>
                  <span className="text-xs font-bold text-slate-400">{pendingCapture.diff.nextLength} caracteres</span>
                </div>
                <pre className="max-h-[50vh] overflow-auto whitespace-pre-wrap rounded-2xl bg-emerald-50 p-4 text-sm leading-relaxed text-emerald-950">
                  {pendingCapture.diff.nextSnippet}
                </pre>
              </div>
            </div>

            <div className="border-t border-slate-200 px-8 py-6">
              <h3 className="mb-4 text-sm font-black uppercase tracking-wide text-slate-900">Metadados capturados</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {pendingMetadataDiffs.map((field) => (
                  <div key={field.label} className={`rounded-2xl border p-4 ${field.changed ? "border-amber-200 bg-amber-50" : "border-slate-200 bg-slate-50"}`}>
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <span className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">{field.label}</span>
                      <span className={`text-[10px] font-black uppercase tracking-wide ${field.changed ? "text-amber-700" : "text-slate-400"}`}>
                        {field.changed ? "Alterado" : "Sem mudança"}
                      </span>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div>
                        <span className="block text-[11px] font-black uppercase tracking-wide text-slate-400">Atual</span>
                        <p className="mt-1 rounded-xl bg-white px-3 py-2 font-medium text-slate-700">{field.currentValue || "vazio"}</p>
                      </div>
                      <div>
                        <span className="block text-[11px] font-black uppercase tracking-wide text-slate-400">Capturado</span>
                        <p className="mt-1 rounded-xl bg-white px-3 py-2 font-medium text-slate-700">{field.nextValue || "vazio"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 px-8 py-5">
              <div className="space-y-3">
                <p className="text-xs font-medium text-slate-500">O histórico da captura será preservado em ambos os casos.</p>
                <label className="inline-flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
                  <input
                    type="checkbox"
                    checked={applyCapturedMetadata}
                    onChange={(e) => setApplyCapturedMetadata(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>
                    Aplicar tambem metadados capturados
                    <span className="mt-1 block text-xs text-slate-500">
                      Atualiza titulo, resumo, fonte e data original com os valores exibidos acima.
                    </span>
                  </span>
                </label>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={keepCurrentTextWithPendingCapture}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
                >
                  Manter texto atual
                </button>
                <button
                  type="button"
                  onClick={applyPendingCapture}
                  className="rounded-xl bg-emerald-500 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-600"
                >
                  Aplicar nova captura
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                {isNewsType ? (
                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-5 py-4 text-sm font-medium text-emerald-900">
                    Para notícias e matérias, o corpo do texto fica no bloco <span className="font-black">Preservação da matéria</span> abaixo. Ali você pode capturar o link original e manter uma cópia preservada dentro do portal.
                  </div>
                ) : (
                  <textarea
                    value={contentMd}
                    onChange={(e) => setContentMd(e.target.value)}
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-mono text-sm h-80"
                    placeholder="# Introdução\n\nTexto formatado..."
                  />
                )}
              </div>
            </div>
          </section>

          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
            <h2 className="text-xl font-black text-slate-900">Fontes & Autores</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isNewsType ? "Autor da matéria" : isMediaType ? "Crédito / autoria" : "Autor(es)"}</label>
                <input
                  type="text"
                  value={authors}
                  onChange={(e) => setAuthors(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="Ex: Silva, J.; Oliveira, M."
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isMediaType ? "Data aproximada" : "Data original"}</label>
                <input
                  type="date"
                  value={publishedAt}
                  onChange={(e) => setPublishedAt(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isScientificType ? "Periódico / instituição" : isNewsType ? "Veículo / fonte" : isMediaType ? "Fonte do registro" : isHistoricalDocument ? "Origem / fonte" : "Fonte"}</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                  placeholder="Ex: Portal G1 / UFF"
                />
              </div>
              {!isNewsType && (
                <div>
                  <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">{isScientificType ? "Link externo" : "Link externo"}</label>
                  <input
                    type="url"
                    value={sourceUrl}
                    onChange={(e) => setSourceUrl(e.target.value)}
                    className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                    placeholder="https://..."
                  />
                </div>
              )}
              {isScientificType && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">DOI</label>
                    <input
                      type="text"
                      value={doi}
                      onChange={(e) => setDoi(e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                      placeholder="10.1234/exemplo.2026.001"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Área temática</label>
                    <input
                      type="text"
                      value={meta.thematic_area || ""}
                      onChange={(e) => updateMeta("thematic_area", e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                      placeholder="Ex: Saúde ambiental"
                    />
                  </div>
                </>
              )}
              {isMediaType && (
                <>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tipo de mídia</label>
                    <select
                      value={meta.media_subtype || "foto"}
                      onChange={(e) => updateMeta("media_subtype", e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                    >
                      <option value="foto">Foto</option>
                      <option value="video">Vídeo</option>
                      <option value="audio">Áudio</option>
                      <option value="galeria">Galeria</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Local</label>
                    <input
                      type="text"
                      value={meta.media_location || ""}
                      onChange={(e) => updateMeta("media_location", e.target.value)}
                      className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                      placeholder="Ex: Volta Redonda, RJ"
                    />
                  </div>
                </>
              )}
            </div>
          </section>

          {isNewsType && (
            <section className="overflow-hidden rounded-[2rem] border border-emerald-200 bg-white shadow-sm">
              <div className="bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.26),_transparent_40%),linear-gradient(135deg,#052e2b_0%,#0f172a_52%,#064e3b_100%)] px-8 py-8 text-white">
                <div className="max-w-3xl space-y-4">
                  <span className="inline-flex items-center rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.22em] text-emerald-100">
                    Preservação da matéria
                  </span>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight md:text-3xl">Salvar o link original e manter uma cópia viva no portal</h2>
                    <p className="mt-2 text-sm font-medium text-emerald-50/90 md:text-base">
                      Use o link da notícia para capturar o texto e guardar uma versão preservada no acervo. Se o site original sair do ar, o portal continua exibindo a matéria arquivada.
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-6 p-8">
                <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.4fr_0.8fr]">
                  <div className="space-y-4">
                    <div>
                      <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Link original da matéria</label>
                      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 md:flex-row">
                        <input
                          type="url"
                          value={sourceUrl}
                          onChange={(e) => setSourceUrl(e.target.value)}
                          className="min-w-0 flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 font-bold text-slate-800 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                          placeholder="https://..."
                        />
                        <button
                          type="button"
                          onClick={handleCaptureArticle}
                          disabled={isCapturingArticle}
                          className="inline-flex items-center justify-center rounded-xl bg-emerald-500 px-5 py-3 text-sm font-black uppercase tracking-wide text-white transition hover:bg-emerald-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isCapturingArticle ? "Capturando..." : sourceCapture ? "Recapturar matéria" : "Capturar e preservar"}
                        </button>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-3">
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Status</span>
                        <strong className="mt-3 block text-lg font-black text-slate-900">{sourceCapture ? "Preservada" : "Aguardando captura"}</strong>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                          {sourceCapture ? "O portal já guarda uma cópia em Markdown desta matéria." : "O item ainda depende só do link externo."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Última captura</span>
                        <strong className="mt-3 block text-lg font-black text-slate-900">
                          {sourceCapture?.captured_at ? formatCaptureDate(sourceCapture.captured_at) : "Ainda não capturada"}
                        </strong>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                          {sourceCapture?.domain ? `Origem: ${sourceCapture.domain}` : "Sem domínio identificado ainda."}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Texto preservado</span>
                        <strong className="mt-3 block text-lg font-black text-slate-900">
                          {sourceCapture?.word_count ? `${sourceCapture.word_count} palavras` : contentMd.trim() ? "Texto preenchido manualmente" : "Sem cópia"}
                        </strong>
                        <p className="mt-2 text-sm font-medium text-slate-500">
                          {sourceCapture?.title || "O corpo do item será usado como cópia preservada da matéria."}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                      <label className="mb-2 block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">
                        Status editorial da preservação
                      </label>
                      <select
                        value={meta.editorial_preservation_status || "pending_review"}
                        onChange={(e) => setMeta((current) => ({
                          ...current,
                          editorial_preservation_status: e.target.value as NonNullable<AcervoMeta["editorial_preservation_status"]>,
                        }))}
                        className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-800"
                      >
                        <option value="pending_review">Capturada, revisão pendente</option>
                        <option value="ready">Preservação fechada</option>
                        <option value="needs_recapture">Recapturar depois</option>
                      </select>
                      <p className="mt-2 text-sm font-medium text-slate-500">
                        Use este campo para marcar se a matéria já foi validada pela curadoria ou se ainda exige nova rodada.
                      </p>
                    </div>

                    {sourceCapture?.snapshot_url && (
                      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-600">
                        Snapshot bruto salvo em storage.
                        <a
                          href={sourceCapture.snapshot_url}
                          target="_blank"
                          rel="noreferrer noopener"
                          className="ml-2 font-black text-emerald-700 underline underline-offset-2"
                        >
                          Abrir HTML preservado
                        </a>
                        {typeof sourceCapture.snapshot_size_bytes === "number" ? (
                          <span className="ml-2 text-slate-400">({formatAssetSize(sourceCapture.snapshot_size_bytes)})</span>
                        ) : null}
                      </div>
                    )}

                    {sourceCaptureHistory.length > 0 && (
                      <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Histórico de capturas</span>
                        <div className="mt-3 space-y-3">
                          {sourceCaptureHistory.map((entry, index) => (
                            <div key={`${entry.captured_at}-${index}`} className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                              <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                                <div>
                                  <strong className="block text-sm font-black text-slate-900">
                                    {entry.title || entry.source_name || `Captura ${index + 1}`}
                                  </strong>
                                  <p className="text-xs font-medium text-slate-500">
                                    {formatCaptureDate(entry.captured_at)} • {entry.word_count ? `${entry.word_count} palavras` : "sem contagem"}
                                    {entry.replaced_live_copy ? " • aplicada ao texto vivo" : " • registrada sem substituir"}
                                  </p>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                  {entry.snapshot_url && (
                                    <a
                                      href={entry.snapshot_url}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      className="text-xs font-black uppercase tracking-wide text-emerald-700 underline underline-offset-2"
                                    >
                                      Snapshot HTML
                                    </a>
                                  )}
                                  {entry.url && (
                                    <a
                                      href={entry.url}
                                      target="_blank"
                                      rel="noreferrer noopener"
                                      className="text-xs font-black uppercase tracking-wide text-slate-600 underline underline-offset-2"
                                    >
                                      Fonte
                                    </a>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {captureFeedback && (
                      <div className={`rounded-2xl px-4 py-3 text-sm font-bold ${sourceCapture ? "border border-emerald-100 bg-emerald-50 text-emerald-800" : "border border-amber-100 bg-amber-50 text-amber-800"}`}>
                        {captureFeedback}
                      </div>
                    )}
                  </div>

                  <aside className="rounded-[1.5rem] border border-slate-200 bg-slate-50 p-5">
                    <span className="block text-[11px] font-black uppercase tracking-[0.2em] text-slate-400">Boas práticas</span>
                    <ul className="mt-4 space-y-3 text-sm font-medium leading-relaxed text-slate-600">
                      <li>Guarde sempre o link original para preservar autoria e contexto.</li>
                      <li>Recapture se a matéria for atualizada no veículo de origem.</li>
                      <li>Use o contexto editorial para registrar leitura crítica, clipping e observações da curadoria.</li>
                    </ul>
                  </aside>
                </div>

                <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Contexto editorial da curadoria</label>
                    <textarea
                      value={meta.editorial_context || ""}
                      onChange={(e) => updateMeta("editorial_context", e.target.value)}
                      className="h-52 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-medium text-slate-700"
                      placeholder="Registre o contexto da clipping, por que essa matéria importa, relações com o território e observações editoriais."
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-xs font-black uppercase tracking-widest text-slate-400">Cópia preservada da matéria (Markdown)</label>
                    <textarea
                      value={contentMd}
                      onChange={(e) => setContentMd(e.target.value)}
                      className="h-52 w-full rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 font-mono text-sm text-slate-700"
                      placeholder="A captura preencherá este campo. Você também pode revisar ou complementar manualmente."
                    />
                  </div>
                </div>
              </div>
            </section>
          )}

          {(isScientificType || isNewsType || isMediaType || isHistoricalDocument || type === "relatorio_tecnico") && (
            <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
              <h2 className="text-xl font-black text-slate-900">Campos específicos</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {isScientificType && (
                  <>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Palavras-chave</label>
                      <input
                        type="text"
                        value={tags}
                        onChange={(e) => setTags(e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                        placeholder="ciência, qualidade do ar, epidemiologia"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Instituição complementar</label>
                      <input
                        type="text"
                        value={meta.journal_or_institution || ""}
                        onChange={(e) => updateMeta("journal_or_institution", e.target.value)}
                        className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-bold"
                        placeholder="Laboratório, programa ou centro de pesquisa"
                      />
                    </div>
                  </>
                )}
                {isMediaType && (
                  <>
                    <div className="md:col-span-2">
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição visual</label>
                      <textarea
                        value={meta.visual_description || ""}
                        onChange={(e) => updateMeta("visual_description", e.target.value)}
                        className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl h-28 font-medium"
                        placeholder="Descreva o conteúdo visual e o contexto do registro."
                      />
                    </div>
                    <div className="md:col-span-2 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs font-bold text-amber-700">
                      Imagens publicadas no Acervo continuam exigindo alt_text no asset vinculado.
                    </div>
                  </>
                )}
                {isHistoricalDocument && (
                  <div className="md:col-span-2">
                    <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Contexto histórico</label>
                    <textarea
                      value={meta.document_context || ""}
                      onChange={(e) => updateMeta("document_context", e.target.value)}
                      className="w-full px-5 py-4 bg-slate-50 border border-slate-100 rounded-2xl h-32 font-medium"
                      placeholder="Explique a origem, o período e a relevância histórica do documento."
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          <section className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Anexos & Mídias</h2>
              <label className={`cursor-pointer px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl font-black text-xs border border-emerald-100 hover:bg-emerald-100 transition-all ${isUploading ? 'opacity-50' : ''}`}>
                {isUploading ? "Enviando..." : "+ Novo Upload"}
                <input type="file" className="hidden" accept=".pdf,image/jpeg,image/png,image/webp" onChange={handleQuickUpload} disabled={isUploading} />
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
                      {isImageAsset(asset) ? (
                        <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-300">
                          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <span className="mt-1 block truncate text-[8px] font-black uppercase tracking-widest text-slate-400">{asset.mime_type.split("/")[1]}</span>
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
                          {isImageAsset(m) ? (
                            <img src={m.url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-[10px] font-black uppercase">PDF</span>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-black text-slate-900 truncate">{m.title}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400 truncate">{m.file_name || m.title}</p>
                          <p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{m.mime_type} • {m.size_bytes ? formatAssetSize(m.size_bytes) : "Tamanho indisponível"}</p>
                          <button 
                            type="button" 
                            onClick={() => setCoverAssetId(m.id)}
                            className={`text-[9px] font-black uppercase tracking-widest ${coverAssetId === m.id ? 'text-emerald-600' : 'text-slate-400 hover:text-emerald-500'}`}
                          >
                            {coverAssetId === m.id ? '★ Capa Atual' : '☆ Definir como Capa'}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          type="button" 
                          onClick={() => moveMedia(media.indexOf(m), 'up')}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-all disabled:opacity-30"
                          disabled={media.indexOf(m) === 0}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                          </svg>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => moveMedia(media.indexOf(m), 'down')}
                          className="p-1.5 text-slate-400 hover:text-slate-600 transition-all disabled:opacity-30"
                          disabled={media.indexOf(m) === media.length - 1}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>
                        <button 
                          type="button" 
                          onClick={() => removeMediaAsset(m.id)}
                          className="p-1.5 text-slate-300 hover:text-rose-500 transition-all"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
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
                  onChange={(e) => {
                    const nextType = e.target.value;
                    setType(nextType);
                    if (nextType === "documento") updateMeta("document_category", "historico");
                  }}
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
            {coverAssetId && (media.find(m => m.id === coverAssetId) || recentAssets.find(a => a.id === coverAssetId)) && (
              <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                {(() => {
                  const coverAsset = media.find(m => m.id === coverAssetId) || recentAssets.find(a => a.id === coverAssetId);
                  if (!coverAsset) return null;
                  return (
                    <>
                      <p className="text-sm font-black text-slate-900 break-all">{coverAsset.file_name || coverAsset.title}</p>
                      <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">{coverAsset.mime_type} • {coverAsset.size_bytes ? formatAssetSize(coverAsset.size_bytes) : "Tamanho indisponível"}</p>
                    </>
                  );
                })()}
              </div>
            )}
          </section>
        </div>
      </div>
    </form>
  );
}
