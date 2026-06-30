import { useState } from "react";
import { SurfaceCard, IconShell } from "../BrandSystem";
import { WIND_ROSE_DATA, SO2_WIND_SECTOR_ROSE } from "../../data/air/weather-analytics-summary";
import { RADAR_EXPERIMENTAL_OBSERVATION_NOTE } from "../../data/air/radar-copy";
import { useRadarReleaseMetadata } from "../../data/air/useRadarReleaseMetadata";
import { RadarEvidenceStateBlock } from "../../pages/air/radar/RadarEvidenceStateBlock";

const QUADRANTS_ANGLE_MAP: Record<string, number> = {
  N: 0,
  NNE: 22.5,
  NE: 45,
  ENE: 67.5,
  E: 90,
  ESE: 112.5,
  SE: 135,
  SSE: 157.5,
  S: 180,
  SSW: 202.5,
  SW: 225,
  WSW: 247.5,
  W: 270,
  WNW: 292.5,
  NW: 315,
  NNW: 337.5
};

export function WindRosePanel() {
  const releaseMetadata = useRadarReleaseMetadata();
  const [mode, setMode] = useState<"frequency" | "so2">("frequency");
  const [hoveredSector, setHoveredSector] = useState<{
    quadrant: string;
    value: number;
    extra: string;
  } | null>(null);

  const cx = 150;
  const cy = 150;
  const maxRadius = 120;

  // Find max values for scaling
  const maxFreq = Math.max(...WIND_ROSE_DATA.map(d => d.frequency));
  const maxSo2 = Math.max(...SO2_WIND_SECTOR_ROSE.map(d => d.avgSo2));

  const sectors = WIND_ROSE_DATA.map(item => {
    const angle = QUADRANTS_ANGLE_MAP[item.quadrant];
    const startAngle = angle - 11.25;
    const endAngle = angle + 11.25;

    const so2Data = SO2_WIND_SECTOR_ROSE.find(s => s.quadrant === item.quadrant);
    const avgSo2 = so2Data ? so2Data.avgSo2 : 0;

    let value: number;
    let radius: number;
    let fillColor: string;
    let extra: string;

    if (mode === "frequency") {
      value = item.frequency;
      // Scale frequency to radius (minimum 15px so it's always clickable/visible)
      radius = 15 + (item.frequency / maxFreq) * (maxRadius - 15);
      // Soft green/emerald shade based on wind speed
      fillColor = `rgba(16, 185, 129, ${0.3 + (item.avgSpeed / 4) * 0.7})`;
      extra = `Velocidade média: ${item.avgSpeed} m/s`;
    } else {
      value = avgSo2;
      radius = 15 + (avgSo2 / maxSo2) * (maxRadius - 15);
      // Orange/red scale for SO2 concentration
      fillColor = `rgba(249, 115, 22, ${0.3 + (avgSo2 / maxSo2) * 0.7})`;
      extra = `Média: ${avgSo2} µg/m³`;
    }

    // Convert angles to radians (pointing up)
    const startRad = ((startAngle - 90) * Math.PI) / 180;
    const endRad = ((endAngle - 90) * Math.PI) / 180;

    const x1 = cx + radius * Math.cos(startRad);
    const y1 = cy + radius * Math.sin(startRad);
    const x2 = cx + radius * Math.cos(endRad);
    const y2 = cy + radius * Math.sin(endRad);

    const pathData = `M ${cx} ${cy} L ${x1} ${y1} A ${radius} ${radius} 0 0 1 ${x2} ${y2} Z`;

    return {
      quadrant: item.quadrant,
      value,
      extra,
      pathData,
      fillColor,
      angle
    };
  });

  return (
    <SurfaceCard className="p-6 border border-slate-100 rounded-3xl space-y-6 hover:shadow-md transition-all">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-slate-800">Direção do Vento e Dispersão</h3>
          <p className="text-xs text-slate-500 font-medium">
            Influência da rosa dos ventos na distribuição e transporte de poluentes.
          </p>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[10px] font-black text-emerald-800">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="uppercase tracking-[0.16em]">Vento observado</span>
            <span className="hidden font-semibold normal-case text-emerald-700/80 md:inline">setores de direção e velocidade vêm da camada de vento mais confiável do sistema</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
              ciclo {releaseMetadata.cycleVersion}
            </span>
            <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-slate-700">
              metodologia {releaseMetadata.methodologyVersion}
            </span>
            <span className="inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-amber-800">
              evidência parcial
            </span>
          </div>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl self-start">
          <button
            onClick={() => setMode("frequency")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "frequency"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Frequência (%)
          </button>
          <button
            onClick={() => setMode("so2")}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              mode === "so2"
                ? "bg-white text-slate-800 shadow-sm"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            Transporte de SO₂
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
        {/* Wind Rose SVG */}
        <div className="md:col-span-6 flex justify-center relative select-none">
          <svg width="300" height="300" className="drop-shadow-sm overflow-visible">
            {/* Grid concentric rings */}
            {[0.25, 0.5, 0.75, 1.0].map((scale, idx) => (
              <circle
                key={idx}
                cx={cx}
                cy={cy}
                r={maxRadius * scale}
                fill="none"
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
            ))}

            {/* Compass axis lines */}
            <line x1={cx - maxRadius} y1={cy} x2={cx + maxRadius} y2={cy} stroke="#cbd5e1" strokeWidth="1" />
            <line x1={cx} y1={cy - maxRadius} x2={cx} y2={cy + maxRadius} stroke="#cbd5e1" strokeWidth="1" />

            {/* Direction Labels */}
            <text x={cx} y={cy - maxRadius - 8} textAnchor="middle" className="text-[10px] font-black fill-slate-500">N</text>
            <text x={cx + maxRadius + 12} y={cy + 3} textAnchor="middle" className="text-[10px] font-black fill-slate-500">E</text>
            <text x={cx} y={cy + maxRadius + 15} textAnchor="middle" className="text-[10px] font-black fill-slate-500">S</text>
            <text x={cx - maxRadius - 12} y={cy + 3} textAnchor="middle" className="text-[10px] font-black fill-slate-500">W</text>

            {/* Render quadrants/sectors */}
            {sectors.map((s) => {
              const isHovered = hoveredSector?.quadrant === s.quadrant;
              return (
                <path
                  key={s.quadrant}
                  d={s.pathData}
                  fill={s.fillColor}
                  stroke={isHovered ? "#334155" : "rgba(255, 255, 255, 0.5)"}
                  strokeWidth={isHovered ? "2" : "0.5"}
                  className="cursor-pointer transition-all duration-150 hover:brightness-110"
                  onMouseEnter={() =>
                    setHoveredSector({
                      quadrant: s.quadrant,
                      value: s.value,
                      extra: s.extra
                    })
                  }
                  onMouseLeave={() => setHoveredSector(null)}
                />
              );
            })}

            {/* Center core */}
            <circle cx={cx} cy={cy} r="6" fill="#475569" stroke="#ffffff" strokeWidth="2" />
          </svg>

          {/* Floating Tooltip in Center/Corner */}
          {hoveredSector && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-3 py-2 rounded-xl text-[11px] shadow-lg flex flex-col items-center pointer-events-none w-48 text-center animate-fade-in border border-slate-700/50">
              <span className="font-bold uppercase tracking-wider text-[10px] text-slate-300">Quadrante {hoveredSector.quadrant}</span>
              <span className="font-black text-sm mt-0.5">
                {mode === "frequency" ? `${hoveredSector.value}% das horas` : `${hoveredSector.value} µg/m³`}
              </span>
              <span className="text-[10px] opacity-75 mt-0.5">{hoveredSector.extra}</span>
            </div>
          )}
        </div>

        {/* Narrative & Explainer */}
        <div className="md:col-span-6 space-y-4">
          {mode === "frequency" ? (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Padrão de Ventos de Volta Redonda</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-medium">
                O monitoramento da estação Retiro mostra ventos predominantes soprando do quadrante **SSE (Sul-Sudeste)** e do quadrante **WNW/NW (Oeste-Noroeste)**, alinhados com o relevo natural do Vale do Paraíba.
              </p>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-1 text-xs">
                <span className="font-bold text-slate-700">Estado de Calmaria Atmosférica:</span>
                <p className="text-[11px] text-slate-500 font-medium">
                  A velocidade do vento é geralmente baixa, com médias de 0.8 a 1.5 m/s. Ventos fracos reduzem o espalhamento dos poluentes acumulados perto do solo.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="font-bold text-slate-700 text-xs uppercase tracking-wider">Transporte Direcional de Poluentes</h4>
              <p className="text-xs leading-relaxed text-slate-600 font-medium">
                Ao mapear as concentrações médias de SO₂ por direção, observa-se uma elevação nas leituras médias quando o vento sopra do quadrante **SSE/SE**. 
              </p>
              <p className="text-xs leading-relaxed text-slate-600 font-medium">
                Geograficamente, este setor alinha-se com a área da Usina Siderúrgica Presidente Vargas (CSN) localizada a sudeste da estação Retiro. Isso sugere compatibilidade com transporte físico da pluma industrial na direção dos bairros residenciais, mas não prova fonte isolada sem auditoria complementar.
              </p>
            </div>
          )}

          {/* Safeguard Alert */}
          <div className="p-3.5 border border-amber-200 bg-amber-50/50 text-amber-900 rounded-2xl flex items-start gap-2.5">
            <IconShell tone="warm" className="shrink-0 scale-90">
              <svg className="h-5 w-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </IconShell>
            <div className="space-y-1">
              <p className="text-[11px] leading-relaxed font-bold text-amber-800">
                Os dados indicam condições favoráveis ou desfavoráveis à dispersão atmosférica. Correlação meteorológica não prova fonte emissora isolada.
              </p>
              <p className="text-[10px] leading-relaxed font-semibold text-amber-700">
                Interprete este painel no contexto do release {releaseMetadata.cycleVersion}, conferindo cobertura, série histórica e revisão pública prevista para {releaseMetadata.plannedReviewDate}.
              </p>
            </div>
          </div>

          <RadarEvidenceStateBlock
            state="partial"
            title="Leitura física útil, sem equivalência causal isolada"
            description={`A rosa dos ventos fortalece a leitura de dispersão e transporte no release ${releaseMetadata.cycleVersion}, mas continua como evidência parcial. Ela apoia hipótese territorial e auditoria pública, sem substituir ${RADAR_EXPERIMENTAL_OBSERVATION_NOTE} nem atribuição única de fonte.`}
          />
        </div>
      </div>
    </SurfaceCard>
  );
}
