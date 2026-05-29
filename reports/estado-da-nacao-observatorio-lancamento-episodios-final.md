# Estado da Nação — Lançamento do Pacote “Quando o ar exige atenção?” — Final (2022–2024)

Este relatório consolida a versão final do pacote de divulgação pública da linha do tempo plurianual (2022–2024) e da camada de episódios de atenção e sazonalidade do Observatório do Ar de Volta Redonda, incorporando as correções e refinamentos finais realizados no Tijolo 32.1.

---

## 1. Materiais de Divulgação e Revisões Realizadas

Os cinco materiais originais de comunicação pública foram atualizados e validados:

1.  **Release de Imprensa Curto:**  
    *   Arquivo: [release-observatorio-episodios-2022-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/release-observatorio-episodios-2022-2024.md)
    *   Revisão 1: Correção do termo *"Utiliade Cívica"* para *"Utilidade Cívica"*.
    *   Revisão 2: Suavização de vínculo causal direto, alterando *"Esse comportamento está intimamente ligado aos fatores climáticos locais"* para *"Esse comportamento pode estar associado a fatores climáticos locais"*.
2.  **Roteiro de Carrossel Visual:**  
    *   Arquivo: [carrossel-observatorio-episodios-2022-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/carrossel-observatorio-episodios-2022-2024.md)
    *   Revisão: Ajuste no Card 2, alterando *"2023: Ano mais seco do período, registrando o maior número de eventos de atenção gerais."* para *"2023: Ano com maior número de eventos de atenção no período analisado."*
3.  **Legenda de Instagram e WhatsApp:**  
    *   Arquivo: [post-instagram-observatorio-episodios-2022-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/post-instagram-observatorio-episodios-2022-2024.md)
    *   Foco: Sem alterações necessárias, mantendo o resumo da sazonalidade (maio-setembro), os picos de PM2.5 no Retiro e Belmonte, além dos picos históricos do Santa Cecília.
4.  **Thread para Redes Sociais (X/Bluesky):**  
    *   Arquivo: [thread-observatorio-episodios-2022-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/thread-observatorio-episodios-2022-2024.md)
    *   Foco: Sequência de 7 postagens curtas mantendo a conformidade e os limites de caracteres.
5.  **Banners Internos do Portal:**  
    *   Locais: HomePage ([HomePage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/HomePage.tsx)) e Página de Dados ([DadosPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/DadosPage.tsx)).
    *   Foco: Botão ativo *"Ver episódios de atenção"* direcionando corretamente à âncora `/qualidade-ar/inea#episodios`.

---

## 2. Principais Mensagens e Fatos Estatísticos Mantidos

As mensagens estatísticas canônicas da série temporal plurianual (2022–2024) foram preservadas com integridade:

*   **Sazonalidade:** Concentração de parte importante dos episódios de atenção entre os meses de **maio e setembro**, coincidindo com o inverno e estiagem no Médio Paraíba.
*   **VR-Belmonte:** Maior média geral e ano de 2023 crítico (84 dias de médias diárias acima da recomendação da OMS para PM10, dos quais 22 ocorreram em agosto).
*   **VR-Retiro:** Maior volume de eventos de atenção em PM2.5 no ano de 2024 (60 dias acima da recomendação OMS e 11 dias acima dos padrões CONAMA 506).
*   **VR-Santa Cecília:** Apresenta menores médias gerais de PM10 e PM2.5, porém registrou o maior pico horário pontual de concentração da série: 410,81 µg/m³ de PM10 em 29 de julho de 2022.

---

## 3. Salvaguardas Metodológicas e Editorial Neutro

Todos os textos incorporam rigorosamente as salvaguardas públicas acordadas para blindar o caráter cívico do Observatório:

1.  **Comparação Experimental:**  
    Uso obrigatório de *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito."*
2.  **Integridade de Dados Ausentes:**  
    Uso explícito de *"ausência de dado não representa ar bom"*, sinalizando que problemas pontuais na rede governamental não significam ar de boa qualidade.
3.  **Ressalva de Freshness (não representa tempo real):**  
    Uso da frase *"não representa monitoramento ao vivo ou leitura minuto a minuto"* para afastar qualquer confusão de monitoramento instantâneo.
4.  **Vocabulário Adequado:**  
    Evitou-se termos indutores de crime, culpa ou erro (sem usar "prova de crime", "homologado", "oficialmente validado" ou "emissões" no lugar de concentrações).

---

## 4. Resultados do Controle de Qualidade (QA)

As correções do Tijolo 32.1 foram inteiramente validadas:

*   **Linter de Linguagem (`npm run inea:qa:language`):** **PASS**
    *   As novas revisões e o relatório final foram incluídos no escopo de checagem.
    *   Todos os textos passaram de forma limpa pelo linter de conformidade.
*   **Verificação de Build e Tipos (`npm run verify`):** **PASS**
    *   Nenhum erro de tipo de TypeScript ou quebra de build da Vite foi detectado nos arquivos React modificados ou scripts de QA.

---

## 5. Recomendação de Publicação

Recomenda-se a publicação coordenada e imediata dos materiais atualizados e revisados deste pacote final para a imprensa e redes sociais.
