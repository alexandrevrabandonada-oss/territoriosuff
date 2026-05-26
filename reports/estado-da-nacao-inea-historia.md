# Estado da Nação — História dos Dados INEA

Este relatório documenta a entrega do **Tijolo 11**, focado na criação de uma interface didática, narrativa e compreensível sobre a base histórica consolidada do INEA (2022–2025) para Volta Redonda.

---

## 1. Rota Criada
- **URL Pública**: `/qualidade-ar/inea/historia`
- **Nome Público**: *"A história do ar em Volta Redonda nos dados oficiais do INEA"*
- **Objetivo**: Apresentar os dados de qualidade do ar a um público geral de forma clara e instigante, destacando o que os dados dizem, o que eles calam e como interpretá-los.

---

## 2. Componentes Criados
Para modularizar e enriquecer a experiência de leitura, foram criados três novos componentes sob o diretório `src/components/air/`:

1. **[IneaHistoricalTimeline.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/IneaHistoricalTimeline.tsx)**:
   - Representação visual do período coberto pela base pública de dados (02/01/2022 a 13/02/2025).
   - Destaque ao último processamento/ingestão no banco de dados.
   - Inclui aviso de ressalva: *"A linha mostra o período coberto pela base pública disponível, não todo o histórico possível de monitoramento."*

2. **[AqiExplainer.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/AqiExplainer.tsx)**:
   - Explicação amigável do Índice de Qualidade do Ar (IQAr) como indicador consolidado.
   - Detalhamento do papel dos subíndices de cada poluente e a lógica do "poluente controlador" (o pior define a nota geral).
   - Tabela visual com as 5 faixas oficiais (BOA, MODERADA, RUIM, MUITO RUIM e PÉSSIMA) com cores, intervalos e impactos previstos à saúde.

3. **[IneaStorySummaryCard.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/IneaStorySummaryCard.tsx)**:
   - Card compacto de compartilhamento / visualização rápida para consolidar as conclusões históricas principais (período, estações monitoradas, controlador SO₂ e lacunas críticas de dados).
   - Oferece um botão CTA ("Abrir história completa") direcionando à página narrativa.

---

## 3. APIs Usadas
A página consome diretamente os seguintes endpoints oficiais estruturados:
- `/api/air/inea/summary` (Estatísticas de contagem total de registros e limites de datas).
- `/api/air/inea/stations` (Lista e coordenadas georreferenciadas das 4 estações físicas).
- `/api/air/inea/analytics/monthly-profile` (Perfil de dias classificados como MODERADA ou pior por mês).
- `/api/air/inea/analytics/controller-frequency` (Frequência e peso de cada poluente controlador).
- `/api/air/inea/analytics/data-gaps` (Métricas de cobertura por estação e maior duração de lacunas de transmissão).

---

## 4. Explicações de Conceitos-Chave

### Índice de Qualidade do Ar (IQAr)
A página conceitua o IQAr como uma métrica processada de fácil leitura. Em vez de lidar com unidades científicas de difícil compreensão para o público geral ($\mu g/m^3$), o leitor compreende que o IQAr reúne diferentes poluentes e exibe a pior classificação apurada no momento do registro como a nota final.

### Lacunas de Transmissão (Dados Ausentes)
A narrativa da página combate fortemente a percepção de que a ausência de dados indica qualidade aceitável do ar. O componente e os textos reforçam ativamente:
> *"Ausência de dado não é ar bom. É ausência de transparência sobre aquele período."*
Exibe-se de forma clara a porcentagem de cobertura de cada estação, a quantidade de interrupções superiores a 24 horas e a maior lacuna contínua identificada na série histórica.

---

## 5. Pontos de Entrada e Acesso à Página
Os links e CTAs para a página narrativa foram distribuídos estrategicamente nas rotas:
1. **/dados**: No bloco do "Radar do Ar INEA", ao lado de *"Abrir mapa"* e *"Ver análises"*, adicionou-se o botão *"Ver história dos dados"*.
2. **/qualidade-ar/inea**: No hero (título) geral e também no hero do fallback de erros, adicionou-se o link *"Entender a série histórica"*.
3. **/qualidade-ar/inea/analises**: Inserido o botão *"Ver explicação didática"* no cabeçalho de controle analítico.
4. **Navbar.tsx**: Adicionado o link *"História INEA"* de forma fixa no menu principal de navegação desktop e no menu móvel (sob o grupo "Principal").

---

## 6. Próximos Passos Editoriais
- **Campanhas de LAI (Lei de Acesso à Informação)**: Mobilizar a população e parceiros para cobrar os dados anteriores a 2022 em formato aberto, metadados de instalação e calibração das estações conhecidas.
- **Cruzamento Qualitativo**: Integrar relatos e histórias dos moradores do entorno das estações com os períodos mais críticos mostrados na base oficial para comparar a percepção popular e o registro governamental.
- **Relatório Mensal de Transparência**: Gerar um boletim automático de cobertura e perdas de transmissão a cada nova ingestão em lote realizada pelo coletor.
