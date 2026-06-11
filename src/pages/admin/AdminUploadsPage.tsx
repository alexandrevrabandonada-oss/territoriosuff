import { useState, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ADMIN_MAX_FILE_SIZE, ADMIN_MAX_PDF_FILE_SIZE, adminUploadMedia, formatAssetSize, isImageAsset, updateMediaAssetMetadata, validateAdminUploadFile, type MediaAssetRecord } from "../../lib/admin/media";
import { getSupabaseClientOrNull } from "../../lib/supabase/runtime";

const ACERVO_EDITORIAL_TYPES = [
  {
    value: "artigo_cientifico",
    label: "Artigo científico",
    description: "Para papers, PDFs acadêmicos, estudos e pesquisas.",
  },
  {
    value: "noticia",
    label: "Notícia ou matéria",
    description: "Para reportagens, matérias históricas e clipping jornalístico.",
  },
  {
    value: "midia",
    label: "Mídia",
    description: "Para fotos, vídeos, imagens e registros audiovisuais.",
  },
  {
    value: "documento",
    label: "Documento histórico",
    description: "Para atas, documentos escaneados e registros públicos antigos.",
  },
  {
    value: "relatorio_tecnico",
    label: "Relatório técnico",
    description: "Para notas técnicas, boletins, medições e documentos oficiais.",
  },
  {
    value: "outro",
    label: "Outro",
    description: "Para conteúdos do Acervo que não se encaixam nas categorias acima.",
  },
] as const;

const ACERVO_ACTIONS = [
  { type: "artigo_cientifico", label: "Criar item de Acervo como Artigo Científico", emoji: "📄" },
  { type: "noticia", label: "Criar item de Acervo como Notícia", emoji: "📰" },
  { type: "midia", label: "Criar item de Acervo como Mídia", emoji: "🎬" },
  { type: "documento", label: "Criar item de Acervo como Documento", emoji: "🏛️" },
];

function buildAcervoLink(assetId: string, type: string) {
  return `/admin/acervo/novo?assetId=${assetId}&type=${type}`;
}

function buildPreservedStoryLink(assetId: string, type = "noticia") {
  return `/admin/acervo/novo?assetId=${assetId}&type=${type}&autocapture=1`;
}

function getAcervoTypeLabel(type: string | null | undefined) {
  return ACERVO_EDITORIAL_TYPES.find((option) => option.value === type)?.label ?? "Outro";
}

function hasOriginLink(asset: Pick<MediaAssetRecord, "source_url">) {
  return Boolean(asset.source_url?.trim());
}

function hasSourceName(asset: Pick<MediaAssetRecord, "source_name">) {
  return Boolean(asset.source_name?.trim());
}

function isPressAcervoType(type?: string | null) {
  return type === "noticia" || type === "materia";
}

const BUCKETS = [
  { id: "acervo", label: "Acervo" },
  { id: "media", label: "Mídia Geral (fora do Acervo)" },
  { id: "blog", label: "Blog" },
  { id: "reports", label: "Relatórios" },
  { id: "transparency", label: "Transparência" },
];

type AssetReference = {
  area: "acervo" | "blog" | "relatorios" | "agenda";
  label: string;
  href: string;
  role: string;
  contentType?: string | null;
};

