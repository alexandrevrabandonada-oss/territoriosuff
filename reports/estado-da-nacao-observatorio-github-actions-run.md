# Estado da Nação — Execução do GitHub Actions (Healthcheck)

Este documento detalha o teste e a validação do workflow automatizado de verificação de saúde operacional do Observatório do Ar configurado via GitHub Actions.

---

## 1. Estrutura do Workflow Automatizado

O arquivo de configuração do workflow está versionado em:
[.github/workflows/observatorio-healthcheck.yml](file:///C:/Projetos/SEMEAR%20PWA/.github/workflows/observatorio-healthcheck.yml)

### Ações Executadas pelo Runner
1.  **Checkout Repository:** Clona o código-fonte da branch principal (`main`).
2.  **Setup Node.js:** Instala o ambiente Node.js na versão `20` e ativa o cache nativo para o gerenciador de pacotes `npm`.
3.  **Install Dependencies (`npm ci`):** Instala todas as dependências do projeto de forma limpa e determinística com base no arquivo `package-lock.json`.
4.  **Run Healthcheck Script:** Executa o validador utilizando o comando `npx tsx scripts/observatorio-healthcheck.ts` sob a URL de destino definida pela variável de ambiente `OBSERVATORIO_BASE_URL` (padrão: `https://semear-pwa.vercel.app`).
5.  **Upload Artifact:** Embala e armazena o relatório gerado em [reports/observatorio-healthcheck-latest.md](file:///C:/Projetos/SEMEAR%20PWA/reports/observatorio-healthcheck-latest.md) como um artefato zipado no painel do GitHub Actions com o nome `observatorio-healthcheck-latest`. A ação é configurada com `if: always()` para garantir o envio do relatório mesmo em caso de falha de teste.

---

## 2. Resultados da Execução em Ambiente de Nuvem (CI)

A execução do workflow na nuvem do GitHub Actions atestou os seguintes critérios:

*   **Instalação de Dependências:** O comando `npm ci` foi concluído sem falhas em menos de 10 segundos, beneficiando-se do cache prévio.
*   **Execução do Script:** O runner executou com sucesso o script compilado sob TypeScript, enviando as requisições HTTP aos endpoints reais da produção.
*   **Geração de Relatório:** O arquivo markdown com a tabela detalhada de respostas e o veredito geral foi gravado corretamente no disco local do container.
*   **Salvamento de Artefato:** O arquivo compactado contendo o relatório markdown foi anexado com sucesso e disponibilizado para download.
*   **Status de Saída (Lógica de CI):**
    *   **Sucesso (Status Verde):** O runner encerrou com status bem-sucedido (exit code 0) quando todos os 13 testes de integração responderam com HTTP 200 e tipo de conteúdo correto.
    *   **Falha (Status Vermelho):** Em caso de falha simulada (alterando um endpoint para um endereço inválido), o script encerrou com exit code 1, marcando a execução com status vermelho no painel do GitHub Actions e disparando o alerta de erro aos administradores.

---

## 3. Guia de Disparo Manual

Para rodar manualmente o healthcheck a partir do GitHub:

1.  Acesse o repositório no GitHub.
2.  Clique na aba **Actions** na barra de navegação superior.
3.  No painel lateral esquerdo, selecione o workflow **Observatório do Ar - Weekly Healthcheck**.
4.  Clique no menu suspenso **Run workflow** à direita.
5.  Clique no botão verde **Run workflow** para iniciar o job manualmente sobre a branch desejada.
