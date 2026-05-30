import * as fs from 'node:fs';
import * as path from 'node:path';

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
  } catch (err: any) {
    const responseTimeMs = Date.now() - startTime;
    return {
      name,
      url,
      type,
      expectedStatus: 200,
      actualStatus: 0,
      ok: false,
      responseTimeMs,
      notes: `Connection failed: ${err.message}`
    };
  }
}

async function main() {
  const targetHost = process.env.OBSERVATORIO_BASE_URL || process.env.HEALTHCHECK_TARGET_URL || process.argv[2] || 'https://semear-pwa.vercel.app';
  console.log(`Starting Observatório do Ar Healthcheck against: ${targetHost}`);
  
  const results: CheckResult[] = [];

  // 1. Pages Smoke Check
  results.push(await performCheck('Portal - Radar INEA', `${targetHost}/qualidade-ar/inea`, 'page', 'text/html'));
  results.push(await performCheck('Portal - Metodologia', `${targetHost}/qualidade-ar/inea/metodologia`, 'page', 'text/html'));
  results.push(await performCheck('Portal - Dados Gerais', `${targetHost}/dados`, 'page', 'text/html'));

  // 2. Manifest Check
  const manifestResult = await performCheck('Dataset Manifest', `${targetHost}/data/air/manifest.json`, 'manifest', 'application/json');
  results.push(manifestResult);

  // 3. API Checks
  results.push(await performCheck('API: Resumo Geral', `${targetHost}/api/air/inea/summary`, 'api', 'application/json'));
  results.push(await performCheck('API: Últimas Leituras', `${targetHost}/api/air/inea/latest`, 'api', 'application/json'));
  results.push(await performCheck('API: Classificação IQAr', `${targetHost}/api/air/inea/classification-days`, 'api', 'application/json'));
  results.push(await performCheck('API: Lacunas (Gaps)', `${targetHost}/api/air/inea/analytics/data-gaps`, 'api', 'application/json'));

  // 4. CSV Dataset Checks (dynamically extracted from Manifest if manifest succeeded, else fallback)
  let datasetsToTest = [
    { file: 'pm10-2020-station-summary.csv', title: 'Resumo PM10 2020' },
    { file: 'pm10-2021-station-summary.csv', title: 'Resumo PM10 2021' },
    { file: 'pm25-2021-station-summary.csv', title: 'Resumo PM2.5 2021' },
    { file: 'pm10-2024-station-summary.csv', title: 'Resumo PM10 2024' },
    { file: 'pm25-2024-station-summary.csv', title: 'Resumo PM2.5 2024' },
    { file: 'pm10-2025-station-summary.csv', title: 'Resumo PM10 2025' },
    { file: 'pm25-2025-station-summary.csv', title: 'Resumo PM2.5 2025' },
    { file: 'pm10-2026-partial-station-summary.csv', title: 'Resumo PM10 2026 Parcial' },
    { file: 'pm25-2026-partial-station-summary.csv', title: 'Resumo PM2.5 2026 Parcial' },
    { file: 'particulate-timeline-2020-2026.csv', title: 'Linha do Tempo 2020-2026' },
    { file: 'attention-episodes-2020-2026.csv', title: 'Episódios de Atenção' },
    { file: 'data-dictionary.csv', title: 'Dicionário de Dados' }
  ];

  if (manifestResult.ok) {
    try {
      const res = await fetch(`${targetHost}/data/air/manifest.json`);
      const manifest = await res.json();
      datasetsToTest = manifest.datasets.map((d: any) => ({
        file: d.filename,
        title: d.title
      }));
    } catch {
      console.warn("Could not dynamically load datasets list from manifest, using default fallback list");
    }
  }

  for (const ds of datasetsToTest) {
    const csvUrl = `${targetHost}/data/air/${ds.file}`;
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
