# Aurassure/UFF — primeira captura real e auditoria inicial (03/11/2026)

## Estado de implantação confirmado

- Supabase projeto **semearsf** (`ojedgswernwbzrcfomqq`): Edge Function `aurassure-bridge` respondeu HTTP 200 à autenticação e realizou captura real em 03/11/2026, 12h05 de Brasília.
- Tabela privada `public.aurassure_api_snapshots`: **4 snapshots** (1 listagem das estações e 3 consultas de dados). Respostas originais e SHA-256 preservados.
- Tabela de trabalho privada `public.aurassure_measurements_staging`: **519 medições únicas normalizadas**, com RLS ativada e sem SELECT público (`anon` ou `authenticated`). Ainda não publicado no portal.
- Migração `aurassure_staging_normalization_and_qa`: normalizador SQL `aurassure_internal.refresh_measurements_staging()` criado e executado.
- Extensões `pg_net` e `pg_cron`: habilitadas.
- `cron.job`: dois agendamentos **ativos**: `semear-aurassure-capture-15min` (`*/15 * * * *` UTC) e `semear-aurassure-normalize-15min` (`5,20,35,50 * * * *` UTC). As chamadas manuais foram bem-sucedidas; confirmar primeira execução autônoma consultando `cron.job_run_details`, `net._http_response` e snapshots.
- Credencial do operador lida **por nome** de `vault.decrypted_secrets` (`aurassure_bridge_token`) dentro do banco, nunca materializada no GitHub. Ao rotacionar `AURASSURE_BRIDGE_TOKEN` da Edge Function é OBRIGATÓRIO atualizar também a entrada correspondente no Vault para não interromper o agendamento.

## Identidade das três estações — confirmada no endpoint /list

| ID | Nome retornado pela Aurassure |
| --- | --- |
| `46560` | UFF - Vila Santa Cecilia |
| `46561` | IFRJ - N. S. das Gracas |
| `46562` | CRIAAD - Vila Mury |

Os três dispositivos foram listados com `online_status=1` no instante da consulta. Esse indicador não comprova calibração ou adequação ao IQAr normativo.

## Contrato observado na resposta

```json
{
  "status": "success",
  "data": [
    {
      "thing_id": 46560,
      "time": 1793715300,
      "parameter_values": {
        "pm2.5": { "avg": 5.093, "value": 5.093 },
        "aqi": { "value": 99 }
      }
    }
  ],
  "summary": {},
  "cache_status": "miss"
}
```

O exemplo foi reduzido apenas aos campos relevantes. Em consultas de médias de 15 minutos, `time` é epoch em segundos UTC, e as leituras se encontram em `parameter_values.<nome>.avg` / `.value`. O AQI pode conter somente `.value` ou objeto vazio. Não inferir unidades dos gases, parâmetros de qualidade ou índice brasileiro sem documentação metrológica adicional.

**Cuidado com as datas:** a propriedade `last_data_received_time_f` da listagem é renderizada em UTC+05:30 (horário da Índia), compatível com o epoch do mesmo campo; ela NÃO está em hora de Volta Redonda. Para a interface, converter sempre `time` e epochs para `America/Sao_Paulo`.

## Volume e lacunas

| Janela BRT | UFF | IFRJ | CRIAAD | Total |
| --- | ---: | ---: | ---: | ---: |
| 29/10/2026 00h a 30/10 00h | 97 | 97 | 31 | 225 |
| 30/10/2026 00h a 31/10 00h | 97 | 97 | 97 | 291 |
| 03/11/2026, 11h15 e 11h30 | 2 | 2 | 2 | 6 |
| **Bruto em 3 respostas** | 196 | 196 | 130 | **522** |

Os intervalos de 24 h vêm com as duas pontas inclusas, isto é, **97 pontos por estação**, não 96. Há **3 duplicações na virada de 29 para 30/10**, eliminadas na tabela de trabalho pela chave (estação, timestamp UTC, período). Resultado: **519 pontos únicos**.

A estação CRIAAD não apresentou dados antes de 16h30 em 29/10 na consulta realizada. Ausência pode refletir disponibilidade da fonte ou equipamento; não significa necessariamente falha física.

## Sinais para revisão antes de publicação

- **PM1:** ausente em **519/519** pontos, apesar de solicitado, indicando lacuna de cobertura desse parâmetro.
- **PM2,5:** presente em 519/519.
- **AQI da Aurassure:** ausente em **29/519** pontos. Não usar como IQAr oficial INEA nem converter a categoria regulatória sem metodologia.
- **NO₂:** ocorreu leitura **540,645**, em unidade ainda não confirmada, na **CRIAAD em 29/10/2026 às 16h30 BRT**; única observação >200 na série importada. É o primeiro horário disponível dessa estação na janela; marcar para investigação de inicialização/calibração/qualidade em vez de tratá-la como concentração validada.
- Na amostra normalizada não se observaram valores negativos de PM2,5, PM10 ou NO₂.
- Fornecedores, estações e rede cidadã não devem ser confundidos com a rede oficial INEA.

## Política de publicação

**Apenas coleta privada e tratamento preliminar.** Sem UI pública, sem misturar com tabelas INEA, sem atribuição causal à CSN e sem classificação de saúde/risco até obter unidades e documentação, verificar QA da estação CRIAAD e testar agendamentos. O frontend de `semearsf.org` permanece bloqueado por problemas de deploy na Vercel (limite de funções/builds).

## Verificações operacionais

```sql
-- Confere captura e normalização sem revelar segredos
select count(*), max(fetched_at) from public.aurassure_api_snapshots;
select count(*), max(measured_at) from public.aurassure_measurements_staging;

-- Confere agendamentos
select jobid,jobname,schedule,active from cron.job
where jobname like 'semear-aurassure-%';

-- Confere últimas execuções do cron
select j.jobname, d.status, d.start_time, d.end_time
from cron.job_run_details d join cron.job j using(jobid)
where j.jobname like 'semear-aurassure-%'
order by d.start_time desc limit 10;
```

**Rotação de segurança:** as chaves de fornecedor e o token de operador foram inicialmente compartilhados na conversa. Planejar rotação posterior; manter sincronizados o segredo Edge Function e Vault e revogar os valores antigos. Nunca imprimir valores do Vault, inserir segredos em SQL de migração/versionamento ou adicionar prefixo `VITE_`.
