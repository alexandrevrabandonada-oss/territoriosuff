# Estado Atual do Projeto — Observatório do Ar SEMEAR
## Volta Redonda · Portal de Qualidade do Ar

**Data de Emissão:** 2026-05-31 · 17:42 (horário de Brasília)
**Produção:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
**Versão do Manifesto:** v1.5.0
**Healthcheck:** 24/24 PASS ✅
**Datasets Públicos:** 16

---

## 1. O Que é Este Projeto

O **Observatório do Ar SEMEAR** é um portal de transparência cívica sobre qualidade do ar em Volta Redonda (RJ). Ele coleta, processa e publica dados horários de estações de monitoramento do INEA (Instituto Estadual do Ambiente) disponíveis na plataforma pública WebLakes, apresentando-os em uma interface acessível ao público geral com comparações contra as diretrizes da OMS e da CONAMA.

O projeto é uma **Progressive Web App (PWA)** construída com Vite + React + TypeScript, hospedada na Vercel, com deploy contínuo.

> [!IMPORTANT]
> **Todos os dados são experimentais.** Rótulo obrigatório em toda publicação:
> *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito."*
> Ausência de dado não representa ar de boa qualidade.

---

## 2. Estado Atual dos Parâmetros Monitorados

### 2.1. PM10 e PM2.5 — Material Particulado ✅ PUBLICADO

| Parâmetro | Série Histórica | Estações | Status |
| :--- | :---: | :--- | :---: |
| **PM10** | 2020–2026 (parc.) | Belmonte, Retiro, Santa Cecília | ✅ Publicado |
| **PM2.5** | 2021 e 2024–2026 (parc.) | Belmonte, Retiro, Santa Cecília | ✅ Publicado |

**Réguas de comparação:**
- OMS 2021: PM10 = 45 µg/m³ (média diária) · PM2.5 = 15 µg/m³ (média diária)
- CONAMA 506/2024: PM10 = 120 µg/m³ · PM2.5 = 37,5 µg/m³

---

### 2.2. SO₂ — Dióxido de Enxofre ✅ PUBLICADO (Experimental)

| Série | Estações | Cobertura | Excedências OMS | Excedências CONAMA |
| :--- | :--- | :---: | :---: | :---: |
| 2020–2026 (parc.) | Belmonte, Retiro, Santa Cecília | 20/21 ✅ | 3 dias (SC 2020) | 2020 e 2021 |

**Achados chave:**
- Tendência de queda de concentração: ~13 µg/m³ em 2020 → ~5 µg/m³ em 2024+.
- Santa Cecília 2025: cobertura insuficiente (45%) — sinalizado nos CSVs.
- Sem anomalias instrumentais sistemáticas na série completa.

---

### 2.3. CO — Monóxido de Carbono ✅ PUBLICADO (Experimental)

| Série | Estações | Cobertura | Excedências OMS | Excedências CONAMA |
| :--- | :--- | :---: | :---: | :---: |
| 2020–2026 (parc.) | Belmonte, Retiro, Santa Cecília | 21/21 ✅ | 0 dias | 0 dias |

**Achados chave:**
- Único parâmetro com cobertura suficiente em 100% das combinações ano × estação.
- Unidade nativa: ppm. Conversão para mg/m³ (fator 1,145) usada apenas na comparação OMS.
- Retiro 2024: possível zero drift (~1,01 ppm vs. histórico de 0,33–0,45 ppm), sem excedências.

---

### 2.4. NO₂ — Dióxido de Nitrogênio 🚫 BLOQUEADO

| Anomalia | Ano | Estação | Natureza |
| :--- | :---: | :--- | :--- |
| Offset instrumental +20 µg/m³ | 2024 | Retiro | Exclusivo de 2024 |

**Situação:**
- Retiro 2024: média de 35,26 µg/m³ vs. baseline histórico de 13–16 µg/m³ e controles (Belmonte: 15,21 · Santa Cecília: 15,67 µg/m³) no mesmo período.
- Anos saudáveis confirmados: 2020, 2021, 2022, 2023, 2025, 2026 (médias de 13–16 µg/m³, coerência inter-estações excelente).
- **Bloqueio total mantido** — publicação dos anos saudáveis aguarda decisão formal de governança.

---

### 2.5. PTS — Partículas Totais em Suspensão 🔒 QUARENTENA

| Anomalia | Ano | Estação | Natureza |
| :--- | :---: | :--- | :--- |
| Erro de ganho 10× | 2024 | Retiro | Exclusivo de 2024 |

**Situação:**
- Retiro 2024: média de 445 µg/m³ vs. baseline histórico de 44–49 µg/m³ e controles no mesmo período.
- Mediana ÷ 10 = 44,75 µg/m³ — matematicamente coerente com os outros anos.
- Anos saudáveis confirmados: 2020–2023 e 2025–2026 (médias de 36–49 µg/m³).
- **Quarentena total mantida** — mesmo critério de bloqueio que NO₂.

