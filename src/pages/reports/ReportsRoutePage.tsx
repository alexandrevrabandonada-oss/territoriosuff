import { AxisEyebrow } from "../../components/AxisSystem";
import { PortalHero, PortalPageShell } from "../../components/portal";
import { ReportsListPage } from "./ReportsListPage";

export function ReportsRoutePage() {
  return (
    <PortalPageShell className="reports-stage">
      <PortalHero
        badge={<AxisEyebrow axis="relatorio">Biblioteca oficial</AxisEyebrow>}
        title="Relatórios e boletins para controle social."
        subtitle="Uma base documental em PDF para consulta pública, memória técnica e acompanhamento institucional do projeto SEMEAR."
        aside={<div className="portal-stage-stat"><span>PDF</span><small>consulta pública e memória técnica</small></div>}
      />

      <ReportsListPage />
    </PortalPageShell>
  );
}
