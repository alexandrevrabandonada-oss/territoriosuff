import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AdminGuard } from "../components/AdminGuard";

const AdminLayout = lazy(() => import("../layout/AdminLayout").then((m) => ({ default: m.AdminLayout })));
const AdminLoginPage = lazy(() => import("../pages/admin/AdminLoginPage").then((m) => ({ default: m.AdminLoginPage })));
const AdminResetPasswordPage = lazy(() => import("../pages/admin/AdminResetPasswordPage").then((m) => ({ default: m.AdminResetPasswordPage })));
const AdminDashboardPage = lazy(() => import("../pages/admin/AdminDashboardPage").then((m) => ({ default: m.AdminDashboardPage })));
const AdminUploadsPage = lazy(() => import("../pages/admin/AdminUploadsPage").then((m) => ({ default: m.AdminUploadsPage })));
const AdminAcervoListPage = lazy(() => import("../pages/admin/AdminAcervoListPage").then((m) => ({ default: m.AdminAcervoListPage })));
const AdminAcervoEditPage = lazy(() => import("../pages/admin/AdminAcervoEditPage").then((m) => ({ default: m.AdminAcervoEditPage })));
const AdminPaperWizardPage = lazy(() => import("../pages/admin/AdminPaperWizardPage").then((m) => ({ default: m.AdminPaperWizardPage })));
const AdminBlogListPage = lazy(() => import("../pages/admin/AdminBlogListPage").then((m) => ({ default: m.AdminBlogListPage })));
const AdminBlogEditPage = lazy(() => import("../pages/admin/AdminBlogEditPage").then((m) => ({ default: m.AdminBlogEditPage })));
const AdminAgendaListPage = lazy(() => import("../pages/admin/AdminAgendaListPage").then((m) => ({ default: m.AdminAgendaListPage })));
const AdminAgendaEditPage = lazy(() => import("../pages/admin/AdminAgendaEditPage").then((m) => ({ default: m.AdminAgendaEditPage })));
const AdminAgendaInscriptionsPage = lazy(() => import("../pages/admin/AdminAgendaInscriptionsPage").then((m) => ({ default: m.AdminAgendaInscriptionsPage })));
const AdminReportsListPage = lazy(() => import("../pages/admin/AdminReportsListPage").then((m) => ({ default: m.AdminReportsListPage })));
const AdminReportsEditPage = lazy(() => import("../pages/admin/AdminReportsEditPage").then((m) => ({ default: m.AdminReportsEditPage })));

function AdminShell() {
  return (
    <AdminGuard>
      <AdminLayout>
        <Routes>
          <Route index element={<AdminDashboardPage />} />
          <Route path="acervo" element={<AdminAcervoListPage />} />
          <Route path="acervo/novo" element={<AdminAcervoEditPage />} />
          <Route path="acervo/artigos/novo" element={<AdminPaperWizardPage />} />
          <Route path="acervo/:id" element={<AdminAcervoEditPage />} />
          <Route path="uploads" element={<AdminUploadsPage />} />
          <Route path="relatorios" element={<AdminReportsListPage />} />
          <Route path="relatorios/novo" element={<AdminReportsEditPage />} />
          <Route path="relatorios/:id" element={<AdminReportsEditPage />} />
          <Route path="blog" element={<AdminBlogListPage />} />
          <Route path="blog/novo" element={<AdminBlogEditPage />} />
          <Route path="blog/:id" element={<AdminBlogEditPage />} />
          <Route path="agenda" element={<AdminAgendaListPage />} />
          <Route path="agenda/novo" element={<AdminAgendaEditPage />} />
          <Route path="agenda/:id" element={<AdminAgendaEditPage />} />
          <Route path="agenda/:id/inscricoes" element={<AdminAgendaInscriptionsPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </Routes>
      </AdminLayout>
    </AdminGuard>
  );
}

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="login" element={<AdminLoginPage />} />
      <Route path="reset-password" element={<AdminResetPasswordPage />} />
      <Route path="*" element={<AdminShell />} />
    </Routes>
  );
}
