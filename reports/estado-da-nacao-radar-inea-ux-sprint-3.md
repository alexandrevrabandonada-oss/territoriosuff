# Estado da Nação — Radar INEA: UX Sprint 3 (Pedagogia, Leitura Guiada e Encaminhamentos Cívicos)

Este relatório detalha as melhorias de usabilidade, design pedagógico e incentivo à ação pública cidadã implementadas na página `/qualidade-ar/inea` no âmbito da **UX Sprint 3 (Tijolo 56)**.

Todas as alterações foram testadas localmente, passaram em 100% nas diretrizes de vocabulário de dados, linter, typecheck, e foram publicadas em produção com integridade operacional garantida e todos os 33/33 healthchecks saudáveis.

---

## 1. O que mudou?

### Guia Visual "Como ler sem cair em erro"
* Substituímos o painel FAQ anterior por um **guia visual interativo com 6 cards pedagógicos**, projetados para instruir o usuário de forma clara sobre limites dos dados. Os cards abordam:
  1. **Dado bruto não é índice**: Diferença de µg/m³ para IQAr.
  2. **Ausência de dado não é ar bom**: Lacunas de sensores e representatividade mínima de 75%.
  3. **OMS e Brasil são réguas diferentes**: O abismo entre a recomendação de saúde e a lei nacional.
  4. **Ano parcial não é ano fechado**: Esclarecimento sobre o ano corrente (2026).
  5. **Comparação experimental**: A ausência de validação oficial (QA/QC) explícita nos dados brutos de gases obtidos.
  6. **Correlação não prova autoria isolada**: Orientação de cautela sobre fatores meteorológicos combinados (ventos, chuvas) e emissão industrial.
* **Layout Híbrido Responsivo**:
  * **Desktop**: Grid de 3 colunas exibindo os cartões expandidos lado a lado para incentivar leitura rápida.
  * **Mobile**: Sanfona (Accordion) fechada por padrão, permitindo ao usuário abrir e ler o tópico desejado sem poluir visualmente a tela pequena.
* Cada card inclui título direto, ícone significativo, texto enxuto e a marca registrada pedagógica: *"💡 Em linguagem simples:"*.

### Eixos Cívicos de Ação Pública ("O que fazer com isso?")
* Estruturamos a antiga seção de recomendações em **4 eixos cívicos principais**:
  1. **Monitoramento**: Solicitação de novas estações em bairros sem cobertura (com botão interativo que abre a modal da minuta de LAI).
  2. **Manutenção**: Cobrança por calibração e publicidade dos relatórios técnicos das estações (botão que navega e foca a aba de Cobertura/Silêncio de dados).
  3. **Saúde Pública**: Fortalecimento de UBS/UPAs nas zonas de maior impacto acumulado (botão de rolagem rápida até o mapa de Exposição Social).
  4. **Proteção Territorial**: Reflorestamento urbano e cortinas verdes no entorno de escolas e hospitais críticos (botão focado nos equipamentos sensíveis).
* Cada eixo conta com contextualização curta, uma "Ação Concreta" demarcada com alvo explícito e botões/CTAs ativos para executar ou rolar até a área relevante correspondente da interface.

### Três Formas de Usar Este Observatório
* Adicionamos uma nova seção contextual de usabilidade focada em perfis distintos de usuários:
  1. **Como cidadão**: Foco no mapa do bairro, engajamento comunitário e conscientização local.
  2. **Como pesquisador/jornalista**: Acesso às séries brutas de dados abertos consolidados em lote (deixando claro que não representam monitoramento ao vivo ou leitura minuto a minuto) e conformidade metodológica.
  3. **Como poder público**: Priorização de postos de saúde e plantio de vegetação nas zonas prioritárias.

### Cards de Download de Dados Abertos e Metodologia
* Substituímos a barra antiga de links dispersos de download por **5 cards de dados abertos** organizados tematicamente na base da seção de metodologia:
  1. **Qualidade do Ar**: Planilhas consolidadas (`pm10-timeline-2013-2026.csv`, `particulate-timeline-2020-2026.csv`).
  2. **Meteorologia**: Dados climáticos e de ventos de Volta Redonda (`weather-vr-2013-2026.csv`, `weather-dictionary.csv`).
  3. **Exposição Social**: Vulnerabilidade setorial e equipamentos sensíveis (`vr-vulnerabilidade-setores-2022.csv`, `equipamentos-sensiveis-vr.csv`).
  4. **Dicionários de Dados**: Significado de cada variável mapeada (`data-dictionary.csv`, `social-data-dictionary.csv`).
  5. **Manifestos**: Metadados de integridade técnica (`manifest.json` do ar e social).
* Adicionamos o microtexto obrigatório de garantia: *"💡 Todos os dados públicos baixáveis estão documentados por dicionários de campos."*

### Refinamento de Legibilidade e Contraste
* Removemos fundos escuros de caixas de textos longos (como a caixa de minuta da LAI, que agora usa `bg-slate-50` com texto escuro de alto contraste) para priorizar o conforto de leitura prolongada.
* Ajustamos títulos e espaçamentos no fluxo vertical para manter a consistência estilística do BrandSystem.

---

## 2. Resultados do Controle de Qualidade (QA)

1. **Conformidade de Linguagem (`npm run inea:qa:language`)**:
   * **STATUS: PASS**
   * Nenhum termo restrito foi violado. Todas as referências a dados consolidados em lote reiteram que os painéis não representam monitoramento ao vivo.
2. **Compilação e Linter (`npm run verify`)**:
   * **STATUS: PASS**
   * Clean build. Todos os avisos e variáveis não utilizadas de desenvolvimento foram higienizados do código.
3. **Healthcheck de Integração (`scripts/observatorio-healthcheck.ts`)**:
   * **STATUS: PASS**
   * 33/33 asserções automáticas retornando verde no ambiente de produção e ambiente de testes local.
4. **Deploy de Produção**:
   * **STATUS: SUCCESS**
   * Link público: [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
