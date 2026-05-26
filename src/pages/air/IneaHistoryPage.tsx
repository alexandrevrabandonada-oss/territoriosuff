import { useEffect } from "react";
import { Link } from "react-router-dom";
import { SurfaceCard } from "../../components/BrandSystem";

export function IneaHistoryPage() {
  useEffect(() => {
    // Redireciona automaticamente para a seção de história do Radar INEA
    window.location.replace("/qualidade-ar/inea#historia");
  }, []);

  return (
    <div className="container mx-auto px-4 py-16 max-w-xl text-center space-y-6">
      <SurfaceCard className="p-8 border border-slate-100 rounded-3xl space-y-4 bg-white">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 mb-2">
          <svg className="h-6 w-6 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
        <h1 className="text-xl font-black text-slate-800">
          A história dos dados agora faz parte do Radar INEA completo.
        </h1>
        <p className="text-sm text-slate-500 font-semibold leading-relaxed">
          Unificamos as análises e o painel em uma única experiência canônica. Você está sendo redirecionado automaticamente...
        </p>
        <div className="pt-4">
          <Link
            to="/qualidade-ar/inea#historia"
            className="inline-flex px-6 py-3 bg-brand-primary hover:bg-brand-primary-dark text-white font-black uppercase tracking-[0.14em] text-xs rounded-xl transition-all shadow-md"
          >
            Abrir Radar INEA
          </Link>
        </div>
      </SurfaceCard>
    </div>
  );
}
export default IneaHistoryPage;
