import { LAI_TEMPLATE } from "./RadarTypes";

interface RadarLaiModalProps {
  copied: boolean;
  onClose: () => void;
  onCopy: () => void;
}

export function RadarLaiModal({ copied, onClose, onCopy }: RadarLaiModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex animate-fade-in items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
      <div className="flex max-h-[85vh] w-full max-w-2xl flex-col space-y-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-2xl">
        <div className="flex shrink-0 items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <span className="text-emerald-600">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </span>
            <strong className="text-sm font-black text-slate-800 md:text-base">Minuta para Pedido de Informação (LAI)</strong>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 text-slate-400 transition-colors hover:text-slate-600" aria-label="Fechar">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="shrink-0 text-xs font-semibold leading-relaxed text-slate-500">
          Copie o modelo abaixo e protocolo-o no e-SIC do Estado do Rio de Janeiro direcionado ao <strong>INEA</strong> para solicitar a série de 2010 a 2021.
        </p>

        <div className="flex-1 select-all overflow-y-auto whitespace-pre-wrap rounded-2xl border border-slate-100 bg-slate-50 p-4 font-mono text-[10px] leading-relaxed text-slate-700">
          {LAI_TEMPLATE}
        </div>

        <div className="flex shrink-0 items-center justify-end gap-3 border-t pt-3">
          <button
            onClick={onCopy}
            className={`flex items-center gap-1.5 rounded-xl px-4 py-2 text-xs font-bold shadow-sm transition-all ${
              copied ? "bg-emerald-600 text-white" : "bg-brand-primary text-white hover:bg-brand-primary-dark"
            }`}
          >
            {copied ? (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
                <span>Copiado!</span>
              </>
            ) : (
              <>
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                <span>Copiar Minuta</span>
              </>
            )}
          </button>
          <button onClick={onClose} className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-bold text-slate-700 transition-colors hover:bg-slate-50">
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
