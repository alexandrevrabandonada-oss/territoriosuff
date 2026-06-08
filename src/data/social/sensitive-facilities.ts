export interface Facility {
  name: string;
  type: 'Escola' | 'Creche' | 'UBS' | 'UPA' | 'Hospital' | 'CRAS';
  lat: number;
  lng: number;
  bairro: string;
  nearestAirStation: string;
  distanceToIndustrialAreaM: number;
}

export const SENSITIVE_FACILITIES: Facility[] = [
  {
    name: "Creche Municipal Recanto das Crianças",
    type: "Creche",
    lat: -22.5038,
    lng: -44.1205,
    bairro: "Retiro",
    nearestAirStation: "RET",
    distanceToIndustrialAreaM: 1800
  },
  {
    name: "C.E. Manuel Marinho",
    type: "Escola",
    lat: -22.5218,
    lng: -44.1042,
    bairro: "Vila Santa Cecília",
    nearestAirStation: "SCE",
    distanceToIndustrialAreaM: 1100
  },
  {
    name: "E.M. Jesus Menino",
    type: "Escola",
    lat: -22.5188,
    lng: -44.1351,
    bairro: "Belmonte",
    nearestAirStation: "BEL",
    distanceToIndustrialAreaM: 3500
  },
  {
    name: "Creche Municipal Ayrton Senna",
    type: "Creche",
    lat: -22.5050,
    lng: -44.0950,
    bairro: "Aterrado",
    nearestAirStation: "NSG",
    distanceToIndustrialAreaM: 1400
  },
  {
    name: "E.M. Prefeito Waldyr Amaral",
    type: "Escola",
    lat: -22.4998,
    lng: -44.1245,
    bairro: "Retiro",
    nearestAirStation: "RET",
    distanceToIndustrialAreaM: 2300
  },
  {
    name: "UBSF Retiro",
    type: "UBS",
    lat: -22.5015,
    lng: -44.1210,
    bairro: "Retiro",
    nearestAirStation: "RET",
    distanceToIndustrialAreaM: 1900
  },
  {
    name: "UBSF Belmonte",
    type: "UBS",
    lat: -22.5165,
    lng: -44.1308,
    bairro: "Belmonte",
    nearestAirStation: "BEL",
    distanceToIndustrialAreaM: 3000
  },
  {
    name: "UBSF Vila Mury",
    type: "UBS",
    lat: -22.4975,
    lng: -44.1162,
    bairro: "Vila Mury",
    nearestAirStation: "RET",
    distanceToIndustrialAreaM: 2600
  },
  {
    name: "UPA 24h Santo Agostinho",
    type: "UPA",
    lat: -22.5085,
    lng: -44.0750,
    bairro: "Santo Agostinho",
    nearestAirStation: "NSG",
    distanceToIndustrialAreaM: 3800
  },
  {
    name: "UBSF Conforto",
    type: "UBS",
    lat: -22.5110,
    lng: -44.1080,
    bairro: "Conforto",
    nearestAirStation: "SCE",
    distanceToIndustrialAreaM: 800
  },
  {
    name: "Hospital das Clínicas de Volta Redonda",
    type: "Hospital",
    lat: -22.5230,
    lng: -44.1052,
    bairro: "Vila Santa Cecília",
    nearestAirStation: "SCE",
    distanceToIndustrialAreaM: 1200
  },
  {
    name: "Hospital Mun. Dr. Munir Rafful (Retiro)",
    type: "Hospital",
    lat: -22.5042,
    lng: -44.1235,
    bairro: "Retiro",
    nearestAirStation: "RET",
    distanceToIndustrialAreaM: 2000
  },
  {
    name: "Hospital Unimed Volta Redonda",
    type: "Hospital",
    lat: -22.5148,
    lng: -44.0990,
    bairro: "Laranjal",
    nearestAirStation: "NSG",
    distanceToIndustrialAreaM: 1400
  },
  {
    name: "Creche Municipal Sementes do Amanhã",
    type: "Creche",
    lat: -22.5080,
    lng: -44.1350,
    bairro: "Belmonte",
    nearestAirStation: "BEL",
    distanceToIndustrialAreaM: 3500
  },
  {
    name: "E.M. Prof. Maria da Conceição Lopes",
    type: "Escola",
    lat: -22.5020,
    lng: -44.0620,
    bairro: "Santo Agostinho",
    nearestAirStation: "NSG",
    distanceToIndustrialAreaM: 4100
  },
  {
    name: "C.E. Barão de Tefé",
    type: "Escola",
    lat: -22.5180,
    lng: -44.1110,
    bairro: "Conforto",
    nearestAirStation: "SCE",
    distanceToIndustrialAreaM: 800
  },
  {
    name: "UBSF Santa Cruz",
    type: "UBS",
    lat: -22.5050,
    lng: -44.1480,
    bairro: "Santa Cruz",
    nearestAirStation: "BEL",
    distanceToIndustrialAreaM: 5000
  },
  {
    name: "UBSF Jardim Amália",
    type: "UBS",
    lat: -22.5210,
    lng: -44.0910,
    bairro: "Jardim Amália",
    nearestAirStation: "NSG",
    distanceToIndustrialAreaM: 1900
  },
  {
    name: "Hospital Municipal Dr. Nelson Gonçalves",
    type: "Hospital",
    lat: -22.5090,
    lng: -44.0940,
    bairro: "Aterrado",
    nearestAirStation: "NSG",
    distanceToIndustrialAreaM: 1400
  },
  {
    name: "UPA 24h Central",
    type: "UPA",
    lat: -22.5225,
    lng: -44.1065,
    bairro: "Vila Santa Cecília",
    nearestAirStation: "SCE",
    distanceToIndustrialAreaM: 500
  },
  {
    name: "UBSF São Geraldo",
    type: "UBS",
    lat: -22.5290,
    lng: -44.1060,
    bairro: "São Geraldo",
    nearestAirStation: "SCE",
    distanceToIndustrialAreaM: 1300
  },
  {
    name: "CRAS Retiro",
    type: "CRAS",
    lat: -22.5005,
    lng: -44.1250,
    bairro: "Retiro",
    nearestAirStation: "RET",
    distanceToIndustrialAreaM: 2200
  },
  {
    name: "CRAS Santa Cruz",
    type: "CRAS",
    lat: -22.5060,
    lng: -44.1460,
    bairro: "Santa Cruz",
    nearestAirStation: "BEL",
    distanceToIndustrialAreaM: 4800
  },
  {
    name: "CRAS Santo Agostinho",
    type: "CRAS",
    lat: -22.5030,
    lng: -44.0660,
    bairro: "Santo Agostinho",
    nearestAirStation: "NSG",
    distanceToIndustrialAreaM: 3900
  },
  {
    name: "CRAS Conforto",
    type: "CRAS",
    lat: -22.5160,
    lng: -44.1105,
    bairro: "Conforto",
    nearestAirStation: "SCE",
    distanceToIndustrialAreaM: 700
  }
];