---

### 2.6. O₃ — Ozônio ⚫ INDISPONÍVEL

- Nenhuma leitura transmitida pelas estações de Volta Redonda no recorte validado (2024).
- Sem série histórica disponível para análise.

---

## 3. Datasets Públicos no Manifesto v1.5.0

| # | Arquivo | Conteúdo |
| :---: | :--- | :--- |
| 1 | `pm10-2020-station-summary.csv` | PM10 por estação · 2020 |
| 2 | `pm10-2021-station-summary.csv` | PM10 por estação · 2021 |
| 3 | `pm25-2021-station-summary.csv` | PM2.5 por estação · 2021 |
| 4 | `pm10-2024-station-summary.csv` | PM10 por estação · 2024 |
| 5 | `pm25-2024-station-summary.csv` | PM2.5 por estação · 2024 |
| 6 | `so2-2024-station-summary.csv` | SO₂ por estação · 2024 |
| 7 | `co-2024-station-summary.csv` | CO por estação · 2024 |
| 8 | `pm10-2025-station-summary.csv` | PM10 por estação · 2025 |
| 9 | `pm25-2025-station-summary.csv` | PM2.5 por estação · 2025 |
| 10 | `pm10-2026-station-summary.csv` | PM10 por estação · 2026 parcial |
| 11 | `pm25-2026-station-summary.csv` | PM2.5 por estação · 2026 parcial |
| 12 | `pm-timeline-2020-2026.csv` | PM10 e PM2.5 · série 2020–2026 |
| 13 | `so2-timeline-2020-2026.csv` | SO₂ · série histórica 2020–2026 |
| 14 | `co-timeline-2020-2026.csv` | CO · série histórica 2020–2026 |
| 15 | `exceedances-2020-2026.csv` | Excedências mensais OMS/CONAMA · 2020–2026 |
| 16 | `data-dictionary.csv` | Dicionário de dados |

---

## 4. Histórico de Lotes de Trabalho

### Lote A — Fundação do Portal (26/05/2026)
- Descoberta e mapeamento das APIs públicas da plataforma INEA/WebLakes.
- Engenharia reversa das rotas de autenticação, leitura de série histórica e download de dados horários.
- Definição do contrato de dados WebLakes e do esquema de normalização.
- Publicação inicial das séries de PM10 e PM2.5 (2021 e 2024) na interface pública.
- Desenvolvimento da UI do portal: mapa interativo, página de metodologia, página de dados abertos.

### Lote B — PM10 Expansão e Consolidação (28–30/05/2026)
- Expansão da série de PM10 para 2020–2026 (parcial).
- Auditoria de cache: cruzamento entre dados brutos baixados e cálculos publicados.
- Recálculo de PM10 para as estações Belmonte e Santa Cecília (2024).
- Deploy de produção com manifesto v1.2.0 → v1.3.x.
- Página de metodologia com seções: origem dos dados, cálculo de médias, réguas de comparação, limitações, dados abertos, expansão de parâmetros.

### Lote C — Gases 2024 (31/05/2026, fase 1)
- **Tijolo 41** · QA crítico de SO₂, NO₂, CO, PTS e O₃ para 2024.
  - SO₂ e CO: aprovados para publicação experimental.
  - NO₂ Retiro 2024: anomalia de offset +20 µg/m³ detectada e confirmada — bloqueado.
  - PTS Retiro 2024: erro de ganho 10× detectado e confirmado — bloqueado.
  - O₃: indisponível (0 horas coletadas).
- **Tijolo 42** · Publicação cautelosa de SO₂ e CO 2024.
  - Geração dos CSVs `so2-2024-station-summary.csv` e `co-2024-station-summary.csv`.
  - Manifesto atualizado: v1.4.0.
  - Healthcheck: 22/22 PASS.

### Lote D — Expansão Histórica e Auditoria Longitudinal (31/05/2026, fase 2)
- **Tijolo 43** · SO₂ e CO expandidos para 2020–2026; auditoria longitudinal de NO₂ e PTS.
  - Coleta de dados brutos para todos os anos disponíveis (2020–2026) em Belmonte, Retiro e Santa Cecília.
  - Anomalias de NO₂ e PTS em Retiro confirmadas como **exclusivas de 2024** via análise longitudinal e controle cruzado com outras estações.
  - Geração dos CSVs plurianuais `so2-timeline-2020-2026.csv` e `co-timeline-2020-2026.csv`.
  - Manifesto atualizado: v1.5.0 (16 datasets). Healthcheck: 24/24 PASS.
