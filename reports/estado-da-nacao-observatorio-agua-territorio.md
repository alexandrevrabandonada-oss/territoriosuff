# Estado da Nação — Recursos Hídricos e Uso do Solo
**Observatório do Ar SEMEAR · Volta Redonda**

Este relatório apresenta o mapeamento das variáveis de recursos hídricos e de cobertura da terra para Volta Redonda. O objetivo é analisar o papel do amortecimento vegetal urbano na dispersão de poluentes e a dinâmica de deposição atmosférica de particulados industriais na bacia hidrográfica do Rio Paraíba do Sul.

---

## 1. Monitoramento de Recursos Hídricos (ANA / HidroWeb)

Volta Redonda é cortada pelo Rio Paraíba do Sul e por diversos córregos tributários (como o Córrego Brandão). O monitoramento hidrológico adota os dados da **Agência Nacional de Águas e Saneamento Básico (ANA)** via portal **HidroWeb**:

### A. Estações Hidrométricas de Referência
*   **Estação Volta Redonda - Ilustre (Código ANA: `58220000`):**
    *   **Parâmetros:** Nível do rio (cota em cm) e vazão estimada (m³/s).
    *   **Importância:** Avaliar a diluição de efluentes e a relação entre vazão do rio e umidade relativa regional.
*   **Estações Pluviométricas Circundantes:**
    *   Medição acumulada diária de chuva histórica útil para calibrar o efeito de deposição úmida (remoção de poluentes do ar pela chuva).

### B. Cruzamento Hídrico-Atmosférico
*   **Estiagem e Nível Baixo:** O período de seca severa do Rio Paraíba do Sul (maio a setembro) coincide exatamente com as piores condições de dispersão atmosférica (inversões térmicas frequentes e acúmulo de material particulado).
*   **Deposição e Qualidade de Água:** O material particulado sedimentável emitido pelas chaminés industriais e tráfego se deposita sobre o espelho d'água do rio e tributários, lixiviando compostos metálicos na bacia.

---

## 2. Cobertura da Terra e Ilhas de Calor (MapBiomas)

O uso do solo em Volta Redonda desempenha um papel crítico na temperatura de superfície e na rugosidade aerodinâmica, influenciando diretamente a dispersão do ar:

### A. Classes de Cobertura (MapBiomas Coleção Recente)
*   **Área Urbanizada (Infraestrutura Urbana):** Mapeia a densidade de asfalto, concreto e telhados. Altas frações correlacionam-se com ilhas de calor urbanas que aprisionam poluentes ao nível do solo.
*   **Área Industrial (Planta Siderúrgica):** Delimitação exata da planta da CSN, permitindo calcular raios de dispersão espacial a partir do polo industrial.
*   **Vegetação Nativa e Floresta Urbana:** Áreas de preservação e parques florestais. A cobertura arbórea funciona como barreira física de deposição seca (absorção de poluentes gasosos e retenção de partículas finas nas folhas).

### B. Proposta de Indicadores de Cobertura por Bairro
Propor a agregação de dados do MapBiomas e bases municipais para estruturar a taxa de cobertura vegetal por habitante e o percentual de impermeabilização do solo por bairro de Volta Redonda:

| Região / Bairro | Taxa de Vegetação (%) | Fração Impermeabilizada (%) | Índice de Exposição ao Calor |
| :--- | :---: | :---: | :---: |
| **Vila Santa Cecília** | Alta | Média | Baixo |
| **Aero Clube** | Baixa | Alta | Alto |
| **Retiro** | Baixa | Alta | Alto |
| **Belmonte** | Média | Média | Médio |

---

## 3. Integração de Camadas "Terra, Água e Ar"

A futura modelagem integrada do Atlas contemplará:
1.  **Camada "Concreto e Clima":** Visualização espacial que sobrepõe as áreas com menor vegetação (MapBiomas) às temperaturas médias locais e picos de poluição atmosférica.
2.  **Relação Chuva-Limpeza:** Gráfico de correlação que demonstra a redução percentual nas leituras horárias de PM10 e PM2.5 imediatamente após eventos de chuva registrados pela ANA (> 5mm).
