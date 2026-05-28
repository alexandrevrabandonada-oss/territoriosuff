import * as fs from 'node:fs';
import * as path from 'path';

// 1. Core visual files
const visualFiles = [
  path.join(process.cwd(), 'src', 'pages', 'air', 'RadarLandingPage.tsx'),
  path.join(process.cwd(), 'src', 'pages', 'air', 'IneaRadarPage.tsx'),
  path.join(process.cwd(), 'src', 'pages', 'air', 'IneaStationPage.tsx'),
  path.join(process.cwd(), 'src', 'pages', 'air', 'IneaAnalyticsPage.tsx'),
  path.join(process.cwd(), 'src', 'pages', 'air', 'IneaHistoryPage.tsx'),
  path.join(process.cwd(), 'src', 'components', 'air', 'MethodologyNotice.tsx'),
  path.join(process.cwd(), 'src', 'components', 'air', 'DataFreshnessNotice.tsx'),
  path.join(process.cwd(), 'src', 'components', 'air', 'PublicInterpretationBox.tsx'),
  path.join(process.cwd(), 'src', 'components', 'air', 'IneaHistoricalTimeline.tsx'),
  path.join(process.cwd(), 'src', 'components', 'air', 'AqiExplainer.tsx'),
  path.join(process.cwd(), 'src', 'components', 'air', 'IneaStorySummaryCard.tsx'),
  path.join(process.cwd(), 'src', 'components', 'air', 'HistoricalRawEvidenceBox.tsx'),
  path.join(process.cwd(), 'src', 'components', 'air', 'YearExplorer.tsx'),
  path.join(process.cwd(), 'src', 'components', 'air', 'ThresholdComparisonPanel.tsx'),
  path.join(process.cwd(), 'src', 'data', 'air', 'pm10-2024-station-summary.ts')
];

const reportFiles: string[] = [
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-dashboard.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-public-language.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-analytics.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-visibilidade.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-historia.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-historia-editorial.md'),
  path.join(process.cwd(), 'reports', 'post-instagram-historia-inea.md'),
  path.join(process.cwd(), 'reports', 'thread-historia-inea.md'),
  path.join(process.cwd(), 'reports', 'release-curto-historia-inea.md'),
  path.join(process.cwd(), 'reports', 'cards-carrossel-historia-inea.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-divulgacao.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-divulgacao-final.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-unificacao.md'),
  path.join(process.cwd(), 'reports', 'inea-fontes-dados-brutos-publicos.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-dados-brutos-publicos.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-evidencias-brutas.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-evidencias-export.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-weblakes-discovery.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-weblakes-replay.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-weblakes-pilot.md'),
  path.join(process.cwd(), 'reports', 'inea-weblakes-pilot-audit.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-weblakes-pm10-estacoes.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-weblakes-poluentes.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-weblakes-expansao-controlada.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-observatorio-ar-arquitetura.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-weblakes-2024.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-thresholds.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-observatorio-ar-ui.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-cache-audit-2024.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-recompute-pm10-2024-belmonte.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-recompute-pm10-2024-santa-cecilia.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-pm10-2024-comparativo-estacoes.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-observatorio-pm10-2024-publicacao.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-observatorio-pm10-2024-qa-publico.md'),
  path.join(process.cwd(), 'reports', 'post-instagram-observatorio-pm10-2024.md'),
  path.join(process.cwd(), 'reports', 'thread-observatorio-pm10-2024.md'),
  path.join(process.cwd(), 'reports', 'release-observatorio-pm10-2024.md'),
  path.join(process.cwd(), 'reports', 'carrossel-observatorio-pm10-2024.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-observatorio-lancamento-pm10.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-observatorio-lancamento-pm10-final.md'),
  path.join(process.cwd(), 'reports', 'post-instagram-observatorio-pm25-2024.md'),
  path.join(process.cwd(), 'reports', 'thread-observatorio-pm25-2024.md'),
  path.join(process.cwd(), 'reports', 'release-observatorio-pm25-2024.md'),
  path.join(process.cwd(), 'reports', 'carrossel-observatorio-pm25-2024.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-observatorio-lancamento-pm25-final.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-observatorio-pm25-2024-final-ajustado.md'),
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-historico-2022-2023.md')
];

const reportsDir = path.join(process.cwd(), 'reports');
if (fs.existsSync(reportsDir)) {
  const files = fs.readdirSync(reportsDir);
  for (const file of files) {
    if (file.startsWith('inea') && file.endsWith('.md')) {
      reportFiles.push(path.join(reportsDir, file));
    }
  }
}

// Deduplicate files to scan
const FILES_TO_SCAN = Array.from(new Set([...visualFiles, ...reportFiles]));

const FORBIDDEN_TERMS = [
  'tempo real',
  'em tempo real',
  'ao vivo',
  'live',
  'viva minuto a minuto',
  'resolução horária viva'
];

const EXCEPTION_MARKERS = [
  'não é tempo real',
  'não representa tempo real',
  'não implementado',
  'roadmap futuro',
  'futuro',
  'roadmap'
];

async function runLanguageScan() {
  console.log("Starting expanded INEA public language QA compliance scan...");
  let violations = 0;

  for (const filePath of FILES_TO_SCAN) {
    if (!fs.existsSync(filePath)) {
      console.warn(`Warning: File not found at ${filePath}, skipping scan.`);
      continue;
    }

    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split(/\r?\n/);

    lines.forEach((line, idx) => {
      const lowerLine = line.toLowerCase();
      
      for (const term of FORBIDDEN_TERMS) {
        const matchesTerm = term === 'live'
          ? (/\blive\b/i).test(line)
          : lowerLine.includes(term);

        if (matchesTerm) {
          // Check if it has an exception marker
          const hasException = EXCEPTION_MARKERS.some(marker => lowerLine.includes(marker));
          
          if (!hasException) {
            console.error(
              `FAIL: Forbidden term "${term}" found in ${path.relative(process.cwd(), filePath)} at line ${idx + 1}:`
            );
            console.error(`  > ${line.trim()}`);
            violations++;
          } else {
            console.log(
              `PASS (Exception): Forbidden term "${term}" found but ignored due to exception context in ${path.relative(process.cwd(), filePath)} at line ${idx + 1}:`
            );
            console.log(`  > ${line.trim()}`);
          }
        }
      }
    });
  }

  console.log("\n------------------------------------------------");
  if (violations > 0) {
    console.error(`QA LANGUAGE COMPLIANCE FAILED: ${violations} forbidden terminology usage(s) found.`);
    process.exit(1);
  } else {
    console.log("QA LANGUAGE COMPLIANCE PASSED: All files are compliant with freshness vocabulary guidelines.");
    process.exit(0);
  }
}

void runLanguageScan();
