import handler0 from "../server/share/blog.js";
import handler1 from "../server/share/dados.js";
import handler2 from "../server/share/acervo.js";
import handler3 from "../server/share/agenda.js";
import handler4 from "../server/share/dossies.js";
import handler5 from "../server/share/boletim.js";
import handler6 from "../server/share/relatorios.js";

type ApiHandler = (request: any, response: any) => Promise<unknown> | unknown;

// Preserve the legacy endpoints and their original handlers/response contracts.
// Explicit whitelist: never resolve arbitrary user-controlled module paths.
const routes: Record<string, ApiHandler> = {
  "blog": handler0,
  "dados": handler1,
  "acervo": handler2,
  "agenda": handler3,
  "dossies": handler4,
  "boletim": handler5,
  "relatorios": handler6
};

export default async function router(request: any, response: any) {
  const endpoint = request.query?.endpoint;
  if (typeof endpoint !== "string" || !Object.prototype.hasOwnProperty.call(routes, endpoint)) {
    response.setHeader("Cache-Control", "no-store");
    response.setHeader("X-Content-Type-Options", "nosniff");
    return response.status(404).json({ error: "Rota não encontrada." });
  }
  return await routes[endpoint](request, response);
}
