# Estado da Nação — Relatório Final do Lote 43
## Consolidação: Expansão SO₂/CO 2020–2026, Auditoria NO₂/PTS, Verificação Metodológica

**Data de Emissão:** 2026-05-31
**Responsável pelo Lote:** Observatório do Ar — SEMEAR Volta Redonda
**Versão do Dataset:** manifest v1.5.0 — 16 datasets públicos
**Produção:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
**Healthcheck:** 24/24 PASS (100% saudável)

---

## 1. Síntese Executiva

O Lote 43 realizou a expansão histórica dos parâmetros gasosos publicáveis e a auditoria longitudinal de quatro parâmetros (SO₂, CO, NO₂ e PTS) nas estações de Volta Redonda (Belmonte, Retiro e Santa Cecília) para o período 2020–2026.

---

## 2. Resultados por Parâmetro

### 2.1. SO₂ — Dióxido de Enxofre

**Status: ✅ PUBLICÁVEL COM CAUTELA**

| Critério | Resultado |
| :--- | :--- |
| Cobertura anual | Suficiente em 20/21 combinações estação×ano |
| Cobertura insuficiente | Santa Cecília 2025 (45,07%) — sinalizada |
| Anomalia instrumental | Nenhuma detectada |
| Excedências OMS 40 µg/m³ | 3 dias em Santa Cecília 2020 |
| Excedências CONAMA 20 µg/m³ | Anos 2020 e 2021 (Belmonte/Retiro) — tendência decrescente |
| Excedências 2022–2026 | Praticamente zero |
| Tendência da série | Decrescente (12–16 µg/m³ em 2020 → 4–6 µg/m³ em 2024+) |
| Coerência inter-estações | ✅ Excelente |

**Mensagens públicas seguras:**
- "As concentrações médias de SO₂ em Volta Redonda apresentam tendência de queda entre 2020 e 2026."
- "Os maiores eventos de excedência do padrão legal brasileiro (CONAMA 506) foram registrados em 2020, com redução significativa nos anos seguintes."
- Rótulo obrigatório: *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito."*

---

### 2.2. CO — Monóxido de Carbono

**Status: ✅ PUBLICÁVEL COM CAUTELA**

| Critério | Resultado |
| :--- | :--- |
| Cobertura anual | Suficiente em 21/21 combinações estação×ano |
| Cobertura insuficiente | Nenhuma |
| Anomalia instrumental | Possível zero drift em Retiro 2024 (média ~1 ppm vs histórico 0,33–0,45 ppm) |
| Excedências OMS 4 mg/m³ | Zero — em nenhum ano, nenhuma estação |
| Excedências CONAMA 9 ppm (8h) | Zero — em nenhum ano, nenhuma estação |
| Unidade nativa | ppm (conversão 1 ppm = 1,145 mg/m³ usada apenas na comparação OMS) |
| Coerência inter-estações | ✅ Boa (com nota técnica sobre Retiro 2024) |

**Mensagens públicas seguras:**
- "O CO em Volta Redonda está sistematicamente abaixo de todos os limiares de saúde estabelecidos pela OMS e pelo CONAMA em todos os anos de 2020 a 2026."
- "A série de CO apresenta a melhor cobertura de dados de todos os parâmetros monitorados, sem nenhum recorte de ano/estação com insuficiência."
- "CO é exibido na unidade nativa de medição (ppm). A conversão para mg/m³ é usada apenas para comparação técnica com diretrizes internacionais."
- Rótulo obrigatório: *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito."*

---

### 2.3. NO₂ — Dióxido de Nitrogênio

**Status: 🚫 BLOQUEADO — PARÂMETRO EM AUDITORIA CRÍTICA**

| Critério | Resultado |
| :--- | :--- |
| Anomalia instrumental | ✅ Confirmada: offset +20 µg/m³ em Retiro em 2024 |
| Abrangência da anomalia | Exclusivamente 2024 (isolada) |
| Anos saudáveis confirmados | 2020, 2021, 2022, 2023, 2025, 2026 |
| Coerência inter-estações em anos saudáveis | ✅ Excelente (13–16 µg/m³ nas três estações) |
| Coerência de 2024 com controles | ❌ Retiro 2024 = 35 µg/m³; Belmonte e Santa Cecília = 15 µg/m³ |
| Decisão de publicação | 🚫 Bloqueio total mantido (aguarda governança institucional) |

**Por que NO₂ está bloqueado integralmente (e não apenas 2024)?**
A publicação seletiva de anos requer decisão formal de governança sobre o tratamento de dados e a nota metodológica de exclusão de 2024. Enquanto essa decisão não for tomada, a série completa permanece restrita a relatórios técnicos internos.

