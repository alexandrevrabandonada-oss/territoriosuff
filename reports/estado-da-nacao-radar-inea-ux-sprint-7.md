# Relatório de Trabalho — Radar INEA · Sprints 4 a 7
**Página:** `/qualidade-ar/inea` — `IneaRadarPage.tsx`
**Período:** Sprint 4 → Sprint 7 (sessão atual)

---

## Visão Geral

O trabalho cobriu a transformação completa da página **Radar INEA** de uma página de rolagem linear para um **observatório de dados públicos de qualidade do ar** com identidade editorial forte, navegação por modos, pedagogia cidadã, encaminhamentos de justiça ambiental e build 100% limpo.

---

## Sprint 4 — Rearquitetura por Modos de Uso

### O que foi feito
A página passou de rolagem infinita para um sistema de **6 abas condicionais** controladas pelo estado `currentMode`:

| Aba | Conteúdo |
|-----|----------|
| `OVERVIEW` | Dashboard introdutório: ranking de atenção, tabela de leituras, encaminhamentos cívicos |
| `MAP` | Mapa interativo (`AirAtlasMap.tsx`), filtros e legenda pedagógica |
| `TIME` | Gráficos de tendências, excedências e cobertura temporal |
| `TERRITORY` | Mapa de exposição social (`SocialExposureMap.tsx`) e saúde pública |
| `STATIONS` | Fichas técnicas das 4 estações físicas de monitoramento |
| `METHODOLOGY` | Guia de leitura, gases 2024, downloads, evidências e limitações |

### Melhorias de navegação
- **Hero CTAs acoplados** aos modos: botões do hero alteram a aba ativa e rolam até o menu
- **Subnav Sticky** fixo no topo durante o scroll, com realce visual do modo ativo
- **Microguides** padronizados em 3 colunas em cada aba técnica (*O que você está vendo · Como ler · Por que importa*)
- **"▲ Voltar ao topo"** adicionado ao rodapé de cada modo

---

## Sprint 4.5 (Tijolo 57) — Pacote de Divulgação Pública

