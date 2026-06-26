import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { LoadingCard } from "./components/LoadingCard";
import { RouteObservability } from "./components/RouteObservability";
import { PortalLayout } from "./layout/PortalLayout";

const AdminRoutes = lazy(() => import("./admin/AdminRoutes"));
const HomePage = lazy(() => import("./pages/HomePage").then((m) => ({ default: m.HomePage })));

// Lazy-loaded (non-critical public)
const DadosPage = lazy(() => import("./pages/DadosPage").then((m) => ({ default: m.DadosPage })));
const SobrePage = lazy(() => import("./pages/SobrePage").then((m) => ({ default: m.SobrePage })));
const AgendaPage = lazy(() => import("./pages/AgendaPage").then((m) => ({ default: m.AgendaPage })));
const AgendaDetailPage = lazy(() => import("./pages/AgendaDetailPage").then((m) => ({ default: m.AgendaDetailPage })));
const InscricoesPage = lazy(() => import("./pages/InscricoesPage").then((m) => ({ default: m.InscricoesPage })));
const TransparenciaPage = lazy(() => import("./pages/TransparenciaPage").then((m) => ({ default: m.TransparenciaPage })));
const AlertasPage = lazy(() => import("./pages/AlertasPage").then((m) => ({ default: m.AlertasPage })));
const SearchPage = lazy(() => import("./pages/SearchPage").then((m) => ({ default: m.SearchPage })));
const StatusPage = lazy(() => import("./pages/StatusPage").then((m) => ({ default: m.StatusPage })));
const ComoLerDadosPage = lazy(() => import("./pages/ComoLerDadosPage").then((m) => ({ default: m.ComoLerDadosPage })));
const ComoParticiparPage = lazy(() => import("./pages/ComoParticiparPage").then((m) => ({ default: m.ComoParticiparPage })));
const PrivacidadeLgpdPage = lazy(() => import("./pages/PrivacidadeLgpdPage").then((m) => ({ default: m.PrivacidadeLgpdPage })));
const GovernancaPage = lazy(() => import("./pages/GovernancaPage").then((m) => ({ default: m.GovernancaPage })));
const ImprensaPage = lazy(() => import("./pages/ImprensaPage").then((m) => ({ default: m.ImprensaPage })));
const ApresentacaoPage = lazy(() => import("./pages/ApresentacaoPage").then((m) => ({ default: m.ApresentacaoPage })));
const ProgramaUffTerritorioPage = lazy(() => import("./pages/ProgramaUffTerritorioPage").then((m) => ({ default: m.ProgramaUffTerritorioPage })));

// Acervo lazy-loaded
const AcervoPage = lazy(() => import("./pages/acervo/AcervoPage").then((m) => ({ default: m.AcervoPage })));
const AcervoTimelinePage = lazy(() => import("./pages/acervo/AcervoTimelinePage").then((m) => ({ default: m.AcervoTimelinePage })));
const AcervoListPage = lazy(() => import("./pages/acervo/AcervoListPage").then((m) => ({ default: m.AcervoListPage })));
const AcervoItemPage = lazy(() => import("./pages/acervo/AcervoItemPage").then((m) => ({ default: m.AcervoItemPage })));
const CollectionsListPage = lazy(() => import("./pages/acervo/CollectionsListPage").then((m) => ({ default: m.CollectionsListPage })));
const CollectionDetailPage = lazy(() => import("./pages/acervo/CollectionDetailPage").then((m) => ({ default: m.CollectionDetailPage })));

// Blog lazy-loaded
const BlogListPage = lazy(() => import("./pages/BlogListPage").then((m) => ({ default: m.BlogListPage })));
const BlogPostPage = lazy(() => import("./pages/BlogPostPage").then((m) => ({ default: m.BlogPostPage })));

// Relatorios lazy-loaded
const ReportsListPage = lazy(() => import("./pages/reports/ReportsListPage").then((m) => ({ default: m.ReportsListPage })));
const ReportDetailPage = lazy(() => import("./pages/reports/ReportDetailPage").then((m) => ({ default: m.ReportDetailPage })));

