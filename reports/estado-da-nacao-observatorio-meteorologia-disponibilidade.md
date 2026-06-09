# Estado da Nação — Meteorologia e Dispersão Atmosférica
**Observatório do Ar SEMEAR · Volta Redonda**

Este relatório apresenta o mapeamento de fontes de dados, parâmetros e viabilidade técnica para a integração de dados meteorológicos ao Observatório do Ar. O objetivo é compreender o transporte de plumas de fumaça industriais e residenciais e modelar a dispersão de poluentes urbanos.

---

## 1. Mapeamento de Fontes e Sensores

### A. Rede INMET (Instituto Nacional de Meteorologia / BDMEP)
O INMET possui estações meteorológicas automáticas próximas que cobrem a região do Médio Paraíba. A base histórica de dados horários está disponível no Banco de Dados Meteorológicos (BDMEP):

1.  **Estação Volta Redonda (ID: A609):**
    *   **Situação:** Operação histórica ativa com dados horários de temperatura, umidade, vento, pressão e chuva.
    *   **Vantagem:** Localizada dentro da mancha urbana municipal.
    *   **Limitação:** Eventuais lacunas de transmissão em períodos recentes.
2.  **Estação Resende (ID: A608) e Rio Claro (ID: A622):**
    *   **Vantagem:** Úteis como estações de controle regional para dispersão de macroescala no Vale do Paraíba.

### B. Sensores Locais INEA/WebLakes
As estações de monitoramento de Volta Redonda possuem ou possuíam anemômetros e sensores meteorológicos integrados na própria estrutura física:

*   **VR-Belmonte (69):** Possui registro de velocidade e direção do vento na base de dados bruta WebLakes.
*   **VR-Retiro (70):** Histórico de temperatura e direção de ventos.
*   **VR-Santa Cecília (71):** Registro histórico parcial de velocidade de vento e temperatura.

---

## 2. Parâmetros Meteorológicos e Matriz de Disponibilidade

| Parâmetro | Unidade | Fonte INMET | Fonte INEA/WebLakes | Papel Metodológico na Dispersão |
| :--- | :---: | :---: | :---: | :--- |
| **Direção do Vento** | Graus (°) | Sim (A609) | Sim (Belmonte/Retiro) | Identificar a origem da pluma poluente (ex: direção da Usina Siderúrgica). |
| **Velocidade do Vento** | m/s | Sim (A609) | Sim (Belmonte/Retiro) | Ventos < 1.5 m/s caracterizam condições de estagnação (acúmulo de partículas). |
| **Precipitação (Chuva)** | mm | Sim (A609) | Parcial | Lavagem atmosférica (*wet deposition*). Zera ou reduz drasticamente PM10/PM2.5. |
| **Umidade Relativa** | % | Sim (A609) | Parcial | Altas umidades propiciam reações secundárias de formação de material particulado. |
| **Temperatura do Ar** | °C | Sim (A609) | Sim (Todas) | Gradiente térmico vertical. Indica estabilidade e inversão térmica. |
| **Pressão Atmosférica** | hPa | Sim (A609) | Não | Auxilia na identificação de frentes frias e sistemas de alta pressão (inversão). |
| **Radiação Solar** | kJ/m² | Sim (A609) | Não | Motor de reações fotoquímicas de formação de Ozônio (O₃) secundário. |

---

## 3. Modelo de Rosa dos Ventos por Estação
Propõe-se a integração de uma biblioteca gráfica (como `uPlot` ou componentes SVG baseados em D3/Canvas) para exibir rosas dos ventos dinâmicas agregadas por estação e período (seco x chuvoso):

```
       N (0°)
  WNW  \ | /  NNE
W (270°) - - E (90°)
  WSW  / | \  ESE
       S (180°)
```
O modelo de Rosa dos Ventos correlacionará a frequência de direção e a magnitude de velocidade do vento (calmaria, vento fraco, moderado e forte) com a localização geográfica das estações físicas em relação à planta da Usina Presidente Vargas (CSN) no centro de Volta Redonda.

---

## 4. Correlação Cruzada: Vento x Picos de Poluição

Para entender os picos de poluentes (PM10, PM2.5, SO₂, CO), a visualização correlacionará as seguintes variáveis:

1.  **Vetor de Vento vs Concentração Horária:**
    *   Plotar no gráfico de dispersão (*scatter plot*) a concentração de poluente no eixo Y e a velocidade/direção do vento no eixo X.
    *   **Padrão Esperado:** Maiores concentrações basais sob baixas velocidades de vento (calmaria) e picos direcionais severos quando o vento sopra de quadrantes industriais na direção de bairros vizinhos (ex: vento de SE soprando sobre Belmonte).
2.  **Mapeamento de Inversão Térmica:**
    *   Cruzamento de temperatura mínima diurna baixa com picos matutinos de poluição (tipicamente entre 06h e 09h da manhã no inverno).
