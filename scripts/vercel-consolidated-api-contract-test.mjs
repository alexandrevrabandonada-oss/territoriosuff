#!/usr/bin/env node
import assert from "node:assert/strict";
import { readdirSync,readFileSync } from "node:fs";
import { join } from "node:path";
const config=JSON.parse(readFileSync("vercel.json","utf8"));
const inea=["summary","stations","latest","observability","export-catalog","export-manifest","stations-metadata","classification-days","timeseries","export","analytics/data-gaps","analytics/degraded-days","analytics/monthly-profile","analytics/station-ranking","analytics/controller-frequency"];
const shares=["blog","dados","acervo","agenda","dossies","boletim","relatorios"];
for(const name of inea){
 assert(config.rewrites.some(r=>r.source==="/api/air/inea/"+name&&r.destination==="/api/inea-router?endpoint="+name),"INEA endpoint not forwarded: "+name);
 assert(readFileSync("api/inea-router.ts","utf8").includes('"'+name+'":'),"INEA router missing handler "+name);
}
for(const name of shares){
 assert(config.rewrites.some(r=>r.source==="/api/share/"+name&&r.destination==="/api/share-router?endpoint="+name),"Share endpoint not forwarded: "+name);
 assert(readFileSync("api/share-router.ts","utf8").includes('"'+name+'":'),"Share router missing handler "+name);
}
for(const item of config.rewrites.filter(r=>r.source?.startsWith("/s/"))) assert(!item.destination.includes("/api/share/"),"Share shortcut must use direct router rewrite");
const files=(dir)=>readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?files(join(dir,e.name)):[join(dir,e.name)]).filter(x=>/\.[cm]?[jt]s$/.test(x));
const apiFiles=files("api");
assert(apiFiles.length<=12,"Hobby Vercel API file limit exceeded ("+apiFiles.length+")");
for(const file of apiFiles) assert(!file.includes("/air/inea/")&&!file.includes("/share/"),"Old API entrypoint still present "+file);
for(const name of inea) assert(readFileSync("server/air/inea/"+name+".ts","utf8").includes("export default"),"INEA handler missing "+name);
for(const name of shares) assert(readFileSync("server/share/"+name+".ts","utf8").includes("export default"),"Share handler missing "+name);
console.log("Vercel consolidated API contract passed: "+inea.length+" INEA routes, "+shares.length+" share routes, "+apiFiles.length+" function files.");
