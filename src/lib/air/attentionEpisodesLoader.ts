export type AttentionEpisode = {
  year: number;
  pollutant: "PM10" | "PM2.5";
  station_id: string;
  station_name: string;
  month: string;
  valid_days: number;
  who_exceedance_days: number;
  conama_exceedance_days: number;
  max_hourly_value: number | null;
  max_hourly_at: string | null;
  coverage_percent: number;
  data_quality_tier: "HIGH" | "MEDIUM" | "LOW";
  validation_note: string;
};

let attentionEpisodesPromise: Promise<AttentionEpisode[]> | null = null;

export async function loadAttentionEpisodes() {
  if (!attentionEpisodesPromise) {
    attentionEpisodesPromise = import("../../data/air/attention-episodes-2020-2026").then(
      (module) => module.ATTENTION_EPISODES as AttentionEpisode[]
    );
  }

  return attentionEpisodesPromise;
}
