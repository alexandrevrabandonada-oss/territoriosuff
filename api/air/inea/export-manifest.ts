import { applyPublicJsonHeaders, rejectNonGet } from "./_http.js";

export default function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  return res.status(200).json({
    dataset: "inea_air_measurements_public_export",
    title: "Exportação pública bruta do Radar INEA",
    description: "Manifesto da rota pública de exportação CSV para auditoria externa dos registros integrados do INEA.",
    endpoint: "/api/air/inea/export",
    method: "GET",
    format: "text/csv",
    filters: {
      stationId: "Filtra por estação específica.",
      metricType: "Filtra por tipo de métrica, por exemplo GENERAL_AQI ou POLLUTANT_SUBINDEX.",
      pollutant: "Filtra por poluente, por exemplo PM10, PM25, SO2, NO2, O3 ou CO.",
      from: "Data/hora ISO para início da janela.",
      to: "Data/hora ISO para fim da janela.",
      batchSize: "Tamanho do lote interno de exportação. Faixa aceita: 1000 a 10000. Padrão: 5000."
    },
    columns: [
      "id",
      "station_id",
      "source",
      "metric_type",
      "pollutant",
      "value",
      "unit",
      "measured_at",
      "averaging_period",
      "quality_flag",
      "air_quality_index",
      "air_quality_classification",
      "controlling_pollutant",
      "raw_column"
    ],
    constraints: {
      source: "A rota exporta apenas registros com source = INEA.",
      maxRowsPerResponse: 100000,
      ordering: "Os registros são ordenados por measured_at ascendente."
    },
    truncation: {
      header: "X-Export-Truncated",
      meaning: "true indica que o volume da consulta excedeu o teto de proteção da rota e a exportação foi parcial."
    },
    relatedEndpoints: {
      timeseries: "/api/air/inea/timeseries",
      summary: "/api/air/inea/summary",
      latest: "/api/air/inea/latest",
      export_catalog: "/api/air/inea/export-catalog",
      stations_metadata: "/api/air/inea/stations-metadata"
    },
    version: "2026-06-16"
  });
}
