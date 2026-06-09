export type ParsedLiveTransparencyDraft = {
  monthKey: string;
  monthLabel: string;
  sourceUrl: string;
  sourceLabel: string;
  exportedAt: string;
  actionsCount: string;
  hearingsCount: string;
  territorialCoveragePct: string;
  territorialStatus: "critica" | "atencao" | "adequada";
  executiveSummary: string;
  methodologicalAlert: string;
  operationalRecommendation: string;
  dominantThemes: string[];
  actionTerritories: string[];
  hearingTerritories: string[];
  groupedPriorities: Array<{ label: string; count: number }>;
  qualitativeSignals: Array<{ label: string; count: number }>;
  recommendedNextSteps: string[];
  actionsPerformed: string[];
  reviewPending: string;
};

function normalizeSpaces(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function findBetween(text: string, startPattern: RegExp, endPatterns: RegExp[]) {
  const startMatch = startPattern.exec(text);
  if (!startMatch) return "";

  const start = startMatch.index + startMatch[0].length;
  let end = text.length;

  for (const endPattern of endPatterns) {
    const segment = text.slice(start);
    const match = endPattern.exec(segment);
    if (match) {
      end = Math.min(end, start + match.index);
    }
  }

  return text.slice(start, end).trim();
}

function parseCountLines(sectionText: string) {
  return sectionText
    .split(/\r?\n/)
    .map((line) => normalizeSpaces(line))
    .map((line) => {
      const match = line.match(/^(.+?)\s+\((\d+)\)$/);
      if (!match) return null;
      return {
        label: match[1].trim(),
        count: Number(match[2])
      };
    })
    .filter((item): item is { label: string; count: number } => Boolean(item));
}

function parseLabelCountLines(sectionText: string) {
  return sectionText
    .split(/\r?\n/)
    .map((line) => normalizeSpaces(line))
    .map((line) => {
      const match =
        line.match(/^(.+?):\s*(\d+)\s+cita/i) ||
        line.match(/^(.+?):\s*(\d+)\s+ocorr/i);
      if (!match) return null;
      return {
        label: match[1].trim(),
        count: Number(match[2])
      };
    })
    .filter((item): item is { label: string; count: number } => Boolean(item));
}

function parseWrappedSentences(sectionText: string) {
  const items: string[] = [];
  let buffer = "";

  for (const rawLine of sectionText.split(/\r?\n/)) {
    const line = normalizeSpaces(rawLine);
    if (!line) continue;
    if (/^\d{2}\/\d{2}\/\d{4}/.test(line)) continue;
    buffer = buffer ? `${buffer} ${line}` : line;
    if (/[.!?]$/.test(line)) {
      items.push(buffer);
      buffer = "";
    }
  }

  if (buffer) items.push(buffer);
  return items;
}

function parseActionRows(sectionText: string) {
  return sectionText
    .split(/\r?\n/)
    .map((line) => normalizeSpaces(line))
    .filter((line) => /^\d{2}\/\d{2}\/\d{4}\s+\|/.test(line));
}

function toIsoDate(value: string) {
  const match = value.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!match) return "";
  return `${match[3]}-${match[2]}-${match[1]}`;
}

function joinMethodologicalLines(sectionText: string) {
  const lines = sectionText
    .split(/\r?\n/)
    .map((line) => normalizeSpaces(line))
    .filter(Boolean);

  const recommendationIndex = lines.findIndex((line) => /^Recomenda[çc][aã]o:/i.test(line));
  if (recommendationIndex < 0) {
    return {
      alert: lines.join(" "),
      recommendation: ""
    };
  }

  const recommendationLines = [...lines.slice(recommendationIndex)];
  recommendationLines[0] = recommendationLines[0].replace(/^Recomenda[çc][aã]o:/i, "").trim();

  return {
    alert: lines.slice(0, recommendationIndex).join(" "),
    recommendation: recommendationLines.join(" ").trim()
  };
}

