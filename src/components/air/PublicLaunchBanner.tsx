import { Link } from "react-router-dom";
import { SurfaceCard } from "../BrandSystem";

const FINDINGS = [
  {
    icon: "📊",
    text: "VR-Retiro registrou o maior Índice IQAr da base: 114, classificado como RUIM.",
  },
  {
    icon: "📅",
    text: "Setembro teve a maior proporção de dias registrados como MODERADA ou pior: 20,7% das medições mensais.",
  },
  {
    icon: "🌫️",
    text: "SO₂ e material particulado (MP10) são os poluentes que mais frequentemente determinam o Índice geral IQAr nas estações monitoradas.",
  },
  {
    icon: "⚠️",
    text: "As estações fixas apresentam uma lacuna comum de aproximadamente 421 dias na planilha oficial do INEA — não é falha de ingestão, é ausência na fonte pública.",
  },
  {
    icon: "🔢",
    text: "Os dados exibidos são índices adimensionais IQAr (subíndices oficiais), não concentrações brutas em µg/m³.",
  },
];

const NOT_MEANS = [
  "Não é prova automática de crime ambiental.",
  "Não mede concentração bruta de poluentes em µg/m³.",
  "Não é monitoramento minuto a minuto — a fonte é um arquivo público periódico.",
  "Não substitui análise técnica oficial ou laudos ambientais.",
  "Ausência de dado não significa que o ar estava bom.",
];

const MEANS = [
  "É um sinal público de atenção que qualquer cidadão pode verificar.",
  "É uma ferramenta de transparência baseada em dados oficiais do Estado.",
  "É base técnica para cobrança pública e fiscalização social.",
  "É justificativa documentada para requisitar dados brutos via Lei de Acesso à Informação (LAI).",
  "É apoio à Rede Cidadã de monitoramento SEMEAR/UFF em Volta Redonda.",
];

export function PublicLaunchBanner() {
  return (
    <SurfaceCard className="overflow-hidden rounded-3xl border border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50 shadow-sm">
      {/* Header */}
      <div className="border-b border-emerald-100 bg-emerald-600 px-6 py-5 md:px-8">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 shrink-0 text-2xl" aria-hidden>📡</span>
          <div>
            <h2 className="text-lg font-extrabold leading-tight text-white md:text-xl">
              Radar do Ar: o que os dados oficiais do INEA mostram sobre Volta Redonda
            </h2>
            <p className="mt-1 text-sm font-medium leading-relaxed text-emerald-100">
              Organizamos os dados públicos de qualidade do ar para que qualquer pessoa consiga enxergar padrões, lacunas e sinais de atenção.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-0 md:grid-cols-3">
        {/* Findings */}
        <div className="col-span-2 border-b border-emerald-100 p-6 md:border-b-0 md:border-r md:p-8">
          <h3 className="mb-4 text-xs font-extrabold uppercase tracking-widest text-emerald-700">
            🔍 Principais achados validados
          </h3>
          <ul className="space-y-3">
            {FINDINGS.map((f, i) => (
              <li key={i} className="flex items-start gap-3 text-sm text-slate-700">
                <span className="mt-0.5 shrink-0 text-base" aria-hidden>{f.icon}</span>
                <span className="font-medium leading-snug">{f.text}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* What it means / doesn't mean */}
        <div className="p-6 md:p-8 space-y-6">
          <div>
            <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-red-600">
              ✋ O que isso NÃO significa
            </h3>
            <ul className="space-y-2">
              {NOT_MEANS.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-medium leading-snug text-slate-600">
                  <span className="mt-0.5 shrink-0 text-red-400" aria-hidden>✕</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-xs font-extrabold uppercase tracking-widest text-emerald-700">
              ✅ O que isso significa
            </h3>
            <ul className="space-y-2">
              {MEANS.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-xs font-medium leading-snug text-slate-600">
                  <span className="mt-0.5 shrink-0 text-emerald-500" aria-hidden>✓</span>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="flex flex-col items-start gap-3 border-t border-emerald-100 bg-emerald-50/60 px-6 py-4 sm:flex-row sm:items-center sm:justify-between md:px-8">
        <p className="text-[11px] font-semibold leading-relaxed text-slate-500">
          Fonte: INEA · Dados Abertos RJ · qualidade_ar.xlsx · Atualização periódica (batch).{" "}
          <span className="font-bold text-slate-600">Não é monitoramento em tempo real.</span>
        </p>
        <Link
          to="/qualidade-ar/inea/analises"
          className="inline-flex shrink-0 items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2 text-xs font-extrabold text-white shadow-sm hover:bg-emerald-700 transition-all"
        >
          Ver Análises Completas →
        </Link>
      </div>
    </SurfaceCard>
  );
}
