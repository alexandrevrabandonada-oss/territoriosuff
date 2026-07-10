import { OfflineBanner } from "../components/OfflineBanner";

export function OfflinePage() {
  return (
    <section className="flex min-h-[60vh] items-center justify-center p-6" aria-labelledby="offline-title">
      <div className="w-full max-w-xl">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700">PWA pública</p>
        <h1 id="offline-title" className="mt-2 text-3xl font-black tracking-tight text-slate-950">Acesso offline ao SEMEAR</h1>
        <p className="mb-6 mt-3 text-sm leading-relaxed text-slate-700">
          Páginas e arquivos já carregados podem continuar disponíveis. Dados dinâmicos serão atualizados quando a conexão voltar.
        </p>
        <OfflineBanner
          description="Você perdeu a conexão com a internet. Alguns conteúdos continuam disponíveis se já tiverem sido carregados neste dispositivo."
          onRetry={() => window.location.reload()}
        />
      </div>
    </section>
  );
}
