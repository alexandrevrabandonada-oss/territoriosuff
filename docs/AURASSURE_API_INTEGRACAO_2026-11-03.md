# Integração privada Aurassure/UFF — SEMEAR SF

**Escopo:** infraestrutura de captura no Supabase `semearsf` (`ojedgswernwbzrcfomqq`), para as três estações Aurassure em Volta Redonda. Não altera dados do INEA e **não é painel público em tempo real**.

## Contrato do fornecedor

- Base: https://app.aurassure.com/-/api/iot-platform/v1.1.0/clients/24302/applications/16/things/
- Autenticação: cabeçalhos Access-Id e Access-Key, **apenas no servidor**.
- GET things/list lista as estações. Identificadores documentados: 46560, 46561, 46562. Os nomes reais devem ser extraídos da resposta; não deduzir a associação dos IDs com UFF/IFRJ/CRIAAD.
- POST things/data consulta leituras raw (periodo 0) ou médias (900, 3600, 86400 segundos).
- Parâmetros permitidos: pm1.0, pm2.5, pm10, no2, so2, co, o3, co2, temp, humid, tvoc; aqi somente no modo agregado.
- Datas numéricas Unix UTC. Em 2026, Volta Redonda está em UTC-3; converta a data local antes da chamada.

## Instalação segura no Supabase

1. Aplicar a migração `20261103143450_aurassure_private_capture.sql` (já aplicada ao projeto remoto em 03/11/2026).
2. Implantar a Edge Function privada `aurassure-bridge` com `verify_jwt=false` (implantação inicial ativa em 03/11/2026). A autenticação do próprio handler é OBRIGATÓRIA.
3. Abrir Supabase Dashboard → Projeto semearsf → Edge Functions → Secrets e configurar **sem colar no repositório**:
   - `AURASSURE_ACCESS_ID`: valor de Access-Id da coleção Postman privada;
   - `AURASSURE_ACCESS_KEY`: valor de Access-Key da coleção Postman privada;
   - `AURASSURE_BRIDGE_TOKEN`: nova senha de operação aleatória de pelo menos 32 caracteres; NÃO reutilizar a chave do fornecedor.
4. Nunca usar prefixo `VITE_`, scripts de navegador, logs públicos ou URLs de query string para esses valores. O código-fonte público não contém segredos.

## Testar a listagem (somente operador)

Rota de captura: `POST https://ojedgswernwbzrcfomqq.supabase.co/functions/v1/aurassure-bridge`.
Header: `Authorization: Bearer <AURASSURE_BRIDGE_TOKEN>`, com `Content-Type: application/json`.
Corpo JSON: `{ "operation": "stations" }`.
Somente após credenciais válidas, rede funcional e gravação com sucesso será devolvido `ok:true`, `snapshot_id`, `sha256` e `provider_response` (apenas para operador).

## Capturar médias de 15 minutos

Corpo JSON ilustrativo:

```json
{
  "operation": "readings",
  "data_type": "aggregate",
  "aggregation_period": 900,
  "things": [46560, 46561, 46562],
  "from_time": 1792638000,
  "upto_time": 1792724400
}
```

Janela máxima por chamada: 24 horas. Parâmetros e estações são restritos a listas permitidas; não há host controlado pelo usuário. Toda resposta JSON é armazenada com corpo textual original, hash SHA-256, momento da captura e origem declarada em tabela privada.

## Garantias e limites

- A tabela privada tem RLS ativo, sem privilégios de leitura para anon e authenticated.
- Os dados ainda não estão validados, publicados, classificados por IQAr brasileiro, convertidos em séries nem ligados ao painel público.
- Antes do dashboard, verificar resposta real, nomes dos pontos, timestamps, unidades, cobertura, calibração, versões instrumentais e algoritmo AQI.
- Não mesclar dados Aurassure com `air_measurements` do INEA; produzir camada curada e pública separada, com proveniência verificável.
- O último deploy do portal PWA no Vercel estava bloqueado pelo limite de 12 serverless functions do plano; esta Edge Function não aumenta a contagem, mas a publicação do frontend ainda requer resolver o bloqueio de deploy.

## Teste local

`node --experimental-strip-types scripts/aurassure-bridge-contract-test.mjs` — 10 verificações de contrato sem credenciais nem chamadas externas.
