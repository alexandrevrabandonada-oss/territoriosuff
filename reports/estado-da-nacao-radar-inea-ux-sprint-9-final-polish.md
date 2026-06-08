# Estado da Nacao — Radar INEA UX Sprint 9 Final Polish

Data: 2026-06-02

## Objetivo

Refinar o visual forte do Sprint 8, reduzir ruídos de confiança pública e ajustar estados de fallback antes da divulgação mais ampla, sem alterar datasets, APIs, cálculos, thresholds ou manifestos.

## Escopo executado

Arquivos ajustados:

- `src/pages/air/IneaRadarPage.tsx`
- `src/pages/air/radar/RadarQuickSummary.tsx`
- `src/pages/air/radar/RadarHero.tsx`
- `src/pages/air/radar/RadarOverviewMode.tsx`

## Entrega por tarefa

### 1. Hero refinado

- Reduzi duplicação de KPIs entre a malha principal e o painel lateral.
- Removi o excesso de blocos concorrendo pela mesma informação.
- Mantive a casca APS/Concreto Zen com contraste alto e fundo escuro.
- Reequilibrei respiro entre:
  - selo editorial
  - titulo
  - descricao
  - CTAs
  - painel lateral

Resultado: o topo segue marcante, mas menos carregado.

### 2. Alerta de API corrigido com semântica pública melhor

#### Produção oficial verificada

Validei diretamente a página pública:

- `https://semear-pwa.vercel.app/qualidade-ar/inea`

Resultado:

- nao apareceu alerta generico vermelho
- nao apareceu aviso de homologacao
- nenhum erro de console no smoke remoto

Screenshot de verificação:

- `reports/radar-inea-sprint-9-prod-check.png`

#### Preview/homologação

No ambiente local sem backend/API correspondente, o comportamento agora foi trocado para aviso contextual:

> "Ambiente de homologação: usando dados estáticos/fallback."

Isso substitui o alerta vermelho generico no topo quando a falha é claramente de ambiente de preview.

### 3. Estados vazios melhorados

O estado vazio da Visão Geral deixou de ser:

- `Sem dados recentes disponíveis.`

e virou um card pedagógico com ações úteis:

- abrir mapa
- ver histórico
- comparar com OMS
- acessar metodologia

Resultado: o vazio agora orienta navegação e preserva confiança.

### 4. Visão Geral mais editorial

Sem redesenhar do zero, a área ficou mais interpretativa:

- bloco de situação reforçado
- destaque para a estação que exige atenção
- leitura mais clara do poluente recorrente
- bloco explícito de próximo passo
- seção de últimos dados convertida em quadro de situação, menos "tabela branca pura"

### 5. Performance futura registrada

Mantive como dívida técnica futura o warning do bundle do Radar:

- `IneaRadarPage` segue acima de `500 kB` minificado

Próxima etapa recomendada, fora deste sprint:

- lazy-load dos modos:
  - Mapa
  - Tempo
  - Território
  - Metodologia

Nao tratei isso agora por nao ser urgente para fechar o polish visual e de confiança.

## Validação executada

### QA obrigatória

- `npm run inea:qa:language` — PASS
- `npm run inea:qa:analytics` — PASS
- `npm run verify` — PASS
- `$env:OBSERVATORIO_BASE_URL='https://semear-pwa.vercel.app'; npx tsx scripts/observatorio-healthcheck.ts` — PASS (`33/33`)

### Validação adicional

- `npm run typecheck` — PASS

### Smoke de produção

Rota verificada:

- `https://semear-pwa.vercel.app/qualidade-ar/inea`

Resultado:

- sem alerta generico no topo
- sem aviso de homologacao
- sem erro de console no smoke remoto

### Smoke local

Rota verificada:

- `http://127.0.0.1:4174/qualidade-ar/inea`

Resultado:

- `h1` carregado
- aviso de homologacao presente
- estado vazio pedagógico presente
- screenshot salva em `reports/radar-inea-ux-sprint-9-smoke.png`

Observacao:

- o console local continua acusando falha de parse JSON porque o preview estatico nao serve as rotas `/api/air/inea/*`. Esse comportamento agora foi absorvido corretamente pela UX como homologação, sem mensagem pública alarmista inadequada.

## Pendências fora do escopo

- Warning preexistente de lint em:
  - `scripts/inea-weblakes-recompute-lote-b.ts`
  - argumento `isPartial` sem uso

## Conclusão

O Sprint 9 fechou o polish de confiança pública do Radar INEA:

- hero mais respirado
- fallback mais honesto
- vazio mais útil
- visão geral mais editorial
- produção verificada sem alerta indevido

O sistema ficou pronto para divulgação com menos ruído visual e menos risco de transmitir instabilidade onde o healthcheck oficial está saudável.
