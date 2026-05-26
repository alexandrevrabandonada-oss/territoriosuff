import * as fs from 'node:fs';
import * as path from 'node:path';

// Mock process.env from .env.local if running locally
const ENV_FILE = fs.existsSync('.env.local') ? '.env.local' : '.env';
function parseEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) return {};
  const raw = fs.readFileSync(filePath, 'utf8');
  const env: Record<string, string> = {};
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const idx = trimmed.indexOf('=');
    if (idx <= 0) continue;
    const key = trimmed.slice(0, idx).trim();
    let value = trimmed.slice(idx + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    env[key] = value;
  }
  return env;
}

const env = parseEnvFile(ENV_FILE);
for (const [k, v] of Object.entries(env)) {
  process.env[k] = v;
}

// Mock Response object
class MockResponse {
  statusCode: number = 200;
  headers: Record<string, string> = {};
  body: any = null;

  status(code: number) {
    this.statusCode = code;
    return this;
  }

  setHeader(name: string, value: string) {
    this.headers[name] = value;
    return this;
  }

  json(data: any) {
    this.body = data;
    return this;
  }

  send(data: any) {
    this.body = data;
    return this;
  }
}

const routes = [
  { name: "summary", path: "../api/air/inea/summary.ts" },
  { name: "stations", path: "../api/air/inea/stations.ts" },
  { name: "latest", path: "../api/air/inea/latest.ts" },
  { name: "timeseries", path: "../api/air/inea/timeseries.ts", query: { stationId: "c2e564ad-1d22-488c-9c71-248dbb96277b", metricType: "GENERAL_AQI" } },
  { name: "classification-days", path: "../api/air/inea/classification-days.ts" },
  { name: "analytics/degraded-days", path: "../api/air/inea/analytics/degraded-days.ts" },
  { name: "analytics/controller-frequency", path: "../api/air/inea/analytics/controller-frequency.ts" },
  { name: "analytics/monthly-profile", path: "../api/air/inea/analytics/monthly-profile.ts" },
  { name: "analytics/station-ranking", path: "../api/air/inea/analytics/station-ranking.ts" },
  { name: "analytics/data-gaps", path: "../api/air/inea/analytics/data-gaps.ts" }
];

async function runDiagnostics() {
  console.log("=== INEA PUBLIC ROUTES DIAGNOSTICS ===");
  console.log(`Using Env File: ${ENV_FILE}`);
  console.log(`SUPABASE_URL: ${process.env.SUPABASE_URL ? "Present" : "Missing"}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${process.env.SUPABASE_SERVICE_ROLE_KEY ? "Present" : "Missing"}`);
  console.log(`VITE_SUPABASE_URL: ${process.env.VITE_SUPABASE_URL ? "Present" : "Missing"}`);
  console.log(`VITE_SUPABASE_ANON_KEY: ${process.env.VITE_SUPABASE_ANON_KEY ? "Present" : "Missing"}`);
  console.log("--------------------------------------\n");

  const results: any[] = [];

  for (const route of routes) {
    console.log(`Testing: ${route.name} (${route.path})`);
    try {
      const handlerModule = await import(route.path);
      const handler = handlerModule.default;

      const req = {
        method: "GET",
        query: route.query || {},
        headers: {}
      };
      const res = new MockResponse();

      await handler(req, res);

      const errorClass = analyzeError(res.statusCode, res.body);

      results.push({
        name: route.name,
        status: res.statusCode,
        ok: res.statusCode === 200,
        body: res.body,
        analysis: errorClass
      });

      console.log(`  Result: Status ${res.statusCode} | Ok: ${res.statusCode === 200}`);
      if (res.statusCode !== 200) {
        console.log(`  Body:`, JSON.stringify(res.body));
      }
    } catch (err: any) {
      console.error(`  Import or Execution Error for ${route.name}:`, err.message);
      results.push({
        name: route.name,
        status: 500,
        ok: false,
        error: err.message,
        analysis: {
          envMissing: false,
          rlsIssue: false,
          missingSchema: false,
          badQuery: true,
          noData: false,
          summary: "Execution crash: " + err.message
        }
      });
    }
    console.log();
  }

  // Generate markdown report
  generateReport(results);
}

