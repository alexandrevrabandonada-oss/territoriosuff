export interface WebLakesSite {
  id: string;
  name: string;
  shortName: string;
}

export interface WebLakesParameter {
  id: string;
  pollutant: string;
  unit: string;
  fullName: string;
}

export const SITES: Record<string, WebLakesSite> = {
  "69": {
    id: "69",
    name: "VR - Belmonte",
    shortName: "Belmonte"
  },
  "70": {
    id: "70",
    name: "VR - Retiro",
    shortName: "Retiro"
  },
  "71": {
    id: "71",
    name: "VR - Santa Cecília",
    shortName: "Santa Cecília"
  },
  "72": {
    id: "72",
    name: "VR - Meteorológica Ilha das Águas Cruas",
    shortName: "Ilha das Águas Cruas"
  }
};

export const PARAMETERS: Record<string, WebLakesParameter> = {
  "18": {
    id: "18",
    pollutant: "PM10",
    unit: "µg/m³",
    fullName: "MP10 - Partículas Inaláveis (<10µm)"
  },
  "20": {
    id: "20",
    pollutant: "PM2.5",
    unit: "µg/m³",
    fullName: "MP2,5 - Partículas Inaláveis (<2,5µm)"
  },
  "23": {
    id: "23",
    pollutant: "SO2",
    unit: "µg/m³",
    fullName: "SO2 - Dióxido de Enxofre"
  },
  "1465": {
    id: "1465",
    pollutant: "NO2",
    unit: "µg/m³",
    fullName: "NO2 - Dióxido de Nitrogênio"
  },
  "2130": {
    id: "2130",
    pollutant: "O3",
    unit: "µg/m³",
    fullName: "O3 - Ozônio"
  },
  "3": {
    id: "3",
    pollutant: "CO",
    unit: "ppm",
    fullName: "CO - Monóxido de Carbono"
  },
  "1955": {
    id: "1955",
    pollutant: "PTS",
    unit: "µg/m³",
    fullName: "PTS - Partículas Totais em Suspensão"
  }
};
