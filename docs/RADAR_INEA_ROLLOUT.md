# Rollout do Radar INEA

## Objetivo

Aplicar com segurança o endurecimento estrutural do Radar INEA:

- RPCs SQL para resumo e analytics do radar
- cobertura baseada em janela esperada por estação
- sinalização de janela inferida na UI
- contrato explícito de truncamento em séries históricas

## Estado atual do rollout

Em 2026-06-16, as migrations do Radar INEA abaixo já foram aplicadas no banco remoto e validadas com:

- `npm run inea:qa:rollout`
- `npm run build`

Observação operacional:

- o histórico do Supabase ainda carrega uma anomalia legada na migration `20260305_170000_reports.sql`
- isso não bloqueia o Radar INEA
- o script `npm run db:push` já incorpora o workaround seguro: marca `20260305` como `reverted` e reaplica a migration idempotente de `reports`
- `npm run db:status`, `npm run db:doctor` e `npm run db:sync` já tratam essa anomalia como dívida legada conhecida e validam o alinhamento real do histórico

## Mudanças que dependem de banco

Aplicar a migration:

- `supabase/migrations/20260616190000_inea_radar_rpc_hardening.sql`
- `supabase/migrations/20260616203000_inea_station_operation_windows_seed.sql`
- `supabase/migrations/20260616212000_inea_data_gap_window_metadata.sql`
- `supabase/migrations/20260616224500_inea_latest_snapshot_rpc.sql`
- `supabase/migrations/20260616231500_inea_freshness_rpc.sql`
- `supabase/migrations/20260616234500_inea_classification_and_controller_rpcs.sql`
- `supabase/migrations/20260617003000_inea_public_stations_rpc.sql`

Ela cria:

- colunas opcionais em `public.air_stations`
  - `operation_start_date`
  - `operation_end_date`
  - `operation_window_source`
- RPCs:
  - `get_inea_station_expected_windows()`
  - `get_inea_daily_aqi()`
  - `get_inea_summary()`
  - `get_inea_monthly_profile()`
  - `get_inea_data_gaps()`
  - `get_inea_station_ranking()`
  - `get_inea_degraded_days()`
  - `get_inea_public_stations()`

Ela também:

- materializa a data de início operacional conhecida das estações INEA de Volta Redonda
- deixa estações ativas com janela aberta até a `source_max_date` sem exigir `operation_end_date` manual
- expõe nas lacunas analíticas a própria janela esperada e a origem editorial/técnica usada
- substitui o endpoint de últimas leituras por um snapshot agregado via RPC, evitando consultas N+1 por estação
- centraliza a metadata de frescor (`latest_measured_at`, `latest_ingested_at`, `is_realtime`) em uma única RPC SQL
- move para SQL a distribuição do poluente controlador e a quebra diária por classificação, reduzindo regras paralelas em Node
- move para SQL o contrato público de metadados de estação consumido por `/stations`, `/stations-metadata` e `/export-catalog`
- endurece os endpoints HTTP do módulo com `405`, `Allow`, `Cache-Control` e validação básica de filtros

## Ordem recomendada

1. Aplicar a migration no ambiente de staging.
2. Popular, quando possível, `operation_start_date`, `operation_end_date` e `operation_window_source` para cada estação INEA.
3. Validar RPCs manualmente no SQL editor ou via cliente Supabase.
4. Rodar `npm run inea:qa:rollout` para executar, na ordem correta, a prontidão RPC e o contrato HTTP público.
5. Publicar o frontend/API que já consome essas RPCs.
6. Revalidar o Radar em produção.

Se o ambiente já estiver ligado ao projeto remoto principal, `npm run db:push` pode ser usado como caminho padrão.
Ele já trata automaticamente a inconsistência histórica de `20260305`.
Depois do push, usar `npm run db:status` como verificação rápida de alinhamento remoto/local.

## Checagens SQL mínimas

Executar:

```sql
select * from public.get_inea_summary();
select * from public.get_inea_station_expected_windows();
select * from public.get_inea_monthly_profile() limit 12;
select * from public.get_inea_data_gaps();
select * from public.get_inea_station_ranking();
select * from public.get_inea_degraded_days();
select * from public.get_inea_public_stations(null);
```

Esperado:

- nenhuma RPC deve falhar
- `coverage_percent` não deve depender apenas do primeiro e último dia observado
- as estações fixas principais de Volta Redonda devem sair com `window_is_inferred = false`
- `expected_end_date` das estações ativas deve acompanhar a data máxima da base pública
- `npm run inea:qa:rollout` deve passar integralmente

## Checagens de produto

Verificar no Radar:

- hero mostra contagens dinâmicas, não números fixos
- gráfico temporal avisa quando a série veio truncada
- aba de cobertura marca estações com `janela esperada inferida`
- aviso de falha parcial lista os blocos analíticos indisponíveis

## Riscos operacionais

- qualquer estação sem `operation_start_date` continua dependente de inferência controlada
- novas estações ativas precisam ao menos de `operation_start_date` e `operation_window_source` para não degradar a leitura de cobertura
- se a migration não for aplicada, os endpoints que agora usam RPC vão falhar
- qualquer ajuste futuro na regra de validação diária deve ser feito primeiro nas RPCs, não duplicado em Node

## Critério de conclusão

O rollout só deve ser considerado concluído quando:

- migration aplicada
- RPCs respondendo
- ao menos as estações principais do radar com início operacional explícito cadastrado
- verificação manual do Radar concluída em staging e produção
