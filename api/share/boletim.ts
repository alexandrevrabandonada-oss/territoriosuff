import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";
import { escapeHtml } from "./_html";

const MONTH_LABELS = [
  "Janeiro",
  "Fevereiro",
  "Marco",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro"
];

function parseYm(input: string | null | undefined): { year: number; month: number } | null {
  if (!input) return null;
  const match = String(input).match(/^(\d{4})-(\d{2})$/);
  if (!match) return null;
  const year = Number.parseInt(match[1], 10);
  const month = Number.parseInt(match[2], 10);
  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) return null;
  return { year, month };
}

function formatCurrency(cents: number): string {
  return (cents / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export default async function handler(req: any, res: any) {
  const ym = typeof req.query?.ym === "string" ? req.query.ym : null;
  const parsed = parseYm(ym);

  if (!parsed) {
    return res.redirect("/status");
  }

  const { year, month } = parsed;
  const monthLabel = MONTH_LABELS[month - 1] ?? String(month);
  const slug = `${year}-${String(month).padStart(2, "0")}`;
  const redirectUrl = `/status?year=${year}&month=${month}`;

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    return res.redirect(redirectUrl);
  }

  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  let measurements: number;
  let alerts: number;
  let monthlyExpensesCents: number;

  try {
    const monthStart = `${year}-${String(month).padStart(2, "0")}-01`;
    const monthEnd = month === 12
      ? `${year + 1}-01-01`
      : `${year}-${String(month + 1).padStart(2, "0")}-01`;

    const [{ data: opsData, error: opsError }, { data: expenseRows, error: expensesError }] = await Promise.all([
      supabase.rpc("get_ops_kpis_month", { p_year: year, p_month: month }),
      supabase
        .from("expenses")
        .select("amount_cents")
        .gte("occurred_on", monthStart)
        .lt("occurred_on", monthEnd)
    ]);

    if (opsError) throw opsError;
    if (expensesError) throw expensesError;

    const ops = Array.isArray(opsData) ? opsData[0] : null;
    measurements = Number(ops?.total_measurements ?? 0);
    alerts = Number(ops?.total_push_alerts ?? 0);
    monthlyExpensesCents = (expenseRows ?? []).reduce(
      (sum: number, row: { amount_cents?: number | null }) => sum + Number(row.amount_cents ?? 0),
      0
    );

    try {
      const rawIp = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || "0.0.0.0";
      const ip = String(rawIp).split(",")[0].trim();
      const userAgent = req.headers["user-agent"] || "unknown";
      const referrer = req.headers["referer"] || null;
      const salt = process.env.SHARE_HASH_SALT || "default-salt-change-me";
      const ipHash = crypto.createHash("sha256").update(`${ip}-${userAgent}-${salt}`).digest("hex");

      await supabase.from("share_events").insert({
        kind: "boletim",
        slug,
        referrer,
        user_agent: userAgent,
        ip_hash: ipHash,
        meta: { year, month }
      });
    } catch (error) {
      console.error("[share/boletim] failed to log share event", error);
    }
  } catch (error) {
    console.error("[share/boletim] failed to assemble monthly bulletin share", error);
    return res.redirect(redirectUrl);
  }

  const host = req.headers["x-forwarded-host"] || req.headers.host || "semear-pwa.vercel.app";
  const proto = req.headers["x-forwarded-proto"] || "https";
  const hostUrl = `${proto}://${host}`;
  const title = `Boletim SEMEAR — ${monthLabel}/${year}`;
  const description = `Medições: ${measurements.toLocaleString("pt-BR")} | Alertas: ${alerts.toLocaleString("pt-BR")} | Gastos: ${formatCurrency(monthlyExpensesCents)}`;
  const image = `${hostUrl}/api/og/card?kind=boletim&title=${encodeURIComponent(title)}&subtitle=${encodeURIComponent(description)}`;
  const canonicalUrl = `${hostUrl}${redirectUrl}`;

  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <meta property="og:type" content="article">
  <meta property="og:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:image" content="${escapeHtml(image)}">
  <meta property="twitter:card" content="summary_large_image">
  <meta property="twitter:url" content="${escapeHtml(canonicalUrl)}">
  <meta property="twitter:title" content="${escapeHtml(title)}">
  <meta property="twitter:description" content="${escapeHtml(description)}">
  <meta property="twitter:image" content="${escapeHtml(image)}">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(redirectUrl)}">
</head>
<body>
  <p>Redirecionando para o boletim mensal...</p>
</body>
</html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  return res.status(200).send(html);
}
