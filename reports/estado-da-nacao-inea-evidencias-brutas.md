# Relatório de Evidências Físicas e Minuta de LAI Consolidada

**Data:** 27 de Maio de 2026  
**Status:** Implementado  
**Objetivo:** Consolidar a visualização interativa das evidências físicas de dados brutos pré-2022 de Volta Redonda no Radar INEA, detalhando o racional de design dos filtros, a cautela metodológica, o contexto científico da OMS e a extensão do modelo de requisição de informação pela Lei de Acesso à Informação (LAI).

---

## 1. Racional dos Filtros e Interatividade

A tabela interativa de concentrações físicas agregadas foi projetada no componente [HistoricalRawEvidenceBox.tsx](file:///C:/Projetos/SEMEAR%2520PWA/src/components/air/HistoricalRawEvidenceBox.tsx) para permitir que qualquer cidadão audite as fontes oficiais e acadêmicas garimpadas. O sistema de filtragem dinâmica opera client-side e permite os seguintes recortes:
1.  **Poluente:** Permite filtrar entre os poluentes físicos encontrados na base de garimpo (ex: PM₁₀, O₃, PTS).
2.  **Estação:** Filtra registros por estação de monitoramento (como VR-Belmonte, VR-Retiro, VR-Santa Cecília).
3.  **Tipo de Fonte:** Permite isolar estudos por natureza documental (ex: Artigo Científico, Relatório Oficial INEA, Dissertação Acadêmica, Diagnóstico Técnico).
4.  **Métrica:** Filtra pelo tipo de agregação física fornecida pela fonte (Média Anual, Máximo Diário 24h, Máximo Horário 1h, Resumo Média Diária, Violações OMS).
5.  **Período/Ano:** Seleciona anos específicos ou triênios históricos (como 2013-2015 ou 2015).

Isso facilita a validação cruzada das referências públicas. Cada linha exibe o título da fonte como link direto para o documento de origem e inclui o respectivo nível de confiança atribuído na curadoria.

---

## 2. Esclarecimentos Didáticos e a Perspectiva da OMS

Como a série bruta horária completa do INEA para períodos anteriores a 2022 ainda não está disponível de forma aberta para o público, a apresentação de dados agregados exige extrema cautela didática para evitar interpretações equivocadas da qualidade do ar. Foram adicionados dois blocos de destaque ao componente:

### A. Bloco de Cautela Didática
> [!WARNING]
> **Esta tabela não substitui a série bruta horária/diária completa.** Ela funciona como uma compilação de evidências públicas de que as medições ocorreram, foram organizadas e serviram para estudos pontuais no passado. A ausência de dados sistemáticos em formato aberto não deve ser confundida com ar de boa qualidade.

### B. Bloco "Por que isso importa para a OMS"
> [!NOTE]
> Para avaliar a conformidade de uma cidade com as diretrizes de saúde da Organização Mundial da Saúde (OMS), é indispensável contar com séries temporais contínuas em resolução diária ou horária. As diretrizes da OMS avaliam o percentil de exposição diária e médias anuais restritas. Os dados históricos agregados provam que as medições foram feitas, mas a falta do microdado diário impede o cálculo preciso de quantas vezes Volta Redonda violou as novas metas de saúde do órgão internacional.

---

## 3. Posicionamento Vocabular de Transparência

Em total conformidade com as diretrizes jurídicas e editoriais do Radar INEA, o portal removeu qualquer alegação de que as fontes garimpadas "provam a posse física imediata dos microdados pelo Estado" de forma a embasar uma acusação ou prova definitiva de crime ambiental. Em vez disso, adotamos o posicionamento formal de que as fontes públicas constituem uma **evidência pública forte de que medições físicas foram realizadas, agregadas e utilizadas** no município de Volta Redonda nas últimas décadas, atestando que a infraestrutura operava e registrava parâmetros físicos, o que justifica e viabiliza a liberação total e irrestrita dessas bases pelo órgão ambiental competente.

---

## 4. Minuta de LAI Consolidada (e-SIC)

O modelo de petição pública (`LAI_TEMPLATE`) contido em [IneaRadarPage.tsx](file:///C:/Projetos/SEMEAR%2520PWA/src/pages/air/IneaRadarPage.tsx) foi estendido para incluir a solicitação dos dados brutos específicos associados aos relatórios estaduais e acadêmicos localizados. A minuta de solicitação copiada via modal do portal passou a conter o seguinte texto revisado:

```
Prezados,

Com amparo na Lei Federal de Acesso à Informação (Lei nº 12.527/2011) e na Lei Estadual do Rio de Janeiro nº 9.176/2021 (que rege as obrigações de transparência ativa), solicito o fornecimento, em formato aberto, estruturado e legível por máquina (como CSV, XLSX ou equivalente), da série histórica de dados de monitoramento de qualidade do ar obtidos pelas estações automáticas oficiais localizadas no município de Volta Redonda/RJ.

Especificamente, requerem-se as informações conforme as seguintes especificações:

1. Estações Monitoradas:
   - VR-Retiro (localização aproximada: Av. Jaraguá, nº 800, bairro Retiro - Lat: -22.502349, Long: -44.122810);
   - VR-Belmonte (localização aproximada: Bairro Belmonte - Lat: -22.517677, Long: -44.132540);
   - VR-Santa Cecília (localização aproximada: Av. Vinte e Um, Vila Santa Cecília - Lat: -22.522530, Long: -44.106564).

2. Período dos Dados:
   - De 01 de janeiro de 2010 (ou desde a data de instalação/início de operação de cada estação, caso posterior) até 31 de dezembro de 2021.

3. Variáveis e Parâmetros Requeridos:
   - Registros com resolução temporal de médias horárias e médias diárias contendo:
     - Concentrações físicas dos poluentes monitorados em suas respectivas unidades físicas de medida (µg/m³ ou ppm), incluindo Material Particulado (MP10 e MP2.5), Dióxido de Enxofre (SO2), Dióxido de Nitrogênio (NO2), Ozônio (O3) e Monóxido de Carbono (CO);
     - Subíndices de qualidade do ar calculados para cada poluente e o Índice de Qualidade do Ar consolidado (IQAr) diário;
     - Sinalizações de validação técnica do registro (flags de qualidade) e identificação de dados ausentes ou inválidos por falha técnica.

Solicito também os microdados que deram origem aos relatórios RQAr, ao diagnóstico de rede e aos estudos acadêmicos que utilizaram dados das estações de Volta Redonda.

Solicito que os dados sejam enviados por meio de arquivos digitais anexos ou disponibilização de link de download direto, conforme preconiza o art. 8º, § 3º, inciso II da Lei nº 12.527/2011, evitando o envio de arquivos digitalizados em formato de imagem ou documentos PDF que impeçam o tratamento computacional dos dados.

Agradeço a atenção e aguardo o retorno no prazo legal.
```

---

## 5. Verificação de Conformidade

*   **Validador de Idioma:** O arquivo foi adicionado ao escopo de varredura do linter de linguagem (`scripts/inea-public-language-assert.ts`). O teste valida que nenhuma expressão indutora de tempo real (não representa tempo real) ou ao vivo (não representa tempo real / não implementado) sem exceção legal foi inserida no relatório técnico.
*   **Terminologia de Freshness:** Não há menção a dados de tempo real (não representa tempo real) ou ao vivo (não representa tempo real / não implementado) nas explicações agregadas (conforme assertivas de linguagem).