- **Tijolo 43.1** · Consolidação analítica e documentação.
  - 5 relatórios analíticos finais gerados (SO₂, CO, NO₂ Retiro, PTS Retiro, Lote 43 executivo).
  - Página de metodologia `IneaMethodologyPage.tsx` (#expansao) atualizada.

---

## 5. Arquitetura Técnica do Sistema

### Stack
| Camada | Tecnologia |
| :--- | :--- |
| Framework | Vite + React 19 + TypeScript |
| UI | Tailwind CSS + design system próprio (`BrandSystem`) |
| Mapa | Leaflet + react-leaflet |
| PWA | vite-plugin-pwa (modo injectManifest) |
| Deploy | Vercel (deploy automático via CLI) |
| Dados | CSVs estáticos + manifest.json servidos pelo CDN Vercel |

### Arquivos-chave
| Arquivo | Função |
| :--- | :--- |
| `public/data/air/manifest.json` | Source of truth de todos os datasets públicos |
| `scripts/observatorio-healthcheck.ts` | Healthcheck automatizado de 24 probes |
| `src/pages/air/IneaMethodologyPage.tsx` | Página pública de metodologia |
| `src/pages/air/IneaPage.tsx` | Dashboard principal do portal |
| `src/components/air/` | Componentes do mapa e visualizações |
| `.vercelignore` | Exclusão de dados brutos do deploy (evita timeout por tamanho) |

### Diretório de dados brutos (excluído do deploy)
```
data/inea_weblakes_normalized/
  69/  → VR-Belmonte
  70/  → VR-Retiro
  71/  → VR-Santa Cecília
  72/  → VR-Aterro (histórico)
```

---

## 6. Salvaguardas Editoriais Aplicadas

| Regra | Status |
| :--- | :---: |
| Rótulo experimental em todos os CSVs | ✅ |
| Proibição de "tempo real", "ao vivo", "minuto a minuto" | ✅ (verificado por linter) |
| Proibição de "emissão" (quando dado é concentração) | ✅ |
| Proibição de "prova de crime", "homologado", "oficialmente validado" | ✅ |
| "Ausência de dado não representa ar bom" | ✅ |
| CO exibido em ppm (unidade nativa) | ✅ |
| Cobertura insuficiente sinalizada nos CSVs | ✅ (Santa Cecília SO₂ 2025) |
| NO₂ e PTS ausentes do manifesto público | ✅ |
| O₃ marcado como indisponível | ✅ |

---

## 7. Pendências e Próximos Passos

### Pendências de Governança (aguardam decisão)
1. **NO₂** — Decidir entre:
   - a) Publicar 2020-2023 e 2025-2026 com nota explícita de exclusão de 2024.
   - b) Aguardar auditoria formal do INEA sobre a calibração do sensor de Retiro em 2024.
2. **PTS** — Mesmo processo de decisão, com aplicação de fator ÷10 em 2024 ou exclusão do ano.

### Pendências Técnicas
3. **Atualização 2026** — Em dezembro/2026, atualizar todos os parâmetros com a série completa do ano.
4. **PM2.5 série histórica completa** — PM2.5 de 2020, 2022 e 2023 ainda não publicados (os dados brutos estão coletados mas não foram processados neste ciclo).
5. **Episódios de atenção** — Funcionalidade de alertas de episódios já está prevista na UI mas depende de validação dos dados horários brutos de PM10 em picos específicos.
6. **O₃** — Verificar se novas transmissões foram iniciadas em 2025/2026 quando os dados de 2025 estiverem disponíveis.

---

## 8. Links de Referência

| Recurso | Link |
| :--- | :--- |
| Portal em produção | [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app) |
| Qualidade do Ar INEA | [https://semear-pwa.vercel.app/qualidade-ar/inea](https://semear-pwa.vercel.app/qualidade-ar/inea) |
| Metodologia pública | [https://semear-pwa.vercel.app/qualidade-ar/inea/metodologia](https://semear-pwa.vercel.app/qualidade-ar/inea/metodologia) |
| Manifesto de datasets | [https://semear-pwa.vercel.app/data/air/manifest.json](https://semear-pwa.vercel.app/data/air/manifest.json) |
| Healthcheck latest | [reports/observatorio-healthcheck-latest.md](./observatorio-healthcheck-latest.md) |
| Relatório executivo Lote 43 | [reports/estado-da-nacao-observatorio-lote-43-final.md](./estado-da-nacao-observatorio-lote-43-final.md) |
| Relatório SO₂ 2020–2026 | [reports/estado-da-nacao-inea-so2-2020-2026-final.md](./estado-da-nacao-inea-so2-2020-2026-final.md) |
| Relatório CO 2020–2026 | [reports/estado-da-nacao-inea-co-2020-2026-final.md](./estado-da-nacao-inea-co-2020-2026-final.md) |
| Auditoria NO₂ Retiro | [reports/estado-da-nacao-inea-no2-retiro-2020-2026-auditoria-longitudinal.md](./estado-da-nacao-inea-no2-retiro-2020-2026-auditoria-longitudinal.md) |
| Auditoria PTS Retiro | [reports/estado-da-nacao-inea-pts-retiro-2020-2026-auditoria-longitudinal.md](./estado-da-nacao-inea-pts-retiro-2020-2026-auditoria-longitudinal.md) |
