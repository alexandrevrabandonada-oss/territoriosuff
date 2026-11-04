import { applyPublicJsonHeaders, getIneaSupabaseClient, isValidDateInput, rejectNonGet, sendPublicError } from "./_http.js";

export default async function handler(req: any, res: any) {
  applyPublicJsonHeaders(res);

  if (rejectNonGet(req, res)) return;

  try {
    const supabase = getIneaSupabaseClient();
    const { stationId, metricType, pollutant, from, to } = req.query;
    const requestedLimit = Number.parseInt(String(req.query.limit ?? "5000"), 10);
    const requestedOffset = Number.parseInt(String(req.query.offset ?? "0"), 10);
    if (req.query.limit !== undefined && !Number.isFinite(requestedLimit)) {
      return res.status(400).json({ error: "Invalid 'limit' value" });
    }
    if (req.query.offset !== undefined && (!Number.isFinite(requestedOffset) || requestedOffset < 0)) {
      return res.status(400).json({ error: "Invalid 'offset' value" });
    }
    if (from && !isValidDateInput(String(from))) {
      return res.status(400).json({ error: "Invalid 'from' date" });
    }
    if (to && !isValidDateInput(String(to))) {
      return res.status(400).json({ error: "Invalid 'to' date" });
    }
    const limit = Number.isFinite(requestedLimit) ? Math.min(Math.max(requestedLimit, 1), 20000) : 5000;
    const offset = Number.isFinite(requestedOffset) ? Math.max(requestedOffset, 0) : 0;

    let query = supabase
      .from("air_measurements")
      .select(
        "id, station_id, pollutant, value, unit, measured_at, averaging_period, quality_flag, metric_type, air_quality_index, air_quality_classification, controlling_pollutant, raw_column",
        { count: "exact" }
      )
      .eq("source", "INEA");

    if (stationId) {
      query = query.eq("station_id", stationId);
    }
    if (metricType) {
      query = query.eq("metric_type", metricType);
    }
    if (pollutant) {
      query = query.eq("pollutant", pollutant);
    }
    if (from) {
      query = query.gte("measured_at", from);
    }
    if (to) {
      query = query.lte("measured_at", to);
    }

    // Default sorting by timestamp
    const { data: timeseries, error, count } = await query
      .order("measured_at", { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    const items = timeseries || [];
    const total = count || items.length;
    const nextOffset = offset + items.length;
    const hasMore = nextOffset < total;

    return res.status(200).json({
      items,
      total,
      limit,
      offset,
      nextOffset: hasMore ? nextOffset : null,
      hasMore,
      truncated: total > offset + items.length
    });
  } catch (err: any) {
    return sendPublicError(res, "api/air/inea/timeseries", err);
  }
}