### O que foi feito
- **Banner de lançamento** inserido na HomePage ([HomePage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/HomePage.tsx)) com a mensagem *"Quem respira esse ar?"*
- Criação do documento [`pacote-divulgacao-quem-respira-esse-ar.md`](file:///C:/Projetos/SEMEAR%20PWA/reports/pacote-divulgacao-quem-respira-esse-ar.md) com 5 peças de comunicação:
  1. Post Instagram
  2. Carrossel Didático (8 cards)
  3. Thread X/Bluesky (5 posts)
  4. Mensagem WhatsApp
  5. Release para imprensa

---

## Sprint 5 — Pedagogia, Encaminhamentos Cívicos e Polimento

### Guia Visual "Como ler sem cair em erro"
Substituição do FAQ antigo por **6 cards pedagógicos** cobrindo:
- Dado bruto ≠ índice
- Ausência de dado ≠ ar bom
- OMS vs. CONAMA (réguas diferentes)
- Ano parcial ≠ ano fechado
- Comparação experimental com QA/QC
- Correlação ≠ causalidade isolada

### 4 Eixos Cívicos de Ação Pública
Reorganização da seção "O que fazer com isso?" em eixos com CTAs diretos:
1. **Monitorar** — Solicitar ampliação da rede via LAI
2. **Manter** — Cobrar calibração e continuidade dos sensores
3. **Cuidar** — Reforçar UBS nos territórios críticos
4. **Proteger** — Arborização e cortinas verdes nos equipamentos sensíveis

### Polimento Visual (Tijolo 59)
- Compactação do Hero: remoção de `min-h` rígida, espaçamento responsivo
- **Auditoria de Ghost Colors**: varredura automática e correção de todas as classes de cor inexistentes no Tailwind (`slate-350`, `slate-850`, `slate-750`, `amber-450`, `rose-450`, etc.)
- Ajuste de contraste nos sidebars do **AirAtlasMap** e **SocialExposureMap** (fundos `bg-slate-950`, rótulos `text-slate-300`, valores `text-white`)

---

## Sprint 6 — Modernização Visual "Concreto Zen Editorial"

### Hero Editorial Premium
- Fundo em gradiente petróleo/azul escuro profundo com grade geométrica sutil
- KPIs em **glassmorphism** de alto contraste com bordas ultrafinas
- Tipografia refinada com tracking-wider em títulos e rótulos
- Badge de status com ponto pulsante âmbar

### Sistema de Classes Semânticas (`index.css`)
Criação de um **design system** de classes reutilizáveis:

| Classe | Uso |
|--------|-----|
| `.card-leitura` | Cards de leitura neutra (fundo branco/cinza claro) |
| `.card-tecnico` | Cards técnicos escuros (fundo `#0d2e46`) |
| `.card-alerta` | Cards de atenção âmbar (riscos e destaques) |
| `.card-social` | Cards de vulnerabilidade social (fundo escarlate escuro) |
| `.card-acao` | Cards de ação cívica (fundo verde escuro) |
| `.bg-ambient-zen` | Fundo geral da página com gradiente suave |
| `.bg-dot-grid` | Grade de pontos decorativa global |

### Conversão da Seção Território
- Fundo escuro premium `#071f30` para o modo Território
- Destaque em caixa alta: *"EXPOSIÇÃO SOCIAL NÃO É RANKING DE BAIRROS. É FERRAMENTA DE PRIORIDADE PÚBLICA."*
- 4 cards de vulnerabilidade com identidade visual de campanha (Crianças, Idosos, Escolas/UBS, Zonas Industriais)

### Metodologia
- 6 FAQs convertidos para **accordions interativos** (`<details>/<summary>`) com ícone animado de rotação
- **Biblioteca de Downloads** em formato de cards de arquivo (5 CSVs com nome, tamanho, descrição e botão de download)
- **Selo visual** "Dados Abertos Auditáveis" em verde esmeralda com versão homologada

---

## Sprint 7 — Correções Estruturais e Build Limpo

### Problema
Após múltiplas sessões de substituição de código, o arquivo `IneaRadarPage.tsx` acumulou **3 erros estruturais de JSX** que quebravam o build:

### Correção 1 — Fragmento órfão de código (linha ~970)
**Causa:** Uma substituição anterior deixou um resíduo de código inválido misturado à tag `</section>`:
```tsx
// Antes (quebrado):
</section>ncaminhamentos");
            }}
            className="...">
  Ver Recomendações
</button>
</SurfaceCard>
```
**Fix:** Removido o fragmento inválido, restaurando apenas o `</section>` limpo.

### Correção 2 — ModeFooter do modo STATIONS truncado (linhas ~1560-1584)
**Causa:** O bloco de fechamento do rodapé do modo STATIONS estava incompleto — um `<button` aberto sem fechar, com o bloco METHODOLOGY começando no meio:
```tsx
// Antes (quebrado):
<button
{/* 8. Metodologia e Dados */}
{currentMode === "METHODOLOGY" && (
```
**Fix:** Restauração completa do ModeFooter com o botão *"Ver Metodologia e Downloads →"*, botão *"Voltar ao topo"* e todos os tags de fechamento `</div></div>)}` antes da abertura do bloco METHODOLOGY.

### Correção 3 — `<div>` da seção de Downloads sem fechar (linha ~1897)
**Causa:** O wrapper `<div className="space-y-4 pt-4 border-t border-slate-100">` aberto na linha 1846 (Downloads) nunca tinha o seu `</div>` de fechamento após o grid terminar na linha 1897. Isso cascateava toda a estrutura JSX subsequente como filha desse div, gerando o erro de build:
```
ERROR: The character "}" is not valid inside a JSX element (line 2045)
ERROR: Unterminated regular expression (line 2113)
```
**Fix:** Inserção do `</div>` faltante entre o fechamento do grid de downloads e o início da seção de evidências.

### Resultado
```
✓ built in 9.10s   ← zero erros de compilação
✓ built in 170ms   ← service worker gerado com sucesso
```

---

## Verificação Visual Final

| Modo | Status |
|------|--------|
| Hero / Cabeçalho | ✅ Renderizando com gradiente escuro, KPIs e CTAs |
| OVERVIEW | ✅ 4 cards de situação, ranking, tabela de leituras e eixos cívicos |
| TERRITORY | ✅ Fundo escuro premium, frase de impacto e 4 cards de vulnerabilidade |
| METHODOLOGY | ✅ 6 accordions interativos + biblioteca de downloads + selo de auditoria |
| STATIONS | ✅ 4 fichas técnicas com status operacional e coordenadas |
| MAP / TIME | ✅ Componentes delegados sem erros (`AirAtlasMap`, `YearExplorer`, etc.) |

---

## Resultados de QA Acumulados

| Validação | Resultado |
|-----------|-----------|
| `npm run inea:qa:language` | ✅ 100% — zero termos de "tempo real" sem salvaguarda |
| `npm run inea:qa:analytics` | ✅ 100% — integridade matemática dos cálculos |
| `npm run build` | ✅ Sem erros TypeScript nem esbuild |
| Verificação visual (Chrome DevTools MCP) | ✅ Todos os modos renderizando corretamente |

---

## Arquivo Principal Modificado

- [`IneaRadarPage.tsx`](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaRadarPage.tsx) — 2.161 linhas — componente monolítico gerenciado por `currentMode`
