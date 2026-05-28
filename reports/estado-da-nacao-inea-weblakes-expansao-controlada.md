# Estado da Nação — Decisão de Expansão Controlada WebLakes/INEAPublico

Este documento consolida as conclusões das coletas piloto (estacoes e poluentes) e avalia a viabilidade técnica e ética da expansão da extração de concentrações físicas horárias da rede pública do INEA em Volta Redonda para o período completo de 2022 a 2025.

---

## 1. Avaliação de Consistência e Decisões Técnicas

### 1.1 O piloto PM10/Retiro foi consistente?
**Sim.** A extração piloto para Julho de 2024 obteve **719 de 744 horas previstas** (96.6% de cobertura). A auditoria detalhada provou que:
- Não existem timestamps duplicados.
- As lacunas (25 horas) estão concentradas e representam quedas reais de transmissão/comunicação ou do próprio site do INEA, não perda do parser.
- Não existem concentrações físicas de valor negativo.
- A faixa de valores (média de 35.09 µg/m³ e pico de 177.71 µg/m³) é realista e coerente para a região.

### 1.2 Há problemas com timezone?
**Não.** Os timestamps retornados vêm formatados sem indicação explícita de offset (ex: `2024-07-01T00:00:00`). Contudo, o servidor do WebLakes realiza o alinhamento de fuso horário através do cookie regulamentar `lkTimeZone=180,America/Sao_Paulo` enviado em nossos headers. 
Portanto, os dados são gerados no timezone local de Brasília (**America/Sao_Paulo**, UTC-3 ou UTC-2 no horário de verão histórico) e podem ser persistidos diretamente como tal.

### 1.3 Como tratar valores iguais a zero?
Os valores zerados (ex: `0.0000 µg/m³`) são possibilidades físicas (especialmente em períodos chuvosos ou de ventania intensa pós-frente fria). Contudo, para blindagem metodológica, eles **não devem ser descartados**, mas sim mantidos no banco de dados e sinalizados com o status provisório **`ZERO_VALUE_REVIEW`**. Isso avisa as suítes analíticas de que esses valores estão sujeitos a revisão de calibração eletrônica.

---

## 2. Resultados da Expansão Mínima (Validação Cruzada)

### 2.1 Quais estações retornam dados?
- **VR - Belmonte (ID: 69):** Operacional. Retornou dados de PM10 com 99.0% de cobertura no período de teste (17/07 a 24/07).
- **VR - Retiro (ID: 70):** Operacional. Retornou dados de PM10 com 99.5% de cobertura no período de teste.
- **VR - Santa Cecília (ID: 71):** Operacional. Retornou dados de PM10 com 100.0% de cobertura no período de teste.
- **VR - Meteorológica Ilha das Águas Cruas (ID: 72):** Inativa para particulados. Obteve 0% de cobertura (192h de lacunas). Fica confirmado que a estação 72 não monitora PM10.

### 2.2 Quais poluentes retornam dados e quais unidades foram confirmadas?
Consultamos todos os 7 poluentes mapeados na estação Retiro no período de 17/07/2024 a 24/07/2024:

- **PM10 (ID: 18):** Operacional. Unidade: **µg/m³** (Média de 43.40 µg/m³).
- **PM2.5 (ID: 20):** Operacional. Unidade: **µg/m³** (Média de 17.08 µg/m³). *Nota: A alta cobertura de 99.5% confirma que a estação Retiro mede sim PM2.5, refutando a hipótese anterior de que ela estava completamente inoperante para particulados finos.*
- **SO2 (ID: 23):** Operacional. Unidade: **µg/m³** (Média de 3.22 µg/m³).
- **NO2 (ID: 1465):** Operacional. Unidade: **µg/m³** (Média de 17.24 µg/m³).
- **O3 (ID: 2130):** Inoperante. Cobertura: 0.0% (192h de lacunas).
- **CO (ID: 3):** Operacional. Unidade: **ppm** (Média de 0.40 ppm).
- **PTS (ID: 1955):** Operacional. Unidade: **µg/m³** (Média de 73.85 µg/m³, com pico severo de 865.46 µg/m³).

---

## 3. Viabilidade de Expansão (2022–2025)

### 3.1 A coleta pode ser expandida para 2024 inteiro?
**Sim.** Com base nos testes, podemos prosseguir com a expansão sistemática para o ano de 2024. Contudo, para economizar chamadas desnecessárias e poupar o servidor, devemos **desativar as consultas de O3 (ID: 2130)** para a estação Retiro, uma vez que ela está inativa e geraria apenas requisições vazias.

### 3.2 Qual o custo ético e técnico de coletar 2022–2025?

#### Cenário 1: Coleta diária (mesma abordagem do piloto)
*   **Período:** 4 anos (1.461 dias).
*   **Estações ativas:** 3 (Belmonte, Retiro, Santa Cecília).
*   **Poluentes ativos:** 6 (PM10, PM2.5, SO2, NO2, CO, PTS).
*   **Volume de Requisições:** 3 estações × 6 poluentes × 1.461 dias = **26.298 chamadas HTTP**.
*   **Tempo estimado (com backoff de 15s):** 26.298 × 15s = 394.470 segundos ≈ **109.5 horas de execução contínua** (4.5 dias).
*   **Avaliação Ética:** Embora o tráfego seja leve (1 request a cada 15 segundos não causa sobrecarga), manter uma rotina de scraping contínua por 4.5 dias aumenta a probabilidade de falhas de conexão, expiração de sessões e é tecnicamente ineficiente.

#### Cenário 2: Otimização para Coleta Mensal (Recomendado)
A plataforma WebLakes aceita intervalos maiores em `UpdateDateRange` e no parâmetro `rows: 1500`. Como um mês inteiro possui no máximo 744 horas de dados, um único request mensal por estação/poluente retornará toda a série horária em uma única chamada de JqGrid.
*   **Período:** 48 meses.
*   **Estações ativas:** 3.
*   **Poluentes ativos:** 6.
*   **Volume de Requisições:** 3 estações × 6 poluentes × 48 meses = **864 chamadas HTTP**.
*   **Tempo estimado (com backoff de 15s):** 864 × 15s = 12.960 segundos ≈ **3.6 horas**.
*   **Avaliação Ética:** Reduz o número de conexões em **96.7%**, aliviando enormemente a carga sobre o servidor do INEA e permitindo concluir a coleta completa de forma segura e elegante em poucas horas.

---

## 4. Recomendações de Ação

1.  **Refatorar o Coletor para Janelas Mensais:** Desenvolver o script de coleta final operando em janelas mensais em vez de diárias.
2.  **Manter o Cache Mensal:** Salvar arquivos raw em `.cache/inea/weblakes/raw/{station}/{pollutant}/{year}-{month}.json`.
3.  **Foco em Poluentes Operacionais:** Focar a coleta de longo prazo apenas nas estações e poluentes confirmados como operacionais, evitando desperdício de requisições.
