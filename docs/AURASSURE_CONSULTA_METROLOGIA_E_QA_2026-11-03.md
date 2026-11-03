# CONSULTA TÉCNICA — Aurassure/UFF, Volta Redonda

**Data:** 03/11/2026 · **Status:** minuta preparada, **não enviada**  
**Destinatário prioritário para encaminhamento:** Daniel Rios De Rosa — Aurassure Brasil, indicado nominalmente na página 3 do manual de API disponibilizado ao SEMEAR. **Não há e-mail individual comprovado no manual.** Encaminhar por canal já estabelecido com a Aurassure Brasil ou solicitar direcionamento ao atendimento corporativo; envolver a coordenação técnica da UFF.  
**Assunto:** Validação metrológica, unidades da API, AQI e interrupções nas estações UFF/IFRJ/CRIAAD.

Prezado Daniel Rios De Rosa e equipe técnica da Aurassure Brasil,

O Projeto UFF SEMEAR está integrando a API Aurassure para acompanhamento de três estações de monitoramento em Volta Redonda, RJ, e preparando uma plataforma pública com rastreabilidade e informações metodológicas. Nossa primeira coleta e recuperação histórica foram concluídas com sucesso, mas a publicação dos valores permanece bloqueada até esclarecimento técnico.

**Estações encontradas na API**

| Thing ID | Identificação devolvida pelo fornecedor |
|---|---|
| 46560 | UFF / Vila Santa Cecília |
| 46561 | IFRJ / Nossa Senhora das Graças |
| 46562 | CRIAAD / Vila Mury |

Solicitamos, se possível, respostas por escrito e documentação técnica para os pontos abaixo.

## 1. Unidades efetivas de `POST /things/data`

O JSON retornado para médias de 900 segundos contém valores em `data[].parameter_values[parameter].avg`, sem unidade associada a cada leitura. No cadastro `GET /things/list` há dois campos diferentes: `unit` e `param_details.default_unit`.

- PM2,5 e PM10: ambos indicam `μg/m3`.
- NO₂, SO₂ e O₃: `unit=ppb` e `default_unit=μg/m3`.
- CO: `unit=ppb` e `default_unit=mg/m3`.
- CO₂: `unit=ppm` e `default_unit=ppm`.
- TVOC: `unit=ppm` e `default_unit=ppm`.

**Perguntas:** qual campo corresponde à unidade **efetivamente entregue** em `.avg` e `.value`, incluindo as séries históricas? Há conversão por temperatura/pressão? O método de média de 15 minutos utiliza apenas amostras válidas? Como são indicadas amostras ausentes ou inválidas? Existe atualização retroativa de séries?

## 2. AQI do fornecedor

Pedimos a fórmula e a autoridade de referência para o índice `aqi` (p. ex. escala, pontos de corte, médias por poluente, janela móvel, condições de validade, poluente determinante e eventual aplicação de NowCast). Identificamos respostas sem AQI em alguns registros.

A equipe pretende **não** chamar esse valor de IQAr oficial brasileiro nem aplicar categorias legais sem confirmação do método e da base metrológica.

## 3. Modelo dos equipamentos e qualidade metrológica

Por estação, solicitamos:
- fabricante, modelo e número/identificação dos sensores realmente instalados;
- poluentes e módulos habilitados (inclusive se há PM1, ausente nas nossas respostas de dados);
- fichas técnicas, faixa operacional, resolução, incerteza, precisão e limites conhecidos;
- calibração inicial, verificações zero/span, manutenção e colocalização com estação de referência;
- procedimentos de garantia/controle de qualidade, identificação e descarte de amostras de aquecimento ou falha;
- posição física/altura e datas da entrada em operação, sem divulgação de dados pessoais.

## 4. Interrupções observadas e valores atípicos

A partir do histórico de médias de 15 minutos importado entre 20/10/2026 e 03/11/2026, encontramos:

