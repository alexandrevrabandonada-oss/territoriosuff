export function AdminPlaceholderPage({ title }: { title: string }) {
  return (
    <div className="admin-list-page space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="admin-list-hero">
        <span className="admin-command-eyebrow">Módulo interno</span>
        <h1 className="mt-4 text-4xl font-black tracking-tight text-white md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-2xl text-base font-medium text-slate-300">Gerenciamento de {title.toLowerCase()} do sistema.</p>
      </div>

      <div className="admin-empty-state flex flex-col items-center justify-center p-12 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-950 text-emerald-200 shadow-xl">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        </div>
        <h2 className="mb-2 text-2xl font-black tracking-tight text-slate-950">Em Construção</h2>
        <p className="max-w-sm font-medium text-slate-500">
          Esta área do painel está sendo preparada para receber os controles operacionais.
        </p>
      </div>
    </div>
  );
}
