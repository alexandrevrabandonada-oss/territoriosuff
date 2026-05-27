# Relatório de Exportabilidade e Blindagem de Evidências Físicas

**Data:** 27 de Maio de 2026  
**Status:** Implementado  
**Objetivo:** Habilitar a exportação de dados e a blindagem final do painel de evidências de qualidade do ar em Volta Redonda, permitindo download em formato aberto (CSV) e cópia de resumos para pedidos de LAI, além de assegurar conformidade vocabular.

---

## 1. Exportabilidade Cidadã (CSV e Clipboard)

Para garantir que os dados históricos garimpados possam ser livremente utilizados por cidadãos, jornalistas e juristas em denúncias, petições, releases de imprensa e relatórios de monitoramento, implementamos dois recursos de exportabilidade no componente [HistoricalRawEvidenceBox.tsx](file:///C:/Projetos/SEMEAR%2520PWA/src/components/air/HistoricalRawEvidenceBox.tsx):

### A. Botão "Baixar evidências em CSV"
*   **Ação:** Gera dinamicamente um arquivo CSV contendo os registros atualmente filtrados (ou a base completa, caso nenhum filtro esteja ativo) diretamente no navegador, codificando os dados em UTF-8 com BOM (`\uFEFF`) para que caracteres especiais (como acentos e símbolos de $\mu g/m^3$) sejam abertos corretamente no Excel e outras planilhas.
*   **Estrutura de Colunas:** As colunas exportadas seguem o padrão técnico definido no schema da base: *ID, Titulo da Fonte, Tipo de Fonte, URL, Estacao, Poluente, Metrica, Ano, Inicio do Periodo, Fim do Periodo, Valor, Unidade, Representatividade, Metodo de Extracao, Confianca, Notas*.
*   **Arquivo Físico:** Como contraparte técnica de reprodutibilidade, criamos também o arquivo [inea-evidencias-fisicas.csv](file:///C:/Projetos/SEMEAR%2520PWA/reports/inea-evidencias-fisicas.csv) contendo a totalidade da base histórica semente.

### B. Botão "Copiar resumo para LAI"
*   **Ação:** Compila um texto descritivo e estruturado a partir da tabela ativa e copia-o para a área de transferência do usuário.
*   **Objetivo:** Fornecer ao cidadão uma justificativa técnica e fática pré-formatada para fundamentar o seu pedido de Acesso à Informação (e-SIC), provando quais dados, fontes e referências comprovam que medições ocorreram, a fim de contrapor eventuais negativas de órgãos públicos.
*   **Formato do Texto Copiado:**
    ```text
    Resumo de Evidências de Medições Físicas em Volta Redonda (INEA):
    - [Estudo/Relatório] (Ano/Período): Medição de [Poluente] ([Métrica]) com valor [Valor] [Unidade] na estação [Estações].
    
    Solicito o fornecimento dos microdados físicos originais completos que subsidiaram estes registros.
    ```

---

## 2. Blindagem Vocabular e Alinhamento Legal

Seguindo as diretrizes jurídicas e metodológicas do Projeto SEMEAR, revisamos os documentos e códigos para expurgar expressões inadequadas. 

A expressão técnica interna:
`"concentrações físicas horárias e diárias brutas existem"`

Foi integralmente substituída nos relatórios e nos metadados do frontend pela redação de segurança:
`"há evidência pública forte de que medições físicas foram realizadas, agregadas e utilizadas"`

### Arquivos Revisados:
1.  **[estado-da-nacao-inea-dados-brutos-publicos.md](file:///C:/Projetos/SEMEAR%2520PWA/reports/estado-da-nacao-inea-dados-brutos-publicos.md):** Linha 11 atualizada para usar a nova redação legal e evitar alegações de posse peremptória, focando em evidências documentais públicas de monitoramento pretérito.
2.  **[inea-fontes-dados-brutos-publicos.md](file:///C:/Projetos/SEMEAR%2520PWA/reports/inea-fontes-dados-brutos-publicos.md):** Linha 3 atualizada de "provam que as medições físicas brutas existem" para "constituem evidência pública forte de que medições físicas foram realizadas, agregadas e utilizadas".

---

## 3. Verificação de Integridade e Linguagem

*   **Validador de Idioma:** Adicionamos este relatório ao rastreador em [inea-public-language-assert.ts](file:///C:/Projetos/SEMEAR%2520PWA/scripts/inea-public-language-assert.ts) para garantir que termos restritos a dados dinâmicos minuto a minuto (como tempo real - não representa tempo real / ao vivo - não representa tempo real / não implementado) estejam ausentes do material público.
*   **Execução dos Testes:**
    *   `npm run inea:qa:language` ➔ **PASS** (Zero violações de vocabulário).
    *   `npm run verify` ➔ **PASS** (Lint, tipagem TypeScript e compilação de produção da Vite limpos e com 100% de sucesso).