**Mensagens públicas seguras (apenas as abaixo):**
- "O parâmetro NO₂ em Retiro apresentou uma anomalia instrumental confirmada em 2024 e permanece em auditoria crítica."
- "Os dados de 2024 para NO₂ em Retiro não são representativos das condições reais de qualidade do ar e foram removidos da visualização pública."

---

### 2.4. PTS — Partículas Totais em Suspensão

**Status: 🔒 HISTÓRICO-TÉCNICO EM QUARENTENA — SEM PUBLICAÇÃO**

| Critério | Resultado |
| :--- | :--- |
| Anomalia instrumental | ✅ Confirmada: fator de ganho 10x em Retiro em 2024 |
| Abrangência da anomalia | Exclusivamente 2024 (isolada) |
| Anos saudáveis confirmados | 2020, 2021, 2022, 2023, 2025, 2026 |
| Evidência do fator 10x | Matemática, espacial e temporal (trifásica) |
| Coerência inter-estações em anos saudáveis | ✅ Boa (medianas de 29–38 µg/m³ alinhadas com Belmonte e Santa Cecília) |
| Decisão de publicação | 🔒 Quarentena total mantida |

**Mensagens públicas seguras:**
- "O parâmetro PTS em Retiro apresentou um erro de escala confirmado em 2024 e permanece catalogado apenas como histórico-técnico de engenharia."

---

### 2.5. O₃ — Ozônio

**Status: ⚫ INDISPONÍVEL / INSUFICIENTE**

O ozônio não apresentou transmissões de dados válidas nas estações de Volta Redonda no recorte 2024 validado. O parâmetro segue listado como "Indisponível" na plataforma. Não há séries históricas de 2020–2026 disponíveis para análise.

---

## 3. Verificação Metodológica

Todos os parâmetros publicáveis (SO₂ e CO) respeitam as seguintes salvaguardas:

| Salvaguarda | Status |
| :--- | :--- |
| Selo de dado experimental explícito | ✅ Presente em todos os arquivos CSV e relatórios |
| Ausência de linguagem de tempo real | ✅ Verificado pelo linter (`npm run inea:qa:language`) |
| Ausência de linguagem de homologação oficial | ✅ Verificado |
| Nota "ausência de dado não representa ar bom" | ✅ Presente em todos os downloads |
| Cobertura insuficiente sinalizada | ✅ Santa Cecília 2025 (SO₂) marcada como INSUFICIENTE no CSV |
| NO₂ e PTS fora do manifesto público | ✅ Confirmado — não listados em `manifest.json` |
| O₃ marcado como indisponível | ✅ Confirmado na UI |

---

## 4. Critérios de Sucesso — Veredito Final

| Critério | Veredito |
| :--- | :--- |
| **SO₂ 2020–2026 publicável com cautela?** | ✅ **SIM** |
| **CO 2020–2026 publicável com cautela?** | ✅ **SIM** |
| **NO₂ permanece bloqueado?** | 🚫 **SIM — bloqueio integral mantido** |
| **PTS permanece histórico-técnico?** | 🔒 **SIM — quarentena total mantida** |
| **O₃ indisponível/insuficiente?** | ⚫ **SIM — zero dados no recorte validado** |

---

## 5. Documentação de Suporte

| Relatório | Arquivo |
| :--- | :--- |
| Série SO₂ 2020–2026 | [estado-da-nacao-inea-so2-2020-2026-final.md](./estado-da-nacao-inea-so2-2020-2026-final.md) |
| Série CO 2020–2026 | [estado-da-nacao-inea-co-2020-2026-final.md](./estado-da-nacao-inea-co-2020-2026-final.md) |
| Auditoria NO₂ Retiro | [estado-da-nacao-inea-no2-retiro-2020-2026-auditoria-longitudinal.md](./estado-da-nacao-inea-no2-retiro-2020-2026-auditoria-longitudinal.md) |
| Auditoria PTS Retiro | [estado-da-nacao-inea-pts-retiro-2020-2026-auditoria-longitudinal.md](./estado-da-nacao-inea-pts-retiro-2020-2026-auditoria-longitudinal.md) |
| Manifesto público | [manifest.json](https://semear-pwa.vercel.app/data/air/manifest.json) |
| Healthcheck mais recente | [observatorio-healthcheck-latest.md](./observatorio-healthcheck-latest.md) |

---

## 6. Próximos Passos Recomendados

1. **Revisão da narrativa pública:** Preparar textos de divulgação para SO₂ e CO 2020–2026 seguindo as mensagens seguras validadas acima.
2. **Governança NO₂:** Decidir entre: (a) publicar 2020-2023 e 2025-2026 com nota de exclusão de 2024, ou (b) aguardar auditoria oficial do INEA para a calibração de 2024.
3. **Governança PTS:** Mesmo processo de decisão para PTS, com aplicação de fator ÷10 em 2024 ou exclusão do ano.
4. **Atualização 2026:** Em dezembro/2026, atualizar todos os parâmetros com os dados completos do ano.
