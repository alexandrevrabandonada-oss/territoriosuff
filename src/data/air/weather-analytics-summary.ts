// Pre-aggregated weather analytics summary for SEMEAR PWA UI
// Generated automatically by scripts/generate-weather-data.ts

export interface WindRoseItem {
  quadrant: string;
  frequency: number;
  avgSpeed: number;
}

export interface CalmDaysStatsItem {
  year: number;
  calmHours: number;
  totalHours: number;
  calmDaysEquivalent: number;
  calmPercentage: number;
}

export interface RainWashingStats {
  dry: { pm10: number; pm25: number; hours: number };
  rainy: { pm10: number; pm25: number; hours: number };
  washReductionPct: { pm10: number; pm25: number };
}

export interface So2WindSectorItem {
  quadrant: string;
  avgSo2: number;
}

export const WIND_ROSE_DATA: WindRoseItem[] = [
  {
    "quadrant": "N",
    "frequency": 2.36,
    "avgSpeed": 0.83
  },
  {
    "quadrant": "NNE",
    "frequency": 2.71,
    "avgSpeed": 0.69
  },
  {
    "quadrant": "NE",
    "frequency": 4.59,
    "avgSpeed": 0.77
  },
  {
    "quadrant": "ENE",
    "frequency": 7.08,
    "avgSpeed": 1.06
  },
  {
    "quadrant": "E",
    "frequency": 9.85,
    "avgSpeed": 1.45
  },
  {
    "quadrant": "ESE",
    "frequency": 9.27,
    "avgSpeed": 1.78
  },
  {
    "quadrant": "SE",
    "frequency": 6.48,
    "avgSpeed": 1.99
  },
  {
    "quadrant": "SSE",
    "frequency": 9.7,
    "avgSpeed": 1.17
  },
  {
    "quadrant": "S",
    "frequency": 6.12,
    "avgSpeed": 1.07
  },
  {
    "quadrant": "SSW",
    "frequency": 1.26,
    "avgSpeed": 1.1
  },
  {
    "quadrant": "SW",
    "frequency": 1.68,
    "avgSpeed": 1.04
  },
  {
    "quadrant": "WSW",
    "frequency": 2.08,
    "avgSpeed": 1.06
  },
  {
    "quadrant": "W",
    "frequency": 3.01,
    "avgSpeed": 1.02
  },
  {
    "quadrant": "WNW",
    "frequency": 9.94,
    "avgSpeed": 0.91
  },
  {
    "quadrant": "NW",
    "frequency": 16.3,
    "avgSpeed": 1.1
  },
  {
    "quadrant": "NNW",
    "frequency": 7.57,
    "avgSpeed": 0.92
  }
];

export const CALM_DAYS_STATS: CalmDaysStatsItem[] = [
  {
    "year": 2013,
    "calmHours": 7728,
    "totalHours": 8760,
    "calmDaysEquivalent": 322,
    "calmPercentage": 88.2
  },
  {
    "year": 2014,
    "calmHours": 7591,
    "totalHours": 8760,
    "calmDaysEquivalent": 316.3,
    "calmPercentage": 86.7
  },
  {
    "year": 2015,
    "calmHours": 7799,
    "totalHours": 8760,
    "calmDaysEquivalent": 325,
    "calmPercentage": 89
  },
  {
    "year": 2016,
    "calmHours": 8042,
    "totalHours": 8784,
    "calmDaysEquivalent": 335.1,
    "calmPercentage": 91.6
  },
  {
    "year": 2017,
    "calmHours": 8406,
    "totalHours": 8760,
    "calmDaysEquivalent": 350.3,
    "calmPercentage": 96
  },
  {
    "year": 2018,
    "calmHours": 8463,
    "totalHours": 8760,
    "calmDaysEquivalent": 352.6,
    "calmPercentage": 96.6
  },
  {
    "year": 2019,
    "calmHours": 5564,
    "totalHours": 8760,
    "calmDaysEquivalent": 231.8,
    "calmPercentage": 63.5
  },
  {
    "year": 2020,
    "calmHours": 3757,
    "totalHours": 8784,
    "calmDaysEquivalent": 156.5,
    "calmPercentage": 42.8
  },
  {
    "year": 2021,
    "calmHours": 2181,
    "totalHours": 8760,
    "calmDaysEquivalent": 90.9,
    "calmPercentage": 24.9
  },
  {
    "year": 2022,
    "calmHours": 6236,
    "totalHours": 8760,
    "calmDaysEquivalent": 259.8,
    "calmPercentage": 71.2
  },
  {
    "year": 2023,
    "calmHours": 5993,
    "totalHours": 8760,
    "calmDaysEquivalent": 249.7,
    "calmPercentage": 68.4
  },
  {
    "year": 2024,
    "calmHours": 5598,
    "totalHours": 8784,
    "calmDaysEquivalent": 233.3,
    "calmPercentage": 63.7
  },
  {
    "year": 2025,
    "calmHours": 6403,
    "totalHours": 8760,
    "calmDaysEquivalent": 266.8,
    "calmPercentage": 73.1
  },
  {
    "year": 2026,
    "calmHours": 2606,
    "totalHours": 3624,
    "calmDaysEquivalent": 108.6,
    "calmPercentage": 71.9
  }
];

export const RAIN_WASHING_STATS: RainWashingStats = {
  "dry": {
    "pm10": 27.14,
    "pm25": 12.21,
    "hours": 115868
  },
  "rainy": {
    "pm10": 9.92,
    "pm25": 5.02,
    "hours": 1708
  },
  "washReductionPct": {
    "pm10": 63.4,
    "pm25": 58.9
  }
};

export const SO2_WIND_SECTOR_ROSE: So2WindSectorItem[] = [
  {
    "quadrant": "N",
    "avgSo2": 6.5
  },
  {
    "quadrant": "NNE",
    "avgSo2": 6.48
  },
  {
    "quadrant": "NE",
    "avgSo2": 6.53
  },
  {
    "quadrant": "ENE",
    "avgSo2": 6.48
  },
  {
    "quadrant": "E",
    "avgSo2": 6.48
  },
  {
    "quadrant": "ESE",
    "avgSo2": 15.99
  },
  {
    "quadrant": "SE",
    "avgSo2": 16
  },
  {
    "quadrant": "SSE",
    "avgSo2": 16.05
  },
  {
    "quadrant": "S",
    "avgSo2": 6.45
  },
  {
    "quadrant": "SSW",
    "avgSo2": 6.61
  },
  {
    "quadrant": "SW",
    "avgSo2": 6.49
  },
  {
    "quadrant": "WSW",
    "avgSo2": 6.57
  },
  {
    "quadrant": "W",
    "avgSo2": 6.52
  },
  {
    "quadrant": "WNW",
    "avgSo2": 6.49
  },
  {
    "quadrant": "NW",
    "avgSo2": 6.5
  },
  {
    "quadrant": "NNW",
    "avgSo2": 6.55
  }
];

export const WEATHER_METADATA = {
  maxConsecutiveDryDays: 45.5,
  lowDispersionEventsTotal: 37381,
  generatedAt: "2026-06-01T01:10:13.165Z",
  period: "2013 - 2026 (Jan-Mai 2026 Parcial)"
};
