# Estado da Nação — Acabamento Editorial e Visual da História INEA

**Data do Relatório:** 2026-05-26  
**Status da Implementação:** Concluído e Auditado  

Este relatório documenta as melhorias visuais, de design e editoriais aplicadas à página narrativa em `/qualidade-ar/inea/historia` (Tijolo 12). O objetivo foi transformar um relatório técnico em uma experiência de reportagem interativa para o público comum.

---

## 1. Melhorias Editoriais e de Conteúdo

### 1.1. Novo Hero e Frase de Impacto
- **Título**: *"O que os dados oficiais revelam — e escondem — sobre o ar de Volta Redonda?"*
- **Subtítulo**: *"De 2022 a fevereiro de 2025, organizamos a base pública do INEA para mostrar onde há leitura, onde há alerta e onde há silêncio."*
- **Frase de Impacto**: Adicionado destaque em bloco (`blockquote`) com borda colorida e gradiente:  
  > *"O dado que aparece importa. O dado que some também."*

### 1.2. Painel "Em 30 segundos"
Instalado logo abaixo do Hero, este bloco resume os 4 pontos fundamentais em cartões sintéticos de design limpo:
1. **4 estações oficiais em Volta Redonda**: Mapeamento da rede fixa e móvel.
2. **Dados públicos de 2022 a fevereiro de 2025**: Total de 15.696 registros normalizados.
3. **SO₂ e material particulado aparecem entre os principais controladores**: Os poluentes com maior recorrência de classificação de atenção.
4. **Há lacunas largas na série pública**: Detecção de falhas temporárias de transmissão.

### 1.3. Bloco "Como ler sem cair em erro"
Aviso didático essencial para evitar interpretações equivocadas de leigos:
> *"Esses dados não mostram concentração bruta em µg/m³. Eles mostram índices e subíndices IQAr. Também não são leitura minuto a minuto. São a última base pública disponível."*

### 1.4. Nova Linguagem Popular para Seções
Substituímos os nomes formais por cabeçalhos conversacionais:
- *Onde o ar foi medido*
- *Quando o alerta apareceu*
- *Quem puxou o índice*
- *Onde a série fica em silêncio*
- *O que dá para afirmar*
- *O que ainda precisamos cobrar*

---

## 2. Refinamentos Visuais e de Interatividade

### 2.1. Destaque Visual para Falhas de Monitoramento
Na seção *"Onde a série fica em silêncio"*, foi dada ênfase máxima à frase:
> **"Ausência de dado não é ar bom."**  
Adicionamos o subtítulo explicativo: *"Quando a estação fica sem registro público, a população perde o direito de acompanhar o que respirou naquele período."*

### 2.2. CTA Final "Queremos a série completa"
Criamos um bloco final de forte apelo visual, em tons de azul índigo e gradientes esmeralda, contendo três ações rápidas:
1. **Ver minuta de LAI**: Abre uma modal interativa na própria tela contendo o template formalizado para o cidadão copiar e protocolar no e-SIC do INEA, cobrando a série histórica de 2010 a 2021.
2. **Ver análises**: Redirecionamento para a rota de análises analíticas.
3. **Abrir mapa das estações**: Redirecionamento para o mapa dinâmico principal.

---

## 3. QA de Integridade e Testes de Regressão

Varreremos os arquivos novos e modificados com as suítes de validação automática:
1. **Conformidade de Linguagem**: A linter verificou que não utilizamos termos proibidos como monitoramento ao vivo ou minuto a minuto em tempo real para a base consolidada do INEA (não representa tempo real / não implementado).
2. **Methodology QA**: Validado que todos os subíndices e registros continuam seguindo o padrão correto de normalização metodológica.
3. **Analytics QA**: As chamadas de APIs serverless continuam respondendo corretamente à paginação e regras de integridade analítica.
4. **Verify Build**: O build foi finalizado com sucesso com 0 erros e 0 avisos.