// Conversar lazy-loaded
const ConversarListPage = lazy(() => import("./pages/conversar/ConversarListPage").then((m) => ({ default: m.ConversarListPage })));
const ConversarDetailPage = lazy(() => import("./pages/conversar/ConversarDetailPage").then((m) => ({ default: m.ConversarDetailPage })));

// Mapa lazy-loaded
const MapaPage = lazy(() => import("./pages/MapaPage").then((m) => ({ default: m.MapaPage })));

// Qualidade do Ar INEA lazy-loaded
const RadarLandingPage = lazy(() => import("./pages/air/RadarLandingPage").then((m) => ({ default: m.RadarLandingPage })));
const IneaRadarPage = lazy(() => import("./pages/air/IneaRadarPage").then((m) => ({ default: m.IneaRadarPage })));
const IneaStationPage = lazy(() => import("./pages/air/IneaStationPage").then((m) => ({ default: m.IneaStationPage })));
const IneaAnalyticsPage = lazy(() => import("./pages/air/IneaAnalyticsPage").then((m) => ({ default: m.IneaAnalyticsPage })));
const IneaMethodologyPage = lazy(() => import("./pages/air/IneaMethodologyPage").then((m) => ({ default: m.IneaMethodologyPage })));

export default function App() {
  return (
    <>
      <RouteObservability />
      <Suspense fallback={<LoadingCard message="Carregando..." />}>
        <Routes>
          {/* Admin Area */}
          <Route path="/admin/*" element={<AdminRoutes />} />

          {/* Public Portal */}
          <Route
            path="/*"
            element={
              <PortalLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/alertas" element={<AlertasPage />} />
                  <Route path="/dados" element={<DadosPage />} />
                  <Route path="/qualidade-ar" element={<RadarLandingPage />} />
                  <Route path="/qualidade-ar/inea" element={<IneaRadarPage />} />
                  <Route path="/qualidade-ar/inea/analises" element={<IneaAnalyticsPage />} />
                  <Route path="/qualidade-ar/inea/metodologia" element={<IneaMethodologyPage />} />
                  <Route path="/qualidade-ar/inea/estacoes/:stationId" element={<IneaStationPage />} />
                  <Route path="/agenda" element={<AgendaPage />} />
                  <Route path="/agenda/:eventId" element={<AgendaDetailPage />} />
                  <Route path="/conversar" element={<ConversarListPage />} />
                  <Route path="/conversar/:slug" element={<ConversarDetailPage />} />
                  <Route path="/mapa" element={<MapaPage />} />
                  <Route path="/inscricoes" element={<InscricoesPage />} />
                  <Route path="/sobre" element={<SobrePage />} />
                  <Route path="/transparencia" element={<TransparenciaPage />} />
                  <Route path="/como-ler-dados" element={<ComoLerDadosPage />} />
                  <Route path="/como-participar" element={<ComoParticiparPage />} />
                  <Route path="/privacidade-lgpd" element={<PrivacidadeLgpdPage />} />
                  <Route path="/governanca" element={<GovernancaPage />} />
                  <Route path="/imprensa" element={<ImprensaPage />} />
                  <Route path="/apresentacao" element={<ApresentacaoPage />} />
                  <Route path="/programa-uff-territorio" element={<ProgramaUffTerritorioPage />} />
                  <Route path="/acervo" element={<AcervoPage />} />
                  <Route path="/acervo/linha" element={<AcervoTimelinePage />} />
                  <Route path="/acervo/:area" element={<AcervoListPage />} />
                  <Route path="/acervo/item/:slug" element={<AcervoItemPage />} />
                  <Route path="/dossies" element={<CollectionsListPage />} />
                  <Route path="/dossies/:slug" element={<CollectionDetailPage />} />
                  <Route path="/blog" element={<BlogListPage />} />
                  <Route path="/blog/:slug" element={<BlogPostPage />} />
                  <Route path="/relatorios" element={<ReportsListPage />} />
                  <Route path="/relatorios/:slug" element={<ReportDetailPage />} />
                  <Route path="/status" element={<StatusPage />} />
                  <Route path="/buscar" element={<SearchPage />} />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </PortalLayout>
            }
          />
        </Routes>
      </Suspense>
    </>
  );
}

