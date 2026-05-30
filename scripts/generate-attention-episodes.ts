import * as fs from 'fs';
import * as path from 'path';

interface AttentionEpisode {
  year: number;
  pollutant: 'PM10' | 'PM2.5';
  station_id: string;
  station_name: string;
  month: string; // "YYYY-MM"
  valid_days: number;
  who_exceedance_days: number;
  conama_exceedance_days: number;
  max_hourly_value: number | null;
  max_hourly_at: string | null;
  coverage_percent: number;
  data_quality_tier: 'HIGH' | 'MEDIUM' | 'LOW';
  validation_note: string;
}

interface ParticulateTimelineEntry {
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

const STATIONS = [
  { id: "69", name: "VR - Belmonte" },
  { id: "70", name: "VR - Retiro" },
  { id: "71", name: "VR - Santa Cecília" }
];

const POLLUTANTS = [
  { id: "18", name: "PM10" as const, whoLimit: 45, conamaLimit: 50 },
  { id: "20", name: "PM2.5" as const, whoLimit: 15, conamaLimit: 25 }
];

const YEARS = [2022, 2023, 2024, 2025, 2026];

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function generateEpisodes() {
  const episodes: AttentionEpisode[] = [];

  for (const year of YEARS) {
    const maxMonth = year === 2026 ? 5 : 12;
    for (const station of STATIONS) {
      for (const pollutant of POLLUTANTS) {
        for (let m = 1; m <= maxMonth; m++) {
          const monthStr = m.toString().padStart(2, '0');
          const monthLabel = `${year}-${monthStr}`;
          const daysInMonth = getDaysInMonth(year, m);
          const expectedHours = daysInMonth * 24;

          const filePath = path.join(
            process.cwd(),
            'data',
            'inea_weblakes_normalized',
            station.id,
            pollutant.id,
            `${year}-${monthStr}.json`
          );

          if (!fs.existsSync(filePath)) {
            // File does not exist, push empty episode data
            episodes.push({
              year,
              pollutant: pollutant.name,
              station_id: station.id,
              station_name: station.name,
              month: monthLabel,
              valid_days: 0,
              who_exceedance_days: 0,
              conama_exceedance_days: 0,
              max_hourly_value: null,
              max_hourly_at: null,
              coverage_percent: 0,
              data_quality_tier: 'LOW',
              validation_note: "Ausência total de dado (não representa ar bom)"
            });
            continue;
          }

          const fileContent = fs.readFileSync(filePath, 'utf-8');
          const hourlyData = JSON.parse(fileContent);

          // Group by day (YYYY-MM-DD)
          const dailyGroups: Record<string, number[]> = {};
          let validHoursCount = 0;
          let maxVal: number | null = null;
          let maxAt: string | null = null;

          for (const row of hourlyData) {
            if (row.value !== null && row.value !== undefined) {
              const dt = row.datetime; // "YYYY-MM-DDTHH:MM:SS"
              const datePart = dt.split('T')[0];
              
              if (!dailyGroups[datePart]) {
                dailyGroups[datePart] = [];
              }
              dailyGroups[datePart].push(row.value);
              validHoursCount++;

              if (maxVal === null || row.value > maxVal) {
                maxVal = row.value;
                maxAt = dt;
              }
            }
          }

          // Calculate daily exceedances
          let validDays = 0;
          let whoExceedDays = 0;
          let conamaExceedDays = 0;

          for (const date in dailyGroups) {
            const values = dailyGroups[date];
            // Standard require >= 18 valid hours (75%)
            if (values.length >= 18) {
              validDays++;
              const dailyMean = values.reduce((sum, v) => sum + v, 0) / values.length;
              if (dailyMean > pollutant.whoLimit) {
                whoExceedDays++;
              }
              if (dailyMean > pollutant.conamaLimit) {
                conamaExceedDays++;
              }
            }
          }

          const coverage = (validHoursCount / expectedHours) * 100;
          let tier: 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
          if (coverage >= 75) {
            tier = 'HIGH';
          } else if (coverage >= 30) {
            tier = 'MEDIUM';
          }

          const validation_note = `Cobertura técnica de ${coverage.toFixed(1)}% com ${validDays} dias válidos analiticamente.`;

          episodes.push({
            year,
            pollutant: pollutant.name,
            station_id: station.id,
            station_name: station.name,
            month: monthLabel,
            valid_days: validDays,
            who_exceedance_days: whoExceedDays,
            conama_exceedance_days: conamaExceedDays,
            max_hourly_value: maxVal,
            max_hourly_at: maxAt,
            coverage_percent: coverage,
            data_quality_tier: tier,
            validation_note
          });
        }
      }
    }
  }

  // Write episodes file
  const outputEpisodesPath = path.join(process.cwd(), 'src', 'data', 'air', 'attention-episodes-2022-2026.ts');
  const episodesContent = `// Arquivo gerado automaticamente pelo script scripts/generate-attention-episodes.ts
// Não modifique manualmente.

export interface AttentionEpisode {
  year: number;
  pollutant: 'PM10' | 'PM2.5';
  station_id: string;
  station_name: string;
  month: string; // "YYYY-MM"
  valid_days: number;
  who_exceedance_days: number;
  conama_exceedance_days: number;
  max_hourly_value: number | null;
  max_hourly_at: string | null;
  coverage_percent: number;
  data_quality_tier: 'HIGH' | 'MEDIUM' | 'LOW';
  validation_note: string;
}

export const ATTENTION_EPISODES: AttentionEpisode[] = ${JSON.stringify(episodes, null, 2)};
`;

  fs.writeFileSync(outputEpisodesPath, episodesContent, 'utf-8');
  console.log(`Success: Generated attention episodes data at ${outputEpisodesPath}`);

  // Generate Particulate Timeline data
  const timelineEntries: ParticulateTimelineEntry[] = [];
  for (const yr of YEARS) {
    const summaryPath = path.join(
      process.cwd(),
      'data',
      'inea_weblakes_normalized',
      `summary-${yr}.json`
    );
    if (!fs.existsSync(summaryPath)) continue;
    const summary = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
    for (const station of STATIONS) {
      const stationData = summary[station.id];
      if (!stationData) continue;
      for (const pollutant of POLLUTANTS) {
        const pollData = stationData.pollutants[pollutant.id];
        if (pollData && pollData.totalHours > 0) {
          timelineEntries.push({
            year: yr,
            station_id: station.id,
            station_name: station.name,
            pollutant: pollutant.name,
            mean: pollData.mean,
            max: pollData.max,
            coveragePct: pollData.coveragePct,
            exceedances_who: pollData.exceedances?.WHO_24H ?? 0,
            exceedances_conama: pollData.exceedances?.BR_24H_FINAL ?? 0,
            partial: yr === 2026
          });
        }
      }
    }
  }

  // Write timeline file
  const outputTimelinePath = path.join(process.cwd(), 'src', 'data', 'air', 'particulate-timeline-2022-2026.ts');
  const timelineContent = `// Arquivo gerado automaticamente pelo script scripts/generate-attention-episodes.ts
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

export const PARTICULATE_TIMELINE: ParticulateTimelineEntry[] = ${JSON.stringify(timelineEntries, null, 2)};
`;

  fs.writeFileSync(outputTimelinePath, timelineContent, 'utf-8');
  console.log(`Success: Generated particulate timeline data at ${outputTimelinePath}`);
}

generateEpisodes();
