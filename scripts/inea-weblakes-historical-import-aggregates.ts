import * as fs from 'node:fs';
import * as path from 'node:path';

const seedPath = path.join(process.cwd(), 'data', 'inea_historical_sources', 'seed-public-findings.json');
const outputPath = path.join(process.cwd(), 'data', 'inea_historical_sources', 'normalized.json');
const reportPath = path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-historico-agregado.md');

function importAggregates() {
  console.log(`Importing Historical Aggregated Evidence from ${seedPath}...`);

  if (!fs.existsSync(seedPath)) {
    console.error(`Seed file not found at ${seedPath}`);
    process.exit(1);
  }

  const rawSeed = fs.readFileSync(seedPath, 'utf8');
  const seedList = JSON.parse(rawSeed);

  const normalizedList = seedList.map((item: any) => ({
    source_id: item.source_id,
    source_title: item.source_title,
    source_type: item.source_type,
    source_url: item.source_url,
    station_name: item.station_name,
    pollutant: item.pollutant,
    metric: item.metric,
    year: item.year,
    period_start: item.period_start,
    period_end: item.period_end,
    value: item.value,
    unit: item.unit,
    confidence: item.confidence,
    data_quality_tier: "HISTORICAL_AGGREGATE",
    notes: item.notes
  }));

  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, JSON.stringify(normalizedList, null, 2), 'utf8');
  console.log(`Saved normalized aggregated evidence to: ${outputPath}`);

  // Build the markdown report
  let reportContent = `# Estado da Nação — Dados Históricos Agregados

**Data do Relatório:** ${new Date().toISOString()}  
**Fonte Principal:** Inventário de Evidências Físicas de Qualidade do Ar  
**Status do Dataset:** Normalizado com sucesso (${normalizedList.length} registros importados)

---

## 1. Visão Geral das Fontes Históricas Importadas

Abaixo está o catálogo completo de evidências de concentrações físicas agregadas extraídas de publicações científicas e relatórios oficiais do INEA/IEMA:

| Fonte | Período | Estação | Poluente | Métrica | Valor | Confiança |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
`;

  for (const item of normalizedList) {
    const periodStr = item.year ? `${item.year}` : `${item.period_start} a ${item.period_end}`;
    const valueStr = `${item.value} ${item.unit}`;
    
    // Shorten source title for table presentation
    const shortTitle = item.source_title.length > 50 
      ? item.source_title.slice(0, 47) + "..." 
      : item.source_title;

    reportContent += `| [${shortTitle}](${item.source_url}) | ${periodStr} | ${item.station_name} | ${item.pollutant} | ${item.metric} | ${valueStr} | ${item.confidence} |\n`;
  }

  reportContent += `\n---

## 2. Lógica de Qualidade dos Dados (Tiers)

Todos os registros contidos no dataset recebem a tag canônica:
\`data_quality_tier = HISTORICAL_AGGREGATE\`

Isso diferencia as métricas agregadas vindas de relatórios pretéritos (2013-2018) das concentrações horárias ativas (\`RAW_PUBLIC_PLATFORM\`) e da base de índices dimensionais (\`PUBLIC_INDEX\`), evitando distorções nas exibições públicas do portal.
`;

  fs.writeFileSync(reportPath, reportContent, 'utf8');
  console.log(`Generated report at: ${reportPath}`);
}

importAggregates();
