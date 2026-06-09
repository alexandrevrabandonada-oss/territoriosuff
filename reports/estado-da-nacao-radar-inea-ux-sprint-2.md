# Estado da Nação — Radar INEA: UX Sprint 2 (Mapa como Coração da Experiência)

Este relatório detalha as melhorias de usabilidade, design e didática implementadas na página `/qualidade-ar/inea` no âmbito da **UX Sprint 2 (Tijolo 55)**. 

Todas as alterações foram testadas localmente, passaram em 100% nas diretrizes de vocabulário de dados, linter, typecheck, e foram publicadas em produção com integridade operacional garantida.

---

## 1. O que mudou?

### Bloco "Explorar no mapa" (`AirAtlasMap.tsx`)

1. **Painel de Detalhes da Estação Selecionada**:
   * Substituímos o painel de comparação estático "Estação A vs Estação B" por um painel inteiramente focado na **estação selecionada ativa** (padrão inicializado em "Retiro").
   * Exibição completa das métricas: Nome da estação, Poluente selecionado, Ano/Período, Média calculada, Pico horário pontual, Cobertura (%), e contagem de dias acima do padrão OMS e CONAMA.
   * **Pill de Status Visual**: Um indicador dinâmico e colorido indicando os status estritos solicitados: `dentro da referência` (verde), `atenção` (amarelo/laranja), `excedente` (vermelho), `sem dado` (cinza) ou `cobertura insuficiente` (azul/índigo para quando o poluente tem leituras mas a série é menor que 75%).
   * **Microtexto Pedagógico**: Inclusão das seções *"O que este ponto mostra?"*, *"Como ler?"* e *"Por que importa?"* para guiar a interpretação pública.

2. **Destaque Visual e Interatividade**:
   * O clique em qualquer marcador do mapa atualiza automaticamente a estação selecionada e recalcula todos os indicadores no painel lateral instantaneamente.
   * O marcador da estação ativa recebe um destaque visual: tamanho aumentado (de 24px para 32px), borda de 3px branca e um halo brilhante amber (`box-shadow`) indicando o foco da seleção.

3. **Filtros Agrupados**:
   * Agrupamos a barra de filtros flutuantes em uma grid semântica de 3 cards:
     * **1. O que ver?**: Seleção do poluente (PM10/PM2.5).
     * **2. Quando?**: Ano e exibição amigável do período selecionado.
     * **3. Como comparar?**: Métrica ativa e botões alternadores rápidos de réguas (OMS vs Brasil).

4. **Legenda Pedagógica e Colapsável**:
   * Implementamos uma legenda flutuante no mapa que inicia expandida por padrão, contendo a explicação das 4 cores fundamentais e o texto de ressalva metodológica *"Cores indicam comparação experimental com a régua selecionada."*.
   * Adicionamos controle de estado para permitir ao usuário colapsar a legenda em um botão de informação discreto, otimizando o visual em telas menores.

5. **Responsividade Mobile-First**:
   * Ajustamos o fluxo narrativo no celular via propriedades CSS flex `order`:
     * O **Mapa** assume a primeira posição (`order-2`, logo abaixo do título `order-1`).
     * O **Painel da Estação Selecionada** renderiza logo abaixo do mapa.
     * Os **Filtros Agrupados** renderizam logo em seguida em formato de cards empilhados.
     * O timeline scrubber temporal fica na base (`order-4`).

---

### Bloco "Comparar no tempo" (`IneaRadarPage.tsx`)

1. **Abas Didáticas**:
   * Renomeamos as 3 abas de comparação temporal para melhor representar suas respostas pedagógicas:
     * `📉 Tendência: média anual` (aba `TREND`)
     * `🚨 Excedências: dias acima das réguas` (aba `EXCEEDANCE`)
     * `🔇 Cobertura: qualidade/continuidade da série` (aba `COVERAGE`)
2. **Frases de Abertura**:
   * Inserimos um card de contextualização no topo de cada aba explicando de forma clara o seu papel e a pergunta que ela se propõe a responder para o cidadão.

---

## 2. Resultados do Controle de Qualidade (QA)

Realizamos a validação completa antes de disponibilizar as mudanças em produção:

1. **Conformidade de Linguagem (`inea:qa:language`)**:
   * **STATUS: PASS**
   * Nenhum termo proibido relacionado a monitoramento instantâneo (ex: `tempo real`, `ao vivo`) foi introduzido sem a respectiva ressalva metodológica de atraso de consolidação periódica.
2. **Compilação e Linter (`npm run verify`)**:
   * **STATUS: PASS**
   * Sem erros de tipagem TypeScript ou quebras de regras do linter no build do Vite.
3. **Healthcheck de Dados (`scripts/observatorio-healthcheck.ts`)**:
   * **STATUS: PASS**
   * 33/33 testes operacionais passaram com sucesso, garantindo integridade das APIs históricas de Volta Redonda.
4. **Publicação no Vercel (`vercel --prod`)**:
   * **STATUS: SUCCESS**
   * Deploy efetuado no domínio principal: [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
