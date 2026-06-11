export const AIR_PUBLIC_DATA_BASE_PATH = "/data/air";

export type AirPublicDownload = {
  title: string;
  file: string;
  format: ".CSV" | ".JSON";
  desc: string;
};

export const AIR_PUBLIC_DOWNLOADS: AirPublicDownload[] = [
  {
    title: "Manifesto completo",
    file: "manifest.json",
    format: ".JSON",
    desc: "Lista versionada de todos os arquivos públicos, datas, origem e rótulos metodológicos."
  },
  {
    title: "PM10 2013-2026",
    file: "pm10-timeline-2013-2026.csv",
    format: ".CSV",
    desc: "Linha do tempo plurianual de PM10 por estação, cobertura e excedências experimentais."
  },
  {
    title: "SO₂ 2013-2026",
    file: "so2-timeline-2013-2026.csv",
    format: ".CSV",
    desc: "Série histórica consolidada de dióxido de enxofre em Volta Redonda."
  },
  {
    title: "CO 2013-2026",
    file: "co-timeline-2013-2026.csv",
    format: ".CSV",
    desc: "Série histórica consolidada de monóxido de carbono, mantendo a unidade nativa em ppm."
  },
  {
    title: "Episódios 2020-2026",
    file: "attention-episodes-2020-2026.csv",
    format: ".CSV",
    desc: "Base de episódios de atenção para leitura pedagógica de excedências e sazonalidade."
  }
];
