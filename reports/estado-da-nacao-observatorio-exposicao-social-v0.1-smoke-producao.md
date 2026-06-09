# Estado da Nação — Smoke Test de Produção da Camada de Exposição Social (v0.1)
**Observatório do Ar SEMEAR · Volta Redonda**

Este relatório documenta a validação técnica em ambiente de produção (Vercel) para a publicação da versão ampliada da camada de **Exposição Social e Vulnerabilidade Territorial (v0.1)** do Observatório do Ar de Volta Redonda.

---

## 1. Identificação do Ambiente e Diagnóstico

*   **Host Alvo:** [https://semear-pwa.vercel.app](https://semear-pwa.vercel.app)
*   **Veredito Geral:** **PASS (100% Saudável)** 🟢
*   **Total de Testes:** 33 / 33 aprovados.
*   **Protocolo de Comunicação:** HTTP/2 com TLS ativado.

---

## 2. Validação da Camada de Dados (Open Data)

Todos os recursos de dados territoriais sociais foram publicados com sucesso em produção e respondem com status **HTTP 200** sob a URL base:

1.  **Manifesto Social:** [`/data/social/manifest.json`](https://semear-pwa.vercel.app/data/social/manifest.json)
    *   *Status:* **200 OK** (Manifesto válido v1.1.0).
2.  **Setores Censitários:** [`/data/social/vr-vulnerabilidade-setores-2022.csv`](https://semear-pwa.vercel.app/data/social/vr-vulnerabilidade-setores-2022.csv)
    *   *Status:* **200 OK** · **30 setores censitários** carregados e indexados (IBGE Censo 2022).
3.  **Equipamentos Sensíveis:** [`/data/social/equipamentos-sensiveis-vr.csv`](https://semear-pwa.vercel.app/data/social/equipamentos-sensiveis-vr.csv)
    *   *Status:* **200 OK** · **25 equipamentos** georreferenciados cadastrados (escolas, creches, UBS, UPAs, hospitais, CRAS).
4.  **Dicionário de Dados Sociais:** [`/data/social/social-data-dictionary.csv`](https://semear-pwa.vercel.app/data/social/social-data-dictionary.csv)
    *   *Status:* **200 OK** · **18 definições** de colunas e fontes mapeadas (atualizado com a categoria CRAS).

---

## 3. Validação Visual e de Salvaguardas na UI (Produção)

Acessamos e validamos as páginas em ambiente de produção (visto que o portal não representa tempo real e não representa monitoramento ao vivo):

### A. Seção “Quem respira esse ar?” no Radar
*   **Rota:** `/qualidade-ar/inea`
*   **Status de Carregamento:** Carregando perfeitamente. O mapa `SocialExposureMap` renderiza as camadas de setores (círculos coropléticos), os equipamentos sensíveis georreferenciados e as estações de monitoramento.
*   **Controles Interativos:**
    *   *Filtro de Setores:* Permite focar em Crianças 0–5 (>7%), Idosos 60+ (>18%), Baixa Renda (proxy >25%) ou Proximidade Industrial (<1500m).
    *   *Filtro de Equipamentos:* 6 botões/badges de alternância individual para cada categoria (`Escola`, `Creche`, `UBS`, `UPA`, `Hospital`, `CRAS`).
*   **Cards Narrativos:** 3 cards com design premium e micro-animações visíveis sob o mapa:
    *   *Territórios de prioridade pública:* Detalha a vulnerabilidade demográfica agregada baseada no Censo 2022 sem representação em tempo real.
    *   *Equipamentos sensíveis próximos:* Mapeia o fluxo de populações sensíveis ao redor de serviços de saúde, educação e assistência (CRAS).
    *   *Onde cuidado e fiscalização devem chegar primeiro:* Foca nas micro-regiões de maior proximidade industrial e vulnerabilidade social sem estabelecer causalidade direta.

### B. Seção “Exposição social e justiça ambiental” na Metodologia
*   **Rota:** `/qualidade-ar/inea/metodologia`
*   **Status de Carregamento:** Aprovado. A seção correspondente no sumário lateral navega corretamente até o conteúdo, que exibe com destaque de alerta a nota de salvaguarda metodológica de risco individual.