export function parseLiveTransparencyReportText(text: string): ParsedLiveTransparencyDraft {
  const clean = text.replace(/\r/g, "");

  const sourceUrl = clean.match(/https:\/\/www\.semearterritorios\.online\/relatorios\/(\d{4}-\d{2})/i)?.[0] ?? "";
  const monthKey = sourceUrl.match(/(\d{4}-\d{2})$/)?.[1] ?? "";
  const monthLabel =
    clean.match(/Relatório mensal(?: interpretativo)?\s*-\s*\n([^\n]+)/i)?.[1]?.trim() ??
    clean.match(/MÊS DE REFERÊNCIA\s*\n([^\n]+)/i)?.[1]?.trim() ??
    "";
  const exportedAt = toIsoDate(clean.match(/Exportado em (\d{2}\/\d{2}\/\d{4})/i)?.[1] ?? "");

  const executiveSummary = normalizeSpaces(findBetween(
    clean,
    /Leitura executiva/i,
    [/\nO que escutamos/i, /\nSíntese pedagógica/i, /\nTemas dominantes/i]
  ));

  const methodological = joinMethodologicalLines(findBetween(
    clean,
    /Qualidade territorial e limites da leitura/i,
    [/\nO que aprendemos neste mês/i, /\nEncaminhamentos recomendados/i, /\nAções realizadas/i, /\nLista de ações do mês/i]
  ));

  const territorialStatus = /Status:\s*cr[íi]tica/i.test(clean)
    ? "critica"
    : /Status:\s*adequada/i.test(clean)
      ? "adequada"
      : "atencao";

  return {
    monthKey,
    monthLabel,
    sourceUrl,
    sourceLabel: "Relatorio mensal interpretativo",
    exportedAt,
    actionsCount: clean.match(/\nAÇÕES\s*\n(\d+)/i)?.[1] ?? "0",
    hearingsCount: clean.match(/\nESCUTAS\s*\n(\d+)/i)?.[1] ?? "0",
    territorialCoveragePct: clean.match(/COBERTURA\s*TERRITORIAL\s*\n(\d+(?:[.,]\d+)?)/i)?.[1]?.replace(",", ".") ?? "0",
    territorialStatus,
    executiveSummary,
    methodologicalAlert: methodological.alert,
    operationalRecommendation: methodological.recommendation,
    dominantThemes: parseCountLines(findBetween(
      clean,
      /Temas dominantes/i,
      [/\nAções por território/i, /\nEscutas por território/i, /\nPrioridades agrupadas/i, /\nTipos de ação/i]
    )).map((item) => item.label),
    actionTerritories: parseCountLines(findBetween(
      clean,
      /Ações por território(?: da ação)?/i,
      [/\nEscutas por território/i, /\nQualidade territorial/i, /\nTipos de ação/i]
    )).map((item) => item.label),
    hearingTerritories: parseCountLines(findBetween(
      clean,
      /Escutas por território de referência/i,
      [/\nQualidade territorial/i, /\nPrioridades agrupadas/i, /\nTipos de ação/i, /\nTemas mais recorrentes/i]
    )).map((item) => item.label),
    groupedPriorities: parseLabelCountLines(findBetween(
      clean,
      /Prioridades agrupadas/i,
      [/\nSinais qualitativos relevantes/i, /\nQualidade territorial/i, /\nO que aprendemos neste mês/i]
    )),
    qualitativeSignals: parseLabelCountLines(findBetween(
      clean,
      /Sinais qualitativos relevantes/i,
      [/\nQualidade territorial/i, /\nO que aprendemos neste mês/i, /\nEncaminhamentos recomendados/i]
    )),
    recommendedNextSteps: parseWrappedSentences(findBetween(
      clean,
      /Encaminhamentos recomendados/i,
      [/\nAções realizadas/i, /\nLista de ações do mês/i, /\nPendências de revisão/i]
    )),
    actionsPerformed: parseActionRows(findBetween(
      clean,
      /(Ações realizadas|Lista de ações do mês)/i,
      [/\nPendências de revisão/i, /\nExportado em/i]
    )),
    reviewPending: normalizeSpaces(findBetween(clean, /Pendências de revisão/i, [/\nExportado em/i])) || "Nenhuma pendencia registrada."
  };
}
