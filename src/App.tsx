import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { LoadingCard } from "./components/LoadingCard";
import { RouteObservability } from "./components/RouteObservability";
import { PortalLayout } from "./layout/PortalLayout";
import { AdminLayout } from "./layout/AdminLayout";
import { AdminGuard } from "./components/AdminGuard";

// Eager-loaded (critical path)
import { HomePage } from "./pages/HomePage";
import { DadosPage } from "./pages/DadosPage";

// Admin Pages
import { AdminLoginPage } from "./pages/admin/AdminLoginPage";
import { AdminDashboardPage } from "./pages/admin/AdminDashboardPage";
import { AdminUploadsPage } from "./pages/admin/AdminUploadsPage";
import { AdminAcervoListPage } from "./pages/admin/AdminAcervoListPage";
import { AdminAcervoEditPage } from "./pages/admin/AdminAcervoEditPage";
import { AdminPaperWizardPage } from "./pages/admin/AdminPaperWizardPage";
import { AdminBlogListPage } from "./pages/admin/AdminBlogListPage";
import { AdminBlogEditPage } from "./pages/admin/AdminBlogEditPage";
import { AdminAgendaListPage } from "./pages/admin/AdminAgendaListPage";
import { AdminAgendaEditPage } from "./pages/admin/AdminAgendaEditPage";
import { AdminAgendaInscriptionsPage } from "./pages/admin/AdminAgendaInscriptionsPage";
import { AdminPlaceholderPage } from "./pages/admin/AdminPlaceholderPage";

// Lazy-loaded (non-critical)
const SobrePage = lazy(() => import("./pages/SobrePage").then((m) => ({ default: m.SobrePage })));
const AgendaPage = lazy(() => import("./pages/AgendaPage").then((m) => ({ default: m.AgendaPage })));
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

// Corredores lazy-loaded
const CorredoresListPage = lazy(() => import("./pages/corredores/CorredoresListPage").then((m) => ({ default: m.CorredoresListPage })));
const CorredoresDetailPage = lazy(() => import("./pages/corredores/CorredoresDetailPage").then((m) => ({ default: m.CorredoresDetailPage })));

// Mapa lazy-loaded
const MapaPage = lazy(() => import("./pages/MapaPage").then((m) => ({ default: m.MapaPage })));

export default function App() {
  return (
    <>
      <RouteObservability />
      <Suspense fallback={<LoadingCard message="Carregando..." />}>
        <Routes>
          {/* Admin Area */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin/*"
            element={
              <AdminGuard>
                <AdminLayout>
                  <Routes>
                    <Route path="/" element={<AdminDashboardPage />} />
                    <Route path="/acervo" element={<AdminAcervoListPage />} />
                    <Route path="/acervo/novo" element={<AdminAcervoEditPage />} />
                    <Route path="/acervo/artigos/novo" element={<AdminPaperWizardPage />} />
                    <Route path="/acervo/:id" element={<AdminAcervoEditPage />} />
                    <Route path="/uploads" element={<AdminUploadsPage />} />
                    <Route path="/relatorios" element={<AdminPlaceholderPage title="Relatórios" />} />
                    <Route path="/blog" element={<AdminBlogListPage />} />
                    <Route path="/blog/novo" element={<AdminBlogEditPage />} />
                    <Route path="/blog/:id" element={<AdminBlogEditPage />} />
                    <Route path="/agenda" element={<AdminAgendaListPage />} />
                    <Route path="/agenda/novo" element={<AdminAgendaEditPage />} />
                    <Route path="/agenda/:id" element={<AdminAgendaEditPage />} />
                    <Route path="/agenda/:id/inscricoes" element={<AdminAgendaInscriptionsPage />} />
                    <Route path="*" element={<Navigate to="/admin" replace />} />
                  </Routes>
                </AdminLayout>
              </AdminGuard>
            }
          />

          {/* Public Portal */}
          <Route
            path="/*"
            element={
              <PortalLayout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/alertas" element={<AlertasPage />} />
                  <Route path="/dados" element={<DadosPage />} />
                  <Route path="/agenda" element={<AgendaPage />} />
                  <Route path="/conversar" element={<ConversarListPage />} />
                  <Route path="/conversar/:slug" element={<ConversarDetailPage />} />
                  <Route path="/corredores" element={<CorredoresListPage />} />
                  <Route path="/corredores/:slug" element={<CorredoresDetailPage />} />
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

