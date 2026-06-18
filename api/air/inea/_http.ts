export function applyPublicJsonHeaders(res: any) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Cache-Control", "public, s-maxage=300, stale-while-revalidate=600");
}

export function rejectNonGet(req: any, res: any) {
  if (req.method === "GET") return false;
  res.setHeader("Allow", "GET");
  res.status(405).json({ error: "Method Not Allowed" });
  return true;
}

export function isValidDateInput(value: unknown) {
  if (typeof value !== "string" || value.trim() === "") return false;
  return !Number.isNaN(Date.parse(value));
}
