import { createClient } from "@supabase/supabase-js";
import crypto from "node:crypto";

const CATEGORIES = new Set([
  "ar_fumaca",
  "residuos_lixo",
  "agua_esgoto",
  "desmatamento_poda",
  "outros"
]);

const requestWindow = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 10 * 60 * 1000;
const MAX_REQUESTS_PER_WINDOW = 5;

function readString(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim();
}

function getClientIp(req: any): string {
  const forwardedFor = req.headers["x-forwarded-for"];
  return String(Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor || req.socket?.remoteAddress || "0.0.0.0")
    .split(",")[0]
    .trim();
}

function getRateKey(req: any): string {
  const ip = getClientIp(req);
  const ua = String(req.headers["user-agent"] || "unknown").slice(0, 160);
  return crypto.createHash("sha256").update(`${ip}|${ua}`).digest("hex");
}

function isRateLimited(req: any): boolean {
  const now = Date.now();
  const key = getRateKey(req);
  const current = requestWindow.get(key);
  if (!current || current.resetAt <= now) {
    requestWindow.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  current.count += 1;
  return current.count > MAX_REQUESTS_PER_WINDOW;
}

function json(res: any, status: number, payload: Record<string, unknown>) {
  res.setHeader("Content-Type", "application/json; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  return res.status(status).json(payload);
}

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return json(res, 405, { error: "Metodo nao permitido." });
  }

  if (isRateLimited(req)) {
    return json(res, 429, { error: "Muitas tentativas. Aguarde alguns minutos antes de enviar outro relato." });
  }

  const body = typeof req.body === "object" && req.body ? req.body : {};
  const reporterName = readString(body.reporter_name);
  const reporterEmail = readString(body.reporter_email);
  const reporterPhone = readString(body.reporter_phone);
  const category = readString(body.category);
  const location = readString(body.location);
  const description = readString(body.description);

  if (!reporterName || !category || !location || !description) {
    return json(res, 400, { error: "Campos obrigatorios ausentes." });
  }
  if (!CATEGORIES.has(category)) {
    return json(res, 400, { error: "Categoria invalida." });
  }
  if (reporterName.length > 120 || location.length > 240 || description.length > 1500) {
    return json(res, 400, { error: "Campos acima do tamanho permitido." });
  }
  if (description.length < 20) {
    return json(res, 400, { error: "Descricao muito curta para triagem responsavel." });
  }
  if (reporterEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(reporterEmail)) {
    return json(res, 400, { error: "E-mail invalido." });
  }
  if (reporterPhone) {
    const digits = reporterPhone.replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      return json(res, 400, { error: "Telefone invalido." });
    }
  }

  const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL || "";
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";
  if (!supabaseUrl || !supabaseKey) {
    return json(res, 503, { error: "Servico de relatos temporariamente indisponivel." });
  }

  const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false }
  });

  const { data, error } = await supabase
    .from("environmental_reports")
    .insert({
      reporter_name: reporterName,
      reporter_email: reporterEmail || null,
      reporter_phone: reporterPhone || null,
      category,
      location,
      description,
      image_url: null
    })
    .select("*")
    .single();

  if (error) {
    console.error("[environmental-reports] insert failed", error.message);
    return json(res, 500, { error: "Falha ao registrar relato ambiental." });
  }

  return json(res, 201, { data });
}

