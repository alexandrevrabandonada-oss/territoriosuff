# Relatório de Conformidade de Divulgação Final — História INEA

**Data:** 26 de Maio de 2026  
**Status:** Aprovado / Finalizado  
**Objetivo:** Consolidação final e revisão editorial de materiais de lançamento e integração visual para divulgação pública da página narrativa `/qualidade-ar/inea/historia`.

---

## 1. Contexto de Revisão Editorial (Tijolo 13.1)

Em conformidade com a revisão editorial final do pacote História INEA, atualizamos todos os materiais de comunicação produzidos e o banner promocional na Home Page para atender aos seguintes requisitos fundamentais:
1. **Padronização dos Nomes das Estações:** Substituição de nomes genéricos/antigos pelos nomes oficiais da rede de Volta Redonda (`VR-Belmonte`, `VR-Retiro`, `VR-Santa Cecília`, `VR-Nossa Sra. das Graças (Van)`).
2. **Substituição da Expressão Interna:** Remoção do termo técnico `não representa tempo real / não implementado` e inserção de expressões acessíveis como `não representa leitura instantânea do ar` ou `não é monitoramento minuto a minuto`.
3. **Clarificação da Origem dos Dados:** Substituição do termo `lote diário` por `dados históricos disponibilizados em lote na base pública do INEA/Dados Abertos RJ`.
4. **Cinco Hashtags Oficiais no Instagram:** Padronização exata no final da legenda: `#SEMEAR #VoltaRedonda #QualidadeDoAr #DadosAbertos #TransparenciaAmbiental`.
5. **Salvaguardas Metodológicas e Jurídicas:** Manutenção de todas as regras anteriores (não falar em concentração bruta, não dizer prova de crime, usar índices e subíndices IQAr, utilizar "dias registrados como MODERADA ou pior" e manter a premissa de que "ausência de dado não é ar bom").

---

## 2. Inventário de Materiais Atualizados

Os seguintes arquivos de divulgação foram atualizados no repositório:

1. **[post-instagram-historia-inea.md](file:///C:/Projetos/SEMEAR%20PWA/reports/post-instagram-historia-inea.md):** 
   * Legenda de Instagram corrigida com os nomes oficiais das estações, as 5 hashtags finais e a linguagem de periodicidade atualizada.
   * Roteiro de carrossel de 5 cards alinhado.
   * Chamada de WhatsApp com as ressalvas corretas.
2. **[thread-historia-inea.md](file:///C:/Projetos/SEMEAR%20PWA/reports/thread-historia-inea.md):** 
   * Sequência de 6 tweets com nomes oficiais das estações e desclaimers atualizados.
3. **[release-curto-historia-inea.md](file:///C:/Projetos/SEMEAR%20PWA/reports/release-curto-historia-inea.md):** 
   * Press release jornalístico contendo a listagem formal das quatro estações e as novas expressões de ressalva ambiental.
4. **[cards-carrossel-historia-inea.md](file:///C:/Projetos/SEMEAR%20PWA/reports/cards-carrossel-historia-inea.md):** 
   * Roteiro visual refinado para o design de carrossel.

---

## 3. Validação e Integração do Banner da Home

O banner de destaque inserido na Home Page (`src/pages/HomePage.tsx`) foi revisado para adequação de texto:

* **Texto Corrigido:**
  * *Título:* "O que os dados oficiais revelam — e escondem — sobre o ar de Volta Redonda?"
  * *Texto:* "Organizamos a base pública do INEA de 2022 a fevereiro de 2025. Ela mostra onde há leitura, onde há alerta e onde há silêncio."
  * *Ressalva:* `* Base pública de índices e subíndices IQAr. Não representa leitura instantânea do ar e não é monitoramento minuto a minuto.`

---

## 4. Testes e Compilação

O script de validação de linguagem de qualidade do ar foi atualizado para referenciar este relatório final. A execução de toda a suíte de asserções foi concluída com status positivo:
- `npm run inea:qa:language` — **PASS**
- `npm run verify` — **PASS**
