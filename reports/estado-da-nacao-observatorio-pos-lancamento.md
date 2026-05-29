# Estado da Nação — Relatório Operacional Pós-Lançamento do Observatório do Ar

Este documento consolida o status da implantação pública do Observatório do Ar em Volta Redonda, as rotas ativas, os conjuntos de dados disponibilizados, a rotina de manutenção recorrente estabelecida e os próximos passos técnicos identificados.

---

## 1. Localização e Rotas Principais em Produção

O portal do Observatório do Ar está publicado no ambiente de nuvem da Vercel sob o domínio público principal:
*   **Domínio de Produção:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)

### Rotas e Âncora Críticas do Portal

| Rota Pública | Descrição Editorial | Status do QA |
| :--- | :--- | :---: |
| [`/qualidade-ar/inea`](https://semear-pwa.vercel.app/qualidade-ar/inea) | Painel central do Radar INEA contendo o mapa interativo, a classificação diária e picos do ano. | Aprovado ✅ |
| [`/qualidade-ar/inea#episodios`](https://semear-pwa.vercel.app/qualidade-ar/inea#episodios) | Âncora da camada de episódios de atenção e sazonalidade de ultrapassagens (matriz mês × estação). | Aprovado ✅ |
| [`/qualidade-ar/inea#timeline-plurianual`](https://semear-pwa.vercel.app/qualidade-ar/inea#timeline-plurianual) | Âncora da linha do tempo histórica de particulados cobrindo o período de 2022 a 2024. | Aprovado ✅ |
| [`/qualidade-ar/inea/metodologia`](https://semear-pwa.vercel.app/qualidade-ar/inea/metodologia) | Portal de metodologia, regras de validade, limitações, downloads CSV e dicionário de dados interativo. | Aprovado ✅ |
| [`/dados`](https://semear-pwa.vercel.app/dados) | Área central de downloads do portal SEMEAR, incluindo atalho destacado para os episódios de atenção. | Aprovado ✅ |

---

## 2. Conjuntos de Dados Disponibilizados (Open Data)

Os datasets consolidados para auditoria pública foram publicados sob a pasta `/data/air/` e estão indexados por meio do arquivo [manifest.json](https://semear-pwa.vercel.app/data/air/manifest.json) contendo metadados detalhados de versão (`1.1.0`) e o hash do commit Git gerador.

*   **Manifesto de Versão:** [manifest.json](https://semear-pwa.vercel.app/data/air/manifest.json)
*   **Arquivos de Dados Consolidados:**
    1.  [pm10-2024-station-summary.csv](https://semear-pwa.vercel.app/data/air/pm10-2024-station-summary.csv): Estatísticas anuais de PM10 por estação (3 linhas de dados).
    2.  [pm25-2024-station-summary.csv](https://semear-pwa.vercel.app/data/air/pm25-2024-station-summary.csv): Estatísticas anuais de PM2.5 por estação (3 linhas de dados).
    3.  [particulate-timeline-2022-2024.csv](https://semear-pwa.vercel.app/data/air/particulate-timeline-2022-2024.csv): Linha do tempo anual consolidada comparativa (18 linhas de dados).
    4.  [attention-episodes-2022-2024.csv](https://semear-pwa.vercel.app/data/air/attention-episodes-2022-2024.csv): Histórico de episódios de atenção e contagem de ultrapassagens (216 linhas de dados).
    5.  [data-dictionary.csv](https://semear-pwa.vercel.app/data/air/data-dictionary.csv): Metadados e definições dos campos (19 linhas de definições).

---

## 3. Rotina de Manutenção e Atualização Recorrente

Foi estabelecido o **Checklist Mensal de Manutenção** ([checklist-observatorio-atualizacao-mensal.md](file:///C:/Projetos/SEMEAR%20PWA/reports/checklist-observatorio-atualizacao-mensal.md)) para estruturar a rotina técnica pós-lançamento:

1.  **Auditoria Operacional Contínua (Healthcheck):**
    O script automatizado [observatorio-healthcheck.ts](file:///C:/Projetos/SEMEAR%20PWA/scripts/observatorio-healthcheck.ts) é executado para fazer o teste de fumaça na API e rotas de produção, salvando o status no relatório [observatorio-healthcheck-latest.md](file:///C:/Projetos/SEMEAR%20PWA/reports/observatorio-healthcheck-latest.md).
2.  **Atualização Incremental em Lote:**
    Procedimento periódico de coleta de novos dados horários transmitidos via portal público WebLakes do INEA para Volta Redonda.
3.  **Auditoria Estatística e Sumária:**
    Garantia de integridade com a auditoria local automatizada de soma de dias válidos de contagem anual contra a compilação mensal (cruzamento consistente).
4.  **Versionamento e Rastreabilidade:**
    A cada atualização, o script `generate-csv-exports.ts` obtém o hash curto de commit do Git do deploy correspondente e atualiza os arquivos do Open Data e o banner de integridade técnica da metodologia.

---

## 4. Riscos Técnicos Conhecidos e Mitigações

*   **Instabilidade no Sinal Público do INEA/WebLakes:**
    *   *Risco:* A plataforma de origem pode sofrer quedas na transmissão ou alterar a nomenclatura de parâmetros horários.
    *   *Mitigação:* Monitorar os erros de conexão no log gerado pelo script de healthcheck e resguardar que erros de parsing resultem em falha evidente antes do deploy do banco.
*   **Falta de QA/QC Oficial por Registro:**
    *   *Risco:* Leituras físicas brutas com ruídos de calibração podem registrar excedências espúrias de curta duração.
    *   *Mitigação:* Salvaguarda de linguagem obrigatória mantida em todas as exibições indicando tratar-se de uma comparação experimental.
*   **Lacunas na Cobertura de Dados (Sensores Inoperantes):**
    *   *Risco:* Falhas prolongadas nas estações geram taxas de cobertura anual abaixo de 75%.
    *   *Mitigação:* Regra estrita das 18h diárias válidas para classificar médias diárias, além da declaração de transparência de que *ausência de dado não representa ar bom*.

---

## 5. Próximos Ciclos de Melhorias Técnicas

1.  **Automação do Healthcheck no GitHub Actions:**
    Programar a execução automática do script de healthcheck semanalmente e alertar os mantenedores por e-mail/Slack caso alguma rota pública ou API retorne HTTP diferente de 200.
2.  **Expansão para Poluentes Adicionais (CONAMA 506):**
    Incorporar novos painéis sazonais para dióxido de enxofre (SO₂), ozônio (O₃) e dióxido de nitrogênio (NO₂), assim que a plataforma WebLakes restabelecer a consistência desses feeds públicos de Volta Redonda.
3.  **Cruzamento Meteorológico Dinâmico:**
    Agregar dados de vento e temperatura para permitir que o usuário correlacione a direção do vento com o comportamento de picos horários de material particulado de forma visual.
