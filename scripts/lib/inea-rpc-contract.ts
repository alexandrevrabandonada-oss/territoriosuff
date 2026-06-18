export interface IneaRpcCheck {
  name: string;
  args?: Record<string, unknown>;
  migration: string;
}

export const INEA_RPC_CHECKS: IneaRpcCheck[] = [
  { name: "get_inea_summary", migration: "20260616231500_inea_freshness_rpc.sql" },
  { name: "get_inea_latest_snapshot", migration: "20260616224500_inea_latest_snapshot_rpc.sql" },
  { name: "get_inea_freshness", migration: "20260616231500_inea_freshness_rpc.sql" },
  { name: "get_inea_data_gaps", migration: "20260616212000_inea_data_gap_window_metadata.sql" },
  { name: "get_inea_monthly_profile", migration: "20260616190000_inea_radar_rpc_hardening.sql" },
  { name: "get_inea_controller_frequency", migration: "20260616234500_inea_classification_and_controller_rpcs.sql" },
  { name: "get_inea_station_ranking", migration: "20260616190000_inea_radar_rpc_hardening.sql" },
  { name: "get_inea_degraded_days", migration: "20260616190000_inea_radar_rpc_hardening.sql" },
  { name: "get_inea_public_stations", args: { p_station_id: null }, migration: "20260617003000_inea_public_stations_rpc.sql" },
  { name: "get_inea_classification_days", args: { p_station_id: null, p_from: null, p_to: null }, migration: "20260616234500_inea_classification_and_controller_rpcs.sql" }
];

export function isMissingIneaRpcError(message: string) {
  return message.includes("Could not find the function public.get_inea_");
}
