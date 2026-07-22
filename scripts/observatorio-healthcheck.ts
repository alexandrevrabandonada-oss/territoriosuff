import * as fs from 'node:fs';
import * as path from 'node:path';

import {
  AIR_PUBLIC_DATA_BASE_PATH,
  AIR_PUBLIC_FILES,
  type AirPublicManifest
} from '../src/data/air/public-downloads';

// Define structures for our checks
interface CheckResult {
  name: string;
  url: string;
  type: 'page' | 'manifest' | 'csv' | 'api';
  expectedStatus: number;
  actualStatus: number;
  ok: boolean;
  responseTimeMs: number;
  notes: string;
}

async function performCheck(
  name: string,
  url: string,
  type: 'page' | 'manifest' | 'csv' | 'api',
  expectedContentType?: string
): Promise<CheckResult> {
  const startTime = Date.now();
  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': type === 'api' || type === 'manifest' ? 'application/json' : '*/*'
      }
    });

    const responseTimeMs = Date.now() - startTime;
    const contentType = res.headers.get('content-type') || '';
    const bodyText = await res.text();

    let ok = res.status === 200;
    let notes = '';

    if (ok) {
      if (expectedContentType && !contentType.toLowerCase().includes(expectedContentType.toLowerCase())) {
        ok = false;
        notes = `Content-Type mismatch. Expected containing "${expectedContentType}", got "${contentType}"`;
      } else if (type === 'csv') {
        // Extra check for CSV to make sure it's not returning HTML error pages as 200
        const isHtml = bodyText.trim().startsWith('<!DOCTYPE html>') || bodyText.trim().startsWith('<html');
        if (isHtml) {
          ok = false;
          notes = 'Returned HTML instead of raw CSV file';
        } else {
          const lines = bodyText.split('\n').filter(l => l.trim().length > 0);
          notes = `CSV content valid. Row count parsed: ${lines.length - 1} (excluding headers)`;
        }
      } else if (type === 'manifest') {
        try {
          const parsed = JSON.parse(bodyText);
          if (!parsed.datasets || !Array.isArray(parsed.datasets)) {
            ok = false;
            notes = 'Manifest JSON is missing "datasets" array';
          } else {
            notes = `Manifest parsed. Version: ${parsed.version || parsed.dataset_version || 'unknown'}, datasets: ${parsed.datasets.length}`;
          }
        } catch {
          ok = false;
          notes = 'Failed to parse manifest body as JSON';
        }
      } else if (type === 'api') {
        try {
          JSON.parse(bodyText);
          notes = 'API JSON parsed successfully';
        } catch {
          ok = false;
          notes = 'Failed to parse API response as JSON';
        }
      }
    } else {
      notes = `HTTP status code: ${res.status}`;
    }

    return {
      name,
      url,
      type,
      expectedStatus: 200,
      actualStatus: res.status,
      ok,
      responseTimeMs,
      notes
    };
  } catch (err: unknown) {
    const responseTimeMs = Date.now() - startTime;
    const message = err instanceof Error ? err.message : String(err);
    return {
      name,
      url,
      type,
      expectedStatus: 200,
      actualStatus: 0,
      ok: false,
      responseTimeMs,
      notes: `Connection failed: ${message}`
    };
  }
}

async function main() {
  const targetHost = process.env.OBSERVATORIO_BASE_URL || process.env.HEALTHCHECK_TARGET_URL || process.argv[2] || 'https://www.semearsf.org';
  console.log(`Starting Observatório do Ar Healthcheck against: ${targetHost}`);
  
  const results: CheckResult[] = [];

  // 1. Pages Smoke Check
  results.push(await performCheck('Portal - Radar INEA', `${targetHost}/qualidade-ar/inea`, 'page', 'text/html'));
  results.push(await performCheck('Portal - Metodologia', `${targetHost}/qualidade-ar/inea/metodologia`, 'page', 'text/html'));
  results.push(await performCheck('Portal - Dados Gerais', `${targetHost}/dados`, 'page', 'text/html'));

  // 2. Manifest Check
  const manifestResult = await performCheck('Dataset Manifest', `${targetHost}${AIR_PUBLIC_DATA_BASE_PATH}/manifest.json`, 'manifest', 'application/json');
  results.push(manifestResult);

  // 3. API Checks
  const criticalApiChecks = [
    ['API: Resumo Geral', '/api/air/inea/summary'],
    ['API: Estações', '/api/air/inea/stations'],
    ['API: Últimas Leituras', '/api/air/inea/latest'],
    ['API: Observabilidade', '/api/air/inea/observability'],
    ['API: Catálogo de Exportação', '/api/air/inea/export-catalog'],
    ['API: Classificação IQAr', '/api/air/inea/classification-days'],
    ['API: Dias Degradados', '/api/air/inea/analytics/degraded-days'],
    ['API: Poluente Controlador', '/api/air/inea/analytics/controller-frequency'],
    ['API: Perfil Mensal', '/api/air/inea/analytics/monthly-profile'],
    ['API: Ranking de Estações', '/api/air/inea/analytics/station-ranking'],
    ['API: Lacunas (Gaps)', '/api/air/inea/analytics/data-gaps']
  ] as const;

  const criticalApiResults = await Promise.all(
    criticalApiChecks.map(([name, pathname]) =>
      performCheck(name, `${targetHost}${pathname}`, 'api', 'application/json')
    )
  );
  results.push(...criticalApiResults);

  // 3.5. Social Layer Checks
  const socialManifestResult = await performCheck('Social Dataset Manifest', `${targetHost}/data/social/manifest.json`, 'manifest', 'application/json');
  results.push(socialManifestResult);

  results.push(await performCheck('CSV: Setores Censitários de Vulnerabilidade', `${targetHost}/data/social/vr-vulnerabilidade-setores-2022.csv`, 'csv', 'text/csv'));
  results.push(await performCheck('CSV: Equipamentos Sensíveis', `${targetHost}/data/social/equipamentos-sensiveis-vr.csv`, 'csv', 'text/csv'));
  results.push(await performCheck('CSV: Dicionário de Dados Sociais', `${targetHost}/data/social/social-data-dictionary.csv`, 'csv', 'text/csv'));

  // 4. CSV Dataset Checks (dynamically extracted from Manifest if manifest succeeded, else fallback)
  let datasetsToTest = AIR_PUBLIC_FILES
    .filter((item) => item.format === 'CSV')
    .map((item) => ({ file: item.file, title: item.file }));

  if (manifestResult.ok) {
    try {
      const res = await fetch(`${targetHost}${AIR_PUBLIC_DATA_BASE_PATH}/manifest.json`);
      const manifest = (await res.json()) as AirPublicManifest;
      datasetsToTest = (manifest.datasets || []).map((d) => ({
        file: d.filename,
        title: d.title
      }));
    } catch {
      console.warn("Could not dynamically load datasets list from manifest, using default fallback list");
    }
  }

  for (const ds of datasetsToTest) {
    const csvUrl = `${targetHost}${AIR_PUBLIC_DATA_BASE_PATH}/${ds.file}`;
    results.push(await performCheck(`CSV: ${ds.title}`, csvUrl, 'csv', 'text/csv'));
  }

  // 5. Generate Markdown Report
  const totalChecks = results.length;
  const passedChecks = results.filter(r => r.ok).length;
  const failedChecks = totalChecks - passedChecks;
  const isHealthy = failedChecks === 0;

  const timestampLocal = new Date().toLocaleString('pt-BR', { timeZone: 'America/Sao_Paulo' });
  const timestampUtc = new Date().toISOString();

  let mdReport = `# Relatório de Healthcheck do Observatório do Ar

Este relatório apresenta o status operacional automatizado das rotas públicas, APIs de backend e datasets abertos do Observatório do Ar em Volta Redonda.

---

## 1. Resumo do Diagnóstico

*   **Host Alvo:** [${targetHost}](${targetHost})
*   **Data e Hora Local:** ${timestampLocal} (Horário de Brasília)
*   **Data e Hora UTC:** \`${timestampUtc}\`
*   **Total de Testes:** ${totalChecks}
*   **Aprovados:** ${passedChecks} ✅
*   **Falhas:** ${failedChecks}${failedChecks > 0 ? ' ❌' : ''}
*   **Status de Saúde Geral:** ${isHealthy ? '**PASS (SAUDÁVEL)** 🟢' : '**FAIL (INCONSISTENTE)** 🔴'}

---

## 2. Detalhamento dos Componentes

| Recurso | Tipo | URL Testada | Status HTTP | Tempo de Resp. | Status | Notas |
| :--- | :---: | :--- | :---: | :---: | :---: | :--- |
`;

  for (const r of results) {
    const statusIcon = r.ok ? '✅ PASS' : '❌ FAIL';
    mdReport += `| **${r.name}** | \`${r.type}\` | [Link](${r.url}) | ${r.actualStatus} | ${r.responseTimeMs} ms | ${statusIcon} | ${r.notes} |\n`;
  }

  mdReport += `
---

## 3. Veredito Operacional

`;

  if (isHealthy) {
    mdReport += `> [!TIP]
> **VEREDITO: SISTEMA 100% OPERACIONAL E SAUDÁVEL**
> Todos os serviços de API, páginas estáticas, manifesto e downloads físicos estão integrados e respondendo corretamente com status 200 e content-type válidos. O portal de transparência está plenamente funcional.
`;
  } else {
    mdReport += `> [!CAUTION]
> **VEREDITO: ANOMALIA DETECTADA**
> Pelo menos um componente falhou no teste de integridade física. Verifique os logs e as conexões do banco Supabase ou o build da Vercel imediatamente.
`;
  }

  const reportsDir = path.join(process.cwd(), 'reports');
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
  }

  fs.writeFileSync(path.join(reportsDir, 'observatorio-healthcheck-latest.md'), mdReport, 'utf8');
  console.log(`Healthcheck complete. Report written to: reports/observatorio-healthcheck-latest.md`);
  console.log(`Status: ${isHealthy ? 'PASS' : 'FAIL'} (${passedChecks}/${totalChecks} passed)`);

  if (!isHealthy) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

void main();
