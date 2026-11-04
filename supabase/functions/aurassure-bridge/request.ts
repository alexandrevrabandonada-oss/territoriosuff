/** Aurassure/UFF request contract. Never accept caller-controlled hosts or credentials. */
export const STATION_IDS = [46560, 46561, 46562] as const;
export const POLLUTANTS = [
  "pm1.0", "pm2.5", "pm10", "no2", "so2", "co", "o3", "co2", "temp", "humid", "tvoc", "aqi"
] as const;

type AggregatePeriod = 900 | 3600 | 86400;
export type ValidRequest =
  | { operation: "stations"; upstreamMethod: "GET"; upstreamPath: "list"; requestMeta: Record<string, unknown> }
  | {
      operation: "readings";
      upstreamMethod: "POST";
      upstreamPath: "data";
      requestMeta: Record<string, unknown>;
      upstreamBody: {
        data_type: "aggregate" | "raw";
        aggregation_period: 0 | AggregatePeriod;
        parameters: string[];
        parameter_attributes: string[];
        things: number[];
        from_time: number;
        upto_time: number;
      };
    };

function object(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function integer(value: unknown): value is number {
  return typeof value === "number" && Number.isSafeInteger(value);
}

export function parseAurassureRequest(input: unknown, nowUnix = Math.floor(Date.now() / 1000)): ValidRequest {
  const body = object(input);
  if (!body) throw new Error("invalid_body");

  if (body.operation === "stations") {
    return { operation: "stations", upstreamMethod: "GET", upstreamPath: "list", requestMeta: { operation: "stations" } };
  }

  if (body.operation !== "readings") throw new Error("invalid_operation");
  const dataType = body.data_type;
  if (dataType !== "raw" && dataType !== "aggregate") throw new Error("invalid_data_type");
  const period = dataType === "raw" ? 0 : (body.aggregation_period ?? 900);
  if (dataType === "raw" && body.aggregation_period !== undefined && body.aggregation_period !== 0) {
    throw new Error("invalid_aggregation_period");
  }
  if (dataType === "aggregate" && period !== 900 && period !== 3600 && period !== 86400) {
    throw new Error("invalid_aggregation_period");
  }

  const ids = body.things ?? [...STATION_IDS];
  if (!Array.isArray(ids) || ids.length < 1 || ids.length > 3 || new Set(ids).size !== ids.length ||
      !ids.every((id) => integer(id) && (STATION_IDS as readonly number[]).includes(id))) {
    throw new Error("invalid_stations");
  }

  const defaults = dataType === "aggregate" ? [...POLLUTANTS] : POLLUTANTS.filter((p) => p !== "aqi");
  const params = body.parameters ?? defaults;
  if (!Array.isArray(params) || params.length < 1 || params.length > POLLUTANTS.length ||
      new Set(params).size !== params.length || !params.every((p) => typeof p === "string" && POLLUTANTS.includes(p as typeof POLLUTANTS[number])) ||
      (dataType === "raw" && params.includes("aqi"))) {
    throw new Error("invalid_parameters");
  }

  const from = body.from_time;
  const upto = body.upto_time;
  if (!integer(from) || !integer(upto) || from < 0 || upto <= from || upto - from > 86400 || upto > nowUnix + 300) {
    throw new Error("invalid_time_window");
  }

  const upstreamBody = {
    data_type: dataType as "aggregate" | "raw",
    aggregation_period: period as 0 | AggregatePeriod,
    parameters: params as string[],
    parameter_attributes: dataType === "aggregate" ? ["value", "avg"] : [],
    things: ids as number[],
    from_time: from,
    upto_time: upto
  };
  return {
    operation: "readings",
    upstreamMethod: "POST",
    upstreamPath: "data",
    requestMeta: { operation: "readings", ...upstreamBody },
    upstreamBody
  };
}
