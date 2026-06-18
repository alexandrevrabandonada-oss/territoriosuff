# Auditoria Técnica do Módulo Radar INEA

Data de referência: 2026-06-16

## 1. Fragilidades já tratadas

- Cobertura baseada apenas em primeiro/último registro observado.
  Agora a cobertura usa janela esperada por estação, com `operation_start_date`, `operation_end_date`, `operation_window_source` e marcação explícita de inferência.

- Truncamento silencioso da série histórica.
  O endpoint de séries agora devolve `total`, `limit` e `truncated`, e a UI avisa quando a leitura está parcial.

- Hero e sumário com números editoriais fixos.
  O radar passou a derivar contagens, período e saúde analítica de dados reais.

- Falhas parciais invisíveis.
  O carregamento principal usa `Promise.allSettled` e informa quais blocos falharam.

- Divergência entre regras em Node e SQL.
  Resumo, frescor, cobertura, ranking, perfil mensal, dias degradados, poluente controlador e classificação diária foram centralizados em RPCs.

- Endpoint `/latest` com padrão N+1.
  O snapshot mais recente por estação agora vem de uma RPC agregada.

- Catálogo estático paralelo de estações no frontend.
  O modo `Estações` passou a renderizar apenas estações reais da base/API.

- Camada HTTP ambígua.
  Endpoints públicos agora usam `405`, `Allow`, `Cache-Control` e validação básica de filtros.

- Catálogo público sem contrato consistente para consumo externo.
  O catálogo agora publica `url` utilizável pelo frontend e por consumidores externos, além de expor recortes com metadados territoriais e operacionais básicos.

- Ausência de endpoint dedicado para provenance de estação.
  O radar agora publica `/api/air/inea/stations-metadata` com janela operacional, origem da janela e contexto metodológico mínimo por estação.

- Metadados públicos de estação dependentes de leitura direta da tabela.
  As rotas públicas agora usam a RPC `get_inea_public_stations()`, reduzindo acoplamento HTTP com `air_stations` e alinhando melhor o contrato público.

- Ausência de testes de contrato para endpoints públicos.
  O pipeline `inea:qa` agora inclui um assert dedicado para `summary`, `latest`, `observability`, `stations`, `stations-metadata`, `export-manifest` e `export-catalog`, incluindo guarda `405` para método inválido.

## 2. Fragilidades remanescentes

- Dívida legada no histórico de migrations do Supabase.
  O bloco INEA já está aplicado e validado, mas a migration antiga `20260305_170000_reports.sql` ainda produz ruído em `supabase migration list --linked` por usar um prefixo de versão de 8 dígitos. O risco atual é operacional, não funcional.

- `timeseries` ainda consulta `air_measurements` diretamente.
  Isso é aceitável para o estado atual, mas continua fora da camada SQL consolidada e pode virar gargalo conforme crescerem filtros, estação e volume histórico.

- `/stations` e derivados ainda dependem de rollout da nova RPC.
  O acoplamento direto com `air_stations` foi removido do código HTTP, e a RPC já está aplicada no remoto principal, mas qualquer novo ambiente ainda depende desse rollout para herdar a proteção.

- Ausência de paginação real para séries longas.
  Havia apenas `limit`, sem paginação pública segura. Isso começou a ser tratado com `offset`, exportação CSV e manifesto da API, mas ainda falta streaming/particionamento para volumes muito grandes.

- Falta de observabilidade explícita do pipeline.
  O portal já mostra frescor, mas ainda não expõe latência de ingestão, última falha, volume ingerido por rodada e regressões de cobertura como KPI público.

- Metadados operacionais ainda incompletos para futuras estações.
  O núcleo principal de Volta Redonda ganhou lastro melhor, mas qualquer nova estação sem `operation_start_date` volta a depender de inferência.

- Estação meteorológica ainda pede validação editorial final.
  `Ilha das Águas Cruas` tem boa presença nos artefatos locais, mas menos lastro documental explícito do que Belmonte, Retiro e Santa Cecília.

## 3. Vulnerabilidades conceituais

- Ausência de dado pode voltar a ser mal interpretada por consumidores externos.
  Mesmo com avisos na UI, exports, prints e leituras de terceiros ainda podem comparar cobertura baixa como “ar melhor”.

- Mistura entre dado medido e dado inferido.
  A inferência está mais controlada, mas continua existindo enquanto nem toda janela operacional estiver documentada na base.

- Risco de regressão metodológica futura.
  Se alguém voltar a implementar regra analítica em Node em vez de RPC, o módulo pode se fragmentar novamente.

## 4. Melhorias prioritárias para nível de referência mundial

1. Criar um contrato público de metadados de estação.
   Incluir tipo de estação, data de instalação, regime operacional, fonte de validação, versão metodológica e histórico de mudanças.

2. Publicar um painel de observabilidade do dado.
   Expor atraso de ingestão, integridade por estação, cobertura por período, lacunas recentes e falhas de pipeline.

3. Implementar séries históricas com paginação e recortes reprodutíveis.
   O módulo agora já oferece `offset` em `/timeseries`, exportação CSV pública em `/export`, manifesto em `/export-manifest`, catálogo em `/export-catalog` e metadados públicos de estação em `/stations-metadata`, mas ainda precisa evoluir para exportação integral sem teto fixo por resposta.

4. Versionar metodologia pública.
   Toda mudança de regra de QA/QC, classificação ou cobertura deveria ter versão, data efetiva e changelog público.

5. Expandir testes de contrato para RPCs e respostas públicas.
   O módulo já ganhou assert de contrato para endpoints públicos principais; o próximo passo é cobrir também consistência cruzada mais profunda entre `/classification-days`, `/analytics/*` e RPCs SQL subjacentes.

6. Expor provenance por indicador.
   Cada card, tabela ou métrica crítica deveria informar qual RPC, janela e fonte operacional a sustentam.

## 5. Conclusão

O módulo saiu de um estado frágil, com lógica espalhada e partes editoriais fixas, para uma arquitetura bem mais auditável e centrada em SQL. O principal risco agora já não é mais “erro silencioso de tela”, e sim disciplina de rollout e completude dos metadados operacionais no banco.

Na frente de transparência ativa, o radar já passou a expor:
- paginação pública da série histórica via `offset`
- exportação CSV bruta por filtro e janela
- manifesto legível por máquina com colunas, filtros, limites e header de truncamento
- catálogo público de partições por ano e por estação para orientar auditorias reprodutíveis
- contrato público de metadados operacionais e territoriais por estação

O próximo salto de maturidade é substituir tetos fixos de resposta por streaming ou partições oficiais de download.
