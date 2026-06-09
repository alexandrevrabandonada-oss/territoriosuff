# Estado da Nação: Validação da Direção do Vento no Observatório do Ar

Este relatório apresenta a validação física e geográfica sobre a interpretação das direções do vento registradas na estação automática Retiro (ID 70 - INEA) em relação à Usina Presidente Vargas (CSN) em Volta Redonda. O objetivo é assegurar o rigor técnico e a conformidade nas representações gráficas da Rosa dos Ventos.

---

## 1. Origem versus Destino na Direção do Vento

Em meteorologia padrão (seguindo as normas da Organização Meteorológica Mundial - OMM e práticas operacionais do INEA/WebLakes), a direção do vento é registrada e expressa em graus azimutais ($0^\circ$ a $360^\circ$) referentes à **origem do fluxo** (de onde o vento sopra), e não ao seu destino (para onde ele vai).

*   **Vento de Leste ($90^\circ$):** Sopra do Leste na direção do Oeste.
*   **Vento de Sudeste ($135^\circ$):** Sopra do Sudeste na direção do Noroeste.
*   **Vento de Sul-Sudeste ($157,5^\circ$):** Sopra do Sul-Sudeste na direção do Norte-Noroeste.

Desta forma, os gráficos de Rosa dos Ventos e as tabelas estatísticas do Observatório do Ar interpretam corretamente os ângulos informados como **vetor de origem do vento**.

---

## 2. Azimute e Disposição Geográfica: Usina Presidente Vargas (CSN) vs. Estação Retiro

Para avaliar a compatibilidade do transporte de plumas, calculamos os vetores geográficos a partir das coordenadas oficiais:

*   **Estação Automática INEA Retiro (ID 70):**
    *   Latitude: `-22.502349` (sul)
    *   Longitude: `-44.122810` (oeste)
*   **Usina Presidente Vargas - Complexo Industrial CSN (Centro Geométrico):**
    *   Latitude: `-22.512631` (sul)
    *   Longitude: `-44.112870` (oeste)

### Cálculo do Vetor de Alinhamento (Azimute)
1.  **Diferença de Latitude ($\Delta\text{Lat}$):**
    $$\text{Retiro Lat} - \text{CSN Lat} = -22.502349 - (-22.512631) = +0.010282^\circ \text{ (Retiro está ao Norte da Usina)}$$
2.  **Diferença de Longitude ($\Delta\text{Lng}$):**
    $$\text{Retiro Lng} - \text{CSN Lng} = -44.122810 - (-44.112870) = -0.009940^\circ \text{ (Retiro está a Oeste da Usina)}$$
3.  **Direção Vetorial Relativa:**
    O vetor que parte da Usina da CSN em direção à estação Retiro aponta na direção **Noroeste (NW)**, com azimute de aproximação de aproximadamente **$316^\circ$**.
    Inversamente, o vetor que parte da estação Retiro em direção ao centro industrial da CSN aponta no azimute de **$136^\circ$ (Sudeste - SE)**.

---

## 3. Compatibilidade Física de Transporte de Plumas (Setores ESE / SE / SSE)

Como o vento é registrado pela sua origem, os quadrantes **ESE (Leste-Sudeste)**, **SE (Sudeste)** e **SSE (Sul-Sudeste)** (ângulos de $101,25^\circ$ a $168,75^\circ$) são **totalmente compatíveis com o transporte físico de plumas de emissões da Usina Siderúrgica Presidente Vargas (CSN) para a estação Retiro**.

*   Quando o sensor da estação Retiro registra ventos vindos de **SE / SSE** (origem), o ar está fluindo geograficamente do quadrante industrial (onde se localiza a CSN) para o quadrante residencial (onde está a estação Retiro).
*   Isso explica o motivo pelo qual as concentrações horárias de gases industriais (como o Dióxido de Enxofre - $SO_2$) apresentam médias significativamente mais altas (**~16,0 µg/m³**) sob ventos de ESE/SE/SSE em comparação à média basal das outras direções (**~6,5 µg/m³**).

---

## 4. Classificação como "Corredores de Atenção"

Embora a correlação de vento e a proximidade geográfica indiquem o transporte físico de emissões, o Observatório adota o termo **"Corredores de Atenção"** para os quadrantes **ESE, SE e SSE**, em vez de fazer acusações diretas.

### Justificativas para a Salvaguarda Editorial:
1.  **Limitação de Causalidade Dinâmica:** A presença de concentrações elevadas de poluentes sob vento originário de uma direção aponta o vetor de transporte físico, mas não constitui prova legal isolada de autoria, uma vez que múltiplos fatores locais e outras fontes menores (ex: tráfego viário, queimas pontuais de biomassa ou pequenas indústrias) podem estar situados ao longo do mesmo corredor físico.
2.  **Topografia Local:** O relevo acidentado e sinuoso do vale do Rio Paraíba do Sul canaliza os ventos nas direções Noroeste/Sudeste. Assim, emissões geradas em outras partes da cidade podem ser carregadas ao longo deste mesmo corredor topográfico.
3.  **Segurança Institucional:** O uso de termos descritivos de dispersão física em substituição a atribuições culpabilizantes assegura que o portal atue como uma ferramenta neutra de transparência de dados públicos.

Portanto, os quadrantes ESE, SE e SSE são caracterizados em toda a interface do usuário como **"corredores de atenção meteorológica para plumas de dispersão regional"**, reforçando que a correlação física indica as rotas de transporte atmosférico sem apontar autoria legal isolada.
