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

---

## Atualização 03/11/2026 — primeiro ciclo automático, auditoria de unidade e interface preparada

**Comprovação cron e HTTP.** 12h15 BRT: o job `semear-aurassure-capture-15min` executou com status `succeeded`, recebeu HTTP 200/`ok:true` da Edge Function e gravou novo snapshot às 12h15min03s. 12h20 BRT: `semear-aurassure-normalize-15min` executou com status `succeeded`. Às 12h21 a staging continha **532 observações únicas**, última medida às 11h45 BRT. A captura → armazenamento → normalização automática está comprovada na primeira rodada. A continuidade ao longo de vários dias ainda requer acompanhamento.

**Unidades por estação confirmadas na configuração do endpoint /list.** Nas três estações, PM2,5 e PM10 exibem `μg/m3` e têm `default_unit=μg/m3`. Para gases existe divergência entre unidade de exibição e padrão interno:

| Parâmetro | Unidade de exibição | Default interno |
|---|---|---|
| NO₂ / SO₂ / O₃ | ppb | μg/m3 |
| CO | ppb | mg/m3 |
| CO₂ | ppm | ppm |
| Temperatura | DegC | °C |
| Umidade | % | % |
| TVOC | ppm | ppm |

O endpoint /data não inclui unidade em cada leitura. **Perguntar à Aurassure qual das duas unidades é usada na resposta JSON, inclusive para histórico. Não converter ou publicar gases em unidade presumida.** PM1 não consta da relação ativa de parâmetros devolvida para essas estações; a ausência sistemática de PM1 nas leituras precisa de confirmação do fornecedor.

**Anomalia CRIAAD 29/10, 16h30–17h00 BRT.** A leitura NO₂ caiu de 540,645 para 189,604 e 55,785; SO₂ de 723,91 para 319,60 e 102,62; CO de 3957,88 para 1630,48 e 711,28. PM2,5 permaneceu ~5 no mesmo intervalo. UFF/IFRJ não mostraram queda semelhante. As unidades de gases **não** estão confirmadas. Esse é o primeiro horário disponível na consulta do dia 29, mas a estação foi cadastrada com `first_data_time` de 20/10/2026: não afirmar que começou a funcionar no dia 29. Possíveis explicações incluem retomada, estabilização, calibração, conversão ou evento real; nenhuma foi confirmada.

**Registro de pendência técnica.** Criada a tabela privada `aurassure_qa_annotations` com três anotações `block_release` para 16h30, 16h45 e 17h00, estado `open`, preservando todos os valores originais. Não confundir esse bloqueio editorial com prova de falha do sensor.

**Fronteira pública de aprovação.** A tabela `aurassure_public_measurements` foi criada com RLS: apenas linhas com `publication_state='published'` e referências obrigatórias de QA, unidade e metodologia podem ser lidas por `anon`/`authenticated`. Nenhum cliente público tem permissão para escrever ou acessar as tabelas privadas. Na última consulta, **zero linhas públicas**: nenhuma medição foi aprovada para divulgação.

**Painel preparado no GitHub, não publicado.** A nova página `src/pages/air/AurassureUffPage.tsx` com rota `/qualidade-ar/uff` permite selecionar UFF/IFRJ/CRIAAD, PM2,5/PM10, recortes 24h/7d/30d, visualização temporal e CSV; a página lê somente a tabela revisada, que está vazia até o aval técnico. Foram incluídos link na landing, SEO e sitemap. O teste estático de segurança do contrato do portal passou 16/16 verificações sobre os arquivos da branch; também se executaram com sucesso 10 testes do conector e 16 do operador (Node 22). A compilação e o preview da versão final ainda requerem verificação independente.

**Publicação bloqueada na Vercel.** O projeto territorial `territoriosuff` continua com erro `exceeded_serverless_functions_per_deployment` no plano Hobby (máximo 12). É necessário reduzir com segurança o número de funções ou aprovar mudança de plano; nenhuma alteração desse tipo foi publicada. **O portal de produção não foi modificado.**

**Pendências obrigatórias com Aurassure/UFF:** unidades das médias do endpoint /data; método AQI e ausências; modelo e calibração dos sensores, colocalização e limites; registros de reinício/manutenção do CRIAAD em 29/10; autorização para republicação, limites de consulta e histórico disponível. Somente depois liberar um conjunto de observações revisadas, sem classificá-las como IQAr oficial ou atribuir causalidade à CSN.

---

## Atualização 03/11/2026 — recuperação integral disponível desde 20/10 e auditoria de lacunas

**Backfill real, sem interpolar valores.** Foram feitas 13 consultas históricas de até 24h no endpoint autenticado da Aurassure, por um processo interno do Supabase (`pg_net` + segredo no Vault, sem imprimir segredo). Datas 20–28/10, 31/10, 01–02/11 e início de 03/11. Todas as requisições receberam HTTP 200 com `ok=true`. As respostas JSON originais foram capturadas em snapshots privados com hash; a função privada de normalização eliminou duplicações entre janelas.

