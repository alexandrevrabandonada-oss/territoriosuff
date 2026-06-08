import { Link } from "react-router-dom";

import { SurfaceCard } from "../../../components/BrandSystem";
import type { LatestResult, RadarComparisonTab, RadarMode } from "./RadarTypes";
import { STATIC_STATIONS_MAP } from "./RadarTypes";
import { RadarMicroguide } from "./RadarMicroguide";
import { RadarModeFooter } from "./RadarModeFooter";

interface RadarStationsModeProps {
  latestData: LatestResult[];
  onNavigate: (mode: RadarMode, tab?: RadarComparisonTab) => void;
  onTop: () => void;
}

export function RadarStationsMode({ latestData, onNavigate, onTop }: RadarStationsModeProps) {
  return (
    <div className="animate-fade-in space-y-8 pt-4">
      <div className="space-y-2 border-b border-slate-200 pb-5">
        <h2 className="flex items-center gap-2 text-xl font-black tracking-tight text-slate-800">
          <span>📡 Detalhes das Estações Operacionais</span>
        </h2>
        <p className="text-sm font-medium text-slate-600">
          Informações detalhadas sobre a localização física, parâmetros de monitoramento e contexto de cada estação em Volta Redonda.
        </p>
        <p className="text-xs font-bold text-brand-primary">
          💡 Este modo responde: Qual é a situação técnica de cada estação de monitoramento física e onde elas estão instaladas?
        </p>
      </div>

      <RadarMicroguide
        whatYouSee="Ficha técnica detalhada com coordenadas, status e histórico operacional de cada estação."
        howToRead="Confira a localização física e o status operacional (ativa/inativa) de cada sensor oficial."
        whyItMatters="Permite validar a transparência e a abrangência geográfica da cobertura instrumental no município."
      />

      <div className="space-y-8">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STATIC_STATIONS_MAP.map((item) => {
            const liveData = latestData.find((d) => d.station.id === item.station.id);
            const station = liveData?.station || item.station;

            return (
              <SurfaceCard
                key={station.id}
                className="flex flex-col justify-between space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition-all duration-300 hover:shadow-md"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400">{station.code}</span>
                      <h3 className="text-sm font-black text-slate-800">{station.name}</h3>
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[9px] font-black uppercase ${
                        station.active
                          ? "border border-emerald-500/20 bg-emerald-50 text-emerald-700"
                          : "border border-slate-200 bg-slate-100 text-slate-500"
                      }`}
                    >
                      {station.active ? "Operacional" : "Inativa"}
                    </span>
                  </div>

                  <p className="text-[11px] font-semibold leading-relaxed text-slate-500">{item.description}</p>

                  <div className="space-y-1.5 border-t border-slate-50 pt-2 text-[10px] font-bold text-slate-600">
                    <div className="flex justify-between">
                      <span>Latitude:</span>
                      <span className="text-slate-800">{station.lat ? station.lat.toFixed(6) : "-"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Longitude:</span>
                      <span className="text-slate-800">{station.lng ? station.lng.toFixed(6) : "-"}</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-3">
                  <Link
                    to={`/qualidade-ar/inea/estacoes/${station.id}`}
                    className="inline-flex min-h-[34px] w-full items-center justify-center rounded-xl bg-slate-800 text-xs font-black text-white transition-all hover:bg-slate-700"
                  >
                    Acessar Série Completa →
                  </Link>
                </div>
              </SurfaceCard>
            );
          })}
        </div>
      </div>

      <RadarModeFooter
        nextStep="Próximo passo recomendado: Consulte as notas de metodologia, gases e baixe os dados abertos."
        primaryLabel="Ver Metodologia e Downloads →"
        onPrimary={() => onNavigate("METHODOLOGY")}
        onTop={onTop}
      />
    </div>
  );
}
