import * as fs from "node:fs";
import * as path from "node:path";

type SectionSummary = {
  title: string;
  summaryLines: string[];
  operationalLink: string | null;
  topCases: string[];
};

function readReport(fileName: string) {
  const filePath = path.join(process.cwd(), "reports", fileName);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Relatório não encontrado: ${filePath}`);
  }
  return fs.readFileSync(filePath, "utf8");
}

function extractSection(report: string): SectionSummary {
  const lines = report.split(/\r?\n/);
  const title = lines.find((line) => line.startsWith("# "))?.replace(/^# /, "").trim() || "Relatório";

  const summaryStart = lines.findIndex((line) => line.trim() === "## Resumo");
  const linkStart = lines.findIndex((line) => line.trim() === "## Link operacional");
  const topStart = lines.findIndex((line) => line.startsWith("## Top "));

  const summaryLines = summaryStart >= 0
    ? lines.slice(summaryStart + 1, linkStart >= 0 ? linkStart : undefined).map((line) => line.trim()).filter((line) => line.startsWith("- "))
    : [];

  const operationalLink = linkStart >= 0
    ? (lines.slice(linkStart + 1).map((line) => line.trim()).find((line) => line.startsWith("- `")) || null)
    : null;

  const topCases = topStart >= 0
    ? lines
      .slice(topStart + 1)
      .map((line) => line.trim())
      .filter((line) => line.startsWith("### "))
      .slice(0, 5)
      .map((line) => line.replace(/^###\s+/, ""))
    : [];

  return { title, summaryLines, operationalLink, topCases };
}

function classifyExecutiveStatus(sections: SectionSummary[]) {
  const joined = sections.flatMap((section) => section.summaryLines).join("\n");
  const staleZero = joined.includes("Total de itens com captura acima de 30 dias: **0**");
  const snapshotZero = joined.includes("Total de itens preservados sem snapshot HTML: **0**");
  const pendingHasLoad = !joined.includes("Total de itens com revisão pendente: **0**");

  if (pendingHasLoad && staleZero && snapshotZero) {
    return "O acúmulo atual está concentrado em revisão editorial, não em recaptura técnica.";
  }
  if (!staleZero || !snapshotZero) {
    return "Há passivos técnicos relevantes em preservação que exigem ação operacional.";
  }
  return "O quadro atual está estabilizado.";
}

function main() {
  const sections = [
    extractSection(readReport("estado-da-nacao-preservacao-imprensa-stale.md")),
    extractSection(readReport("estado-da-nacao-preservacao-imprensa-sem-snapshot.md")),
    extractSection(readReport("estado-da-nacao-preservacao-imprensa-revisao-pendente.md")),
  ];

  const generatedAt = new Date().toLocaleString("pt-BR");
  const executiveStatus = classifyExecutiveStatus(sections);

  const md = [
    "# Estado da Nação — Executivo de Preservação de Imprensa",
    "",
    `Data: ${generatedAt}`,
    "",
    "## Leitura executiva",
    "",
    executiveStatus,
    "",
    "## Consolidação dos monitores",
    "",
    ...sections.flatMap((section) => [
      `### ${section.title}`,
      "",
      ...(section.summaryLines.length > 0 ? section.summaryLines : ["- Sem resumo disponível."]),
      "",
      ...(section.operationalLink ? [`- Link operacional: ${section.operationalLink.replace(/^- /, "")}`] : []),
      ...(section.topCases.length > 0 ? ["", "- Primeiros casos:", ...section.topCases.map((item) => `  - ${item}`)] : []),
      "",
    ]),
    "## Próximo passo recomendado",
    "",
    "- Priorizar fechamento editorial dos itens em `pending_review`.",
    "- Manter o monitor `stale` ativo para detectar envelhecimento futuro das capturas.",
    "- Manter o monitor `preserved_without_snapshot` ativo para evitar fragilidade arquivística.",
    "",
  ].join("\n");

  const reportPath = path.join(process.cwd(), "reports", "estado-da-nacao-preservacao-imprensa-executivo.md");
  fs.writeFileSync(reportPath, md, "utf8");
  console.log(`Relatório salvo em ${reportPath}`);
}

main();
