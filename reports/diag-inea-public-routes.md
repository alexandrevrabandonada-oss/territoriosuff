# Diagnóstico de Rotas Públicas do Radar do Ar INEA

**Data do Diagnóstico:** 2026-05-26T23:15:40.651Z  
**Ambiente Testado:** Local (simulando Serverless via .env.local)  

## Resumo Geral

| Rota | Status | OK | Causa do Erro (se houver) |
| :--- | :---: | :---: | :--- |
| `summary` | 200 | ✅ Sim | Nenhum |
| `stations` | 200 | ✅ Sim | Nenhum |
| `latest` | 200 | ✅ Sim | Nenhum |
| `timeseries` | 200 | ✅ Sim | Nenhum |
| `classification-days` | 200 | ✅ Sim | Nenhum |
| `analytics/degraded-days` | 200 | ✅ Sim | Nenhum |
| `analytics/controller-frequency` | 200 | ✅ Sim | Nenhum |
| `analytics/monthly-profile` | 200 | ✅ Sim | Nenhum |
| `analytics/station-ranking` | 200 | ✅ Sim | Nenhum |
| `analytics/data-gaps` | 200 | ✅ Sim | Nenhum |


## Detalhamento por Rota

### Rota: `summary`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
{
  "totalStations": 4,
  "timeRange": {
    "minDate": "2022-01-02T03:00:00+00:00",
    "maxDate": "2025-02-13T03:00:00+00:00"
  },
  "totalMeasurements": 15696,
  "moderateOrWorseDaysCount": 32,
  "mostFrequentControllingPollutant": "SO2",
  "source_system": "CKAN_XLSX",
  "data_freshness_label": "Última base pública disponível",
  "latest_measured_at": "2025-02-13T03:00:00+00:00",
  "latest_ingested_at": "2026-05-26T17:34:13.743+00:00",
  "is_realtime": false
}...
```

---

### Rota: `stations`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
[
  {
    "id": "d30e819a-8b87-41b1-8d2a-9616895504fa",
    "name": "VR-Belmonte",
    "code": "VR-Belmonte",
    "city": "Volta Redonda",
    "neighborhood": null,
    "lat": -22.517677,
    "lng": -44.13254,
    "active": true
  },
  {
    "id": "5e3899e4-eaee-43e2-88b7-4f7d965f82d4",
    "name": "VR-Nossa Sra. das Graças (Van)",
    "code": "VR-Nossa Sra. das Graças (Van)",
    "city": "Volta Redonda",
    "neighborhood": null,
    "lat": -22.50656,
    "lng": -44.09669,
    "active": true
  ...
```

---

### Rota: `latest`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
{
  "source_system": "CKAN_XLSX",
  "data_freshness_label": "Última base pública disponível",
  "latest_measured_at": "2025-02-13T03:00:00+00:00",
  "latest_ingested_at": "2026-05-26T17:34:13.743+00:00",
  "is_realtime": false,
  "stations": [
    {
      "station": {
        "id": "d30e819a-8b87-41b1-8d2a-9616895504fa",
        "name": "VR-Belmonte",
        "code": "VR-Belmonte",
        "city": "Volta Redonda",
        "neighborhood": null,
        "lat": -22.517677,
        "lng": -44.13254,...
```

---

### Rota: `timeseries`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
[]...
```

---

### Rota: `classification-days`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
{
  "d30e819a-8b87-41b1-8d2a-9616895504fa": {
    "BOA": 263,
    "MODERADA": 45,
    "RUIM": 0,
    "MUITO RUIM": 0,
    "PÉSSIMA": 0,
    "moderateOrWorseDays": 45,
    "totalDays": 308
  },
  "ef577471-fd22-4f72-a955-97f1cffda35a": {
    "BOA": 301,
    "MODERADA": 8,
    "RUIM": 0,
    "MUITO RUIM": 0,
    "PÉSSIMA": 0,
    "moderateOrWorseDays": 8,
    "totalDays": 309
  },
  "05b4aa3d-ea4e-4579-92d3-52f7efb4a07c": {
    "BOA": 303,
    "MODERADA": 6,
    "RUIM": 0,
    "MUITO RUIM": 0,
   ...
```

---

### Rota: `analytics/degraded-days`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
[
  {
    "station_id": "d30e819a-8b87-41b1-8d2a-9616895504fa",
    "station_name": "VR-Belmonte",
    "measured_days": 655,
    "expected_days": 1139,
    "coverage_percent": 57.5,
    "insufficient_data_days": 0,
    "degraded_days": 89,
    "degraded_percent_of_measured_days": 13.6,
    "degraded_percent_of_expected_days": 7.8,
    "caveat": "Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado não é qualidade boa."
  },
  {
    "station_id": "e...
```

---

### Rota: `analytics/controller-frequency`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
[
  {
    "pollutant": "SO2",
    "count": 486,
    "percentage": 48.7
  },
  {
    "pollutant": "MP10",
    "count": 305,
    "percentage": 30.6
  }
]...
```

---

### Rota: `analytics/monthly-profile`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
[
  {
    "month": 1,
    "month_name": "Janeiro",
    "measured_days": 243,
    "expected_days": 434,
    "coverage_percent": 56,
    "insufficient_data_days": 0,
    "degraded_days": 2,
    "degraded_percent_of_measured_days": 0.8,
    "degraded_percent_of_expected_days": 0.5,
    "caveat": "Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado não é qualidade boa."
  },
  {
    "month": 2,
    "month_name": "Fevereiro",
    "measured_days": 165,
...
```

---

### Rota: `analytics/station-ranking`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
[
  {
    "station_id": "d30e819a-8b87-41b1-8d2a-9616895504fa",
    "station_name": "VR-Belmonte",
    "max_aqi": 74,
    "max_aqi_classification": "MODERADA",
    "measured_days": 655,
    "expected_days": 1139,
    "coverage_percent": 57.5,
    "insufficient_data_days": 0,
    "degraded_days": 89,
    "degraded_percent_of_measured_days": 13.6,
    "degraded_percent_of_expected_days": 7.8,
    "caveat": "Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausênci...
```

---

### Rota: `analytics/data-gaps`
- **Status HTTP:** 200
- **Sucesso:** Sim
- **Amostra da Resposta:** 
```json
[
  {
    "station_id": "d30e819a-8b87-41b1-8d2a-9616895504fa",
    "station_name": "VR-Belmonte",
    "measured_days": 655,
    "expected_days": 1139,
    "coverage_percent": 57.5,
    "insufficient_data_days": 0,
    "degraded_days": 89,
    "degraded_percent_of_measured_days": 13.6,
    "degraded_percent_of_expected_days": 7.8,
    "gap_count": 27,
    "max_gap_hours": 10104,
    "caveat": "Estações com baixa cobertura não devem ser interpretadas como regiões de ar melhor. Ausência de dado nã...
```

---

## Próximos Passos recomendados

1. **Verificar Env Vars no Deploy Vercel:** Se todos os testes locais funcionam perfeitamente mas falham no deploy público, a causa provável é a falta das variáveis de ambiente `SUPABASE_URL` e `SUPABASE_SERVICE_ROLE_KEY` no dashboard da Vercel para o ambiente de produção.
2. **RLS e Políticas Públicas:** Se ocorrerem erros de permissão/RLS, certificar-se de que os acessos anônimos para leitura (`select`) estão explicitamente liberados para as tabelas `air_stations` e `air_measurements` com o anon key, ou que a API Serverless está usando corretamente a key bypass (`service_role`) que não deve ser exposta no frontend.
