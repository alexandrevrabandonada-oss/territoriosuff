import { getIneaSupabaseClient, isValidDateInput, rejectNonGet, sendPublicError } from "./_http";

function applyCsvHeaders(res: any, filename: string, truncated: boolean) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
  res.setHeader("X-Export-Truncated", truncated ? "true" : "false");
}

function escapeCsv(value: unknown) {
  return `"${String(value ?? "").replace(/"/g, "\"\"")}"`;
}

export default async function handler(req: any, res: any) {
  if (rejectNonGet(req, res)) return;

  try {
    const supabase = getIneaSupabaseClient();
    const { stationId, metricType, pollutant, from, to } = req.query;
    const requestedBatchSize = Number.parseInt(String(req.query.batchSize ?? "5000"), 10);

    if (req.query.batchSize !== undefined && !Number.isFinite(requestedBatchSize)) {
      return res.status(400).json({ error: "Invalid 'batchSize' value" });
    }
    if (from && !isValidDateInput(String(from))) {
      return res.status(400).json({ error: "Invalid 'from' date" });
    }
    if (to && !isValidDateInput(String(to))) {
      return res.status(400).json({ error: "Invalid 'to' date" });
    }

    const batchSize = Number.isFinite(requestedBatchSize) ? Math.min(Math.max(requestedBatchSize, 1000), 10000) : 5000;
    const maxRows = 100000;
    let offset = 0;
    let total = 0;
    let hasMore = true;
    let truncated = false;
    const rows: Array<Record<string, unknown>> = [];

    while (hasMore && rows.length < maxRows) {
      let query = supabase
        .from("air_measurements")
        .select(
          "id, station_id, pollutant, value, unit, measured_at, averaging_period, quality_flag, metric_type, air_quality_index, air_quality_classification, controlling_pollutant, raw_column, source",
          { count: offset === 0 ? "exact" : undefined }
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

      const { data, error, count } = await query
        .order("measured_at", { ascending: true })
        .range(offset, offset + batchSize - 1);

      if (error) throw error;

      const batch = data || [];
      if (offset === 0) {
        total = count || batch.length;
      }

      rows.push(...batch);
      offset += batch.length;
      hasMore = batch.length === batchSize && offset < total;
    }

    if (rows.length < total) {
      truncated = true;
    }

    const filenameBase = typeof stationId === "string" && stationId.trim() !== "" ? stationId : "todas-estacoes";
    applyCsvHeaders(res, `inea-export-${filenameBase}.csv`, truncated);

    const header = [
      "id",
      "station_id",
      "source",
      "metric_type",
      "pollutant",
      "value",
      "unit",
      "measured_at",
      "averaging_period",
      "quality_flag",
      "air_quality_index",
      "air_quality_classification",
      "controlling_pollutant",
      "raw_column"
    ];

    const csv = [
      header.join(","),
      ...rows.map((row) =>
        [
          row.id,
          row.station_id,
          row.source,
          row.metric_type,
          row.pollutant,
          row.value,
          row.unit,
          row.measured_at,
          row.averaging_period,
          row.quality_flag,
          row.air_quality_index,
          row.air_quality_classification,
          row.controlling_pollutant,
          row.raw_column
        ].map(escapeCsv).join(",")
      )
    ].join("\n");

    return res.status(200).send(csv);
  } catch (err: any) {
    return sendPublicError(res, "api/air/inea/export", err);
  }
}