1. **CRIAAD:** nenhuma média disponibilizada entre **27/10 05h45 e 29/10 16h30**, em horário de Brasília (58h45 entre duas leituras, equivalentes a 234 intervalos internos sem amostra).
2. **CRIAAD em 29/10 16h30–17h00:** no primeiro horário após essa lacuna, NO₂ caiu de 540,645 para 189,604 e 55,785; SO₂ de 723,91 para 319,60 e 102,62; CO de 3957,88 para 1630,48 e 711,28. **As unidades ainda não estão confirmadas.** Pedimos logs de energização/reconexão, diagnóstico, manutenção e avaliação da qualidade dessas amostras. Não estamos afirmando falha instrumental nem descartando um evento ambiental real.
3. **Todas as estações:** têm última leitura antes de uma interrupção em **21/10 às 18h**; retomaram em 22/10 às 09h15 (UFF), 11h (IFRJ) e 12h15 (CRIAAD). Há alguma alteração de plataforma, conectividade ou manutenção que explique esse período?
4. **CRIAAD:** outras interrupções ocorreram em 26/10 (07h45–18h), 02/11 (07h45–16h30) e 03/11 (05h30–10h45), além de lacunas menores.

Todos os horários acima são BRT (`America/Sao_Paulo`).

### Evidência adicional sobre retomadas

A análise posterior à minuta inicial identificou **sete retomadas após intervalos sem registros de pelo menos cinco horas**, consideradas nas três estações. Em seis delas, SO₂ diminuiu mais de 50% e CO mais de 30% nos 30 minutos subsequentes; cinco das seis ocorrências foram no CRIAAD. Para o CRIAAD, o critério apareceu também em 23 de 694 outras janelas contínuas elegíveis (3,3%). Trata-se de **observação exploratória** com limiares definidos após análise e sem verificação metrológica das unidades. A hipótese de efeito de retomada ou estabilização não está comprovada. Solicitamos, se existirem, logs dos canais brutos e de cálculo/correção, flags de warm-up e eventos de manutenção ou energia para esses episódios.

Na base privada, os **21 registros dos primeiros 30 minutos após as sete retomadas** foram marcados para **revisão técnica antes de qualquer publicação**, sem apagar ou modificar as medições originais.

## 5. Integração, propriedade e autorização de publicação

Solicitamos esclarecimento de:
- limites de requisição e limites recomendados por estação para exportações e backfill;
- retenção de histórico, atualização dos dados e estabilidade das IDs;
- permissão para disponibilizar séries históricas e exportação CSV com atribuição Aurassure/UFF no portal SEMEAR, bem como condições de licença e reprodução;
- referência pública adequada da fonte, responsável técnico e contato de incidentes;
- eventual disponibilização de QA flags, qualidade/validade, firmware e logs por API.

Agradecemos a colaboração. Nosso objetivo é disponibilizar informações de qualidade ambiental com transparência, sem atribuir causas de poluição a qualquer fonte sem investigação e sem confundir a rede complementar com os dados oficiais do INEA.

Atenciosamente,

**Equipe de integração técnica — Projeto UFF SEMEAR / SEMEAR SF**

---

## Uso interno e critérios de publicação

- Não enviar IDs de acesso, chaves de API, tokens do banco nem respostas privadas contendo credenciais.
- Exibir ao público os nomes das estações e indicadores de disponibilidade apenas quando autorizados e contextualizados.
- Não considerar ausência de medição equivalente a ar limpo.
- Registrar arquivos/certificados recebidos e a data da resposta no dossiê canônico `docs/AURASSURE_CAPTURA_REAL_QA_2026-11-03.md`.
- Somente aprovar amostras PM2,5/PM10 para divulgação após identificar procedimento documentado e a pessoa que revisou. O gatilho de publicação no banco exige correspondência com amostra real, SHA-256 original e QA aprovada.
- Não publicar NO₂, SO₂, CO ou O₃ com unidade presumida, nem AQI sem metodologia.

**Referências públicas para contextualização, não prova do modelo instalado:**  
- https://aurassure.com/air-quality-monitoring/  
- https://aurassure.com/aurassure-trust-air-quality-monitor/  
- https://aurassure.com/wp-content/uploads/2026/03/Digital-Aurassure-Brochure-2026.pdf


### Referência de encaminhamento (uso interno)

A página 3 de `Manual_API_UFF_Volta_Redonda (1).pdf`, documento fornecido ao projeto, identifica **Daniel Rios De Rosa — Aurassure Brasil** para dúvidas de integração/credenciais. Um perfil profissional público informa vínculo com a empresa (https://br.linkedin.com/in/daniel-rios-de-rosa/en). Isso indica um contato direcionável, **não estabelece e-mail individual**. Manter o pedido como **não enviado** até revisão da assinatura e do canal de comunicação.
