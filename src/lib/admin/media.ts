import { getSupabaseClient } from "../supabase/runtime";

export interface MediaAssetRecord {
  id: string;
  bucket: string;
  path: string;
  public_url: string;
  file_name: string;
  mime_type: string;
  size_bytes: number;
  title: string;
  description?: string;
  alt_text?: string;
  credit?: string;
  source?: string;
  acervo_content_type?: string;
  content_category?: string;
  source_date?: string;
  source_name?: string;
  source_url?: string;
  tags?: string[];
  status?: string;
  created_at?: string;
}

export interface UploadOptions {
  bucket: string;
  file: File;
  title: string;
  description?: string;
  altText?: string;
  credit?: string;
  source?: string;
  acervoContentType?: string;
  contentCategory?: string;
  sourceDate?: string;
  sourceName?: string;
  sourceUrl?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
}

export interface UpdateMediaAssetOptions {
  assetId: string;
  title: string;
  description?: string;
  altText?: string;
  credit?: string;
  source?: string;
  acervoContentType?: string | null;
  contentCategory?: string | null;
  sourceDate?: string | null;
  sourceName?: string | null;
  sourceUrl?: string | null;
  tags?: string[];
  status?: "draft" | "published" | "archived";
}

type ContentKind = "acervo" | "blog" | "reports";
type EmbeddedMediaReference = { id?: unknown };

export const ADMIN_ALLOWED_BUCKETS = ["acervo", "media", "blog", "reports", "transparency"] as const;
export const ADMIN_ALLOWED_MIME_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;
export const ADMIN_MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
export const ADMIN_MAX_PDF_FILE_SIZE = 30 * 1024 * 1024; // 30MB

type UploadValidationOptions = {
  allowedMimeTypes?: readonly string[];
  maxFileSize?: number;
};

export function isImageAsset(asset: Pick<MediaAssetRecord, "mime_type"> | null | undefined) {
  return Boolean(asset?.mime_type?.startsWith("image/"));
}

export function isPdfAsset(asset: Pick<MediaAssetRecord, "mime_type"> | null | undefined) {
  return asset?.mime_type === "application/pdf";
}

export function formatAssetSize(sizeBytes: number | null | undefined) {
  if (!sizeBytes || Number.isNaN(sizeBytes)) return "0 B";
  if (sizeBytes < 1024) return `${sizeBytes} B`;

  const units = ["KB", "MB", "GB"];
  let size = sizeBytes / 1024;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex += 1;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
}

export function validateAdminUploadFile(file: File, options: UploadValidationOptions = {}) {
  const {
    allowedMimeTypes = ADMIN_ALLOWED_MIME_TYPES,
    maxFileSize = file.type === "application/pdf" ? ADMIN_MAX_PDF_FILE_SIZE : ADMIN_MAX_FILE_SIZE,
  } = options;

  if (!allowedMimeTypes.includes(file.type)) {
    throw new Error("Tipo de arquivo não permitido. Use PDF, JPG, PNG ou WEBP.");
  }

  if (file.size > maxFileSize) {
    throw new Error(`Arquivo muito grande. Limite de ${Math.round(maxFileSize / 1024 / 1024)}MB.`);
  }
}

function getEmbeddedMediaAssetId(item: unknown) {
  if (!item || typeof item !== "object") return null;
  const id = (item as EmbeddedMediaReference).id;
  return typeof id === "string" && id ? id : null;
}

export async function getMediaAssetById(assetId: string): Promise<MediaAssetRecord | null> {
  const supabase = await getSupabaseClient();

  const { data, error } = await supabase
    .from("media_assets")
    .select("id, bucket, path, public_url, file_name, mime_type, size_bytes, title, description, alt_text, credit, source, acervo_content_type, content_category, source_date, source_name, source_url, tags, status, created_at")
    .eq("id", assetId)
    .maybeSingle();

  if (error) throw error;
  return data as MediaAssetRecord | null;
}

/**
 * Realiza o upload de mídia para o Supabase Storage e registra os metadados no banco.
 * O path é organizado automaticamente por bucket/ano/mês.
 */
