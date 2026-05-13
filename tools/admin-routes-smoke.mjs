import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN ROUTES SMOKE";
const routes = readWorkspaceFile("src/admin/AdminRoutes.tsx");

assertAll(routes, [
  'path="uploads" element={<AdminUploadsPage />}',
  'path="acervo" element={<AdminAcervoListPage />}',
  'path="acervo/novo" element={<AdminAcervoEditPage />}',
  'path="acervo/:id" element={<AdminAcervoEditPage />}',
  'path="relatorios" element={<AdminReportsListPage />}',
  'path="relatorios/novo" element={<AdminReportsEditPage />}',
  'path="relatorios/:id" element={<AdminReportsEditPage />}',
  'path="blog" element={<AdminBlogListPage />}',
  'path="blog/novo" element={<AdminBlogEditPage />}',
  'path="blog/:id" element={<AdminBlogEditPage />}',
  '<Route index element={<AdminDashboardPage />} />',
], label);

ok(label, "Admin route tree covers dashboard, uploads, acervo, reports and blog editor flows.");