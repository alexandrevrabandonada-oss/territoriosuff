# Estado da Nação — SEMEAR UI Global Sprint 3 (Alertas)

Data: 2026-06-02

## Escopo

Continuação direta da unificação visual global, cobrindo a última página operacional que havia ficado de fora por sensibilidade técnica:

- `src/pages/AlertasPage.tsx`

## O que mudou

- adoção de `PortalPageShell`
- hero migrado para `PortalHero`, com leitura pública mais consistente
- bloco principal de configuração reencabeçado com `PortalSectionHeader`
- simulador de notificação reorganizado com a mesma gramática editorial do restante do portal
- bloco de alertas recentes alinhado ao padrão de seção global
- rodapé técnico preservado

## O que não mudou

- permissões de notificação
- fluxo de subscribe/unsubscribe
- uso de `Notification`, `serviceWorker` e `PushManager`
- persistência local em `localStorage`
- simulação de alerta e toast interno
- integração condicional com `register-push`

## Resultado

`AlertasPage` agora conversa visualmente com `Status`, `Transparência`, `Busca` e as páginas institucionais sem mexer na lógica crítica de notificações.

## QA executada

- `npm run typecheck` — PASS
- `npm run lint` — PASS com 1 warning pré-existente fora do escopo
- `npm run verify` — PASS
- `OBSERVATORIO_BASE_URL=https://semear-pwa.vercel.app npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

## Warning conhecido

- `scripts/inea-weblakes-recompute-lote-b.ts`
  - `isPartial` definido e não utilizado

## Dívida técnica restante

- `IneaRadarPage` continua acima de `500 kB`
- próxima frente recomendada:
  1. lazy-load dos modos pesados do Radar
  2. avaliação da home para migração do hero legado
  3. smoke visual sistemático desktop/mobile das rotas secundárias
