import { NormalizedRow } from '../inea/weblakesClient';
import { THRESHOLDS } from './thresholds';

export interface DailyAverage {
  date: string;
  value: number | null;
  validHours: number;
  totalHours: number;
}

export interface Moving8hAverage {
  datetime: string;
  value: number | null;
  validHoursCount: number;
}

export interface DataGap {
  start: string;
  end: string;
  durationHours: number;
}

export interface PollutantYearSummary {
  pollutant: string;
  unit: string;
  totalHours: number;
  expectedHours: number;
  coveragePct: number;
  missingHours: number;
  mean: number | null;
  min: number | null;
  max: number | null;
  zeroHours: number;
  gaps: DataGap[];
  exceedances: {
    label: string;
    threshold: number;
    count: number;
    regime: 'WHO' | 'BR';
    averaging_period: string;
  }[];
}

// 1. Recalcular médias diárias (necessita >= 18 horas válidas)
export function computeDailyMeans(rawHourlySeries: NormalizedRow[]): DailyAverage[] {
  const dailyGroups: Record<string, { sum: number; count: number; total: number }> = {};

  for (const r of rawHourlySeries) {
    const dateStr = r.datetime.split('T')[0];
    if (!dailyGroups[dateStr]) {
      dailyGroups[dateStr] = { sum: 0, count: 0, total: 0 };
    }
    dailyGroups[dateStr].total++;
    if (r.value !== null) {
      dailyGroups[dateStr].sum += r.value;
      dailyGroups[dateStr].count++;
    }
  }

  const result: DailyAverage[] = Object.entries(dailyGroups).map(([date, g]) => {
    const value = g.count >= 18 ? g.sum / g.count : null;
    return {
      date,
      value,
      validHours: g.count,
      totalHours: g.total
    };
  });

  return result.sort((a, b) => a.date.localeCompare(b.date));
}

// 2. Média anual das médias diárias
export function computeAnnualMeans(dailySeries: { date: string; value: number | null }[]): number | null {
  const validDailyMeans = dailySeries
    .map(d => d.value)
    .filter((v): v is number => v !== null);

  if (validDailyMeans.length === 0) {
    return null;
  }

  const sum = validDailyMeans.reduce((a, b) => a + b, 0);
  return sum / validDailyMeans.length;
}

// 3. Média móvel de 8h (necessita >= 6 das 8 horas válidas em janela de 8h consecutivas)
export function computeMoving8h(rawHourlySeries: NormalizedRow[]): Moving8hAverage[] {
  // Sort series by datetime
  const sorted = [...rawHourlySeries].sort((a, b) => a.datetime.localeCompare(b.datetime));
  const result: Moving8hAverage[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i];
    const currentTime = new Date(current.datetime).getTime();
    
    // Find hours in window [current_time - 7h, current_time]
    const windowRows: NormalizedRow[] = [];
    const eightHoursMs = 7 * 60 * 60 * 1000;
    
    for (let j = i; j >= 0; j--) {
      const checkTime = new Date(sorted[j].datetime).getTime();
      if (currentTime - checkTime <= eightHoursMs) {
        windowRows.push(sorted[j]);
      } else {
        break; // out of window range
      }
    }

    const validRows = windowRows.filter(r => r.value !== null);
    const validCount = validRows.length;
    
    // For 8h moving average, we require at least 6 valid hours (75%)
    let movingAvg: number | null = null;
    if (validCount >= 6) {
      const sum = validRows.reduce((a, b) => a + (b.value || 0), 0);
      movingAvg = sum / validCount;
    }

    result.push({
      datetime: current.datetime,
      value: movingAvg,
      validHoursCount: validCount
    });
  }

  return result;
}

// 4. Detecção de excedências
export function detectThresholdExceedances(
  series: { datetime?: string; date?: string; value: number | null }[],
  thresholdValue: number
): any[] {
  return series.filter(s => s.value !== null && s.value > thresholdValue);
}

// 5. Cobertura de dados
export function computeCoverage(series: any[], expectedCadence: number): number {
  if (expectedCadence <= 0) return 0;
  return (series.length / expectedCadence) * 100;
}

