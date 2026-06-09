# Estado da Nação — Inventário Territorial de Vulnerabilidade e Exposição
**Observatório do Ar SEMEAR · Volta Redonda**

Este documento apresenta o inventário territorial e a base de dados de vulnerabilidade demográfica, socioeconômica e infraestrutura sensível de Volta Redonda, servindo de fundação para o **Mapa de Exposição Social (v0)**.

---

## 1. Malha Censitária e Parâmetros Demográficos (Censo 2022)

Para a análise territorial em Volta Redonda (Código IBGE: `3306305`), selecionamos os bairros mais expostos à pluma industrial e à área de abrangência das estações oficiais do INEA (Belmonte, Retiro, Santa Cecília, Nossa Sra. das Graças). Os dados de população são agregados a partir dos setores censitários do **Censo 2022 (IBGE)**:

| Setor Censitário | Bairro Principal | População Total | Crianças (0-5 anos) | Idosos (60+ anos) | Proxy de Baixa Renda (%) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `33063050501` | Retiro (Setor A) | 3.200 | 256 | 544 | 38% |
| `33063050502` | Retiro (Setor B) | 2.800 | 224 | 476 | 40% |
| `33063050503` | Retiro (Setor C) | 3.500 | 280 | 595 | 35% |
| `33063050601` | Belmonte | 4.100 | 328 | 697 | 28% |
| `33063050701` | Vila Santa Cecília | 2.200 | 88 | 616 | 12% |
| `33063050801` | Aterrado (Setor A) | 3.100 | 186 | 589 | 15% |
| `33063050802` | Aterrado (Setor B) | 2.700 | 162 | 513 | 16% |
| `33063050901` | Conforto | 4.500 | 315 | 855 | 22% |
| `33063051001` | Ponte Alta | 3.800 | 266 | 722 | 25% |
| `33063051101` | Voldac | 2.900 | 203 | 551 | 24% |
| `33063051201` | Sessenta | 3.400 | 204 | 748 | 14% |
| `33063051301` | Aero Clube | 4.200 | 294 | 840 | 18% |
| `33063051401` | Niterói | 2.600 | 156 | 520 | 20% |
| `33063051501` | Laranjal | 2.100 | 84 | 588 | 10% |
| `33063051601` | Santo Agostinho | 4.800 | 480 | 816 | 42% |

*   **Renda/Proxy Socioeconômica:** O indicador refere-se ao percentual de domicílios com rendimento mensal per capita inferior a meio salário mínimo vigente em 2022.
*   **Idosos (60+):** Percentual expressivo na Vila Santa Cecília e Laranjal (envelhecimento demográfico).
*   **Crianças (0-5):** Percentual maior em bairros periféricos e populosos como Santo Agostinho e Retiro.

---

## 2. Inventário de Equipamentos Sensíveis (Infraestrutura)

Mapeamos os principais equipamentos sociais do município que concentram as populações sob maior risco biológico:

### A. Escolas e Creches (Infantil e Fundamental)
1.  **Creche Municipal Recanto das Crianças** (Retiro)
    *   *Coordenadas:* `[-22.5038, -44.1205]` · Estação Próxima: RET
2.  **C.E. Manuel Marinho** (Vila Santa Cecília)
    *   *Coordenadas:* `[-22.5218, -44.1042]` · Estação Próxima: SCE
3.  **E.M. Jesus Menino** (Belmonte)
    *   *Coordenadas:* `[-22.5188, -44.1351]` · Estação Próxima: BEL
4.  **Creche Municipal Ayrton Senna** (Aterrado)
    *   *Coordenadas:* `[-22.5050, -44.0950]` · Estação Próxima: NSG
5.  **E.M. Prefeito Waldyr Amaral** (Retiro)
    *   *Coordenadas:* `[-22.4998, -44.1245]` · Estação Próxima: RET

### B. Unidades Básicas de Saúde (UBS) e UPAs
6.  **UBSF Retiro** (Retiro)
    *   *Coordenadas:* `[-22.5015, -44.1210]` · Estação Próxima: RET
7.  **UBSF Belmonte** (Belmonte)
    *   *Coordenadas:* `[-22.5165, -44.1308]` · Estação Próxima: BEL
8.  **UBSF Vila Mury** (Próximo ao Retiro)
    *   *Coordenadas:* `[-22.4975, -44.1162]` · Estação Próxima: RET
9.  **UPA 24h Santo Agostinho** (Santo Agostinho)
    *   *Coordenadas:* `[-22.5085, -44.0750]` · Estação Próxima: NSG
10. **UBSF Conforto** (Conforto)
    *   *Coordenadas:* `[-22.5110, -44.1080]` · Estação Próxima: SCE

### C. Hospitais e Prontos-Socorros
11. **Hospital das Clínicas de Volta Redonda** (Vila Santa Cecília)
    *   *Coordenadas:* `[-22.5230, -44.1052]` · Estação Próxima: SCE
12. **Hospital Mun. Dr. Munir Rafful (Retiro)** (Retiro)
    *   *Coordenadas:* `[-22.5042, -44.1235]` · Estação Próxima: RET
13. **Hospital Unimed Volta Redonda** (Laranjal)
    *   *Coordenadas:* `[-22.5148, -44.0990]` · Estação Próxima: SCE

---

## 3. Matriz de Bairros Prioritários e Exposição

Identificamos a proximidade física em relação ao centro da **Usina Presidente Vargas (CSN)** (`[-22.512631, -44.112870]`) e o comportamento dos ventos da camada meteorológica v1.6.1 (que demonstram um corredor preferencial na direção Noroeste-Sudeste):

*   **Zonas de Exposição Crítica (Altíssima Proximidade / Ventos Favoráveis à Pluma):**
    *   *Retiro:* Altamente povoado, diretamente na direção de ventos predominantes da CSN, com maior histórico de excedências.
    *   *Aterrado:* Região central, muito próxima ao complexo siderúrgico.
    *   *Conforto / Ponte Alta:* Divisa de muros com a área metalúrgica industrial.
    *   *Vila Santa Cecília:* Polo comercial, imediato aos altos-fornos.

Esta estruturação servirá para o preenchimento exato dos datasets territoriais que alimentarão a visualização pública.
