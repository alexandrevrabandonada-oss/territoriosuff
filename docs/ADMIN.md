# Painel Administrativo SEMEAR

Este documento descreve o funcionamento e a gestão do Painel Administrativo do portal SEMEAR.

## 1. Acesso
O painel está disponível em: `https://[dominio]/admin`

Para acessar, o usuário deve:
1. Estar autenticado via Supabase Auth.
2. Ter seu UUID presente na tabela `public.admin_users`.

## 2. Como adicionar um Administrador
Atualmente, a adição de administradores é feita via banco de dados para garantir a segurança máxima.

### Passo a Passo:
1. Peça para o novo administrador se cadastrar ou crie uma conta para ele no Supabase Auth.
2. Obtenha o `User ID` (UUID) desse usuário no painel do Supabase.
3. Execute o seguinte SQL no Editor SQL do Supabase:

```sql
insert into public.admin_users (id, email)
values ('UUID-DO-USUARIO', 'email@exemplo.com');
```

## 3. Estrutura do Painel
- **Dashboard:** Visão geral e métricas rápidas.
- **Acervo:** Gestão de documentos, fotos e registros históricos.
- **Uploads:** Gerenciamento de arquivos e mídias.
- **Relatórios:** Publicação de relatórios de transparência e monitoramento.
- **Blog:** Edição e publicação de notícias.
- **Agenda:** Gestão de eventos e inscrições.

## 4. Segurança
- **Frontend:** Rotas protegidas pelo componente `AdminGuard`.
- **Backend:** Verificação de privilégios via função `is_admin()` e políticas de RLS.
- **API:** Operações sensíveis exigem que o usuário esteja na lista de admins.

---
*Equipe SEMEAR — 2026*
