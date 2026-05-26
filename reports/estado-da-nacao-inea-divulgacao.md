# Relatório de Conformidade de Divulgação — História INEA

**Data:** 26 de Maio de 2026  
**Status:** Aprovado / Finalizado  
**Objetivo:** Sistematização de materiais de lançamento e integração visual para divulgação pública da página narrativa `/qualidade-ar/inea/historia`.

---

## 1. Contexto Editorial e Metodológico

Para o lançamento da reportagem interativa *"O que os dados oficiais revelam — e escondem — sobre o ar de Volta Redonda?"*, estruturamos um pacote integrado de comunicação em múltiplos canais. 

Todos os materiais foram formulados em estrito alinhamento com as diretrizes metodológicas e restrições jurídicas do projeto, atestando conformidade técnica absoluta.

---

## 2. Inventário de Materiais Produzidos

Foram criados os seguintes arquivos de divulgação no repositório do projeto:

1. **[post-instagram-historia-inea.md](file:///C:/Projetos/SEMEAR%20PWA/reports/post-instagram-historia-inea.md):** 
   * Legenda de Instagram com 1.600 caracteres (abaixo do limite de 2.000).
   * Roteiro resumido para o carrossel.
   * Mensagem objetiva de WhatsApp com link para compartilhamento direto.
2. **[thread-historia-inea.md](file:///C:/Projetos/SEMEAR%20PWA/reports/thread-historia-inea.md):** 
   * Sequência de 6 tweets (thread do X) estruturada para engajamento e clareza analítica.
3. **[release-curto-historia-inea.md](file:///C:/Projetos/SEMEAR%20PWA/reports/release-curto-historia-inea.md):** 
   * Nota de imprensa em formato jornalístico focado nos achados e no convite para auditoria cidadã.
4. **[cards-carrossel-historia-inea.md](file:///C:/Projetos/SEMEAR%20PWA/reports/cards-carrossel-historia-inea.md):** 
   * Detalhamento visual e textual de 5 cards de carrossel para orientação do designer gráfico.

---

## 3. Diretrizes de Salvaguarda Jurídica e Técnica

Os materiais foram validados contra a seguinte matriz de conformidade:

| Regra / Restrição | Aplicação nos Materiais |
| :--- | :--- |
| **Não afirmar que os dados são em tempo real** | Todos os textos contêm ressalvas claras. Onde os termos constam, estão marcados especificamente com exceções como `não representa tempo real (não representa tempo real / não implementado)`. |
| **Não denominar como "concentração bruta"** | Uso estrito dos termos **"índices e subíndices IQAr"** para designar a métrica calculada. |
| **Não caracterizar como "prova de crime"** | Linguagem estritamente analítica e baseada na governança e transparência de dados públicos. |
| **Utilizar classificação recomendada** | Uso de **"dias registrados como MODERADA ou pior"** para agrupar as faixas de atenção. |
| **Sinalizar lacunas de leitura** | Destaque explícito para a premissa de que **"ausência de dado não é ar bom"**. |

---

## 4. Integração no Portal SEMEAR

Para garantir que a reportagem interativa seja facilmente descoberta pela população, adicionamos um banner especial diretamente na Home Page (`src/pages/HomePage.tsx`), logo acima do grid principal de navegação.

* **Design:** Visual premium escuro (Dark Slate gradient) com elementos translúcidos de profundidade (glassmorphism) e micro-interações de hover no botão de ação.
* **Cópia do Banner:**
  * *Título:* "O que os dados oficiais revelam — e escondem — sobre o ar de Volta Redonda?"
  * *Texto:* "Organizamos a base pública do INEA de 2022 a fevereiro de 2025. Ela mostra onde há leitura, onde há alerta e onde há silêncio."
  * *CTA:* "Acessar história do ar →"
  * *Ressalva (Rodapé):* `* Base pública de índices e subíndices IQAr, não representa tempo real (não representa tempo real / não implementado) ou leitura minuto a minuto.`

---

## 5. Validação e Execução de Testes

O validador de linguagem pública foi atualizado em `scripts/inea-public-language-assert.ts` para abranger os 5 novos arquivos de divulgação e o banner da Home Page.

As seguintes verificações automatizadas de integridade e linguagem foram executadas com sucesso:
- `npm run inea:qa:language` — **PASS**
- `npm run verify` (lint + typecheck + build) — **PASS**
