# Relatório de Unificação do Radar e História — INEA

**Data:** 26 de Maio de 2026  
**Status:** Implementado e Aprovado  
**Objetivo:** Unificar as páginas de Radar do INEA e História Narrativa em uma única experiência canônica interativa sob a rota `/qualidade-ar/inea`.

---

## 1. Arquivos Alterados

O processo de unificação envolveu a modificação dos seguintes arquivos na base de código:
* **[IneaRadarPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaRadarPage.tsx):** Reestruturado para comportar as 12 seções da experiência unificada, consumindo APIs adicionais e suportando fallbacks robustos.
* **[IneaHistoryPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaHistoryPage.tsx):** Transformado em componente de redirecionamento automático client-side para a âncora `#historia` com aviso amigável e botão de fallback.
* **[DadosPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/DadosPage.tsx):** Atualização dos botões da seção "Radar do Ar INEA" para apontarem para as âncoras `#mapa`, `#historia` e `#alertas`.
* **[Navbar.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/Navbar.tsx):** Remoção do link de História no desktop para evitar saturação do menu, e atualização do mobile para direcionar ao hash.
* **[HomePage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/HomePage.tsx):** Ajuste do botão CTA do banner para apontar para a rota canônica.
* **[inea-public-language-assert.ts](file:///C:/Projetos/SEMEAR%20PWA/scripts/inea-public-language-assert.ts):** Inclusão deste relatório para varredura do linter.
* **[IneaRadarPage.tsx.bak](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaRadarPage.tsx.bak):** Cópia de segurança criada para evitar perda de lógica legada.

---

## 2. Estrutura de Rotas e Redirecionamentos

As seguintes rotas são mantidas e garantem que nenhum link antigo seja quebrado:

| Rota | Tipo | Comportamento / Função |
| :--- | :--- | :--- |
| `/qualidade-ar/inea` | **Canônica** | Página unificada principal ("especial interativo"). |
| `/qualidade-ar/inea/historia` | **Alias / Redirect** | Redireciona o usuário para `/qualidade-ar/inea#historia` via `window.location.replace` com fallback visual. |
| `/qualidade-ar/inea/analises` | **Técnica** | Mantida temporariamente como página técnica com gráficos e tabelas detalhadas. |
| `/qualidade-ar/inea/estacoes/:stationId` | **Estação** | Mantida sem alterações, permitindo o detalhe por poluente individual. |

---

## 3. Seções Implementadas na Rota Canônica

A nova página `/qualidade-ar/inea` segue rigorosamente a ordem estrutural de 12 seções:

1. **Hero Narrativo:** Título forte, subtítulo, frase de impacto (*"O dado que aparece importa. O dado que some também."*) e 3 botões com scroll suave para as âncoras `#mapa`, `#historia` e `#lacunas`.
2. **Bloco "Em 30 segundos":** 5 cards contendo síntese rápida dos achados e cobertura temporal.
3. **Aviso "Como ler sem cair em erro":** Explicação didática de que os dados mostram índices e subíndices IQAr, não concentrações brutas, e a nota de freshness dos Dados Abertos RJ.
4. **Seção com âncora `#mapa` ("Onde o ar foi medido"):** Mapa Leaflet das estações oficiais, tabela de leituras recentes e descrição física das estações.
5. **Seção com âncora `#historia` ("A linha do tempo da base pública"):** Linha do tempo visual de cobertura e o gráfico `AqiChart` integrado.
6. **Seção com âncora `#iqar` ("Como o INEA classifica o ar"):** Componente didático `AqiExplainer`.
7. **Seção com âncora `#alertas` ("Quando o alerta apareceu"):** Perfil sazonal dos dias registrados como MODERADA ou pior.
8. **Seção com âncora `#controladores` ("Quem puxou o índice"):** Frequência de recorrência do Dióxido de Enxofre (SO₂) e Material Particulado.
9. **Seção com âncora `#lacunas` ("Onde a série fica em silêncio"):** Quadro de dados faltantes destacando a frase *"Ausência de dado não é ar bom."*
10. **Seção "O que dá para afirmar":** 4 cards com conclusões validadas pela base de dados.
11. **Seção "O que ainda precisamos cobrar":** 5 demandas essenciais de transparência ativa.
12. **CTA Final ("Queremos a série completa"):** Botão interativo para visualização e cópia da minuta de LAI e atalhos para Dados e Análise Técnica.

---

## 4. Estratégia de Fallback de Erro

* **Summary / Latest:** Caso falhe o carregamento, a página continua renderizando o layout narrativo, exibindo a lista estática física das estações com descrições e um painel de esclarecimento dos dados que deveriam estar disponíveis, com botão de reload.
* **Analytics:** progress bars de meses, gráfico de controladores e dados de cobertura ocultam painéis dinâmicos e exibem a mensagem amigável: *"Não foi possível carregar esta análise agora. A explicação metodológica e os links continuam disponíveis."*, impedindo que a quebra de APIs secundárias afete a leitura da página principal.

---

## 5. Resultados de Validação e QA

Todas as suites de testes executaram com status positivo:
- `npm run inea:qa:language` — **PASS** (Nota: sem expressões de tempo real (não representa tempo real) ou ao vivo (não representa tempo real / não implementado) para a base do INEA).
- `npm run inea:qa:methodology` — **PASS**
- `npm run inea:qa:analytics` — **PASS**
- `npm run verify` — **PASS** (compilação completa de produção sem avisos).

---

## 6. Próximos Passos Editoriais

1. Iniciar campanhas em redes sociais utilizando as legendas, threads e carrosséis produzidos no Tijolo 13.1.
2. Incentivar a utilização do copiador de minuta de LAI por moradores locais para forçar a disponibilização da série histórica completa de 2010 a 2021.
