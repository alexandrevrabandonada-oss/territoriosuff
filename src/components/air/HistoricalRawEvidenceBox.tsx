import { SectionHeader, SurfaceCard, IconShell } from "../BrandSystem";
import seedFindings from "../../../data/inea_historical_sources/seed-public-findings.json";

export function HistoricalRawEvidenceBox() {
  // Find RBCIAMB data points
  const pm10Mean = seedFindings.find(f => f.source_id === "rbciamb_2020_pm10_mean")?.value;
  const pm10Max = seedFindings.find(f => f.source_id === "rbciamb_2020_pm10_max")?.value;
  const ptsMean = seedFindings.find(f => f.source_id === "rbciamb_2020_pts_mean")?.value;
  const ptsMax = seedFindings.find(f => f.source_id === "rbciamb_2020_pts_max")?.value;
  const o3Mean = seedFindings.find(f => f.source_id === "rbciamb_2020_o3_mean")?.value;
  const o3Max = seedFindings.find(f => f.source_id === "rbciamb_2020_o3_max")?.value;
  const pm10Exceed = seedFindings.find(f => f.source_id === "rbciamb_2020_pm10_who_exceedance")?.value;
  const o3Exceed = seedFindings.find(f => f.source_id === "rbciamb_2020_o3_who_exceedance")?.value;

  // Find INEA Report 2015 data points
  const belmonteO3Max = seedFindings.find(f => f.source_id === "inea_rqar_2015_o3_belmonte_max")?.value;
  const santaCeciliaPtsMax = seedFindings.find(f => f.source_id === "inea_rqar_2015_pts_santa_cecilia_max")?.value;

  return (
    <section className="space-y-8" id="evidencias-historicas">
      <SectionHeader
        eyebrow="Rastros dos Dados Físicos"
        title="Encontramos rastros dos dados brutos"
        description="A série completa ainda não está aberta em CSV/XLSX/API. Mas relatórios oficiais e estudos científicos mostram que concentrações físicas foram medidas, agregadas e usadas em pesquisas."
      />

      <div className="grid gap-6 sm:grid-cols-2">
        {/* Card 1: Artigo Científico */}
        <SurfaceCard className="border border-brand-primary/10 bg-surface-1 p-5 rounded-2xl md:p-6 transition-all hover:border-brand-primary/20">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between">
              <IconShell tone="brand">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </IconShell>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary-soft px-2.5 py-1 rounded-full">
                Artigo 2013–2015
              </span>
            </div>
            
            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-black text-text-primary">
                Estudo de Internações (RBCIAMB)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Artigo científico da UFF publicado na <em>Revista Brasileira de Ciências Ambientais</em> que correlacionou a poluição do ar às internações por doenças respiratórias.
              </p>
              
              <div className="mt-4 pt-4 border-t border-border-subtle grid grid-cols-3 gap-2.5">
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-tertiary block uppercase">PM₁₀ (Média / Max)</span>
                  <span className="text-xs font-black text-text-primary block">{pm10Mean} / {pm10Max} µg/m³</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-tertiary block uppercase">PTS (Média / Max)</span>
                  <span className="text-xs font-black text-text-primary block">{ptsMean} / {ptsMax} µg/m³</span>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] font-bold text-text-tertiary block uppercase">O₃ (Média / Max)</span>
                  <span className="text-xs font-black text-text-primary block">{o3Mean} / {o3Max} µg/m³</span>
                </div>
              </div>

              <div className="pt-2.5 text-xs font-semibold text-accent-red-dark space-y-1 bg-accent-red/5 p-3 rounded-xl border border-accent-red/10">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                  <span><strong>{pm10Exceed} violações</strong> das diretrizes da OMS para PM₁₀</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent-red" />
                  <span><strong>{o3Exceed} violações</strong> das diretrizes da OMS para O₃</span>
                </div>
              </div>
            </div>
          </div>
        </SurfaceCard>

        {/* Card 2: Relatórios INEA */}
        <SurfaceCard className="border border-brand-primary/10 bg-surface-1 p-5 rounded-2xl md:p-6 transition-all hover:border-brand-primary/20">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between">
              <IconShell tone="brand">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </IconShell>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary-soft px-2.5 py-1 rounded-full">
                Relatórios INEA
              </span>
            </div>

            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-black text-text-primary">
                Relatórios Estaduais de Qualidade (RQAr)
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Relatórios oficiais anuais editados pelo INEA registram a existência física e o monitoramento sistemático das estações de Volta Redonda em anos anteriores a 2022.
              </p>

              <div className="mt-4 pt-4 border-t border-border-subtle space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary"><strong>O₃ Máximo Horário</strong> (VR-Belmonte, 2015)</span>
                  <span className="font-black text-text-primary bg-surface-2 px-2.5 py-0.5 rounded border border-border-subtle">{belmonteO3Max} µg/m³</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-secondary"><strong>PTS Máximo Diário</strong> (VR-Santa Cecília, 2015)</span>
                  <span className="font-black text-text-primary bg-surface-2 px-2.5 py-0.5 rounded border border-border-subtle">{santaCeciliaPtsMax} µg/m³</span>
                </div>
              </div>
              
              <p className="text-[10px] text-text-tertiary pt-2 leading-relaxed">
                *Nota: Os relatórios oficiais comprovam excedências aos limites nacionais, mas publicam apenas estatísticas anuais agregadas.
              </p>
            </div>
          </div>
        </SurfaceCard>

        {/* Card 3: Diagnóstico IEMA */}
        <SurfaceCard className="border border-brand-primary/10 bg-surface-1 p-5 rounded-2xl md:p-6 transition-all hover:border-brand-primary/20">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between">
              <IconShell tone="brand">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </IconShell>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary-soft px-2.5 py-1 rounded-full">
                IEMA 2000–2012
              </span>
            </div>

            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-black text-text-primary">
                1º Diagnóstico de Qualidade do Ar
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Documento técnico nacional compilado pelo Instituto de Energia e Meio Ambiente (IEMA) que audita a rede brasileira de monitoramento ambiental.
              </p>
              <div className="mt-4 pt-4 border-t border-border-subtle space-y-2 text-xs">
                <p className="text-text-secondary leading-relaxed">
                  ✓ Registra o histórico operacional das 3 estações fixas antigas de Volta Redonda.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  ✓ Mapeia a presença de analisadores automáticos de SO₂, CO, O₃ e NO₂ ativos na região do Médio Paraíba.
                </p>
              </div>
            </div>
          </div>
        </SurfaceCard>

        {/* Card 4: Dissertações UFF */}
        <SurfaceCard className="border border-brand-primary/10 bg-surface-1 p-5 rounded-2xl md:p-6 transition-all hover:border-brand-primary/20">
          <div className="flex flex-col gap-4 h-full">
            <div className="flex items-start justify-between">
              <IconShell tone="brand">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
                </svg>
              </IconShell>
              <span className="text-[10px] font-black uppercase tracking-widest text-brand-primary bg-brand-primary-soft px-2.5 py-1 rounded-full">
                Dissertações UFF
              </span>
            </div>

            <div className="space-y-3 flex-1">
              <h3 className="text-lg font-black text-text-primary">
                Pesquisas Acadêmicas na UFF
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Trabalhos de mestrado em Saúde Coletiva e Engenharia Ambiental que obtiveram do INEA as planilhas de microdados diários brutos (2013 a 2015) para análises estatísticas locais.
              </p>
              <div className="mt-4 pt-4 border-t border-border-subtle space-y-2 text-xs">
                <p className="text-text-secondary leading-relaxed">
                  ✓ Dissertação de Jéssica G. I. de Oliveira comprova que dados de concentração diária bruta circularam ativamente para modelagem de regressão epidemiológica.
                </p>
                <p className="text-text-secondary leading-relaxed">
                  ✓ Demonstra correlação significativa entre picos de particulado e internações pediátricas e geriátricas no SUS.
                </p>
              </div>
            </div>
          </div>
        </SurfaceCard>
      </div>
    </section>
  );
}