**Base confirmada na auditoria:** 3.328 observações únicas com intervalos médios de 15 minutos, entre 20/10/2026 e 03/11/2026 12h30 BRT. Por estação: UFF 1.271 registros (primeira leitura 20/10 15h30), IFRJ 1.265 (20/10 15h30) e CRIAAD 792 (20/10 16h00). PM2,5 e PM10 não têm valores nulos nos registros presentes; isso não significa cobertura contínua.

**Lacunas reais entre registros consecutivos:** criamos a visão privada `aurassure_internal.measurement_gaps`, `security_invoker=true`, sem acesso de `anon` ou `authenticated`. Não inventa amostras nem inclui automaticamente ausência anterior à primeira ou posterior à última leitura.

| Estação | Lacunas entre registros | Intervalos de 15 min sem amostra dentro dessas lacunas | Maior intervalo entre registros |
|---|---:|---:|---|
| UFF | 2 | 62 | 15h15 |
| IFRJ | 2 | 68 | 17h00 |
| CRIAAD | 40 | 539 | 58h45 |

**Achado central CRIAAD:** ficou sem leituras disponíveis entre **27/10/2026 05h45** e **29/10/2026 16h30** (BRT): 234 intervalos de 15 min sem registro entre as pontas. Não há nenhuma medição de 28/10. A primeira leitura da retomada em 29/10 às 16h30 coincide com os valores de NO₂, SO₂ e CO elevados e decrescentes já sinalizados. Essa coincidência é compatível com hipóteses instrumentais, mas não prova reinicialização ou invalida necessariamente episódio ambiental. Exige logs de energia, manutenção, calibração e diagnóstico com a Aurassure/UFF.

**Outras lacunas relevantes CRIAAD:** 21/10 18h00 até 22/10 12h15; 26/10 07h45 até 18h00; 02/11 07h45 até 16h30; 03/11 05h30 até 10h45. Todos os horários em BRT.

**Lacuna simultânea das três estações:** os três sensores têm última amostra antes de uma interrupção em 21/10 às 18h. A UFF retoma em 22/10 às 09h15, o IFRJ às 11h e o CRIAAD às 12h15. Investigar causa comum (plataforma, conectividade, operação ou outra) sem afirmar uma origem.

**Governança:** nenhuma amostra foi liberada para `aurassure_public_measurements`; as séries continuam em revisão técnica, separadas do INEA. Na branch, a consolidação Vercel reduziu arquivos de função a 5 e o CI com testes de roteadores, painel, Playwright e acessibilidade terminou com sucesso. O preview Vercel continua indisponível devido à quota diária HTTP 402 `api-deployments-free-per-day`, não por falha de TypeScript.

**Consulta privada para auditorias futuras:**

```sql
select station_id, last_measured_at at time zone 'America/Sao_Paulo' as anterior_brt, next_measured_at at time zone 'America/Sao_Paulo' as posterior_brt, missing_15min_slots, interval_hours from aurassure_internal.measurement_gaps order by interval_hours desc limit 20;
```

---

## Atualização 03/11/2026, 17h — prévia Vercel validada, proteção de publicação e saúde por estação

**Prévia Vercel funcional:** deployment `dpl_6CYhz1rKbnf4jPZ4jYU8CtuE7BvS`, commit `7694870d6247ffbedea4b4fbfc13551924fde202`, estado `READY`, target preview. A rota `https://territoriosuff-14d98y43c-alexandrevrabandonada-oss-projects.vercel.app/qualidade-ar/uff` retornou HTTP 200 com metadados SEO corretos. Foram consultadas rotas reais INEA: `export-manifest`, `stations`, `summary`, `latest`, `observability`, `analytics/data-gaps`, `analytics/monthly-profile`, `export-catalog`, todas HTTP 200 e JSON. Endpoint desconhecido retornou 404, `api/share/dados` sem parâmetro obrigatório retornou 400. Playwright e testes de acessibilidade do GitHub Actions aprovados. **Não houve promoção a produção**.

**Bloqueio do limite Hobby tratado:** cinco arquivos de função Vercel em `api/` e deployment de prévia concluído. A informação anterior de prévia indisponível por HTTP 402 foi superada pela implantação automática de um preview pronto; um futuro deploy ainda pode estar sujeito à cota diária.

**Captura em 16h54 BRT:** `aurassure_internal.pipeline_health` indica `operational`, 3.373 medições únicas, 35 snapshots de leituras; coleta às 16h45 e normalização às 16h50 concluídas. As últimas medições tinham timestamp 16h15. Seguem três bloqueios QA e **zero dados públicos**.

**Barreira de publicação efetivamente testada:** migração `20261103165300_aurassure_enforce_public_release_provenance.sql` valida staging, estado `qa_status='approved_for_publication'`, ausência de anotação `block_release` aberta, hash SHA-256 correspondente a snapshot original, valores PM2,5 e PM10 sem divergência e documentação formal de unidade, método e revisor. Uma tentativa experimental de inserção de dado real ainda não aprovado foi rejeitada por SQLSTATE 23514. Trigger ativo; 0 dados públicos; `anon` não tem SELECT nas tabelas privadas nem INSERT na tabela curada.

