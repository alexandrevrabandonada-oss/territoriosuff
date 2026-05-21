import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import conversasDemo from "../data/demo/conversas.demo.json" with { type: "json" };
import corredoresDemo from "../data/demo/corredores.demo.json" with { type: "json" };

if (fs.existsSync(".env.local")) {
  const env = fs.readFileSync(".env.local", "utf8");
  env.split("\n").forEach((line) => {
    const [key, ...vals] = line.split("=");
    if (key && vals.length > 0) {
      process.env[key.trim()] = vals.join("=").trim().replace(/^["']|["']$/g, "");
    }
  });
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required in .env.local");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const DATA_DIR = path.join(process.cwd(), "data", "demo");

async function safelyLoadJson(filename) {
  const p = path.join(DATA_DIR, filename);
  if (!fs.existsSync(p)) {
    console.warn(`WARN: skipped ${filename}, file not found.`);
    return null;
  }
  return JSON.parse(fs.readFileSync(p, "utf-8"));
}

async function run() {
  console.log(`\nLoading DEMO seeds into ${SUPABASE_URL}...\n`);
  console.log("Auth mode: Service Role\n");

  const summary = {
    acervo: 0,
    blog: 0,
    reports: 0,
    transparenciaLinks: 0,
    transparenciaFinances: 0,
    colecoes: 0,
    colecaoBindings: 0,
    conversar: 0,
    corredores: 0,
    corredorLinks: 0
  };

  const acervoData = await safelyLoadJson("acervo.demo.json");
  if (acervoData) {
    console.log(`Inserting ${acervoData.length} Acervo artifacts...`);
    const { error } = await supabase.from("acervo_items").upsert(acervoData, { onConflict: "slug" });
    if (error) console.error("Error Acervo:", error.message);
    else summary.acervo = acervoData.length;
  }

  const blogData = await safelyLoadJson("blog.demo.json");
  if (blogData) {
    console.log(`Inserting ${blogData.length} Blog posts...`);
    const { error } = await supabase.from("blog_posts").upsert(blogData, { onConflict: "slug" });
    if (error) console.error("Error Blog:", error.message);
    else summary.blog = blogData.length;
  }

  const reportsSeedPath = path.join(process.cwd(), "data", "reports.seed.json");
  if (fs.existsSync(reportsSeedPath)) {
    const reportsData = JSON.parse(fs.readFileSync(reportsSeedPath, "utf-8"));
    if (Array.isArray(reportsData) && reportsData.length > 0) {
      console.log(`Inserting ${reportsData.length} Reports...`);
      const { error } = await supabase.from("reports").upsert(reportsData, { onConflict: "slug" });
      if (error) console.error("Error Reports:", error.message);
      else summary.reports = reportsData.length;
    }
  } else {
    console.warn("WARN: skipped data/reports.seed.json, file not found.");
  }

  const transData = await safelyLoadJson("transparencia.demo.json");
  if (transData) {
    if (transData.portal_links) {
      console.log(`Inserting ${transData.portal_links.length} portal links...`);
      const { error: e1 } = await supabase.from("transparency_links").upsert(transData.portal_links);
      if (e1) console.error("Error Transparency Links:", e1.message);
      else summary.transparenciaLinks = transData.portal_links.length;
    }
    if (transData.finances) {
      console.log(`Inserting ${transData.finances.length} finance records...`);
      const { error: e2 } = await supabase.from("transparency_expenses").upsert(transData.finances);
      if (e2) console.error("Error Transparency Finances:", e2.message);
      else summary.transparenciaFinances = transData.finances.length;
    }
  }

  const collData = await safelyLoadJson("collections.demo.json");
  if (collData) {
    console.log(`Inserting ${collData.length} Dossies Collections...`);
    const withoutItems = collData.map((c) => {
      const { items: _items, ...rest } = c;
      return rest;
    });

    const { error: e1 } = await supabase.from("acervo_collections").upsert(withoutItems, { onConflict: "slug" });
    if (e1) {
      console.error("Error Dossies:", e1.message);
    } else {
      summary.colecoes = withoutItems.length;
      console.log("Binding Dossie <-> Acervo relationships...");
      const rels = [];
      for (const col of collData) {
        if (col.items && col.items.length > 0) {
          const { data: colDb } = await supabase.from("acervo_collections").select("id").eq("slug", col.slug).single();
          if (!colDb) continue;

          for (let i = 0; i < col.items.length; i += 1) {
            const itemSlug = col.items[i];
            const { data: itemDb } = await supabase.from("acervo_items").select("id").eq("slug", itemSlug).single();
            if (itemDb) rels.push({ collection_id: colDb.id, item_id: itemDb.id, position: i });
          }
        }
      }

      if (rels.length > 0) {
        const { error: e2 } = await supabase.from("acervo_collection_items").upsert(rels, { onConflict: "collection_id,item_id" });
        if (e2) console.error("Error Dossie bindings:", e2.message);
        else summary.colecaoBindings = rels.length;
      }
    }
  }

  const convsData = Array.isArray(conversasDemo) ? conversasDemo : [];
  if (convsData.length > 0) {
    console.log(`Upserting ${convsData.length} Conversar topics...`);
    const { error } = await supabase.from("conversations").upsert(convsData, { onConflict: "slug" });
    if (error) console.error("Error Conversations:", error.message);
    else summary.conversar = convsData.length;
  }

  const corridorsData = Array.isArray(corredoresDemo) ? corredoresDemo : [];
  if (corridorsData.length > 0) {
    console.log(`Upserting ${corridorsData.length} Corredores...`);
    const withoutLinks = corridorsData.map((c) => {
      const { links: _links, ...rest } = c;
      return rest;
    });

    const { error: e1 } = await supabase.from("climate_corridors").upsert(withoutLinks, { onConflict: "slug" });
    if (e1) {
      console.error("Error Climate Corridors:", e1.message);
    } else {
      summary.corredores = withoutLinks.length;
      console.log("Binding Climate Corridor links...");
      const rels = [];
      for (const col of corridorsData) {
        if (col.links && col.links.length > 0) {
          const { data: colDb } = await supabase.from("climate_corridors").select("id").eq("slug", col.slug).single();
          if (!colDb) continue;

          for (let i = 0; i < col.links.length; i += 1) {
            const link = col.links[i];
            rels.push({
              corridor_id: colDb.id,
              item_kind: link.item_kind,
              item_ref: link.item_ref,
              position: i
            });
          }
        }
      }

      if (rels.length > 0) {
        const { error: e2 } = await supabase
          .from("climate_corridor_links")
          .upsert(rels, { onConflict: "corridor_id,item_kind,item_ref" });
        if (e2) console.error("Error Climate Corridor Links:", e2.message);
        else summary.corredorLinks = rels.length;
      }
    }
  }

  console.log("\nDEMO SUMMARY:");
  console.log(`- Acervo: ${summary.acervo}`);
  console.log(`- Blog: ${summary.blog}`);
  console.log(`- Reports: ${summary.reports}`);
  console.log(`- Transparencia (links): ${summary.transparenciaLinks}`);
  console.log(`- Transparencia (financas): ${summary.transparenciaFinances}`);
  console.log(`- Dossies: ${summary.colecoes}`);
  console.log(`- Dossies bindings: ${summary.colecaoBindings}`);
  console.log(`- Conversar: ${summary.conversar}`);
  console.log(`- Corredores: ${summary.corredores}`);
  console.log(`- Corredores bindings: ${summary.corredorLinks}`);

  console.log("\nDEMO OK");
  process.exit(0);
}

run();
