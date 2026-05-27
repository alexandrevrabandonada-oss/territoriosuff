# Relatório de Homologação e Publicação Final — Radar INEA Unificado

**Data:** 26 de Maio de 2026  
**Status:** Aprovado e Publicado  
**Escopo:** Homologação final, testes de redirecionamento, resiliência do dev server local, correção de rotas e publicação da rota unificada `/qualidade-ar/inea`.

---

## 1. Homologação Visual e Responsividade

Realizamos testes de renderização visual e responsividade emulando visualizações tanto para desktop quanto para dispositivos móveis:

* **Desktop (1280x800):**
  * O Hero Narrativo carrega de forma limpa, com os três botões principais de atalho ("Ver no Mapa", "Ver Linha do Tempo", "Ver Lacunas") perfeitamente acessíveis na primeira dobra, sem rolagem excessiva.
  * O bloco **"Em 30 segundos"** exibe de forma harmoniosa os 5 cards com as estatísticas consolidadas da base histórica.
  * O mapa interativo Leaflet renderiza com as 4 estações oficiais, e o gráfico de série histórica uPlot exibe o comportamento sazonal do ar de forma rápida e responsiva.
  * O modal interativo de cópia da minuta da LAI funciona de forma isolada e limpa.
* **Celular (iPhone XS - 375x812, touch):**
  * A navegação em colunas únicas do bloco "Em 30 segundos" empilha perfeitamente.
  * O mapa do Leaflet e o gráfico de série histórica uPlot redimensionam-se corretamente de acordo com o viewport, mantendo as interações por toque totalmente fluidas e sem quebras de layout.

---

## 2. Testes de Âncoras e Navegação Interna

Validamos o comportamento de rolagem automática em todas as âncoras internas da página unificada (deep-linking), obtendo sucesso completo:
* `#mapa`: Direciona o scroll para a seção *"Onde o ar foi medido"* (mapa Leaflet e tabela de leituras).
* `#historia`: Direciona o scroll para *"A linha do tempo da base pública"* (gráfico uPlot e timeline).
* `#iqar`: Direciona o scroll para *"Como o INEA classifica o ar"* (tabela explicativa do IQAr).
* `#alertas`: Direciona o scroll para *"Quando o alerta apareceu"* (sazonalidade de dias MODERADA ou pior).
* `#controladores`: Direciona o scroll para *"Quem puxou o índice"* (poluentes controladores).
* `#lacunas`: Direciona o scroll para *"Onde a série fica em silêncio"* (estatísticas de dados faltantes).

---

## 3. Teste de Redirecionamento da Rota Antiga

Testamos o acesso à rota legada `/qualidade-ar/inea/historia`. O componente [IneaHistoryPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaHistoryPage.tsx) intercepta a requisição e executa um redirecionamento client-side via `window.location.replace` para `/qualidade-ar/inea#historia`.
* **Resultado:** O usuário é levado diretamente à seção de histórico na página unificada de forma transparente, com fallback visual adequado em caso de carregamento lento.

---

## 4. Auditoria de Links de Integração do Portal

Mapeamos e testamos a origem de todos os links que direcionam para o painel INEA no portal:
* **Página de Dados (`/dados`):**
  * O botão do card principal aponta para `/qualidade-ar/inea`.
  * Os links secundários de atalhos rápidos apontam perfeitamente para as âncoras `#mapa`, `#historia` e `#alertas`.
* **Home Page (`/`):**
  * O banner de lançamento editorial aponta para `/qualidade-ar/inea`.
* **Navbar (Menu de Navegação):**
  * O link principal desktop e o link mobile apontam corretamente para a rota unificada.

---

## 5. Nomes Oficiais das Estações e Vocabulário de Confiança

Confirmamos que todos os textos e componentes públicos utilizam a nomenclatura correta das estações e respeitam a cartilha metodológica:
1. **Estações Oficiais:**
   * `VR-Belmonte`
   * `VR-Retiro`
   * `VR-Santa Cecília`
   * `VR-Nossa Sra. das Graças (Van)`
2. **Vocabulário Restrito:**
   * Nenhum local exibe ou induz a "tempo real", "ao vivo", "leitura instantânea" ou "monitoramento minuto a minuto". O aviso de freshness é exibido na tela principal informando a natureza batch em lote da base do INEA/Dados Abertos RJ.
   * Não são exibidos dados de concentração bruta, e sim índices e subíndices IQAr.
   * Não há afirmações de "prova de crime" no material de divulgação nem na tela.
   * A ausência de dados é explicitada com o lema: *"Ausência de dado não é ar bom"*.

---

## 6. Ajuste do Servidor Local e Proxies Vercel (`vercel.json`)

Durante os testes locais com o Vercel Dev server (`npx vercel dev`), detectamos que a regra catch-all de SPA interceptava as requisições de desenvolvimento do Vite (como `@vite/client` e scripts em `/src/`), forçando-as a retornar o arquivo `index.html` e gerando erro de parse JS (`SyntaxError`).
* **Correção aplicada:** Atualizamos o arquivo [vercel.json](file:///C:/Projetos/SEMEAR%20PWA/vercel.json) para restringir o redirecionamento catch-all do SPA. Agora ele ignora rotas internas e de desenvolvimento:
  ```json
  {
    "source": "/((?!api/|@|src/|node_modules/|assets/|favicon\\.ico|manifest\\.webmanifest|registerSW\\.js).*)",
    "destination": "/index.html"
  }
  ```
* **Resultado:** O Vercel Dev local funciona perfeitamente, resolvendo de forma nativa a comunicação com as APIs e a renderização do frontend no mesmo host/porta.

---

## 7. Resultados dos Testes de QA e Compilação

Todos os scripts de asserção automáticos e builds de produção rodaram de forma limpa:
* `npm run inea:qa:language` ➔ **PASS**
* `npm run inea:qa:methodology` ➔ **PASS**
* `npm run inea:qa:analytics` ➔ **PASS**
* `npm run verify` (lint + typecheck + build) ➔ **PASS** (zero erros/warnings).
