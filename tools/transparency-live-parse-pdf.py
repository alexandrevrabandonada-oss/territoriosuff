import json
import re
import sys
import unicodedata
from pathlib import Path

from pypdf import PdfReader


def normalize_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def ascii_fold(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(char for char in normalized if not unicodedata.combining(char))


def extract_text(pdf_path: Path) -> str:
    reader = PdfReader(str(pdf_path))
    chunks = []
    for page in reader.pages:
        chunks.append(page.extract_text() or "")
    return "\n".join(chunks)


def find_between(text: str, start_pattern: str, end_patterns: list[str]) -> str:
    start_match = re.search(start_pattern, text, re.IGNORECASE)
    if not start_match:
        return ""

    start = start_match.end()
    end = len(text)
    for end_pattern in end_patterns:
        match = re.search(end_pattern, text[start:], re.IGNORECASE)
        if match:
            end = min(end, start + match.start())
    return text[start:end].strip()


def parse_count_lines(section_text: str) -> list[dict]:
    items = []
    for raw_line in section_text.splitlines():
        line = normalize_spaces(raw_line)
        match = re.match(r"(.+?)\s+\((\d+)\)$", line)
        if not match:
            continue
        items.append({
            "label": ascii_fold(match.group(1).strip()),
            "count": int(match.group(2)),
        })
    return items


def parse_label_count_lines(section_text: str) -> list[dict]:
    items = []
    for raw_line in section_text.splitlines():
        line = normalize_spaces(raw_line)
        match = re.match(r"(.+?):\s*(\d+)\s+cita\w*$", line, re.IGNORECASE)
        if not match:
            match = re.match(r"(.+?):\s*(\d+)\s+ocorr\w*$", line, re.IGNORECASE)
        if not match:
            continue
        items.append({
            "label": ascii_fold(match.group(1).strip()),
            "count": int(match.group(2)),
        })
    return items


def parse_wrapped_sentences(section_text: str) -> list[str]:
    items = []
    buffer = ""
    for raw_line in section_text.splitlines():
        line = normalize_spaces(raw_line)
        if not line:
            continue
        if line.startswith("09/") or line.startswith("19/"):
            continue
        buffer = f"{buffer} {line}".strip() if buffer else line
        if line.endswith("."):
            items.append(ascii_fold(buffer))
            buffer = ""
    if buffer:
        items.append(ascii_fold(buffer))
    return items


def parse_action_rows(section_text: str) -> list[str]:
    items = []
    for raw_line in section_text.splitlines():
        line = normalize_spaces(raw_line)
        if not line or line.startswith("09/") or line.startswith("19/"):
            continue
        if re.match(r"^\d{2}/\d{2}/\d{4}\s+\|", line):
            items.append(ascii_fold(line))
    return items


def parse_report(pdf_path: Path) -> dict:
    raw_text = extract_text(pdf_path)
    text = raw_text.replace("\r", "")
    folded = ascii_fold(text)

    source_url_match = re.search(r"https://www\.semearterritorios\.online/relatorios/(\d{4}-\d{2})", folded)
    month_key = source_url_match.group(1) if source_url_match else ""
    source_url = f"https://www.semearterritorios.online/relatorios/{month_key}" if month_key else None

    month_label_match = re.search(r"Relatorio mensal(?: interpretativo)? -\s*\n([^\n]+)", folded, re.IGNORECASE)
    month_label = normalize_spaces(month_label_match.group(1)) if month_label_match else ""

    exported_at_match = re.search(r"Exportado em (\d{2}/\d{2}/\d{4})", folded)
    exported_at = None
    if exported_at_match:
        d, m, y = exported_at_match.group(1).split("/")
        exported_at = f"{y}-{m}-{d}"

    actions_count_match = re.search(r"\nACOES\s*\n(\d+)", folded, re.IGNORECASE)
    hearings_count_match = re.search(r"\nESCUTAS\s*\n(\d+)", folded, re.IGNORECASE)
    coverage_match = re.search(r"COBERTURA\s*TERRITORIAL\s*\n(\d+(?:\.\d+)?)%", folded, re.IGNORECASE)

    executive_summary = normalize_spaces(find_between(
        folded,
        r"Leitura executiva",
        [r"\nO que escutamos", r"\nSintese pedagogica", r"\nTemas dominantes"]
    ))

    methodological_block = find_between(
        folded,
        r"Qualidade territorial e limites da leitura",
        [r"\nO que aprendemos neste mes", r"\nEncaminhamentos recomendados", r"\nAcoes realizadas", r"\nLista de acoes do mes"]
    )
    methodological_alert = ""
    operational_recommendation = ""
    if methodological_block:
        lines = [normalize_spaces(line) for line in methodological_block.splitlines() if normalize_spaces(line)]
        recommendation_index = next((index for index, line in enumerate(lines) if line.startswith("Recomendacao:")), -1)
        if recommendation_index >= 0:
            methodological_alert = ascii_fold(" ".join(lines[:recommendation_index]))
            recommendation_lines = lines[recommendation_index:]
            recommendation_lines[0] = recommendation_lines[0].replace("Recomendacao:", "").strip()
            operational_recommendation = ascii_fold(" ".join(recommendation_lines).strip())
        else:
            methodological_alert = ascii_fold(" ".join(lines))

    dominant_themes = [item["label"] for item in parse_count_lines(find_between(
        folded,
        r"Temas dominantes",
        [r"\nAcoes por territorio", r"\nEscutas por territorio", r"\nPrioridades agrupadas", r"\nTipos de acao"]
    ))]

    action_territories = [item["label"] for item in parse_count_lines(find_between(
        folded,
        r"Acoes por territorio(?: da acao)?",
        [r"\nEscutas por territorio", r"\nQualidade territorial", r"\nTipos de acao"]
    ))]

    hearing_territories = [item["label"] for item in parse_count_lines(find_between(
        folded,
        r"Escutas por territorio de referencia",
        [r"\nQualidade territorial", r"\nPrioridades agrupadas", r"\nTipos de acao", r"\nTemas mais recorrentes"]
    ))]

    grouped_priorities = parse_label_count_lines(find_between(
        folded,
        r"Prioridades agrupadas",
        [r"\nSinais qualitativos relevantes", r"\nQualidade territorial", r"\nO que aprendemos neste mes"]
    ))

    qualitative_signals = parse_label_count_lines(find_between(
        folded,
        r"Sinais qualitativos relevantes",
        [r"\nQualidade territorial", r"\nO que aprendemos neste mes", r"\nEncaminhamentos recomendados"]
    ))

    recommended_next_steps = parse_wrapped_sentences(find_between(
        folded,
        r"Encaminhamentos recomendados",
        [r"\nAcoes realizadas", r"\nLista de acoes do mes", r"\nPendencias de revisao"]
    ))

    actions_performed = parse_action_rows(find_between(
        folded,
        r"(Acoes realizadas|Lista de acoes do mes)",
        [r"\nPendencias de revisao", r"\nExportado em"]
    ))

    review_pending = normalize_spaces(find_between(
        folded,
        r"Pendencias de revisao",
        [r"\nExportado em"]
    )) or "Nenhuma pendencia registrada."

    territorial_status = "atencao"
    if re.search(r"Status:\s*critica", folded, re.IGNORECASE):
        territorial_status = "critica"
    elif re.search(r"Status:\s*adequada", folded, re.IGNORECASE):
        territorial_status = "adequada"

    return {
        "month_key": month_key,
        "month_label": ascii_fold(month_label),
        "source_url": source_url,
        "source_label": "Relatorio mensal interpretativo",
        "exported_at": exported_at,
        "actions_count": int(actions_count_match.group(1)) if actions_count_match else 0,
        "hearings_count": int(hearings_count_match.group(1)) if hearings_count_match else 0,
        "territorial_coverage_pct": float(coverage_match.group(1)) if coverage_match else 0,
        "territorial_status": territorial_status,
        "executive_summary": ascii_fold(executive_summary),
        "methodological_alert": methodological_alert,
        "operational_recommendation": operational_recommendation,
        "dominant_themes": dominant_themes,
        "action_territories": action_territories,
        "hearing_territories": hearing_territories,
        "grouped_priorities": grouped_priorities,
        "qualitative_signals": qualitative_signals,
        "recommended_next_steps": recommended_next_steps,
        "actions_performed": actions_performed,
        "review_pending": ascii_fold(review_pending),
        "status": "published",
    }


def main():
    if len(sys.argv) < 2:
        print("Usage: transparency-live-parse-pdf.py <pdf> [<pdf> ...]", file=sys.stderr)
        sys.exit(1)

    reports = []
    for arg in sys.argv[1:]:
        pdf_path = Path(arg)
        if not pdf_path.exists():
            print(f"Arquivo nao encontrado: {pdf_path}", file=sys.stderr)
            sys.exit(1)
        reports.append(parse_report(pdf_path))

    reports.sort(key=lambda item: item["month_key"], reverse=True)
    print(json.dumps(reports, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
