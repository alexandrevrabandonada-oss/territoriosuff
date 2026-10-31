# Auditoria SEMEAR | Aurassure, dois dias de medições e gargalos da publicação

**Atualização:** 31/10/2026  
**Status:** auditoria preliminar com boletins fornecidos pela equipe; dados brutos e calibração pendentes.  
**Base de resumos canônica:** [`data/aurassure/resumos-diarios-2026-10.json`](../data/aurassure/resumos-diarios-2026-10.json)  
**Validador estrutural:** [`scripts/aurassure-validate-summaries.mjs`](../scripts/aurassure-validate-summaries.mjs)  
**Boletins publicados em fonte aberta:** [29/10](../reports/boletim-aurassure-2026-10-29.md) · [30/10](../reports/boletim-aurassure-2026-10-30.md)

## 1. O que está demonstrado pelos resumos recebidos

- **Cobertura:** UFF e IFRJ registraram 100% em ambos os dias; CRIAAD Vila Mury teve **32% em 29/10** e **100% em 30/10**. Não extrapolar a média parcial do primeiro dia.
- **PM2.5 em 29/10:** máximos reportados UFF 37,1 µg/m³ às 22h; IFRJ 39,9 às 21h30; CRIAAD 36,8 às 21h. Curvas visualmente sincronizadas na noite do dia 29, sujeitas à conferência com o CSV.
- **PM2.5 em 30/10:** máximos UFF 17,7 µg/m³ às 11h45, IFRJ 31,1 e CRIAAD 31,6 µg/m³ às 11h30. A simultaneidade de horários merece análise das séries brutas e do vento.
- **NO₂ na UFF:** médias reportadas **34,9 ppb em 29/10** e **37,1 ppb em 30/10**. No IFRJ: **2,5** e **3,0 ppb**, respectivamente. Razão UFF/IFRJ ≈ **14,0** e **12,4**, respectivamente. Esta diferença é observacional, não prova de fonte ou de precisão comparável entre equipamentos.
- **NO₂ na Vila Mury em 29/10:** pico reportado **540,6 ppb** às 16h30 com apenas 32% de cobertura; gráfico indica medição no retorno da série seguida de queda rápida. Hipótese de artefato precisa ser testada, não presumida.
- **AQI máximo reportado no dia 29:** 36 (UFF), 90 (IFRJ), 3 (CRIAAD). No dia 30: 33, 94, 80. Sem fórmula, período, poluentes controladores e critérios de completude não há classificação ou comparação regulatória válida.
- **Sem alertas abertos:** informação de status do sistema, **não** declaração técnica de ar saudável.

## 2. Achado tecnológico: marca Aurassure exige validação independente

Uma avaliação publicada em abril de 2026 pelo **CSTEP / Indi-SET**, em Bengaluru, testou **25 equipamentos Aurassure** (dentre 48 de seis fabricantes), em calibração junto a instrumentos de referência. Na avaliação de médio prazo, observaram problemas instrumentais, inclusive **um equipamento Aurassure com NO₂ aparentemente limitado a 17 ppb**, além de falhas em sensores de outros poluentes. O estudo recomenda calibração local e checagem periódica de 3 a 6 meses, com colocação conjunta a equipamentos de referência.

**Ressalva decisiva:** o modelo, o módulo de NO₂, a idade e o estado de manutenção dos **três dispositivos em Volta Redonda são desconhecidos**. O estudo **não prova** que os sensores da UFF, do IFRJ ou do CRIAAD tenham as mesmas falhas. Ele demonstra por que é indispensável identificar e testar os equipamentos antes de interpretar grandes diferenças entre localidades.

**Fonte primária:** CSTEP (2026), *Performance Evaluation of Multi-pollutant Air Quality Sensors at Indi-SET, Bengaluru, India*, seção 6, p. 38 do PDF, e recomendações p. 39.  
https://cstep.in/wp-content/uploads/2026/04/Performance-evaluation-of-multipollutant-air-quality-sensors-at-IndiSET-Bengaluru-India.pdf

**Referência metodológica complementar:** estudo científico sobre calibração de sensores de NO₂/O₃ e influência de meteorologia/interferentes, *Atmospheric Measurement Techniques* (2023).  
https://amt.copernicus.org/articles/16/4723/2023/

**Evitar confusão de marcas:** **Aurassure** não é **AirAssure**, da fabricante TSI. Não aplicar especificações da segunda marca aos dispositivos SEMEAR.

## 3. Bloqueios reais na infraestrutura SEMEAR

