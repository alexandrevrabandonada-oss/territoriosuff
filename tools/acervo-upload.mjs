import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import process from "node:process";
import dotenv from "dotenv";

// Load env
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    console.error("ERRO: SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não encontrados.");
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Simple arg parser
const args = process.argv.slice(2);
const params = {};
for (let i = 0; i < args.length; i++) {
    if (args[i].startsWith("--")) {
        params[args[i].slice(2)] = args[i + 1];
        i++;
    }
}

const { slug, file, kind, title, cover, "small-url": smallUrl, "thumb-url": thumbUrl } = params;

if (!slug || !file || !kind) {
    console.error("USO: node tools/acervo-upload.mjs --slug <slug> --file <caminho> --kind <pdf|image> [--title <titulo>] [--cover <true|false>] [--small-url <url>] [--thumb-url <url>]");
    process.exit(1);
}

async function upload() {
    try {
        if (!fs.existsSync(file)) {
            throw new Error(`Arquivo não encontrado: ${file}`);
        }

        const fileName = path.basename(file);
        const ts = Date.now();
        const storagePath = `${slug}/${ts}-${fileName}`;
        const fileBuffer = fs.readFileSync(file);

        console.log(`Enviando ${fileName} para storage: ${storagePath}...`);
        const { error: uploadError } = await supabase.storage
            .from("acervo")
            .upload(storagePath, fileBuffer, {
                contentType: kind === "pdf" ? "application/pdf" : "image/jpeg",
                upsert: true
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from("acervo").getPublicUrl(storagePath);
        console.log(`OK: URL pública: ${publicUrl}`);

        // Update DB
        console.log(`Atualizando acervo_items para slug: ${slug}...`);

        // 1. Get current item to append media
        const { data: item, error: fetchError } = await supabase
            .from("acervo_items")
            .select("id, media")
            .eq("slug", slug)
            .maybeSingle();

        if (fetchError || !item) {
            throw new Error(`Item do acervo não encontrado para o slug: ${slug}`);
        }

        const currentMedia = Array.isArray(item.media) ? item.media : [];
        const newMediaItem = {
            kind,
            url: publicUrl,
            title: title || fileName,
            uploaded_at: new Date().toISOString()
        };

        const updateData = {
            media: [...currentMedia, newMediaItem]
        };

        if (cover === "true") {
            updateData.cover_url = publicUrl;
        }

        if (smallUrl) {
            updateData.cover_small_url = smallUrl;
        }

        if (thumbUrl) {
            updateData.cover_thumb_url = thumbUrl;
        }

        const { error: updateError } = await supabase
            .from("acervo_items")
            .update(updateData)
            .eq("id", item.id);

        if (updateError) throw updateError;

        console.log(`SUCESSO: Item atualizado com a nova mídia.`);
        process.exit(0);
    } catch (error) {
        console.error("FALHA:", error.message || error);
        process.exit(1);
    }
}

void upload();
