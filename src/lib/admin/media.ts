import { supabase } from "../supabase/client";

export interface UploadOptions {
  bucket: string;
  file: File;
  title: string;
  description?: string;
  altText?: string;
  credit?: string;
  source?: string;
  tags?: string[];
  status?: "draft" | "published" | "archived";
}

/**
 * Realiza o upload de mídia para o Supabase Storage e registra os metadados no banco.
 * O path é organizado automaticamente por bucket/ano/mês.
 */
export async function adminUploadMedia(options: UploadOptions) {
  if (!supabase) throw new Error("Supabase não configurado.");

  const {
    bucket,
    file,
    title,
    description = "",
    altText = "",
    credit = "",
    source = "",
    tags = [],
    status = "draft"
  } = options;

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

  return asset;
}