**Deploy Vercel:** o deploy de produção dos boletins de 29/10 e 30/10 falhou com `exceeded_serverless_functions_per_deployment`: a hospedagem Hobby admite **no máximo 12 funções independentes** em projeto Vite com funções no diretório `api/`. No repositório, há **27 arquivos .ts/.js em `api/`**, incluindo `_http.ts` e `_html.ts` como potenciais auxiliares. Não apagar endpoints nem pressupor que todos os arquivos sejam contados sem conferir as regras do build; a implantação exige reorganizar as rotas com cobertura de regressão ou mudar o plano de forma deliberada. Os boletins Markdown permanecem públicos no GitHub.

**Banco SEMEAR (consulta em 31/10):** em Supabase `semearsf`, tabela `public.stations` estava vazia, `public.measurements` tinha 30 registros (último em maio de 2026) e `public.air_measurements` 15.696 registros, todos anteriores a 2026 (série INEA até fevereiro de 2025). Nenhuma medição de 29 ou 30/10/2026 nas duas tabelas analisadas. Os dados Aurassure dos boletins não estão integrados nesse banco consultado.

**Lacuna de esquema:** a tabela `public.measurements` possui `pm25` e `pm10`, mas **não dispõe de coluna `no2`**; o protocolo `docs/SENSOR_PROTOCOL.md` de ingestão da rede própria também não especifica NO₂. Qualquer integração Aurassure de NO₂ exige **evolução de esquema e API** antes de afirmar suporte operacional. A tabela `air_measurements` é voltada a dados oficiais INEA e **não deve misturar origens sem contrato de proveniência, calibração e RLS**.

**Arquivos de origem:** os nomes `dados_15min_2026-10-29.csv`, `dados_brutos_2026-10-29.csv`, `dados_15min_2026-10-30.csv`, `dados_brutos_2026-10-30.csv` foram informados, mas não estão anexados aos boletins; buscas por nomes exatos no Drive conectado não os localizaram. Não inventar linhas nem valores de 15 minutos.

## 4. Protocolo recomendado de conferência (ordem)

1. **Identificação dos dispositivos:** código/série de cada Aurassure, modelo do equipamento, módulo específico de NO₂, data de instalação, calibração, firmware, condições de abrigo e altura do sensor; preservar logs de reinicialização da Vila Mury em 29/10.
2. **Receber os quatro CSVs originais** e respectivas somas de verificação SHA-256; armazenar cópias imutáveis, declarar timezone, lacunas, unidades, diferenças entre dado bruto e dado calibrado e versão do algoritmo.
3. **Auditar a série NO₂:** distinguir diferenças verdadeiras entre microambientes e deriva/interferência; verificar testes de zero/span, períodos de aquecimento, limites de saturação, temperatura e umidade; testar o valor de 540,6 ppb e seu contexto nos 15–60 minutos adjacentes.
4. **Cointerpretar com meteorologia:** ventos/hora, chuva, pressão, inversão térmica, condições de dispersão, localização precisa e usos do solo. Não atribuir episódios a CSN ou qualquer outra fonte sem evidências.
5. **Validação com referência:** coinstalação (collocation) e análise conjunta com uma estação de referência calibrada, idealmente com registros horários de NO₂ e PM2.5; estabelecer métricas de erro, viés, dispersão e intervalo de confiança. Priorizar checagens periódicas e histórico de intervenções.
6. **Evoluir o banco e o portal:** desenhar modelo multi-poluente com coluna `source`, `sensor_id`, `measured_at`, `averaging_period`, `unit`, `calibration_version`, `quality_flag`, `ingested_at`, `original_file_hash`; promover dados ao público somente com proveniência e RLS testados.
7. **AQI e divulgação:** publicar definição da escala e fórmula antes de rotular “bom” ou “moderado”; não converter máximos de 15 minutos em excedências das médias de 24 horas da OMS.

## 5. Regras editoriais deste dossiê

Classificar cada informação como **RELATADA**, **VERIFICADA NO BANCO**, **PENDENTE DE VALIDAÇÃO**, **HIPÓTESE INVESTIGATIVA** ou **PUBLICADA**. Os resumos diários são resultados **relatados** pela equipe. A leitura da infraestrutura foi **verificada** nesta rodada. Nenhum arquivo bruto foi validado, nenhuma causa de poluição foi estabelecida e nenhuma estação foi declarada “saudável”.

**Próxima entrega técnica recomendada:** resolver o deploy com testes de regressão, e preparar migração segura de NO₂ e ingestão dos CSVs quando disponibilizados, sem adulterar ou sobrescrever a série oficial do INEA.