// 6. Detecção de lacunas (gaps)
export function computeDataGaps(series: NormalizedRow[]): DataGap[] {
  if (series.length === 0) return [];
  const sorted = [...series].sort((a, b) => a.datetime.localeCompare(b.datetime));
  
  const gaps: DataGap[] = [];
  const oneHourMs = 60 * 60 * 1000;

  for (let i = 0; i < sorted.length - 1; i++) {
    const current = sorted[i];
    const next = sorted[i + 1];
    const diff = new Date(next.datetime).getTime() - new Date(current.datetime).getTime();

    if (diff > oneHourMs) {
      // Gap found!
      gaps.push({
        start: current.datetime,
        end: next.datetime,
        durationHours: Math.round(diff / oneHourMs) - 1
      });
    } else if (current.value === null) {
      // Missing value is also a gap
      gaps.push({
        start: current.datetime,
        end: current.datetime,
        durationHours: 1
      });
    }
  }

  // Handle last element null
  if (sorted.length > 0 && sorted[sorted.length - 1].value === null) {
    const last = sorted[sorted.length - 1];
    gaps.push({
      start: last.datetime,
      end: last.datetime,
      durationHours: 1
    });
  }

  return gaps;
}

export function getNormalizedValueForThreshold(
  value: number,
  valueUnit: string,
  thresholdUnit: string,
  pollutant: string
): number {
  if (!valueUnit || !thresholdUnit || valueUnit === thresholdUnit) return value;
  if (pollutant === "CO") {
    if (valueUnit === "ppm" && thresholdUnit === "mg/m³") {
      // 1 ppm CO = 1.145 mg/m3 at 25C and 1 atm
      return value * 1.145;
    }
    if (valueUnit === "mg/m³" && thresholdUnit === "ppm") {
      return value / 1.145;
    }
  }
  return value;
}

// 7. Sumarização por poluente
export function summarizePollutantYear(
  series: NormalizedRow[],
  year: number,
  pollutant: string
): PollutantYearSummary {
  const filtered = series.filter(r => r.pollutant === pollutant && r.datetime.startsWith(String(year)));
  const isLeap = (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
  const yearExpectedHours = isLeap ? 366 * 24 : 365 * 24;

  const totalHours = filtered.length;
  const coveragePct = (totalHours / yearExpectedHours) * 100;
  const missingHours = Math.max(0, yearExpectedHours - totalHours);

  const values = filtered.map(r => r.value).filter((v): v is number => v !== null);
  const zeroHours = values.filter(v => v === 0).length;

  const min = values.length > 0 ? Math.min(...values) : null;
  const max = values.length > 0 ? Math.max(...values) : null;
  const mean = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null;

  const unit = filtered[0]?.unit || "µg/m³";

  const gaps = computeDataGaps(filtered);

  // Exceedances calculation
  const dailyMeans = computeDailyMeans(filtered);
  const moving8h = (pollutant === "O3" || pollutant === "CO") ? computeMoving8h(filtered) : [];

  // Filter thresholds for this pollutant
  const activeThresholds = THRESHOLDS.filter(t => t.pollutant === pollutant);
  const exceedanceStats = activeThresholds.map(t => {
    let count = 0;
    if (t.averaging_period === "DAY") {
      const mappedDailyMeans = dailyMeans.map(d => ({
        ...d,
        value: d.value !== null ? getNormalizedValueForThreshold(d.value, unit, t.unit, pollutant) : null
      }));
      count = detectThresholdExceedances(mappedDailyMeans, t.threshold_value).length;
    } else if (t.averaging_period === "MOVING_8H") {
      if (pollutant === "O3" || pollutant === "CO") {
        const mappedMoving8h = moving8h.map(m => ({
          ...m,
          value: m.value !== null ? getNormalizedValueForThreshold(m.value, unit, t.unit, pollutant) : null
        }));
        count = detectThresholdExceedances(mappedMoving8h, t.threshold_value).length;
      } else {
        count = 0; // fallback
      }
    } else if (t.averaging_period === "HOUR") {
      const mappedFiltered = filtered.map(f => ({
        ...f,
        value: f.value !== null ? getNormalizedValueForThreshold(f.value, unit, t.unit, pollutant) : null
      }));
      count = detectThresholdExceedances(mappedFiltered, t.threshold_value).length;
    }

    return {
      label: t.label,
      threshold: t.threshold_value,
      count,
      regime: t.regime,
      averaging_period: t.averaging_period
    };
  });

  return {
    pollutant,
    unit,
    totalHours,
    expectedHours: yearExpectedHours,
    coveragePct,
    missingHours,
    mean,
    min,
    max,
    zeroHours,
    gaps,
    exceedances: exceedanceStats
  };
}

// 8. Sumarização por estação
export function summarizeStationYear(
  series: NormalizedRow[],
  year: number,
  stationId: string
): Record<string, PollutantYearSummary> {
  const stationRows = series.filter(r => r.station_id === stationId);
  const pollutants = Array.from(new Set(stationRows.map(r => r.pollutant)));
  const result: Record<string, PollutantYearSummary> = {};

  for (const p of pollutants) {
    result[p] = summarizePollutantYear(stationRows, year, p);
  }

  return result;
}
