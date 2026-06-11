import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN ACTIVITIES FLOW SMOKE";
const listPage = readWorkspaceFile("src/pages/admin/AdminActivitiesListPage.tsx");
const editPage = readWorkspaceFile("src/pages/admin/AdminActivitiesEditPage.tsx");
const publicPage = readWorkspaceFile("src/pages/conversar/ConversarListPage.tsx");
const embed = readWorkspaceFile("src/components/InstagramEmbed.tsx");
const migration = readWorkspaceFile("supabase/migrations/20260519000001_conversas_atividades_admin.sql");

assertAll(listPage, [
  'from("conversations")',
  'item.meta?.kind === "activity"',
  "/admin/atividades/novo",
], label);

assertAll(editPage, [
  'from("conversations")',
  "InstagramEmbed",
  'kind: "activity"',
  "instagram_url",
  "Transformar em matéria",
  "parseInstagramPostUrl",
], label);

assertAll(publicPage, [
  "Conversas e atividades",
  "InstagramEmbed",
  'item.meta?.kind === "activity"',
  'item.meta?.kind !== "activity"',
  "Ler matéria",
], label);

assertAll(embed, [
  "instagram.com",
  "/embed",
  "iframe",
], label);

assertAll(migration, [
  "add column if not exists meta jsonb",
  "conversations_admin_insert",
  "conversations_admin_update",
  "conversations_admin_delete",
  "idx_conversations_meta_kind",
], label);

ok(label, "Activities flow has admin CRUD, public Instagram rendering, route wiring and database policy coverage.");
