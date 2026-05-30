import * as fs from 'node:fs';
import * as path from 'node:path';

const STATIONS = [
  { id: '69', name: 'VR - Belmonte' },
  { id: '70', name: 'VR - Retiro' },
  { id: '71', name: 'VR - Santa Cecília' }
];

const POLLUTANTS = [
  { id: '18', pollutant: 'PM10' },
  { id: '20', pollutant: 'PM2.5' }
];

interface AuditResult {
  year: number;
  stationId: string;
  stationName: string;
  pollutantId: string;
  pollutantName: string;
  annualWho: number;
  sumMonthlyWho: number;
  whoMatches: boolean;
  annualConama: number;
  sumMonthlyConama: number;
  conamaMatches: boolean;
}

function auditYear(year: number): AuditResult[] {
  const summaryPath = path.join(process.cwd(), 'data', 'inea_weblakes_normalized', `summary-${year}.json`);
  if (!fs.existsSync(summaryPath)) {
    throw new Error(`Summary file not found: ${summaryPath}`);
  }

  const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf8'));
  const results: AuditResult[] = [];

  for (const station of STATIONS) {
    const stationData = summary[station.id];
    if (!stationData) {
      throw new Error(`Station ${station.id} not found in summary-${year}.json`);
    }

    for (const pollutant of POLLUTANTS) {
      const pollData = stationData.pollutants[pollutant.id];
      if (!pollData) {
        throw new Error(`Pollutant ${pollutant.id} not found for station ${station.id} in summary-${year}.json`);
      }

      const annualWho = pollData.exceedances?.WHO_24H ?? 0;
      const annualConama = pollData.exceedances?.BR_24H_FINAL ?? 0;

      let sumMonthlyWho = 0;
      let sumMonthlyConama = 0;

      if (pollData.months) {
        for (const [_monthKey, mData] of Object.entries<any>(pollData.months)) {
          sumMonthlyWho += mData.exceedances?.WHO_24H ?? 0;
          sumMonthlyConama += mData.exceedances?.BR_24H_FINAL ?? 0;
        }
      }

      results.push({
        year,
        stationId: station.id,
        stationName: station.name,
        pollutantId: pollutant.id,
        pollutantName: pollutant.pollutant,
        annualWho,
        sumMonthlyWho,
        whoMatches: annualWho === sumMonthlyWho,
        annualConama,
        sumMonthlyConama,
        conamaMatches: annualConama === sumMonthlyConama
      });
    }
  }

  return results;
}

function run() {
  console.log('Iniciando auditoria matemática de somas excedentes (Lote B - 2020-2021)...');
  
  const results2020 = auditYear(2020);
  const results2021 = auditYear(2021);
  const allResults = [...results2020, ...results2021];

  let hasErrors = false;
  let reportMd = `# Estado da Nação — Auditoria de Somas de Excedências (2020-2021)

**Data da Auditoria:** ${new Date().toISOString().split('T')[0]}  
**Objetivo:** Verificar a consistência matemática entre as somas das ultrapassagens mensais e os totais consolidados anuais para os poluentes PM10 e PM2.5 (2020-2021).  
**Metodologia:** Validação cruzada estrita (100% de match exigido).

---

## 1. Relatório de Validação Cruzada

| Ano | Estação | Poluente | Total Anual OMS | Soma Mensal OMS | Match OMS | Total Anual CONAMA | Soma Mensal CONAMA | Match CONAMA |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: | :---: | :---: |
`;

  for (const r of allResults) {
    const whoMatchIcon = r.whoMatches ? '✅' : '❌';
    const conamaMatchIcon = r.conamaMatches ? '✅' : '❌';

    if (!r.whoMatches || !r.conamaMatches) {
      hasErrors = true;
    }

    reportMd += `| ${r.year} | ${r.stationName} (${r.stationId}) | ${r.pollutantName} | ${r.annualWho} | ${r.sumMonthlyWho} | ${whoMatchIcon} | ${r.annualConama} | ${r.sumMonthlyConama} | ${conamaMatchIcon} |\n`;
  }

  reportMd += `
---

## 2. Veredito Final

`;

  if (hasErrors) {
    reportMd += `> [!CAUTION]
> **AUDITORIA REPROVADA:** Foram detectadas divergências matemáticas entre os totais consolidados e as somas dos meses. A publicação está bloqueada.
`;
    console.error('❌ Auditoria de somas REPROVADA! Veja os detalhes no relatório gerado.');
  } else {
    reportMd += `> [!NOTE]
> **AUDITORIA APROVADA:** 100% dos cruzamentos matemáticos estão corretos. As somas mensais batem perfeitamente com os totais anuais informados nos sumários.
`;
    console.log('✅ Auditoria de somas APROVADA com 100% de sucesso.');
  }

  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  fs.writeFileSync(path.join(reportsDir, 'estado-da-nacao-observatorio-auditoria-somas-2020-2021.md'), reportMd, 'utf8');
  console.log(`Relatório salvo em reports/estado-da-nacao-observatorio-auditoria-somas-2020-2021.md`);

  if (hasErrors) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

try {
  run();
} catch (err: any) {
  console.error(`Erro crítico executando a auditoria: ${err.message}`);
  process.exit(1);
}
