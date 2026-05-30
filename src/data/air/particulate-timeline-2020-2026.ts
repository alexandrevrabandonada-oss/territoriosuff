// Arquivo gerado automaticamente pelo script scripts/generate-attention-episodes.ts
// Não modifique manualmente.

export interface ParticulateTimelineEntry {
  year: number;
  station_id: string;
  station_name: string;
  pollutant: 'PM10' | 'PM2.5';
  mean: number | null;
  max: number | null;
  coveragePct: number;
  exceedances_who: number;
  exceedances_conama: number;
  partial?: boolean;
}

export const PARTICULATE_TIMELINE: ParticulateTimelineEntry[] = [
  {
    "year": 2020,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM10",
    "mean": 15.742477408798129,
    "max": 188,
    "coveragePct": 92.89617486338798,
    "exceedances_who": 4,
    "exceedances_conama": 1,
    "partial": false
  },
  {
    "year": 2020,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM10",
    "mean": 28.090363682645744,
    "max": 303,
    "coveragePct": 77.90300546448088,
    "exceedances_who": 22,
    "exceedances_conama": 14,
    "partial": false
  },
  {
    "year": 2020,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM10",
    "mean": 19.81498584820143,
    "max": 258.783303265042,
    "coveragePct": 78.99590163934425,
    "exceedances_who": 3,
    "exceedances_conama": 1,
    "partial": false
  },
  {
    "year": 2021,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM10",
    "mean": 28.329726581086913,
    "max": 251.383642075857,
    "coveragePct": 92.56849315068493,
    "exceedances_who": 55,
    "exceedances_conama": 41,
    "partial": false
  },
  {
    "year": 2021,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM2.5",
    "mean": 10.93067983384086,
    "max": 94.0015396287706,
    "coveragePct": 89.68036529680366,
    "exceedances_who": 69,
    "exceedances_conama": 9,
    "partial": false
  },
  {
    "year": 2021,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM10",
    "mean": 27.446347821055266,
    "max": 264.767015406291,
    "coveragePct": 97.73972602739725,
    "exceedances_who": 26,
    "exceedances_conama": 14,
    "partial": false
  },
  {
    "year": 2021,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM2.5",
    "mean": 9.482659594281271,
    "max": 82.359445177714,
    "coveragePct": 97.80821917808218,
    "exceedances_who": 48,
    "exceedances_conama": 2,
    "partial": false
  },
  {
    "year": 2021,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM10",
    "mean": 16.788174883725656,
    "max": 234.272822244432,
    "coveragePct": 74.18949771689498,
    "exceedances_who": 8,
    "exceedances_conama": 4,
    "partial": false
  },
  {
    "year": 2021,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM2.5",
    "mean": 8.282775544079671,
    "max": 92.9700737486945,
    "coveragePct": 71.23287671232876,
    "exceedances_who": 31,
    "exceedances_conama": 0,
    "partial": false
  },
  {
    "year": 2022,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM10",
    "mean": 30.74205386340659,
    "max": 319.39112074958,
    "coveragePct": 96.7123287671233,
    "exceedances_who": 38,
    "exceedances_conama": 26,
    "partial": false
  },
  {
    "year": 2022,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM2.5",
    "mean": 10.70633158753166,
    "max": 109.45,
    "coveragePct": 98.5958904109589,
    "exceedances_who": 64,
    "exceedances_conama": 6,
    "partial": false
  },
  {
    "year": 2022,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM10",
    "mean": 30.645285398129154,
    "max": 284.441828782823,
    "coveragePct": 97.44292237442922,
    "exceedances_who": 37,
    "exceedances_conama": 24,
    "partial": false
  },
  {
    "year": 2022,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM2.5",
    "mean": 9.12227277010394,
    "max": 97.5000750647651,
    "coveragePct": 98.98401826484017,
    "exceedances_who": 41,
    "exceedances_conama": 2,
    "partial": false
  },
  {
    "year": 2022,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM10",
    "mean": 16.531227012066438,
    "max": 410.8149372779,
    "coveragePct": 91.89497716894978,
    "exceedances_who": 10,
    "exceedances_conama": 8,
    "partial": false
  },
  {
    "year": 2022,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM2.5",
    "mean": 8.022766870454715,
    "max": 96.5322627793506,
    "coveragePct": 94.3607305936073,
    "exceedances_who": 35,
    "exceedances_conama": 3,
    "partial": false
  },
  {
    "year": 2023,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM10",
    "mean": 36.11387163189068,
    "max": 333.103571200901,
    "coveragePct": 95.69634703196347,
    "exceedances_who": 84,
    "exceedances_conama": 50,
    "partial": false
  },
  {
    "year": 2023,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM2.5",
    "mean": 11.502954896059833,
    "max": 86.2612833849589,
    "coveragePct": 97.71689497716895,
    "exceedances_who": 79,
    "exceedances_conama": 6,
    "partial": false
  },
  {
    "year": 2023,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM10",
    "mean": 28.55852926177569,
    "max": 251.458768675062,
    "coveragePct": 96.76940639269407,
    "exceedances_who": 24,
    "exceedances_conama": 8,
    "partial": false
  },
  {
    "year": 2023,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM2.5",
    "mean": 8.26389521863625,
    "max": 131.016475372314,
    "coveragePct": 97.78538812785388,
    "exceedances_who": 27,
    "exceedances_conama": 0,
    "partial": false
  },
  {
    "year": 2023,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM10",
    "mean": 20.990945457556023,
    "max": 383.836963738335,
    "coveragePct": 98.37899543378995,
    "exceedances_who": 12,
    "exceedances_conama": 6,
    "partial": false
  },
  {
    "year": 2023,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM2.5",
    "mean": 8.041498539360813,
    "max": 97.0252046267192,
    "coveragePct": 98.01369863013699,
    "exceedances_who": 29,
    "exceedances_conama": 1,
    "partial": false
  },
  {
    "year": 2024,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM10",
    "mean": 30.96902781974212,
    "max": 367.515159123739,
    "coveragePct": 93.53369763205829,
    "exceedances_who": 48,
    "exceedances_conama": 28,
    "partial": false
  },
  {
    "year": 2024,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM2.5",
    "mean": 11.331063661690017,
    "max": 84.1857440747155,
    "coveragePct": 95.63979963570127,
    "exceedances_who": 77,
    "exceedances_conama": 14,
    "partial": false
  },
  {
    "year": 2024,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM10",
    "mean": 29.69950312455378,
    "max": 300.758069534302,
    "coveragePct": 96.7440801457195,
    "exceedances_who": 46,
    "exceedances_conama": 32,
    "partial": false
  },
  {
    "year": 2024,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM2.5",
    "mean": 9.335077070779697,
    "max": 208.582668300205,
    "coveragePct": 99.66985428051002,
    "exceedances_who": 60,
    "exceedances_conama": 11,
    "partial": false
  },
  {
    "year": 2024,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM10",
    "mean": 18.012257801964573,
    "max": 212.703400306702,
    "coveragePct": 96.90346083788707,
    "exceedances_who": 5,
    "exceedances_conama": 2,
    "partial": false
  },
  {
    "year": 2024,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM2.5",
    "mean": 8.879715056126566,
    "max": 132.252555896971,
    "coveragePct": 98.3948087431694,
    "exceedances_who": 54,
    "exceedances_conama": 10,
    "partial": false
  },
  {
    "year": 2025,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM10",
    "mean": 27.293984739304648,
    "max": 187.782773130205,
    "coveragePct": 94.45205479452055,
    "exceedances_who": 7,
    "exceedances_conama": 3,
    "partial": false
  },
  {
    "year": 2025,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM2.5",
    "mean": 8.786425175876918,
    "max": 111.915807005179,
    "coveragePct": 93.66438356164383,
    "exceedances_who": 21,
    "exceedances_conama": 1,
    "partial": false
  },
  {
    "year": 2025,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM10",
    "mean": 22.130716821510912,
    "max": 175.334557668898,
    "coveragePct": 93.81278538812785,
    "exceedances_who": 3,
    "exceedances_conama": 2,
    "partial": false
  },
  {
    "year": 2025,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM2.5",
    "mean": 6.935120882349938,
    "max": 77.2822463851505,
    "coveragePct": 93.17351598173515,
    "exceedances_who": 7,
    "exceedances_conama": 0,
    "partial": false
  },
  {
    "year": 2025,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM10",
    "mean": 13.81650688223878,
    "max": 194.398551074134,
    "coveragePct": 95.41095890410959,
    "exceedances_who": 2,
    "exceedances_conama": 0,
    "partial": false
  },
  {
    "year": 2025,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM2.5",
    "mean": 6.8056298758895855,
    "max": 66.0361427699195,
    "coveragePct": 93.29908675799086,
    "exceedances_who": 4,
    "exceedances_conama": 0,
    "partial": false
  },
  {
    "year": 2026,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM10",
    "mean": 21.405445497592147,
    "max": 112.579831937154,
    "coveragePct": 93.92935982339957,
    "exceedances_who": 2,
    "exceedances_conama": 0,
    "partial": true
  },
  {
    "year": 2026,
    "station_id": "69",
    "station_name": "VR - Belmonte",
    "pollutant": "PM2.5",
    "mean": 7.8565702067227905,
    "max": 66.3759760051303,
    "coveragePct": 93.10154525386314,
    "exceedances_who": 8,
    "exceedances_conama": 0,
    "partial": true
  },
  {
    "year": 2026,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM10",
    "mean": 19.23380892686011,
    "max": 126.601811862522,
    "coveragePct": 85.89955849889624,
    "exceedances_who": 0,
    "exceedances_conama": 0,
    "partial": true
  },
  {
    "year": 2026,
    "station_id": "70",
    "station_name": "VR - Retiro",
    "pollutant": "PM2.5",
    "mean": 6.429691049845534,
    "max": 44.0658854103088,
    "coveragePct": 81.81567328918322,
    "exceedances_who": 1,
    "exceedances_conama": 0,
    "partial": true
  },
  {
    "year": 2026,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM10",
    "mean": 11.436649188858917,
    "max": 68.2304279020098,
    "coveragePct": 88.65894039735099,
    "exceedances_who": 0,
    "exceedances_conama": 0,
    "partial": true
  },
  {
    "year": 2026,
    "station_id": "71",
    "station_name": "VR - Santa Cecília",
    "pollutant": "PM2.5",
    "mean": 6.242981415907884,
    "max": 54.7959718745285,
    "coveragePct": 84.82339955849889,
    "exceedances_who": 1,
    "exceedances_conama": 0,
    "partial": true
  }
];
