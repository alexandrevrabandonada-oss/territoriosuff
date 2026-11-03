#!/usr/bin/env node
/** Regression guard: public UFF page must never read raw Aurassure observations. */
import assert from "node:assert/strict";
import fs from "node:fs";

const read = (path) => fs.readFileSync(path, "utf8");

const app = read("src/App.tsx");
const page = read("src/pages/air/AurassureUffPage.tsx");
const landing = read("src/pages/air/RadarLandingPage.tsx");
const metadata = read("src/content/siteMetadata.ts");
const vercel = JSON.parse(read("vercel.json"));
const sitemap = read("public/sitemap.xml");
const migration = read("supabase/migrations/20261103152500_aurassure_public_release_approval_gate.sql");
const qa = read("supabase/migrations/20261103153500_aurassure_private_qa_annotations_first_gas_decay.sql");
const provenance = read("supabase/migrations/20261103165300_aurassure_enforce_public_release_provenance.sql");
const stationHealth = read("supabase/migrations/20261103165900_aurassure_station_level_operational_health.sql");

assert(app.includes('path="/qualidade-ar/uff"'), "UFF route missing from SPA router.");
assert(landing.includes('to="/qualidade-ar/uff"'), "UFF route missing from network landing.");
assert(metadata.includes('path: "/qualidade-ar/uff"'), "UFF SEO metadata missing.");
assert(vercel.rewrites.some((route) => route.source === "/qualidade-ar/uff" && route.destination === "/_seo/qualidade-ar--uff.html"), "UFF Vercel rewrite missing.");
assert(sitemap.includes("https://www.semearsf.org/qualidade-ar/uff"), "UFF canonical sitemap entry missing.");
assert(page.includes('.from("aurassure_public_measurements")'), "Page must query the reviewed-only table.");
assert(!page.includes("aurassure_measurements_staging"), "Page must not query the private staging dataset.");
assert(!page.includes("aurassure_api_snapshots"), "Page must not query original vendor snapshots.");
assert(!page.includes("AURASSURE_BRIDGE_TOKEN") && !page.includes("AURASSURE_ACCESS_KEY"), "No operator or vendor secrets in the browser.");
assert(page.includes("Ainda não há uma série aprovada"), "No-data state must explain publication approval.");
assert(page.includes("Não transformamos automaticamente o AQI"), "Page must distinguish the vendor AQI from the INEA IQAr.");
assert(migration.includes("enable row level security"), "Public table must enable RLS.");
assert(migration.includes("publication_state='published'"), "Public table policy must require publication approval.");
assert(migration.includes("grant select on public.aurassure_public_measurements to anon, authenticated"), "Public role needs read-only rights.");
assert(!migration.includes("insert into public.aurassure_public_measurements"), "Migration must not release unreviewed data automatically.");
assert(qa.includes("block_release") && qa.includes("cause', 'unconfirmed'"), "Anomaly must remain blocked and its cause explicitly unconfirmed.");
assert(provenance.includes("create trigger aurassure_enforce_public_release_provenance"), "Publication trigger must remain installed.");
assert(provenance.includes("source checksum mismatch"), "Public release must preserve original SHA-256.");
assert(provenance.includes("qa_status <> 'approved_for_publication'"), "Publication must require QA approval.");
assert(provenance.includes("qa.severity = 'block_release'"), "Open QA blockers must prevent release.");
assert(stationHealth.includes("coverage_degraded"), "Per-station operational coverage must be tracked.");
assert(stationHealth.includes("revoke all on aurassure_internal.station_health from public,anon,authenticated"), "Station health must remain private by default.");
console.log("Aurassure portal release contract: 22 checks passed.");
