# Estado da Nação — Lançamento do Pacote “Quando o ar exige atenção?” (2022–2024)

Este relatório consolida o pacote de divulgação pública da linha do tempo plurianual (2022–2024) e da camada de episódios de atenção e sazonalidade do Observatório do Ar de Volta Redonda.

---

## 1. Materiais de Divulgação Criados

Desenvolvemos e integramos cinco materiais principais para cobrir a imprensa, mídias sociais e as interfaces internas do portal:

1.  **Legenda de Instagram e WhatsApp:**  
    *   Arquivo: [post-instagram-observatorio-episodios-2022-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/post-instagram-observatorio-episodios-2022-2024.md)
    *   Foco: Mensagem direta sobre o comportamento histórico das estações e o padrão de sazonalidade. Mantido sob o limite de 2.000 caracteres.
2.  **Thread para Redes Sociais (X/Bluesky):**  
    *   Arquivo: [thread-observatorio-episodios-2022-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/thread-observatorio-episodios-2022-2024.md)
    *   Foco: Sequência didática de 7 posts cobrindo a metodologia, as estações (Belmonte, Retiro, Santa Cecília) e o link de acesso.
3.  **Roteiro de Carrossel Visual:**  
    *   Arquivo: [carrossel-observatorio-episodios-2022-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/carrossel-observatorio-episodios-2022-2024.md)
    *   Foco: Planejamento de 8 slides explicando graficamente as conclusões temporais e as salvaguardas técnicas.
4.  **Release de Imprensa Curto:**  
    *   Arquivo: [release-observatorio-episodios-2022-2024.md](file:///C:/Projetos/SEMEAR%20PWA/reports/release-observatorio-episodios-2022-2024.md)
    *   Foco: Texto jornalístico informativo voltado a veículos locais e regionais, reforçando a transparência e a utilidade cívica, evitando tons acusatórios.
5.  **Banners Internos no Portal:**  
    *   Locais: HomePage ([HomePage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/HomePage.tsx)) e Página de Dados ([DadosPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/DadosPage.tsx)).
    *   Foco: Redirecionamento direto com o título *"Quando o ar exige mais atenção?"* ligando os usuários à âncora `/qualidade-ar/inea#episodios`.

---

## 2. Principais Mensagens e Fatos Estatísticos

Os materiais criados dão destaque aos achados consolidados do Observatório na série histórica plurianual (2022–2024):

*   **Sazonalidade:** Concentração de parte importante dos eventos de atenção entre os meses de **maio e setembro**, período característico de baixa dispersão atmosférica e seca no Médio Paraíba.
*   **Recorrência no Belmonte:** A estação VR-Belmonte destaca-se por registrar recorrentemente médias anuais e mensais elevadas de partículas. O ano de 2023 (ano de maior criticidade geral) registrou 84 dias acima do padrão diário recomendado pela OMS na estação para o PM10, com 22 dias críticos em agosto daquele ano.
*   **Picos de PM2.5 no Retiro:** Em 2024, a estação VR-Retiro registrou excedências marcantes para partículas finas (PM2.5): 60 dias acima das diretrizes da OMS e 11 dias acima dos padrões regulamentares da resolução CONAMA 506.
*   **Amplitude no Santa Cecília:** Apresenta as menores médias gerais, mas marcou o maior pico horário pontual de concentração de partículas da série: 410,81 µg/m³ de PM10 em 29 de julho de 2022.

---

## 3. Salvaguardas Metodológicas e Editorial Neutro

Todos os textos de divulgação foram estritamente blindados para evitar ruídos informacionais e alarmismo, adotando a linha técnica do portal SEMEAR:

1.  **Caráter de Comparação Experimental:**  
    Todas as análises e excedências de referências são descritas sob a etiqueta: *"Dado horário público WebLakes — comparação experimental — sem QA/QC oficial explícito."*
2.  **Transparência sobre Lacunas:**  
    Garante-se a informação crucial de que *"ausência de dado não representa ar bom"*, deixando claro que falhas de rede original não devem ser confundidas com ar limpo.
3.  **Natureza Consolidada:**  
    Inclusão da ressalva de que o Observatório funciona com a compilação periódica de dados horários em lotes e de que a visualização *"não representa monitoramento ao vivo ou leitura minuto a minuto"*.
4.  **Vocabulário Adequado:**  
    Eliminação completa de termos impróprios: não foram usados termos como "prova de crime", "oficialmente validado", "homologado" ou "emissões" (utilizou-se "picos horários pontuais de concentração").

---

## 4. Resultados do Controle de Qualidade (QA)

Realizamos a varredura completa das novas e das antigas estruturas:

*   **Linter de Linguagem (`npm run inea:qa:language`):** **PASS**
    *   O script `scripts/inea-public-language-assert.ts` foi atualizado para varrer os cinco novos documentos criados.
    *   Nenhuma infração de terminologia foi detectada.
*   **Verificação de Build e Tipos (`npm run verify`):** **PASS**
    *   A integração dos banners na HomePage e na Página de Dados foi testada. Os tipos e rotas do React Router compilam sem erros no build de produção.

---

## 5. Recomendação de Publicação

1.  **Disponibilização Imediata:** Os banners adicionados já estão direcionando corretamente os usuários para a seção correta `/qualidade-ar/inea#episodios` e devem ser mantidos ativos.
2.  **Post de Redes:** Agendar a publicação do carrossel no Instagram de forma integrada com a legenda curta.
3.  **Thread no X/Bluesky:** Publicar a sequência encadeada no início da semana para obter maior engajamento acadêmico e de ativismo ambiental.
4.  **Envio do Release:** Compartilhar o release curto com portais de imprensa do Médio Paraíba focados em Volta Redonda para apoiar matérias sobre qualidade de vida e clima seco no inverno.
