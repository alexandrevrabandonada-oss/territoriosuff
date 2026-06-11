# Estado da Nação — Upload, mídia e Acervo

Data: 2026-06-11

## Escopo

Passada técnica no fluxo de upload e organização de mídia/acervo, sem alteração de schema, buckets, permissões, UI pública ou comportamento editorial.

## Melhorias aplicadas

- Removidos casts genéricos `any` da leitura de mídias anexadas ao Acervo em `src/lib/admin/media.ts`.
- Tipadas as linhas de referência que alimentam a fila admin de uploads: Acervo, Blog, Relatórios e Agenda.
- Centralizado o tratamento de erro dos handlers da tela de uploads com fallback explícito.
- Substituído cast amplo de status por normalização conservadora (`draft`, `published`, `archived`).
- Mantidos os contratos existentes de procedência, preservação de notícia/matéria, criação de item no Acervo e validação de texto alternativo em imagem publicada.
- Corrigida a autocaptura de notícia/matéria vinda do upload: o parâmetro `autocapture=1` agora pode acionar captura também em item novo do Acervo.
- Adicionado smoke dedicado para proteger o caminho upload editorial -> link/fonte -> item de Acervo com autocaptura.
- Adicionado smoke de contrato de storage para manter alinhados buckets permitidos, MIME types, limite de upload, policies admin e regra de alt text entre app e migração.
- Ajustado limite de upload por tipo: imagens seguem limitadas a 15MB e PDFs administrativos passam a aceitar até 30MB, pensando em relatórios e documentos escaneados do Acervo.

## Verificações

- `node tools/admin-upload-flow-smoke.mjs`
- `node tools/admin-upload-acervo-type-smoke.mjs`
- `node tools/admin-storage-contract-smoke.mjs`
- `node tools/admin-preserved-story-upload-smoke.mjs`
- `npm run smoke`
- `npm run typecheck`

## Próximas frentes recomendadas

1. Mapear políticas reais de retenção e backup dos buckets `acervo`, `media`, `blog`, `reports` e `transparency` no painel Supabase.
2. Criar checklist editorial para assets órfãos, sem procedência e prontos para preservação.
3. Avaliar compressão/otimização automática futura para PDFs muito grandes antes do upload.
