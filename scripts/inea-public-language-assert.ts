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
  path.join(process.cwd(), 'src', 'components', 'air', 'HistoricalRawEvidenceBox.tsx')
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
  path.join(process.cwd(), 'reports', 'estado-da-nacao-inea-weblakes-expansao-controlada.md')
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