export async function adminUploadMedia(options: UploadOptions) {
  const supabase = await getSupabaseClient();

  const {
    bucket,
    file,
    title,
    description = "",
    altText = "",
    credit = "",
    source = "",
    acervoContentType = "",
    contentCategory = bucket,
    sourceDate = "",
    sourceName = "",
    sourceUrl = "",
    tags = [],
    status = "draft"
  } = options;

  if (!ADMIN_ALLOWED_BUCKETS.includes(bucket as (typeof ADMIN_ALLOWED_BUCKETS)[number])) {
    throw new Error("Bucket de upload não permitido.");
  }

  validateAdminUploadFile(file);

  // 1. Validar usuário administrador
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("Usuário não autenticado.");

  // 2. Organizar Path: bucket/ano/mês/nome-do-arquivo
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const fileExt = file.name.split(".").pop();
  const cleanFileName = file.name
    .replace(/[^\w.-]/g, "_") // Limpa caracteres especiais
    .replace(/\.[^/.]+$/, ""); // Remove extensão temporariamente
  
  const uniqueName = `${cleanFileName}_${Date.now()}.${fileExt}`;
  const filePath = `${year}/${month}/${uniqueName}`;

  // 3. Upload para o Storage
  const { error: storageError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false
    });

  if (storageError) throw storageError;

  // 4. Obter URL Pública
  const { data: { publicUrl } } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  // 5. Registrar Metadados no Banco (media_assets)
  const { data: asset, error: dbError } = await supabase
    .from("media_assets")
    .insert({
      bucket,
      path: filePath,
      public_url: publicUrl,
      file_name: file.name,
      mime_type: file.type,
      size_bytes: file.size,
      title,
      description,
      alt_text: altText,
      credit,
      source,
      acervo_content_type: acervoContentType || null,
      content_category: contentCategory || null,
      source_date: sourceDate || null,
      source_name: sourceName || null,
      source_url: sourceUrl || null,
      tags,
      status,
      created_by: user.id
    })
    .select()
    .single();

  if (dbError) {
    // Se falhar o banco, tentamos limpar o storage para não deixar lixo
    await supabase.storage.from(bucket).remove([filePath]);
    throw dbError;
  }

  return asset as MediaAssetRecord;
}

export async function updateMediaAssetMetadata(options: UpdateMediaAssetOptions) {
  const supabase = await getSupabaseClient();

  const {
    assetId,
    title,
    description = "",
    altText = "",
    credit = "",
    source = "",
    acervoContentType = null,
    contentCategory = null,
    sourceDate = null,
    sourceName = null,
    sourceUrl = null,
    tags = [],
    status = "draft",
  } = options;

  const existingAsset = await getMediaAssetById(assetId);
  if (!existingAsset) {
    throw new Error("Asset não encontrado.");
  }

  if (status === "published" && isImageAsset(existingAsset) && !altText.trim()) {
    throw new Error("Texto alternativo é obrigatório para imagens publicadas.");
  }

  const { data, error } = await supabase
    .from("media_assets")
    .update({
      title,
      description,
      alt_text: altText,
      credit,
      source,
      acervo_content_type: acervoContentType,
      content_category: contentCategory,
      source_date: sourceDate,
      source_name: sourceName,
      source_url: sourceUrl,
      tags,
      status,
    })
    .eq("id", assetId)
    .select("id, bucket, path, public_url, file_name, mime_type, size_bytes, title, description, alt_text, credit, source, acervo_content_type, content_category, source_date, source_name, source_url, tags, status, created_at")
    .single();

  if (error) throw error;
  return data as MediaAssetRecord;
}

export async function getLinkedMediaAssetIdsForContent(contentKind: ContentKind, contentId: string) {
  const supabase = await getSupabaseClient();

  if (contentKind === "acervo") {
    const { data, error } = await supabase
      .from("acervo_items")
      .select("cover_asset_id, media")
      .eq("id", contentId)
      .maybeSingle();

    if (error) throw error;
    if (!data) return [];

    const ids = new Set<string>();
    if (typeof data.cover_asset_id === "string" && data.cover_asset_id) {
      ids.add(data.cover_asset_id);
    }
    if (Array.isArray(data.media)) {
      data.media.forEach((item) => {
        const assetId = getEmbeddedMediaAssetId(item);
        if (assetId) ids.add(assetId);
      });
    }
    return Array.from(ids);
  }

  if (contentKind === "blog") {
    const { data, error } = await supabase
      .from("blog_posts")
      .select("cover_asset_id")
      .eq("id", contentId)
      .maybeSingle();

    if (error) throw error;
    if (!data?.cover_asset_id) return [];
    return [data.cover_asset_id];
  }

  const { data, error } = await supabase
    .from("reports")
    .select("cover_asset_id, pdf_asset_id")
    .eq("id", contentId)
    .maybeSingle();

  if (error) throw error;
  if (!data) return [];

  const ids = new Set<string>();
  if (typeof data.cover_asset_id === "string" && data.cover_asset_id) {
    ids.add(data.cover_asset_id);
  }
  if (typeof data.pdf_asset_id === "string" && data.pdf_asset_id) {
    ids.add(data.pdf_asset_id);
  }
  return Array.from(ids);
}
