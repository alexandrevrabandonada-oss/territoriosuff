# Dicionário de Dados — Observatório do Ar

Este documento apresenta a especificação técnica de todos os campos contidos nas bases de dados consolidadas e arquivos CSV públicos disponibilizados pelo Observatório do Ar da rede cidadã SEMEAR.

---

## Estrutura dos Campos

A tabela abaixo detalha cada campo, sua finalidade, unidade de medida, fonte e ressalva técnica associada.

| Campo | Rótulo | Descrição | Unidade | Fonte | Ressalva Técnica |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `station_id` | ID da Estação | Código numérico da estação automática no sistema público de origem. | N/A | INEA/WebLakes | Corresponde a Belmonte (69), Retiro (70) ou Santa Cecília (71). |
| `station_name` | Nome da Estação | Nome legível associado à estação. | N/A | INEA/WebLakes | Corresponde aos pontos oficiais do município de Volta Redonda-RJ. |
| `year` | Ano | Ano civil das leituras agregadas. | N/A | INEA/WebLakes | Abrange o período plurianual de 2022 a 2024. |
| `pollutant` | Poluente | Sigla do poluente medido (PM10 ou PM2.5). | N/A | INEA/WebLakes | PM10 são partículas inaláveis; PM2.5 são partículas finas. |
| `month` | Mês | Mês de agregação no formato YYYY-MM. | N/A | INEA/WebLakes | Usado para análises de sazonalidade e excedências mensais. |
| `coverage_percent` | Cobertura de Dados | Percentual de horas com leitura em relação ao total teórico do período. | % | SEMEAR (Computado) | Coberturas anuais abaixo de 75% ou mensais abaixo de 30% indicam confiabilidade comprometida. |
| `hourly_records` | Registros Horários | Contagem total de horas com medições válidas capturadas. | Leituras | SEMEAR (Computado) | Exclui horas em que a estação estava offline ou sem registrar dados. |
| `annual_mean_available_hourly` | Média Geral | Média aritmética simples de todas as leituras horárias válidas disponíveis. | µg/m³ | SEMEAR (Computado) | Não há preenchimento artificial de lacunas. Trata-se de uma comparação experimental. |
| `hourly_peak` | Pico Horário Anual | Maior valor individual registrado para o poluente em leituras horárias no ano. | µg/m³ | INEA/WebLakes | Representa picos horários pontuais de concentração. |
| `max_hourly_value` | Pico Horário Mensal | Maior valor individual registrado em leituras horárias durante o mês. | µg/m³ | INEA/WebLakes | Mede a intensidade extrema em escala mensal. |
| `max_hourly_at` | Data/Hora do Pico | Timestamp em formato ISO da ocorrência do pico horário de concentração. | N/A | INEA/WebLakes | Utiliza a marcação de tempo fornecida pela plataforma original. |
| `zero_values` | Registros Zero | Total de horas contendo leituras físicas de valor exatamente igual a zero. | Leituras | SEMEAR (Computado) | Zeros são mantidos para fidelidade, sob suspeita de calibragem física (ZERO_VALUE_REVIEW). |
| `valid_days` | Total de Dias Válidos | Contagem de dias contendo pelo menos 18 horas válidas de leituras físicas. | Dias | SEMEAR (Computado) | Menos de 18 horas invalida o dia para o cálculo das médias diárias. |
| `who_24h_exceedance_days` | Dias acima da OMS | Dias em que a média diária excedeu os limiares de saúde diários da OMS 2021. | Dias | SEMEAR (Comparação) | PM10 > 45 µg/m³; PM2.5 > 15 µg/m³. Comparação estritamente experimental. |
| `conama506_24h_exceedance_days` | Dias acima da CONAMA 506 | Dias em que a média diária excedeu os limites legais federais diários do Brasil. | Dias | SEMEAR (Comparação) | PM10 > 50 µg/m³; PM2.5 > 25 µg/m³ (Resolução CONAMA 506/2024). Comparação experimental. |
| `confidence_level` | Nível de Confiança | Avaliação qualitativa da confiabilidade do ano baseado em sua cobertura. | N/A | SEMEAR (Avaliação) | Classificado em HIGH (alta), MEDIUM (média) ou LOW (baixa cobertura). |
| `source_system` | Sistema de Origem | Nome técnico da base de dados públicas de onde a série foi extraída. | N/A | SEMEAR (Metadados) | Dados extraídos dos dados horários públicos exibidos pela plataforma INEA/WebLakes. |
| `data_quality_tier` | Camada de Qualidade | Nível de tratamento do repositório SEMEAR. | N/A | SEMEAR (Classificação) | Classificados como RAW_PUBLIC_PLATFORM (dados originais sem QA/QC oficial por registro). |
| `validation_note` | Nota de Validação | Nota técnica explícita sobre a leitura e escopo da análise. | N/A | SEMEAR (Nota) | Ressalta que as ultrapassagens são tratadas como comparações experimentais. |

---

## Diretrizes de Uso e Salvaguardas Cívicas

Para garantir o rigor técnico e a transparência em relatórios secundários baseados nestes conjuntos de dados, os utilizadores devem incluir as seguintes notas:

1.  **Comparação Experimental:** Toda referência às excedências diárias de limites deve ser acompanhada pelo aviso:  
    *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito."*
2.  **Visualização Não Instantânea:** As análises baseiam-se em consolidações de séries históricas periódicas e *não representam monitoramento ao vivo ou leitura minuto a minuto*.
3.  **Transparência sobre Falhas:** Ressaltar em relatórios secundários que *ausência de dado não representa ar bom*, impedindo que eventuais problemas de sinal de transmissão original induzam a interpretações de ar purificado.