type AssetReferenceMap = Record<string, AssetReference[]>;
type UploadWorkflowMode = "general" | "editorial";
type UploadQueueFilter = "all" | "without_origin" | "without_source_name" | "orphan" | "ready_to_preserve";
type UploadQueueSort = "recent" | "missing_origin" | "orphan_first" | "ready_first";
type UploadStatus = "draft" | "published" | "archived";
type EmbeddedMediaReference = { id?: unknown };
type AcervoReferenceRow = {
  id: string;
  title?: string | null;
  slug?: string | null;
  type?: string | null;
  cover_asset_id?: string | null;
  media?: unknown;
};
type BlogReferenceRow = {
  id: string;
  title?: string | null;
  slug?: string | null;
  cover_asset_id?: string | null;
};
type ReportReferenceRow = {
  id: string;
  title?: string | null;
  slug?: string | null;
  cover_asset_id?: string | null;
  pdf_asset_id?: string | null;
};
type EventReferenceRow = {
  id: string;
  title?: string | null;
  cover_asset_id?: string | null;
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function getEmbeddedMediaAssetId(item: unknown) {
  if (!item || typeof item !== "object") return null;
  const id = (item as EmbeddedMediaReference).id;
  return typeof id === "string" && id ? id : null;
}

function asUploadStatus(status: string): UploadStatus {
  return status === "published" || status === "archived" ? status : "draft";
}

const UPLOAD_QUEUE_FILTER_LABELS: Record<UploadQueueFilter, string> = {
  all: "Tudo",
  without_origin: "Sem link",
  without_source_name: "Sem fonte",
  orphan: "Órfãos",
  ready_to_preserve: "Prontos p/ preservar",
};

const UPLOAD_QUEUE_SORT_LABELS: Record<UploadQueueSort, string> = {
  recent: "Mais recentes",
  missing_origin: "Sem origem primeiro",
  orphan_first: "Órfãos primeiro",
  ready_first: "Prontos primeiro",
};

export function AdminUploadsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [recentAssets, setRecentAssets] = useState<MediaAssetRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [successAsset, setSuccessAsset] = useState<MediaAssetRecord | null>(null);
  const [editingAssetId, setEditingAssetId] = useState<string | null>(null);
  const [quickEditingAssetId, setQuickEditingAssetId] = useState<string | null>(null);
  const [isSavingAsset, setIsSavingAsset] = useState(false);
  const [isSavingQuickProvenance, setIsSavingQuickProvenance] = useState(false);
  const [assetReferences, setAssetReferences] = useState<AssetReferenceMap>({});
  const [workflowMode, setWorkflowMode] = useState<UploadWorkflowMode>("general");

  // Form State
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [altText, setAltText] = useState("");
  const [credit, setCredit] = useState("");
  const [source, setSource] = useState("");
  const [sourceName, setSourceName] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [sourceDate, setSourceDate] = useState("");
  const [tags, setTags] = useState("");
  const [bucket, setBucket] = useState("acervo");
  const [acervoContentType, setAcervoContentType] = useState("artigo_cientifico");
  const [status, setStatus] = useState("draft");
  const [assetTitle, setAssetTitle] = useState("");
  const [assetDescription, setAssetDescription] = useState("");
  const [assetAltText, setAssetAltText] = useState("");
  const [assetCredit, setAssetCredit] = useState("");
  const [assetSource, setAssetSource] = useState("");
  const [assetSourceName, setAssetSourceName] = useState("");
  const [assetSourceUrl, setAssetSourceUrl] = useState("");
  const [assetSourceDate, setAssetSourceDate] = useState("");
  const [assetTags, setAssetTags] = useState("");
  const [assetStatus, setAssetStatus] = useState("draft");
  const [assetAcervoType, setAssetAcervoType] = useState("artigo_cientifico");
  const [quickSourceName, setQuickSourceName] = useState("");
  const [quickSourceUrl, setQuickSourceUrl] = useState("");
  const [selectedAssetIds, setSelectedAssetIds] = useState<string[]>([]);
  const [bulkSourceName, setBulkSourceName] = useState("");
  const [bulkSourceUrl, setBulkSourceUrl] = useState("");
  const [isApplyingBulkProvenance, setIsApplyingBulkProvenance] = useState(false);
  const [queueSearch, setQueueSearch] = useState("");
  const [queueSort, setQueueSort] = useState<UploadQueueSort>("recent");

  const loadRecentAssets = useCallback(async () => {
    const supabase = await getSupabaseClientOrNull();
    if (!supabase) return;
    setLoading(true);
    const { data, error: fetchError } = await supabase
      .from("media_assets")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(10);

    if (fetchError) {
      console.error("[Uploads] Erro ao carregar:", fetchError);
    } else {
      setRecentAssets(data || []);
    }
    setLoading(false);
  }, []);

  const loadAssetReferences = useCallback(async (assetIds: string[]) => {
    if (assetIds.length === 0) {
      setAssetReferences({});
      return;
    }

    const supabase = await getSupabaseClientOrNull();
    if (!supabase) {
      setAssetReferences({});
      return;
    }

    const references: AssetReferenceMap = {};
    assetIds.forEach((assetId) => {
      references[assetId] = [];
    });

    const [{ data: acervoRows }, { data: blogRows }, { data: reportRows }, { data: eventRows }] = await Promise.all([
      supabase.from("acervo_items").select("id, title, slug, type, cover_asset_id, media"),
      supabase.from("blog_posts").select("id, title, slug, cover_asset_id"),
      supabase.from("reports").select("id, title, slug, cover_asset_id, pdf_asset_id"),
      supabase.from("events").select("id, title, cover_asset_id"),
    ]);

    ((acervoRows || []) as AcervoReferenceRow[]).forEach((row) => {
      if (row.cover_asset_id && references[row.cover_asset_id]) {
        references[row.cover_asset_id].push({
          area: "acervo",
          label: row.title || "Item de acervo",
          href: `/admin/acervo/${row.id}`,
          role: "capa",
          contentType: row.type || null,
        });
      }

      if (Array.isArray(row.media)) {
        row.media.forEach((item) => {
          const assetId = getEmbeddedMediaAssetId(item);
          if (assetId && references[assetId]) {
            references[assetId].push({
              area: "acervo",
              label: row.title || "Item de acervo",
              href: `/admin/acervo/${row.id}`,
              role: "anexo",
              contentType: row.type || null,
            });
          }
        });
      }
    });

    ((blogRows || []) as BlogReferenceRow[]).forEach((row) => {
      if (row.cover_asset_id && references[row.cover_asset_id]) {
        references[row.cover_asset_id].push({
          area: "blog",
          label: row.title || "Post do blog",
          href: `/admin/blog/${row.id}`,
          role: "capa",
        });
      }
    });

    ((reportRows || []) as ReportReferenceRow[]).forEach((row) => {
      if (row.cover_asset_id && references[row.cover_asset_id]) {
        references[row.cover_asset_id].push({
          area: "relatorios",
          label: row.title || "Relatório",
          href: `/admin/relatorios/${row.id}`,
          role: "capa",
        });
      }
      if (row.pdf_asset_id && references[row.pdf_asset_id]) {
        references[row.pdf_asset_id].push({
          area: "relatorios",
          label: row.title || "Relatório",
          href: `/admin/relatorios/${row.id}`,
          role: "pdf",
        });
      }
    });

    ((eventRows || []) as EventReferenceRow[]).forEach((row) => {
      if (row.cover_asset_id && references[row.cover_asset_id]) {
        references[row.cover_asset_id].push({
          area: "agenda",
          label: row.title || "Evento",
          href: `/admin/agenda/${row.id}`,
          role: "capa",
        });
      }
    });

    setAssetReferences(references);
  }, []);

  useEffect(() => {
    loadRecentAssets();
  }, [loadRecentAssets]);

  useEffect(() => {
    if (recentAssets.length === 0) {
      setAssetReferences({});
      return;
    }

    void loadAssetReferences(recentAssets.map((asset) => asset.id));
  }, [recentAssets, loadAssetReferences]);

  const hasPressReference = useCallback((assetId: string) => {
    return (assetReferences[assetId] || []).some((reference) => reference.area === "acervo" && isPressAcervoType(reference.contentType));
  }, [assetReferences]);

  const getPressReference = useCallback((assetId: string) => {
    return (assetReferences[assetId] || []).find((reference) => reference.area === "acervo" && isPressAcervoType(reference.contentType)) || null;
  }, [assetReferences]);

  const assetsWithoutOriginLink = recentAssets.filter((asset) => !hasOriginLink(asset)).length;
  const assetsWithoutSourceName = recentAssets.filter((asset) => !hasSourceName(asset)).length;
  const orphanAssets = recentAssets.filter((asset) => (assetReferences[asset.id]?.length || 0) === 0).length;
  const provenanceReadyAssets = recentAssets.filter((asset) => hasOriginLink(asset) && hasSourceName(asset) && !hasPressReference(asset.id)).length;
  const queueFilter = (searchParams.get("queue") as UploadQueueFilter | null) || "all";

  const setQueueFilter = (nextFilter: UploadQueueFilter) => {
    const params = new URLSearchParams(searchParams);
    if (nextFilter === "all") {
      params.delete("queue");
    } else {
      params.set("queue", nextFilter);
    }
    setSearchParams(params);
  };

  const queueCounts: Record<UploadQueueFilter, number> = {
    all: recentAssets.length,
    without_origin: recentAssets.filter((asset) => !hasOriginLink(asset)).length,
    without_source_name: recentAssets.filter((asset) => !hasSourceName(asset)).length,
    orphan: recentAssets.filter((asset) => (assetReferences[asset.id]?.length || 0) === 0).length,
    ready_to_preserve: recentAssets.filter((asset) => hasOriginLink(asset) && hasSourceName(asset) && !hasPressReference(asset.id)).length,
  };

  const queueFilteredAssets = recentAssets.filter((asset) => {
    const isOrphan = (assetReferences[asset.id]?.length || 0) === 0;
    const hasReadyProvenance = hasOriginLink(asset) && hasSourceName(asset) && !hasPressReference(asset.id);

    if (queueFilter === "without_origin") return !hasOriginLink(asset);
    if (queueFilter === "without_source_name") return !hasSourceName(asset);
    if (queueFilter === "orphan") return isOrphan;
    if (queueFilter === "ready_to_preserve") return hasReadyProvenance;
    return true;
  });

  const filteredAssets = queueFilteredAssets.filter((asset) => {
    const term = queueSearch.trim().toLowerCase();
    if (!term) return true;
    const haystack = [
      asset.title,
      asset.file_name,
      asset.source,
      asset.source_name,
      asset.source_url,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(term);
  }).sort((a, b) => {
    const aOrphan = (assetReferences[a.id]?.length || 0) === 0;
    const bOrphan = (assetReferences[b.id]?.length || 0) === 0;
    const aReady = hasOriginLink(a) && hasSourceName(a);
    const bReady = hasOriginLink(b) && hasSourceName(b);
    const aMissingOrigin = !hasOriginLink(a);
    const bMissingOrigin = !hasOriginLink(b);
    const recentDiff = new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();

    if (queueSort === "missing_origin") {
      if (aMissingOrigin !== bMissingOrigin) return aMissingOrigin ? -1 : 1;
      return recentDiff;
    }

    if (queueSort === "orphan_first") {
      if (aOrphan !== bOrphan) return aOrphan ? -1 : 1;
      return recentDiff;
    }

    if (queueSort === "ready_first") {
      if (aReady !== bReady) return aReady ? -1 : 1;
      return recentDiff;
    }

    return recentDiff;
  });

  const visibleSelectedAssetIds = selectedAssetIds.filter((assetId) => filteredAssets.some((asset) => asset.id === assetId));
  const allVisibleSelected = filteredAssets.length > 0 && visibleSelectedAssetIds.length === filteredAssets.length;

  const focusUploadForm = () => {
    document.getElementById("admin-upload-form")?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const activateGeneralWorkflow = () => {
    setWorkflowMode("general");
    setBucket("media");
    focusUploadForm();
  };

  const activateEditorialWorkflow = () => {
    setWorkflowMode("editorial");
    setBucket("acervo");
    setAcervoContentType("noticia");
    focusUploadForm();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      try {
        validateAdminUploadFile(selectedFile);
      } catch (err) {
        setError(getErrorMessage(err, "Arquivo inválido para upload."));
        return;
      }
      setFile(selectedFile);
      setTitle(selectedFile.name.replace(/\.[^/.]+$/, "")); // Nome sem extensão como título inicial
      setError(null);
      setSuccessAsset(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("URL copiada!");
  };

  const startEditingAsset = (asset: MediaAssetRecord) => {
    setEditingAssetId(asset.id);
    setAssetTitle(asset.title || "");
    setAssetDescription(asset.description || "");
    setAssetAltText(asset.alt_text || "");
    setAssetCredit(asset.credit || "");
    setAssetSource(asset.source || "");
    setAssetSourceName(asset.source_name || "");
    setAssetSourceUrl(asset.source_url || "");
    setAssetSourceDate(asset.source_date || "");
    setAssetTags((asset.tags || []).join(", "));
    setAssetStatus(asset.status || "draft");
    setAssetAcervoType(asset.acervo_content_type || "artigo_cientifico");
    setError(null);
  };

  const cancelEditingAsset = () => {
    setEditingAssetId(null);
    setAssetTitle("");
    setAssetDescription("");
    setAssetAltText("");
    setAssetCredit("");
    setAssetSource("");
    setAssetSourceName("");
    setAssetSourceUrl("");
    setAssetSourceDate("");
    setAssetTags("");
    setAssetStatus("draft");
    setAssetAcervoType("artigo_cientifico");
  };

  const startQuickEditingProvenance = (asset: MediaAssetRecord) => {
    setQuickEditingAssetId(asset.id);
    setQuickSourceName(asset.source_name || "");
    setQuickSourceUrl(asset.source_url || "");
    setError(null);
  };

  const cancelQuickEditingProvenance = () => {
    setQuickEditingAssetId(null);
    setQuickSourceName("");
    setQuickSourceUrl("");
  };

  const handleSaveAssetMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssetId) return;

    const asset = recentAssets.find((item) => item.id === editingAssetId);
    if (!asset) return;

    setIsSavingAsset(true);
    setError(null);

    try {
      const updatedAsset = await updateMediaAssetMetadata({
        assetId: editingAssetId,
        title: assetTitle,
        description: assetDescription,
        altText: assetAltText,
        credit: assetCredit,
        source: assetSource,
        sourceName: assetSourceName.trim() || null,
        sourceUrl: assetSourceUrl.trim() || null,
        sourceDate: assetSourceDate || null,
        acervoContentType: asset.bucket === "acervo" ? assetAcervoType : null,
        contentCategory: asset.content_category || (asset.bucket === "acervo" ? "acervo" : asset.bucket),
        tags: assetTags.split(",").map((tag) => tag.trim()).filter(Boolean),
        status: asUploadStatus(assetStatus),
      });

      setRecentAssets((current) => current.map((item) => item.id === updatedAsset.id ? updatedAsset : item));
      if (successAsset?.id === updatedAsset.id) {
        setSuccessAsset(updatedAsset);
      }
      cancelEditingAsset();
    } catch (err) {
      setError(getErrorMessage(err, "Falha ao salvar metadados do asset."));
    } finally {
      setIsSavingAsset(false);
    }
  };

  const handleSaveQuickProvenance = async (asset: MediaAssetRecord) => {
    setIsSavingQuickProvenance(true);
    setError(null);

    try {
      const updatedAsset = await updateMediaAssetMetadata({
        assetId: asset.id,
        title: asset.title || asset.file_name || "Asset",
        description: asset.description || "",
        altText: asset.alt_text || "",
        credit: asset.credit || "",
        source: asset.source || "",
        sourceName: quickSourceName.trim() || null,
        sourceUrl: quickSourceUrl.trim() || null,
        sourceDate: asset.source_date || null,
        acervoContentType: asset.bucket === "acervo" ? (asset.acervo_content_type || "artigo_cientifico") : null,
        contentCategory: asset.content_category || (asset.bucket === "acervo" ? "acervo" : asset.bucket),
        tags: asset.tags || [],
        status: asUploadStatus(asset.status || "draft"),
      });

      setRecentAssets((current) => current.map((item) => item.id === updatedAsset.id ? updatedAsset : item));
      if (successAsset?.id === updatedAsset.id) {
        setSuccessAsset(updatedAsset);
      }
      cancelQuickEditingProvenance();
    } catch (err) {
      setError(getErrorMessage(err, "Falha ao salvar procedência rápida."));
    } finally {
      setIsSavingQuickProvenance(false);
    }
  };

  const toggleAssetSelection = (assetId: string) => {
    setSelectedAssetIds((current) =>
      current.includes(assetId) ? current.filter((id) => id !== assetId) : [...current, assetId],
    );
  };

  const handleSelectAllVisibleAssets = () => {
    setSelectedAssetIds((current) => {
      const visibleIds = filteredAssets.map((asset) => asset.id);
      const remainingIds = current.filter((id) => !visibleIds.includes(id));
      return [...remainingIds, ...visibleIds];
    });
  };

  const handleClearSelectedAssets = () => {
    setSelectedAssetIds((current) => current.filter((assetId) => !filteredAssets.some((asset) => asset.id === assetId)));
  };

  const handleApplyBulkProvenance = async () => {
    const trimmedSourceName = bulkSourceName.trim();
    const trimmedSourceUrl = bulkSourceUrl.trim();

    if (visibleSelectedAssetIds.length === 0) {
      setError("Selecione ao menos um upload visível para aplicar a origem em lote.");
      return;
    }

    if (!trimmedSourceName && !trimmedSourceUrl) {
      setError("Preencha nome da fonte ou link antes de aplicar a origem em lote.");
      return;
    }

    setIsApplyingBulkProvenance(true);
    setError(null);

    try {
      const selectedAssets = filteredAssets.filter((asset) => visibleSelectedAssetIds.includes(asset.id));
      const updatedAssets = await Promise.all(
        selectedAssets.map((asset) =>
          updateMediaAssetMetadata({
            assetId: asset.id,
            title: asset.title || asset.file_name || "Asset",
            description: asset.description || "",
            altText: asset.alt_text || "",
            credit: asset.credit || "",
            source: asset.source || "",
            sourceName: trimmedSourceName || asset.source_name || null,
            sourceUrl: trimmedSourceUrl || asset.source_url || null,
            sourceDate: asset.source_date || null,
            acervoContentType: asset.bucket === "acervo" ? (asset.acervo_content_type || "artigo_cientifico") : null,
            contentCategory: asset.content_category || (asset.bucket === "acervo" ? "acervo" : asset.bucket),
            tags: asset.tags || [],
            status: asUploadStatus(asset.status || "draft"),
          }),
        ),
      );

      setRecentAssets((current) =>
        current.map((asset) => updatedAssets.find((updatedAsset) => updatedAsset.id === asset.id) || asset),
      );
      setSuccessAsset((current) => {
        if (!current) return current;
        return updatedAssets.find((asset) => asset.id === current.id) || current;
      });
      setSelectedAssetIds((current) => current.filter((assetId) => !visibleSelectedAssetIds.includes(assetId)));
      setBulkSourceName("");
      setBulkSourceUrl("");
    } catch (err) {
      setError(getErrorMessage(err, "Falha ao aplicar procedência em lote."));
    } finally {
      setIsApplyingBulkProvenance(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    // Validação de alt_text para imagens se for publicar
    if (status === "published" && file.type.startsWith("image/") && !altText.trim()) {
      setError("Texto alternativo é obrigatório para imagens publicadas.");
      return;
    }
    if (bucket === "acervo" && !acervoContentType) {
      setError("Selecione o tipo editorial do Acervo antes de enviar.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(20);
    setError(null);

    try {
      const asset = await adminUploadMedia({
        bucket,
        file,
        title,
        description,
        altText,
        credit,
        source,
        sourceName,
        sourceUrl,
        sourceDate,
        acervoContentType: bucket === "acervo" ? acervoContentType : undefined,
        contentCategory: bucket === "acervo" ? "acervo" : bucket,
        tags: tags.split(",").map(t => t.trim()).filter(Boolean),
        status: asUploadStatus(status)
      });

      setUploadProgress(100);
      setSuccessAsset(asset);
      
      // Reset Form
      setFile(null);
      setTitle("");
      setDescription("");
      setAltText("");
      setCredit("");
      setSource("");
      setSourceName("");
      setSourceUrl("");
      setSourceDate("");
      setTags("");
      setAcervoContentType("artigo_cientifico");
      
      await loadRecentAssets();
    } catch (err) {
      console.error("[Upload] Falha:", err);
      setError(getErrorMessage(err, "Falha no upload."));
    } finally {
      setIsUploading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return (
    <div className="admin-upload-page space-y-8 pb-20 animate-in fade-in duration-500">
      <div className="admin-list-hero flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <span className="admin-command-eyebrow">Ingestão inteligente</span>
          <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">Gestão de Mídia</h1>
          <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">Classifique arquivos por finalidade editorial e acelere a publicação em acervo, blog, relatórios e transparência.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
              Fila ativa: {UPLOAD_QUEUE_FILTER_LABELS[queueFilter]}
            </span>
            {queueSearch.trim() && (
              <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
                Busca: {queueSearch.trim()}
              </span>
            )}
            <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-white/80">
              Ordem: {UPLOAD_QUEUE_SORT_LABELS[queueSort]}
            </span>
          </div>
        </div>
        <div className="admin-command-board">
          <div>
            <span>Arquivos recentes</span>
            <strong>{loading ? "..." : recentAssets.length}</strong>
            <small>últimos registros carregados</small>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[1.5rem] border border-violet-200 bg-violet-50 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Sem link de origem</span>
          <strong className="mt-3 block text-3xl font-black text-violet-900">{loading ? "..." : assetsWithoutOriginLink}</strong>
          <p className="mt-2 text-sm font-medium text-violet-900/80">Uploads recentes ainda sem URL original salva.</p>
          <button type="button" onClick={() => setQueueFilter("without_origin")} className="mt-4 text-xs font-black uppercase tracking-wide text-violet-800 underline underline-offset-2">
            Ver fila
          </button>
        </div>
        <div className="rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-amber-700">Sem nome da fonte</span>
          <strong className="mt-3 block text-3xl font-black text-amber-900">{loading ? "..." : assetsWithoutSourceName}</strong>
          <p className="mt-2 text-sm font-medium text-amber-900/80">Arquivos que ainda não registram veículo, instituição ou acervo de origem.</p>
          <button type="button" onClick={() => setQueueFilter("without_source_name")} className="mt-4 text-xs font-black uppercase tracking-wide text-amber-800 underline underline-offset-2">
            Ver fila
          </button>
        </div>
        <div className="rounded-[1.5rem] border border-sky-200 bg-sky-50 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-sky-700">Órfãos</span>
          <strong className="mt-3 block text-3xl font-black text-sky-900">{loading ? "..." : orphanAssets}</strong>
          <p className="mt-2 text-sm font-medium text-sky-900/80">Assets recentes ainda sem uso em acervo, blog, relatório ou agenda.</p>
          <button type="button" onClick={() => setQueueFilter("orphan")} className="mt-4 text-xs font-black uppercase tracking-wide text-sky-800 underline underline-offset-2">
            Ver fila
          </button>
        </div>
        <div className="rounded-[1.5rem] border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <span className="block text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Procedência completa</span>
          <strong className="mt-3 block text-3xl font-black text-emerald-900">{loading ? "..." : provenanceReadyAssets}</strong>
          <p className="mt-2 text-sm font-medium text-emerald-900/80">Uploads recentes já com link e nome de fonte preenchidos.</p>
          <button type="button" onClick={() => setQueueFilter("ready_to_preserve")} className="mt-4 text-xs font-black uppercase tracking-wide text-emerald-800 underline underline-offset-2">
            Ver fila
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <button
          type="button"
          onClick={activateGeneralWorkflow}
          className={`rounded-[1.75rem] border p-6 text-left transition-all ${workflowMode === "general" ? "border-emerald-300 bg-white shadow-md" : "border-slate-200 bg-white/80 hover:border-emerald-200"}`}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-emerald-700">Rota 1</span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Upload genérico</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">Para imagem, PDF, relatório, capa ou arquivo operacional sem fluxo de preservação jornalística.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
            <span className="rounded-full bg-slate-100 px-3 py-1">mídia geral</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">blog</span>
            <span className="rounded-full bg-slate-100 px-3 py-1">relatórios</span>
          </div>
        </button>
        <button
          type="button"
          onClick={activateEditorialWorkflow}
          className={`rounded-[1.75rem] border p-6 text-left transition-all ${workflowMode === "editorial" ? "border-violet-300 bg-violet-50 shadow-md" : "border-slate-200 bg-white/80 hover:border-violet-200"}`}
        >
          <span className="text-[11px] font-black uppercase tracking-[0.18em] text-violet-700">Rota 2</span>
          <h2 className="mt-3 text-2xl font-black tracking-tight text-slate-950">Matéria ou notícia preservada</h2>
          <p className="mt-2 text-sm font-medium text-slate-600">Para clipping, imprensa e matérias que precisam guardar link de origem, fonte e autocaptura do texto no acervo.</p>
          <div className="mt-4 flex flex-wrap gap-2 text-[10px] font-black uppercase tracking-widest text-violet-700">
            <span className="rounded-full bg-white px-3 py-1">link original</span>
            <span className="rounded-full bg-white px-3 py-1">fonte</span>
            <span className="rounded-full bg-white px-3 py-1">autocaptura</span>
          </div>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Upload Form */}
        <div className="lg:col-span-2 space-y-6">
          <form id="admin-upload-form" onSubmit={handleUpload} className="admin-ingest-panel space-y-6 p-8">
            {workflowMode === "general" ? (
              <div className="rounded-[1.75rem] border border-emerald-100 bg-emerald-50/70 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Fluxo atual</p>
                <p className="mt-2 text-sm font-medium text-emerald-950/80">
                  Suba o asset, revise metadados mínimos e depois encaminhe para acervo, blog, relatório ou agenda.
                </p>
              </div>
            ) : (
              <div className="rounded-[1.75rem] border border-violet-200 bg-violet-50 p-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-700">Fluxo atual</p>
                <p className="mt-2 text-sm font-medium text-violet-950/80">
                  Preencha link, fonte e data original. Depois do upload, use o atalho de preservação para abrir o item no acervo com captura automática.
                </p>
              </div>
            )}
            <div 
              className={`admin-dropzone relative flex flex-col items-center justify-center rounded-[2rem] border-2 border-dashed p-10 text-center transition-all ${
                file ? "border-emerald-300 bg-emerald-50/60" : "border-slate-200 bg-white/60 hover:border-emerald-400"
              }`}
            >
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
                accept=".pdf,image/*"
                disabled={isUploading}
              />
              
              {!file ? (
                <>
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-slate-400 shadow-sm mb-4 border border-slate-100">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="text-base font-bold text-slate-900">Clique ou arraste o arquivo aqui</p>
                  <p className="text-xs text-slate-500 mt-1 uppercase font-bold tracking-widest">
                    PDF até {Math.round(ADMIN_MAX_PDF_FILE_SIZE / 1024 / 1024)}MB • imagens até {Math.round(ADMIN_MAX_FILE_SIZE / 1024 / 1024)}MB
                  </p>
                </>
              ) : (
                <div className="flex items-center gap-6 text-left w-full">
                  <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-md overflow-hidden border-2 border-white">
                    {file.type.startsWith("image/") ? (
                      <img src={URL.createObjectURL(file)} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center">
                        <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <span className="text-[10px] font-black uppercase mt-1">PDF</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-lg font-black text-slate-900 truncate">{file.name}</p>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB • {file.type.split("/")[1]}</p>
                    <button 
                      type="button" 
                      onClick={() => setFile(null)}
                      className="text-xs text-rose-500 font-black mt-2 hover:bg-rose-50 px-3 py-1 rounded-full transition-colors border border-rose-100"
                    >
                      Remover e Escolher Outro
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Título do Arquivo</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-bold"
                  placeholder="Ex: Foto do Mutirão de Saúde"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Destino (Bucket)</label>
                <select
                  value={bucket}
                  onChange={(e) => setBucket(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 font-bold"
                >
                  {BUCKETS.map(b => <option key={b.id} value={b.id}>{b.label}</option>)}
                </select>
              </div>

              {bucket === "acervo" && (
                <div className="md:col-span-2 rounded-[1.75rem] border border-emerald-100 bg-emerald-50/50 p-5">
                  <div className="mb-4">
                    <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-700">Tipo de conteúdo no Acervo</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">Esta escolha define onde o item será exibido no portal: artigos, notícias/matérias, mídias ou documentos.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {ACERVO_EDITORIAL_TYPES.map((option) => (
                      <label
                        key={option.value}
                        className={`cursor-pointer rounded-2xl border p-4 transition-all ${acervoContentType === option.value ? "border-emerald-500 bg-white shadow-sm" : "border-emerald-100 bg-white/70 hover:border-emerald-300"}`}
                      >
                        <input
                          type="radio"
                          name="acervo-content-type"
                          value={option.value}
                          checked={acervoContentType === option.value}
                          onChange={(e) => setAcervoContentType(e.target.value)}
                          className="sr-only"
                        />
                        <span className="block text-sm font-black text-slate-900">{option.label}</span>
                        <span className="mt-1 block text-xs font-medium text-slate-500">{option.description}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {bucket === "acervo" && acervoContentType === "noticia" && (
                <div className="md:col-span-2 rounded-[1.75rem] border border-violet-200 bg-violet-50 p-5">
                  <p className="text-xs font-black uppercase tracking-[0.22em] text-violet-700">Fluxo guiado de imprensa</p>
                  <p className="mt-2 text-sm font-medium text-violet-900/80">
                    Para notícia ou matéria, preencha o link original antes do upload. Depois, use o atalho de preservação para abrir o item no acervo com autocaptura do texto.
                  </p>
                  <div className="mt-4 grid gap-2 text-[11px] font-bold text-violet-950/80 sm:grid-cols-2">
                    <span>1. Salvar asset com procedência</span>
                    <span>2. Abrir item de acervo com autocaptura</span>
                    <span>3. Revisar texto preservado</span>
                    <span>4. Publicar ou manter em rascunho</span>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Status Inicial</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className={`w-full px-5 py-3 border rounded-xl font-bold transition-colors ${status === 'published' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-slate-50 border-slate-100'}`}
                >
                  <option value="draft">Rascunho</option>
                  <option value="published">Publicado</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descrição Curta</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl focus:ring-4 focus:ring-emerald-500/10 h-24 font-medium"
                  placeholder="Para que serve este arquivo?"
                />
              </div>

              {file?.type.startsWith("image/") && (
                <div className="md:col-span-2">
                  <label className="block text-xs font-black text-rose-400 uppercase tracking-widest mb-2">
                    Texto Alternativo (Acessibilidade) <span className="text-rose-600">*</span>
                  </label>
                  <input
                    type="text"
                    value={altText}
                    onChange={(e) => setAltText(e.target.value)}
                    className="w-full px-5 py-3 bg-rose-50/30 border border-rose-100 rounded-xl focus:ring-4 focus:ring-rose-500/10 font-medium"
                    placeholder="O que está acontecendo nesta imagem?"
                    required={status === "published"}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Créditos</label>
                <input
                  type="text"
                  value={credit}
                  onChange={(e) => setCredit(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium"
                  placeholder="Nome do autor ou fonte"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Origem editorial</label>
                <input
                  type="text"
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium"
                  placeholder="Ex: O Globo, acervo próprio, assessoria"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Nome da fonte original</label>
                <input
                  type="text"
                  value={sourceName}
                  onChange={(e) => setSourceName(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium"
                  placeholder="Ex: Jornal do Brasil"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Link original</label>
                <input
                  type="url"
                  value={sourceUrl}
                  onChange={(e) => setSourceUrl(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Data original</label>
                <input
                  type="date"
                  value={sourceDate}
                  onChange={(e) => setSourceDate(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium"
                />
              </div>

              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Tags</label>
                <input
                  type="text"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  className="w-full px-5 py-3 bg-slate-50 border border-slate-100 rounded-xl font-medium"
                  placeholder="saude, volta-redonda, pdf"
                />
              </div>
            </div>

            {error && (
              <div className="p-5 bg-rose-50 text-rose-700 text-sm font-bold rounded-2xl border border-rose-100 flex items-center gap-3">
                <span className="text-xl">⚠️</span> {error}
              </div>
            )}

            {successAsset && (
              <div className="admin-success-panel flex flex-col gap-6 p-8 text-emerald-950 animate-in zoom-in duration-300">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-emerald-500 text-white rounded-2xl flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20">
                    ✅
                  </div>
                  <div>
                    <p className="text-lg font-black leading-tight">Upload concluído!</p>
                    <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest">O arquivo está pronto para uso.</p>
                  </div>
                </div>

                <div className="rounded-[1.5rem] border border-emerald-100 bg-white/90 p-5 shadow-sm">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                    <div className="h-28 w-full overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50 sm:h-24 sm:w-24 sm:flex-shrink-0">
                      {isImageAsset(successAsset) ? (
                        <img src={successAsset.public_url} alt={successAsset.alt_text || successAsset.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full flex-col items-center justify-center text-emerald-700">
                          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="mt-2 text-[10px] font-black uppercase tracking-[0.22em]">PDF</span>
                        </div>
                      )}
                    </div>

                    <div className="grid flex-1 grid-cols-1 gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Nome do arquivo</p>
                        <p className="mt-1 text-sm font-black text-slate-900 break-all">{successAsset.file_name}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Tipo</p>
                        <p className="mt-1 text-sm font-black text-slate-900">{successAsset.mime_type}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Tamanho</p>
                        <p className="mt-1 text-sm font-black text-slate-900">{formatAssetSize(successAsset.size_bytes)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Categoria editorial</p>
                        <p className="mt-1 text-sm font-black text-slate-900">
                          {successAsset.bucket === "acervo" ? getAcervoTypeLabel(successAsset.acervo_content_type) : "Não se aplica"}
                        </p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-emerald-600">Título interno</p>
                        <p className="mt-1 text-sm font-black text-slate-900">{successAsset.title}</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  <a 
                    href={successAsset.public_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex-1 py-3 bg-white border border-emerald-200 text-[10px] font-black text-emerald-700 uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all text-center"
                  >
                    Abrir arquivo
                  </a>
                  <button 
                    onClick={() => copyToClipboard(successAsset.public_url)}
                    className="flex-1 py-3 bg-white border border-emerald-200 text-[10px] font-black text-emerald-700 uppercase tracking-widest rounded-xl hover:bg-emerald-100 transition-all"
                  >
                    Copiar URL
                  </button>
                </div>

                {successAsset.bucket === "acervo" ? (
                  <div className="space-y-4">
                    {successAsset.source_url?.trim() && (
                      <Link
                        to={buildPreservedStoryLink(successAsset.id, "noticia")}
                        className="flex flex-col rounded-[1.75rem] border border-violet-200 bg-violet-50 px-5 py-4 text-violet-950 transition-all hover:bg-violet-100"
                      >
                        <span className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-700">Atalho editorial</span>
                        <span className="mt-2 text-sm font-black">Criar matéria preservada com autocaptura</span>
                        <span className="mt-1 text-xs font-medium text-violet-900/80">
                          Abre o editor do acervo com link, fonte e captura automática da matéria.
                        </span>
                      </Link>
                    )}
                    <Link
                      to={buildAcervoLink(successAsset.id, successAsset.acervo_content_type || acervoContentType)}
                      className="flex items-center justify-center rounded-2xl bg-emerald-600 px-5 py-4 text-center text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-emerald-700"
                    >
                      Criar item no Acervo
                    </Link>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {ACERVO_ACTIONS.map((action) => (
                        <Link
                          key={action.type}
                          to={buildAcervoLink(successAsset.id, action.type)}
                          className="flex flex-col items-center rounded-2xl border border-emerald-100 bg-white p-4 text-center transition-all hover:shadow-md"
                        >
                          <span className="mb-2 text-2xl">{action.emoji}</span>
                          <span className="text-[10px] font-black uppercase text-emerald-700">{action.label}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {successAsset.source_url?.trim() && (
                      <Link to={buildPreservedStoryLink(successAsset.id, "noticia")} className="flex flex-col items-center p-4 bg-violet-50 rounded-2xl border border-violet-200 hover:shadow-md transition-all group">
                        <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">🗞️</span>
                        <span className="text-[10px] font-black uppercase text-violet-700">Matéria preservada</span>
                      </Link>
                    )}
                    <Link to={buildAcervoLink(successAsset.id, "outro")} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-all group">
                      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📚</span>
                      <span className="text-[10px] font-black uppercase text-emerald-700">Usar no Acervo</span>
                    </Link>
                    <Link to={`/admin/relatorios/novo?assetId=${successAsset.id}`} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-all group">
                      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">📄</span>
                      <span className="text-[10px] font-black uppercase text-emerald-700">Usar em Relatório</span>
                    </Link>
                    <Link to={`/admin/blog/novo?assetId=${successAsset.id}`} className="flex flex-col items-center p-4 bg-white rounded-2xl border border-emerald-100 hover:shadow-md transition-all group">
                      <span className="text-2xl mb-2 group-hover:scale-110 transition-transform">✍️</span>
                      <span className="text-[10px] font-black uppercase text-emerald-700">Usar no Blog</span>
                    </Link>
                  </div>
                )}
                
                <div className="flex items-center justify-center gap-4 pt-2 border-t border-emerald-100">
                  <button onClick={() => setSuccessAsset(null)} className="text-[10px] font-black uppercase text-emerald-600 hover:text-emerald-800 transition-colors">
                    Fazer outro Upload
                  </button>
                </div>
              </div>
            )}

            {isUploading && (
              <div className="space-y-3">
                <div className="h-3 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-emerald-500 transition-all duration-500 rounded-full" 
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
                <p className="text-xs text-center font-black text-slate-400 uppercase tracking-widest animate-pulse">Sincronizando Metadados... {uploadProgress}%</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isUploading || !file}
              className="admin-upload-submit w-full py-5 text-sm font-black uppercase tracking-widest text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUploading ? "Enviando para o Servidor..." : "Iniciar Upload"}
            </button>
          </form>
        </div>

        {/* Recent Uploads Sidebar */}
        <div className="admin-upload-sidebar space-y-6 p-6">
          {editingAssetId && (
            <form onSubmit={handleSaveAssetMetadata} className="rounded-[1.75rem] border border-emerald-100 bg-white p-5 shadow-sm space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <span className="admin-eyebrow">Metadados</span>
                  <h2 className="mt-2 text-lg font-black text-slate-950">Editar asset</h2>
                </div>
                <button
                  type="button"
                  onClick={cancelEditingAsset}
                  className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700"
                >
                  Fechar
                </button>
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Título</label>
                <input
                  type="text"
                  value={assetTitle}
                  onChange={(e) => setAssetTitle(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Descrição</label>
                <textarea
                  value={assetDescription}
                  onChange={(e) => setAssetDescription(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium h-24"
                />
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Texto alternativo</label>
                <input
                  type="text"
                  value={assetAltText}
                  onChange={(e) => setAssetAltText(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium"
                />
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Créditos</label>
                  <input
                    type="text"
                    value={assetCredit}
                    onChange={(e) => setAssetCredit(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Fonte</label>
                  <input
                    type="text"
                    value={assetSource}
                    onChange={(e) => setAssetSource(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Nome da fonte original</label>
                  <input
                    type="text"
                    value={assetSourceName}
                    onChange={(e) => setAssetSourceName(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Link original</label>
                  <input
                    type="url"
                    value={assetSourceUrl}
                    onChange={(e) => setAssetSourceUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Data original</label>
                  <input
                    type="date"
                    value={assetSourceDate}
                    onChange={(e) => setAssetSourceDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-3">
                <div>
                  <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Status</label>
                  <select
                    value={assetStatus}
                    onChange={(e) => setAssetStatus(e.target.value)}
                    className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold"
                  >
                    <option value="draft">Rascunho</option>
                    <option value="published">Publicado</option>
                    <option value="archived">Arquivado</option>
                  </select>
                </div>
                {recentAssets.find((asset) => asset.id === editingAssetId)?.bucket === "acervo" && (
                  <div>
                    <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Tipo no acervo</label>
                    <select
                      value={assetAcervoType}
                      onChange={(e) => setAssetAcervoType(e.target.value)}
                      className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold"
                    >
                      {ACERVO_EDITORIAL_TYPES.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400 mb-2">Tags</label>
                <input
                  type="text"
                  value={assetTags}
                  onChange={(e) => setAssetTags(e.target.value)}
                  className="w-full rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm font-medium"
                  placeholder="saude, arquivo, acervo"
                />
              </div>

              <div className="flex gap-2">
                <button
                  type="submit"
                  disabled={isSavingAsset}
                  className="flex-1 rounded-xl bg-emerald-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                >
                  {isSavingAsset ? "Salvando..." : "Salvar metadados"}
                </button>
                <button
                  type="button"
                  onClick={cancelEditingAsset}
                  className="rounded-xl border border-slate-200 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-600"
                >
                  Cancelar
                </button>
              </div>
            </form>
          )}

          <div className="flex items-center justify-between">
            <div>
              <span className="admin-eyebrow">Fila recente</span>
              <h2 className="mt-3 text-xl font-black uppercase tracking-tight text-slate-950">Últimos Envios</h2>
            </div>
            <button 
              onClick={() => loadRecentAssets()}
              className="p-2 text-slate-400 hover:text-emerald-600 transition-colors"
            >
              <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </button>
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Buscar na fila</label>
            <input
              type="text"
              value={queueSearch}
              onChange={(e) => setQueueSearch(e.target.value)}
              placeholder="titulo, arquivo, fonte..."
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700"
            />
          </div>

          <div>
            <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.22em] text-slate-400">Ordenar fila</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(UPLOAD_QUEUE_SORT_LABELS).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setQueueSort(value as UploadQueueSort)}
                  className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                    queueSort === value
                      ? "bg-emerald-600 text-white"
                      : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(UPLOAD_QUEUE_FILTER_LABELS).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setQueueFilter(value as UploadQueueFilter)}
                className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-widest transition-all ${
                  queueFilter === value
                    ? "bg-slate-900 text-white"
                    : "bg-white text-slate-500 border border-slate-200 hover:border-slate-300"
                }`}
              >
                {label} <span className="ml-1 opacity-70">{queueCounts[value as UploadQueueFilter]}</span>
              </button>
            ))}
          </div>

          <div className="rounded-[1.75rem] border border-violet-200 bg-violet-50/80 p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-violet-700">Qualificação em lote</p>
                <p className="mt-2 text-sm font-semibold text-slate-700">
                  {visibleSelectedAssetIds.length === 0
                    ? "Selecione uploads visíveis para preencher procedência mais rápido."
                    : `${visibleSelectedAssetIds.length} upload(s) selecionado(s) neste recorte.`}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={allVisibleSelected ? handleClearSelectedAssets : handleSelectAllVisibleAssets}
                  className="rounded-full border border-violet-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-violet-700 transition hover:border-violet-300"
                >
                  {allVisibleSelected ? "Limpar visíveis" : "Selecionar visíveis"}
                </button>
                <button
                  type="button"
                  onClick={handleClearSelectedAssets}
                  disabled={visibleSelectedAssetIds.length === 0}
                  className="rounded-full border border-slate-200 bg-white px-3 py-2 text-[10px] font-black uppercase tracking-widest text-slate-600 transition hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Limpar seleção
                </button>
              </div>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-[1fr,1fr,auto]">
              <input
                type="text"
                value={bulkSourceName}
                onChange={(e) => setBulkSourceName(e.target.value)}
                placeholder="Nome da fonte para os selecionados"
                className="w-full rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm font-medium text-slate-700"
              />
              <input
                type="url"
                value={bulkSourceUrl}
                onChange={(e) => setBulkSourceUrl(e.target.value)}
                placeholder="https://link-original..."
                className="w-full rounded-xl border border-violet-100 bg-white px-4 py-3 text-sm font-medium text-slate-700"
              />
              <button
                type="button"
                onClick={handleApplyBulkProvenance}
                disabled={isApplyingBulkProvenance}
                className="rounded-xl bg-violet-600 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isApplyingBulkProvenance ? "Aplicando..." : "Aplicar origem"}
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-20 text-center text-slate-400 italic font-medium">Carregando mídias...</div>
            ) : filteredAssets.length === 0 ? (
              <div className="admin-panel py-20 text-center font-medium italic text-slate-400">Nenhum upload encontrado para esse recorte.</div>
            ) : (
              filteredAssets.map((asset) => {
                const pressReference = getPressReference(asset.id);
                const canCreatePressItem = Boolean(asset.source_url?.trim()) && !pressReference;

                return (
                <div key={asset.id} className="admin-media-card group p-5">
                  <div className="mb-4 flex items-center justify-between gap-3">
                    <label className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.22em] text-slate-500">
                      <input
                        type="checkbox"
                        checked={selectedAssetIds.includes(asset.id)}
                        onChange={() => toggleAssetSelection(asset.id)}
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      Selecionar
                    </label>
                    {selectedAssetIds.includes(asset.id) && (
                      <span className="rounded-full bg-violet-100 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-violet-700">
                        Em lote
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400 overflow-hidden border border-slate-100 relative shadow-inner">
                      {isImageAsset(asset) ? (
                        <img src={asset.public_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="text-center">
                          <svg className="w-7 h-7 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          <span className="text-[8px] font-black uppercase">PDF</span>
                        </div>
                      )}
                      <div className={`absolute bottom-1 right-1 w-3 h-3 border-2 border-white rounded-full ${asset.status === 'published' ? 'bg-emerald-500' : 'bg-amber-400'}`} title={asset.status} />
                    </div>
	                  <div className="flex-1 min-w-0">
	                      <p className="text-sm font-black text-slate-900 truncate">{asset.title}</p>
	                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
	                        {asset.mime_type.split("/")[1]} • {formatAssetSize(asset.size_bytes)}
	                      </p>
                      {isImageAsset(asset) && !asset.alt_text?.trim() && (
                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-rose-500">Sem alt_text</p>
                      )}
	                      {asset.bucket === "acervo" && asset.acervo_content_type && (
	                        <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-600">
	                          {getAcervoTypeLabel(asset.acervo_content_type)}
	                        </p>
	                      )}
                        {asset.source_url?.trim() && (
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-violet-600">
                            Com link de origem
                          </p>
                        )}
                        {pressReference && (
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-emerald-700">
                            Já virou imprensa
                          </p>
                        )}
                        {(assetReferences[asset.id]?.length || 0) === 0 ? (
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-amber-600">Asset órfão</p>
                        ) : (
                          <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-sky-600">
                            Em uso: {assetReferences[asset.id].length}
                          </p>
                        )}
	                    </div>
	                  </div>
                  
                  <div className={`grid gap-2 mb-3 ${asset.source_url?.trim() ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"}`}>
                    {canCreatePressItem && (
                      <Link
                        to={buildPreservedStoryLink(asset.id, "noticia")}
                        className="py-2 bg-violet-50 hover:bg-violet-100 text-[9px] font-black text-violet-700 uppercase tracking-widest rounded-lg transition-all text-center"
                      >
                        Preservar
                      </Link>
                    )}
                    {pressReference && (
                      <Link
                        to={pressReference.href}
                        className="py-2 bg-emerald-50 hover:bg-emerald-100 text-[9px] font-black text-emerald-700 uppercase tracking-widest rounded-lg transition-all text-center"
                      >
                        Abrir imprensa
                      </Link>
                    )}
	                    <button
                        onClick={() => startEditingAsset(asset)}
                        className="py-2 bg-slate-50 hover:bg-slate-100 text-[9px] font-black text-slate-600 uppercase tracking-widest rounded-lg transition-all"
                      >
                        Editar
                      </button>
                    <button
                      onClick={() => startQuickEditingProvenance(asset)}
                      className="py-2 bg-amber-50 hover:bg-amber-100 text-[9px] font-black text-amber-700 uppercase tracking-widest rounded-lg transition-all"
                    >
                      Origem
                    </button>
	                    <button 
	                      onClick={() => copyToClipboard(asset.public_url)}
	                      className="py-2 bg-slate-50 hover:bg-slate-100 text-[9px] font-black text-slate-600 uppercase tracking-widest rounded-lg transition-all"
                    >
                      Copiar URL
                    </button>
                    <a 
                      href={asset.public_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="py-2 bg-slate-50 hover:bg-emerald-50 text-[9px] font-black text-slate-600 uppercase tracking-widest rounded-lg transition-all text-center"
                    >
                      Abrir
                    </a>
                  </div>

                  {quickEditingAssetId === asset.id && (
                    <div className="mb-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-amber-700">Origem rápida</p>
                      <div className="mt-3 grid gap-3">
                        <input
                          type="text"
                          value={quickSourceName}
                          onChange={(e) => setQuickSourceName(e.target.value)}
                          placeholder="Nome da fonte original"
                          className="w-full rounded-xl border border-amber-100 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                        />
                        <input
                          type="url"
                          value={quickSourceUrl}
                          onChange={(e) => setQuickSourceUrl(e.target.value)}
                          placeholder="https://..."
                          className="w-full rounded-xl border border-amber-100 bg-white px-4 py-3 text-sm font-medium text-slate-700"
                        />
                      </div>
                      <div className="mt-3 flex gap-2">
                        <button
                          type="button"
                          onClick={() => handleSaveQuickProvenance(asset)}
                          disabled={isSavingQuickProvenance}
                          className="flex-1 rounded-xl bg-amber-500 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50"
                        >
                          {isSavingQuickProvenance ? "Salvando..." : "Salvar origem"}
                        </button>
                        <button
                          type="button"
                          onClick={cancelQuickEditingProvenance}
                          className="rounded-xl border border-amber-200 px-4 py-3 text-[10px] font-black uppercase tracking-widest text-amber-800"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  )}

	                  <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-1">
	                    <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">Usar em:</p>
	                    <div className="flex items-center gap-1">
                      <Link to={buildAcervoLink(asset.id, asset.acervo_content_type || "outro")} className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all" title="Acervo">
                        📚
                      </Link>
                      <Link to={`/admin/relatorios/novo?assetId=${asset.id}`} className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all" title="Relatório">
                        📄
                      </Link>
                      <Link to={`/admin/blog/novo?assetId=${asset.id}`} className="p-1.5 bg-slate-50 hover:bg-emerald-50 text-slate-400 hover:text-emerald-600 rounded-lg transition-all" title="Blog">
                        ✍️
                      </Link>
	                    </div>
	                  </div>

                    {(assetReferences[asset.id]?.length || 0) > 0 && (
                      <div className="mt-3 border-t border-slate-50 pt-3">
                        <p className="text-[8px] font-black uppercase tracking-widest text-slate-300 mb-2">Referências</p>
                        <div className="space-y-1">
                          {assetReferences[asset.id].slice(0, 3).map((reference, index) => (
                            <Link
                              key={`${asset.id}-${reference.area}-${reference.role}-${index}`}
                              to={reference.href}
                              className="block rounded-lg bg-slate-50 px-3 py-2 text-[10px] font-bold text-slate-600 transition-all hover:bg-slate-100"
                            >
                              <span className="uppercase text-slate-400">{reference.area}</span> • {reference.role} • {reference.label}
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
	                </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