**Visão privada `aurassure_internal.station_health`:** separa estado de cada estação de saúde geral do pipeline. Na consulta próxima de 17h BRT: UFF 93/96 amostras de 15 min nas últimas 24h (96,88%, `receiving`); IFRJ 93/96 (96,88%, `receiving`); CRIAAD 73/96 (76,04%, `coverage_degraded`). É uma métrica de recebimento de dados, **não** atestado de qualidade do ar, de calibração ou de funcionamento metrológico.

**Consulta técnica preparada, NÃO enviada:** `docs/AURASSURE_CONSULTA_METROLOGIA_E_QA_2026-11-03.md`. Solicita: unidade efetiva de `avg` e `value`, relação de `unit` com `default_unit`, método AQI, fichas e calibração dos equipamentos realmente instalados, interrupções simultâneas de 21–22/10, 58h45 de ausência no CRIAAD, além da autorização para publicação e exportação. As páginas públicas da Aurassure apresentam modelos e módulos configuráveis e não comprovam qual modelo foi instalado nos pontos UFF.

**Ainda pendente:** resposta formal técnica e licença de republicação, promoção controlada do deployment após revisão e plano de rollback, além de rotação sincronizada dos segredos que foram expostos anteriormente no chat. Não mesclar o PR ainda.

---

## Atualização 03/11/2026, 17h15 — retirada automática de leituras e histórico de incidentes

**Barreira pós-publicação aplicada de verdade.** A migração `20261103172500_aurassure_retract_public_data_after_qa_or_source_change.sql` institui triggers que **retiram imediatamente da tabela pública** qualquer observação anteriormente aprovada quando (a) uma anotação QA recebe `review_status=open` com `severity=block_release`; (b) a aprovação técnica do staging é retirada; (c) PM2,5 ou PM10 da origem são alterados; (d) a observação original é excluída ou sua chave é alterada. A publicação passa de `published` para `withheld`, com os timestamps de aprovação/publicação esvaziados para impedir reexibição sem nova decisão técnica. O evento é registrado na tabela privada `aurassure_internal.publication_revocations`. A inserção/atualização inicial em estado `published` já estava protegida pela validação de hash, documentação e aprovação de QA.

**Dois testes de integração reais, isolados e revertidos:** foi criada temporariamente uma observação publicada vinculada ao snapshot de uma estação. (1) A inserção de anotação bloqueadora a retirou imediatamente da seleção pública; (2) a alteração do valor original de PM2,5 também provocou sua retirada. Nos dois casos houve registro de revogação. Os testes foram executados dentro de subtransações com rollback confirmado; **zero linhas de teste ou aprovações ficaram no banco**. Verificação final: `public_rows=0` e `revocations_persisted=0`.

**Histórico privado de disponibilidade criado:** migração `20261103174000_aurassure_private_station_health_incident_history.sql` cria `aurassure_internal.station_health_history` (até três snapshots por intervalo de 15 minutos, chave `(observed_bucket,station_id)`) e `aurassure_internal.station_incidents` (ocorrências de `coverage_degraded`, `stale` ou `no_measurements`, com primeira e última observação, fechamento e motivo). A função `aurassure_internal.record_station_health()` captura o estado e acompanha abertura/fechamento de incidentes; repetição na mesma janela é idempotente. O novo `pg_cron` foi registrado como ativo com nome `semear-aurassure-station-health-15min`, horário `7,22,37,52 * * * *` (relógio interno UTC, de forma que há uma checagem dois minutos após a normalização). A **primeira chamada manual** foi bem-sucedida (três snapshots, uma ocorrência aberta do CRIAAD); repetição imediata retornou `rows_written_on_repeat=0`. **Ainda não se comprovou a primeira execução autônoma desse terceiro agendamento**.

**Estado de coleta 17h13 BRT:** status geral `operational`, 3.376 observações deduplicadas, 36 snapshots originais de medições; última captura às 17h00 e última média com horário 16h30. Continuam 3 bloqueios QA e zero observações publicadas. Os três cron jobs aparecem ativos.

**Nova evidência externa, com ressalva:** a página oficial de contato da Aurassure informa `contact@aurassure.com` e suporte técnico `+91 90780 32911` (https://aurassure.com/contact_aurassure/). Sua página explicativa de AQI destaca padrões diferentes por país e faz referência à metodologia indiana (https://aurassure.com/air-quality-index/). Isso **não** prova qual método a API usa nas três estações brasileiras. Preparado, mas **NÃO enviado**, um pedido de esclarecimentos em inglês em `docs/AURASSURE_EMAIL_TECHNICAL_SUPPORT_EN_2026-11-03.md`; existe uma versão em português.

**Critérios de publicação permanecem inalterados:** sem concentrações públicas até confirmação de unidades, modelo/calibração, validação de sensor e autorização de redistribuição. Não classificar AQI do fabricante como IQAr do INEA; não preencher intervalos ausentes por interpolação.