function analyzeError(status: number, body: any) {
  const analysis = {
    envMissing: false,
    rlsIssue: false,
    missingSchema: false,
    badQuery: false,
    noData: false,
    summary: "No error"
  };

  if (status === 200) {
    if (Array.isArray(body) && body.length === 0) {
      analysis.noData = true;
      analysis.summary = "No data returned (table might be empty)";
    } else if (body && typeof body === 'object' && !Array.isArray(body) && Object.keys(body).length === 0) {
      analysis.noData = true;
      analysis.summary = "Empty object returned";
    }
    return analysis;
  }

  const errMsg = body?.error || body?.message || JSON.stringify(body) || "";
  const errMsgLower = errMsg.toLowerCase();

  if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    analysis.envMissing = true;
    analysis.summary = "Missing environment variables (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY)";
  } else if (errMsgLower.includes("api key") || errMsgLower.includes("invalid key") || errMsgLower.includes("jwt")) {
    analysis.envMissing = true;
    analysis.summary = "Invalid or expired Supabase key configuration";
  } else if (errMsgLower.includes("rls") || errMsgLower.includes("permission denied") || errMsgLower.includes("policy") || errMsgLower.includes("insufficient privilege")) {
    analysis.rlsIssue = true;
    analysis.summary = "RLS Policy / Supabase permission denied";
  } else if (errMsgLower.includes("relation") && errMsgLower.includes("does not exist")) {
    analysis.missingSchema = true;
    analysis.summary = "Table or relation does not exist in schema";
  } else if (errMsgLower.includes("column") && errMsgLower.includes("does not exist")) {
    analysis.missingSchema = true;
    analysis.summary = "Column does not exist in schema";
  } else if (errMsgLower.includes("syntax") || errMsgLower.includes("malformed") || errMsgLower.includes("bad request") || errMsgLower.includes("invalid input")) {
    analysis.badQuery = true;
    analysis.summary = "SQL Syntax or malformed query error";
  } else {
    analysis.badQuery = true;
    analysis.summary = "Server or database query error: " + errMsg;
  }

  return analysis;
}

function generateReport(results: any[]) {
  const reportPath = path.join(process.cwd(), 'reports', 'diag-inea-public-routes.md');
  
  let md = `# Diagnóstico de Rotas Públicas do Radar do Ar INEA\n\n`;
  md += `**Data do Diagnóstico:** ${new Date().toISOString()}  \n`;
  md += `**Ambiente Testado:** Local (simulando Serverless via .env.local)  \n\n`;
  
  md += `## Resumo Geral\n\n`;
  md += `| Rota | Status | OK | Causa do Erro (se houver) |\n`;
  md += `| :--- | :---: | :---: | :--- |\n`;
  for (const r of results) {
    md += `| \`${r.name}\` | ${r.status} | ${r.ok ? "✅ Sim" : "❌ Não"} | ${r.ok ? "Nenhum" : r.analysis.summary} |\n`;
  }
  md += `\n\n`;

  md += `## Detalhamento por Rota\n\n`;
  for (const r of results) {
    md += `### Rota: \`${r.name}\`\n`;
    md += `- **Status HTTP:** ${r.status}\n`;
    md += `- **Sucesso:** ${r.ok ? "Sim" : "Não"}\n`;
    if (!r.ok) {
      md += `- **Análise do Erro:** ${r.analysis.summary}\n`;
      md += `- **Corpo do Erro:** \n\`\`\`json\n${JSON.stringify(r.body || r.error, null, 2)}\n\`\`\`\n`;
    } else {
      const sample = Array.isArray(r.body) ? r.body.slice(0, 2) : r.body;
      md += `- **Amostra da Resposta:** \n\`\`\`json\n${JSON.stringify(sample, null, 2).substring(0, 500)}...\n\`\`\`\n`;
    }
    md += `\n---\n\n`;
  }

  md += `## Próximos Passos recomendados\n\n`;
  md += `1. **Verificar Env Vars no Deploy Vercel:** Se todos os testes locais funcionam perfeitamente mas falham no deploy público, a causa provável é a falta das variáveis de ambiente \`SUPABASE_URL\` e \`SUPABASE_SERVICE_ROLE_KEY\` no dashboard da Vercel para o ambiente de produção.\n`;
  md += `2. **RLS e Políticas Públicas:** Se ocorrerem erros de permissão/RLS, certificar-se de que os acessos anônimos para leitura (\`select\`) estão explicitamente liberados para as tabelas \`air_stations\` e \`air_measurements\` com o anon key, ou que a API Serverless está usando corretamente a key bypass (\`service_role\`) que não deve ser exposta no frontend.\n`;

  fs.writeFileSync(reportPath, md, 'utf8');
  console.log(`Saved diagnostics report to ${reportPath}`);
}

runDiagnostics().catch(console.error);
