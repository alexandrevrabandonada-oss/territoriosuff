import { assertAll, ok, readWorkspaceFile } from "./admin-smoke-lib.mjs";

const label = "ADMIN BLOG FLOW SMOKE";
const listContent = readWorkspaceFile("src/pages/admin/AdminBlogListPage.tsx");
const editContent = readWorkspaceFile("src/pages/admin/AdminBlogEditPage.tsx");

assertAll(listContent, [
  'from("blog_posts")',
  '.select("id, title, status, category, published_at, publish_at, slug, author_name")',
  'query = query.ilike("title", `%${searchTerm}%`);',
  'query = query.eq("status", filterStatus);',
  'to={`/blog/${post.slug}`}',
  'navigate(`/admin/blog/${post.id}`)',
], label);

assertAll(editContent, [
  'const assetIdFromUrl = searchParams.get("assetId");',
  'const { data, error } = await supabase.from("blog_posts").select("*").eq("id", id).single();',
  'const { error } = await supabase.from("blog_posts").insert(payload);',
  'const { error } = await supabase.from("blog_posts").update(payload).eq("id", id);',
  'if (!contentMd.trim()) {',
  '<SafeMarkdown text={contentMd} className="markdown-content" />',
  'setAttachmentAsset(asset);',
  'const attachmentBlock = attachmentAsset && !contentMd.includes(attachmentAsset.public_url)',
  'cover_asset_id: coverAssetId || null,',
  'published_at: status === "published" ? (normalizedPublishAt || new Date().toISOString()) : null',
  'setShowSuccess(true);',
  'to={`/blog/${slug}`}',
  'const STATUSES = [',
  "{ value: \"scheduled\", label: \"Agendado\" }",
], label);

ok(label, "Blog list and editor use real Supabase reads, insert/update writes, markdown preview, cover and PDF attachment flows, assetId intake and public preview links.");
