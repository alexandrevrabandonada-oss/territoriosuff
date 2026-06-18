# Fluxo de Banco de Dados (DB Workflow) - SEMEAR PWA

Este projeto utiliza o Supabase CLI para gerenciar migracoes de banco de dados. Para garantir a integridade entre ambientes local e remoto, siga estas diretrizes.

## Regra principal

Use sempre:
```bash
npm run db:push
```

Esse comando agora e seguro por padrao (`db-push-safe`):
1. tenta reparar automaticamente o historico remoto legado `20260305`
2. executa `supabase db push --include-all` via CLI fixada do projeto
3. imprime um resumo do fluxo
4. falha apenas se o `db push` falhar de fato

Nao use `npx supabase db push` diretamente no dia a dia do projeto.

## Nomenclatura de Migracoes

Todas as novas migracoes devem seguir o padrao de 14 digitos (timestamp) da CLI:
`YYYYMMDDHHMMSS_descricao_da_mudanca.sql`

Exemplo: `20260308000001_relatorio_gastos.sql`

> [!IMPORTANT]
> Nao renomeie migracoes antigas: se uma migracao ja foi aplicada em producao (remoto), renomea-la localmente causara conflitos de historico. O `Migration Doctor` avisara sobre nomes fora do padrao, mas isso deve ser tratado apenas para novas migracoes.

## Ferramenta de Diagnostico (Doctor)

Se voce encontrar erros de "diverging history" ou "out of sync", use:
```bash
npm run db:doctor
```

O Doctor realiza:
1. Status check: verifica se o DB local esta rodando e se a CLI esta vinculada.
2. CLI scan: tenta listar migracoes via Supabase CLI.
3. FS fallback: se o CLI falhar, ele analisa a pasta `supabase/migrations` diretamente para garantir que os arquivos estao presentes.
4. Naming lint: alerta sobre arquivos que nao seguem o padrao de 14 digitos.

## Modo Remote-first

Se voce optou por nao rodar o Supabase localmente, utilize os comandos remotos:

1. Suba migracoes diretamente para o projeto vinculado:
   ```bash
   npm run db:push
   ```
2. Atualize os tipos do banco (TypeScript) diretamente do servidor:
   ```bash
   npm run db:types:remote
   ```
   Nota: requer `SUPABASE_PROJECT_REF` no `.env` ou `.env.local`.

   Se o token vinculado nao tiver privilegio para gerar tipos remotamente, use:
   ```bash
   npm run db:types
   ```
   Esse comando tenta remoto primeiro e cai para `db:types:local` quando o Supabase local estiver disponivel.

3. Faça deploy das Edge Functions com a mesma CLI fixada do projeto:
   ```bash
   npm run fn:deploy
   ```

## Portabilidade

Os comandos abaixo agora sao portaveis entre Windows e shell Unix:

- `npm run db:push`
- `npm run db:status`
- `npm run db:doctor`
- `npm run db:sync`
- `npm run db:types:local`
- `npm run db:types:remote`
- `npm run fn:deploy`

## Fluxo recomendado

1. Criar a migration em `supabase/migrations/`
2. Rodar `npm run db:push`
3. Rodar `npm run db:doctor`
4. Rodar `npm run done`

---
Nota: a integridade do banco e critica para o funcionamento do PWA e das Edge Functions.
