import { SurfaceCard } from "../../components/BrandSystem";
import { AxisEyebrow } from "../../components/AxisSystem";
import { PortalPageShell } from "../../components/portal";
import { ReportsListPage } from "./ReportsListPage";

export function ReportsRoutePage() {
  return (
    <PortalPageShell className="reports-stage">
      <SurfaceCard className="portal-stage-hero portal-stage-hero-documental overflow-hidden p-0">
        <div className="portal-stage-hero-inner">
          <div className="portal-stage-copy">
            <AxisEyebrow axis="relatorio">Biblioteca oficial</AxisEyebrow>
            <h1>Relatórios e boletins para controle social.</h1>
            <p>
              Uma base documental em PDF para consulta pública, memória técnica e acompanhamento institucional do projeto SEMEAR.
            </p>
          </div>
          <div className="portal-stage-stat">
            <span>PDF</span>
            <small>consulta pública e memória técnica</small>
          </div>
        </div>
      </SurfaceCard>

      <ReportsListPage />
    </PortalPageShell>
  );
}
