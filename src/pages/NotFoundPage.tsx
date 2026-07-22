import { Link } from "react-router-dom";

import { usePageMetadata } from "../hooks/usePageMetadata";

export function NotFoundPage() {
  usePageMetadata({
    title: "Página não encontrada | SEMEAR",
    description: "O endereço informado não corresponde a uma página publicada no portal SEMEAR."
  });

  return (
    <section className="flex min-h-[60vh] items-center justify-center p-6" aria-labelledby="not-found-title">
      <div className="w-full max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_70px_rgba(17,38,59,0.10)] md:p-10">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-brand-primary">Erro 404</p>
        <h1 id="not-found-title" className="mt-3 text-3xl font-black tracking-tight text-slate-950 md:text-5xl">
          Página não encontrada
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-slate-700">
          Este endereço pode ter sido removido ou alterado. Use os acessos abaixo para continuar no portal.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          <Link className="ui-btn-primary" to="/">Ir para o início</Link>
          <Link className="ui-btn-ghost" to="/buscar">Buscar no portal</Link>
          <Link className="ui-btn-ghost" to="/acervo">Abrir o acervo</Link>
        </div>
      </div>
    </section>
  );
}
