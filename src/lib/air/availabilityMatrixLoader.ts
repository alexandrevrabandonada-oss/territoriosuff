export interface AvailabilityEntry {
  station_id: string;
  station_name: string;
  parameter_id: string;
  pollutant: string;
  year: number;
  sampled_windows: number;
  windows_with_data: number;
  estimated_availability: string;
  unit_detected: string;
  parser_status: string;
  min_sample_value: number | null;
  max_sample_value: number | null;
  zeros_count: number;
  notes: string;
}

let availabilityMatrixPromise: Promise<AvailabilityEntry[]> | null = null;

export async function loadAvailabilityMatrix() {
  if (!availabilityMatrixPromise) {
    availabilityMatrixPromise = import("../../../data/air/availability-matrix.json").then(
      (module) => module.default as AvailabilityEntry[]
    );
  }

  return availabilityMatrixPromise;
}
