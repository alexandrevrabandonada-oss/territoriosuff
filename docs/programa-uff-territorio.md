# Programa UFF + Território

Nova página institucional criada dentro da base do SEMEAR para apresentação do “Programa UFF + Território: Observatório Popular do Médio Paraíba”.

## Como acessar

- Em desenvolvimento, execute `npm run dev` na raiz do projeto.
- Abra a rota `/programa-uff-territorio`.
- A página também pode ser acessada pelo botão `Observatório Popular` no cabeçalho e pelo link correspondente no rodapé.

## O que foi reutilizado

- Arquitetura Vite + React + TypeScript existente.
- Layout global (`PortalLayout`), navegação principal e tokens visuais do SEMEAR.
- Componentes base do design system (`SurfaceCard`, `SectionHeader`, `Chip`, `IconShell`).

## Componentes novos

- `src/components/programa/InteractiveFronts.tsx`
- `src/components/programa/GovernanceModel.tsx`
- `src/components/programa/Timeline24Months.tsx`
- `src/components/programa/BudgetBreakdown.tsx`

## Conteúdo estruturado

Os textos e dados iniciais da apresentação estão centralizados em `src/content/programaUffTerritorio.ts`, facilitando ajustes editoriais futuros sem espalhar conteúdo pela página.