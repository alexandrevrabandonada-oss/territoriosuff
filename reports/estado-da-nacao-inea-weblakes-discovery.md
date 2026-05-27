# Relatório de Descoberta Ética — Endpoint Tabular INEA/WebLakes

**Data/Hora do Teste:** 2026-05-27T22:27:05.133Z  
**Status do Endpoint:** FALHA (HTTP 503)  
**Estação Testada:** VR - Retiro (ID: 70)  
**Poluente Testado:** PM10 (ID: 18)  
**Período:** 2024-07-17 a 2024-07-18

---

## 1. Resultados da Requisição

- **Endpoint respondeu?** Não
- **Retornou JSON?** Não
- **Campos do JSON bruto:** Nenhum
- **Quantidade total de registros retornados:** 0
- **Há valor físico de concentração?** Não há dados na amostra ou houve falha no retorno
- **Há sinalizador de qualidade (QA/QC)?** Não

---

## 2. Amostra Normalizada (Primeiros Registros)

```json
[]
```

---

## 3. Parâmetros e Estações Identificadas (Mapeamento de Scripts)

Através do cruzamento com scripts acadêmicos públicos da UFSC/LCQAr, mapeamos os seguintes códigos e identificadores operacionais no sistema WebLakes:

### A. Poluentes Monitorados (Parâmetros)
- **PM10:** ID `18`
- **PM2.5:** ID `20`
- **SO2:** ID `23`
- **NO2:** ID `1465`
- **O3:** ID `2130`
- **CO:** ID `3`
- **PTS:** ID `1955`

### B. Estações de Volta Redonda (Sites)
- **VR - Belmonte:** ID `69`
- **VR - Retiro:** ID `70`
- **VR - Santa Cecília:** ID `71`
- **VR - Meteorológica Ilha das Águas Cruas:** ID `72`

---

## 4. Análise de Riscos e Limites de Coleta (Roteiro Ético)

### A. Limite de Período Seguro para Coleta
Para evitar sobrecarregar o servidor do INEA/WebLakes, qualquer extração de dados deve seguir regras estritas:
1.  **Janelas de tempo pequenas:** Realizar chamadas em lote de no máximo 1 ano (ou preferencialmente 1 mês) por requisição para manter o payload pequeno.
2.  **Pausas (Backoff):** Aguardar pelo menos 10 a 20 segundos entre cada chamada de API, exatamente como faz o scraper do laboratório da UFSC.
3.  **Caching local:** Evitar refazer requisições de períodos que já foram baixados e persistidos localmente.

### B. Riscos Técnicos e Jurídicos
- **Mudança de Layout/Endpoint:** Como se trata de um endpoint do sistema WebLakes integrado, alterações na plataforma podem quebrar a extração, pois os dados vêm estruturados dentro de células de tabela HTML representadas como strings de array.
- **Rate-Limiting e Bloqueios:** O servidor pode banir o IP do cliente se detectar scraping rápido e agressivo. Por isso, a identificação do User-Agent do Projeto SEMEAR é indispensável para transparência ética.
- **Ressalvas Legais:** Os dados obtidos por este endpoint são de natureza provisória ou validada preliminarmente pelo órgão, e não substituem relatórios oficiais consolidados.
