import * as fs from 'node:fs';
import * as path from 'node:path';
import { initPublicSession, fetchConcentrationWithWindArrows, parseJqGridRows, normalizeConcentrationRow } from '../src/lib/inea/weblakesClient';

// Disable TLS reject unauthorized as some environments require it for INEA
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

async function runAudit() {
  console.log("Starting INEA WebLakes Stateful Contract Audit...");

  const stationId = "70"; // Retiro
  const pm10ParamId = "18"; // PM10
  const ptsParamId = "1955"; // PTS
  const targetDate = "2024-07-01";

  const results: any[] = [];
  let errorOccurred = false;
  let errorMsg = "";

  try {
    // ----------------------------------------------------
    // Test 1: Clean Session -> PM10
    // ----------------------------------------------------
    console.log("\n--- TEST 1: Clean Session -> PM10 ---");
    const session1Cookies = await initPublicSession();
    console.log("Initialized Session 1.");

    const pm10Result = await fetchConcentrationWithWindArrows("qualidadedoar.inea.rj.gov.br", session1Cookies, {
      stationId,
      parameterId: pm10ParamId,
      startDate: targetDate,
      endDate: targetDate
    });

    const pm10Rows = parseJqGridRows(pm10Result.body);
    console.log(`Test 1 returned ${pm10Rows.length} rows.`);

    let pm10ValAt00h: number | null = null;
    if (pm10Rows.length > 0) {
      const firstRow = pm10Rows[0];
      const norm = normalizeConcentrationRow(firstRow, {
        stationId,
        parameterId: pm10ParamId,
        startDate: targetDate,
        endDate: targetDate
      });
      pm10ValAt00h = norm.value;
      console.log(`First row datetime: ${norm.datetime}, value: ${norm.value} (raw html: ${firstRow.cell[5]})`);
    }

    // ----------------------------------------------------
    // Test 2: Same Session 1 -> PTS (Check if it changes parameter)
    // ----------------------------------------------------
    console.log("\n--- TEST 2: Same Session 1 -> PTS ---");
    // Reuse the updated cookies returned by Test 1
    const ptsSameSessionResult = await fetchConcentrationWithWindArrows("qualidadedoar.inea.rj.gov.br", pm10Result.cookies, {
      stationId,
      parameterId: ptsParamId,
      startDate: targetDate,
      endDate: targetDate
    });

    const ptsSameSessionRows = parseJqGridRows(ptsSameSessionResult.body);
    console.log(`Test 2 (same session) returned ${ptsSameSessionRows.length} rows.`);

    let ptsSameSessionValAt00h: number | null = null;
    if (ptsSameSessionRows.length > 0) {
      const firstRow = ptsSameSessionRows[0];
      const norm = normalizeConcentrationRow(firstRow, {
        stationId,
        parameterId: ptsParamId,
        startDate: targetDate,
        endDate: targetDate
      });
      ptsSameSessionValAt00h = norm.value;
      console.log(`First row datetime: ${norm.datetime}, value: ${norm.value} (raw html: ${firstRow.cell[5]})`);
    }

    // ----------------------------------------------------
    // Test 3: Clean Session 2 -> PTS
    // ----------------------------------------------------
    console.log("\n--- TEST 3: Clean Session 2 -> PTS ---");
    const session2Cookies = await initPublicSession();
    console.log("Initialized Session 2.");

    const ptsCleanResult = await fetchConcentrationWithWindArrows("qualidadedoar.inea.rj.gov.br", session2Cookies, {
      stationId,
      parameterId: ptsParamId,
      startDate: targetDate,
      endDate: targetDate
    });

    const ptsCleanRows = parseJqGridRows(ptsCleanResult.body);
    console.log(`Test 3 (clean session) returned ${ptsCleanRows.length} rows.`);

    let ptsCleanValAt00h: number | null = null;
    if (ptsCleanRows.length > 0) {
      const firstRow = ptsCleanRows[0];
      const norm = normalizeConcentrationRow(firstRow, {
        stationId,
        parameterId: ptsParamId,
        startDate: targetDate,
        endDate: targetDate
      });
      ptsCleanValAt00h = norm.value;
      console.log(`First row datetime: ${norm.datetime}, value: ${norm.value} (raw html: ${firstRow.cell[5]})`);
    }

    // Compare results
    const isStatefulBugDetected = (ptsSameSessionValAt00h === pm10ValAt00h) && (ptsSameSessionValAt00h !== ptsCleanValAt00h);

    results.push({
      pm10ValAt00h,
      ptsSameSessionValAt00h,
      ptsCleanValAt00h,
      isStatefulBugDetected
    });

    console.log("\n--- AUDIT RESULTS SUMMARY ---");
    console.log(`Clean Session PM10: ${pm10ValAt00h}`);
    console.log(`Reused Session PTS: ${ptsSameSessionValAt00h}`);
    console.log(`Clean Session PTS:  ${ptsCleanValAt00h}`);
    console.log(`Stateful session bug detected: ${isStatefulBugDetected ? "YES" : "NO"}`);

  } catch (err: any) {
    console.error("Error during audit:", err);
    errorOccurred = true;
    errorMsg = err.message || String(err);
  }

  // Generate Report
  const reportsDir = path.join(process.cwd(), 'reports');
  fs.mkdirSync(reportsDir, { recursive: true });
  const reportPath = path.join(reportsDir, 'inea-weblakes-stateful-contract.md');

  const testResults = results[0] || {};

  let mdContent = `# Relatório Técnico — Auditoria de Contrato Stateful WebLakes

**Data da Auditoria:** ${new Date().toISOString()}  
**Estação Testada:** Retiro (ID: 70)  
**Data Alvo:** 2024-07-01  

---

## 1. Resultados dos Testes de Sessão

| Caso de Teste | Sessão | Parâmetro Solicitado | Valor Retornado às 00:00 (µg/m³) | Observação |
| :--- | :--- | :--- | :--- | :--- |
| **Teste 1** | Limpa (Sessão 1) | PM10 (18) | ${testResults.pm10ValAt00h !== undefined ? testResults.pm10ValAt00h : "Falha/N/A"} | Valor piloto diário validado esperado: ~5.87 |
| **Teste 2** | Reutilizada (Sessão 1) | PTS (1955) | ${testResults.ptsSameSessionValAt00h !== undefined ? testResults.ptsSameSessionValAt00h : "Falha/N/A"} | Se for idêntico ao Teste 1, há bug de estado |
| **Teste 3** | Limpa (Sessão 2) | PTS (1955) | ${testResults.ptsCleanValAt00h !== undefined ? testResults.ptsCleanValAt00h : "Falha/N/A"} | Valor correto de PTS esperado |

### Diagnóstico de Conclusão:
`;

  if (errorOccurred) {
    mdContent += `
> [!CAUTION]
> **FALHA NA EXECUÇÃO DO AUDIT**  
> Ocorreu um erro ao tentar conectar ou consultar o servidor do INEA:  
> \`${errorMsg}\`  
> Isso pode ser causado por instabilidade no servidor (HTTP 503) ou falta de conectividade.
`;
  } else if (testResults.isStatefulBugDetected) {
    mdContent += `
> [!WARNING]
> **BUG DE ESTADO CONFIRMADO (STATEFUL BUG)**  
> O Teste 2 (PTS na Sessão 1) retornou exatamente o mesmo valor de PM10 (${testResults.pm10ValAt00h} µg/m³), enquanto uma sessão limpa (Sessão 2) retornou o valor real de PTS (${testResults.ptsCleanValAt00h} µg/m³).  
> **Implicação:** O servidor do INEA/WebLakes armazena o parâmetro selecionado na sessão HTTP e falha em atualizar a seleção quando múltiplos parâmetros são requisitados sequencialmente na mesma sessão, mesmo que a URL do GridData especifique o novo \`aParameterKey\`.
`;
  } else {
    mdContent += `
> [!NOTE]
> **COMPORTAMENTO ESPERADO (SEM BUG DETECTADO NESTA EXECUÇÃO)**  
> Os valores das sessões reutilizadas bateram com os das sessões limpas, ou o servidor retornou erro.  
> Valores: PM10 = ${testResults.pm10ValAt00h}, PTS (Mesma Sessão) = ${testResults.ptsSameSessionValAt00h}, PTS (Sessão Limpa) = ${testResults.ptsCleanValAt00h}.
`;
  }

  mdContent += `
---

## 2. Recomendações de Mitigação

Para evitar a contaminação cruzada de dados históricos, devemos adotar o seguinte comportamento no cliente:
1. **Sessão Isolada por Requisição:** Cada par (Estação, Poluente) deve inicializar uma sessão limpa (\`initPublicSession()\`), recebendo novos cookies do servidor.
2. **Coleta Stateful Segura:** Implementar o parâmetro \`WEBLAKES_COLLECTION_MODE=daily_validated\` que isola as consultas de forma transacional.
`;

  fs.writeFileSync(reportPath, mdContent, 'utf8');
  console.log(`Saved contract audit report to: ${reportPath}`);
}

runAudit();
