# Estado da Nação — Replicação do Endpoint Tabular INEA/WebLakes

**Data da Auditoria:** 2026-05-27T22:54:44.039Z
**Responsável Técnico:** Alexandre Martins (alexandre.martins@pwa.semear)

---

## 1. Perguntas do Roteiro de Descobrimento

### A. A chamada real usa GET ou POST?
A chamada real para obter os dados em formato JSON utiliza o método **GET**.

### B. Exige cookies ou tokens de sessão?
**Sim.** A plataforma utiliza cookies de sessão emitidos pelo framework ASP.NET:
- `ASP.NET_SessionId`: Identifica a sessão no servidor.
- `publicuser`: Identifica o usuário público.
- `.ASPXAUTHPUB`: Identifica a autenticação pública emitida pelo portal.
- `__RequestVerificationToken_L0lORUFQdWJsaWNv0`: Token Antiforgery (CSRF) para proteger as chamadas.

Se uma chamada direta for feita sem cookies de sessão inicializados, ela falha ou redireciona. Porém, qualquer cliente HTTP simples pode inicializar uma sessão fazendo um GET inicial à página de entrada pública (`/NavPage/Index/Analytics?aGroupId=NPSEARCH`) e salvando os cookies de retorno (`set-cookie`) para serem enviados na requisição subsequente do `GridData`.

### C. Exige referer ou origin?
A requisição ao endpoint `/GridData` envia o cabeçalho `Referer` apontando para a URL do controlador correspondente (ex: `https://qualidadedoar.inea.rj.gov.br/INEAPublico/ConcentrationWithWindArrows?aSectionId=Analytics`) e o cabeçalho `X-Requested-With: XMLHttpRequest`. 

### D. Qual host funciona?
- O host oficial do INEA **`qualidadedoar.inea.rj.gov.br`** está **ATIVO** (HTTP 200).
- O host alternativo **`ei.weblakes.com`** está **OFFLINE / INDISPONÍVEL** (retorna HTTP 503 ou falha de conexão).

### E. Há dado horário físico?
**Sim.** O endpoint `/ConcentrationWithWindArrows/GridData` expõe concentrações físicas em escala **horária** (por exemplo, registros a cada hora como `00:00:00`, `01:00:00`, contendo valores decimais brutos como `25.302303270234`).

### F. Há QA/QC?
Na visualização horária de concentrações (`ConcentrationWithWindArrowsGrid`), **não há** coluna explícita de QA/QC (quality flag) ou código de validação. A tabela fornece apenas os valores numéricos brutos medidos e a direção/velocidade do vento. 
*(Nota: O painel diário de IQAr possui uma classificação qualitativa baseada na faixa de índice, mas não é um flag de controle de qualidade de dados brutos).*

### G. Qual é o formato de resposta?
A resposta é um objeto **JSON** estruturado para alimentar o componente JqGrid (`gridId=ConcentrationWithWindArrowsGrid`). A estrutura básica é:
```json
{
  "total": 1,
  "page": 1,
  "records": 47,
  "rows": [
    {
      "id": 1,
      "cell": [
        1,
        "",
        "<span data-value='2024-07-17T00:00:00'>17-jul-2024, 00:00:00</span>",
        "Região do Médio Paraíba (RMP)",
        "VR - Retiro",
        "<span data-value='0000000000000025,3023032702340000'>25,30</span>",
        "<span data-value='0000000000000000,9138763855563270'>0,9</span>",
        "<span data-value='0000000000000025,2011762194820000'>25</span>"
      ]
    }
  ]
}
```
Para obter os valores reais de data/hora e concentração física, é necessário realizar um parse no HTML retornado no array `cell`, extraindo o atributo `data-value` (que contém o valor completo de precisão numérica sem formatação local).

### H. Podemos coletar de forma ética e estável?
**Sim, com ressalvas.** Como a página é inteiramente pública e não exige login ou captcha para visualização, a coleta automática é tecnicamente viável. Porém, ela deve seguir um protocolo ético estrito:
1.  **Identificação do User-Agent:** Manter o User-Agent transparente identificando a finalidade do projeto.
2.  **Moderação de janelas:** Solicitar períodos curtos (ex: 1 mês por lote) para evitar sobrecarregar o banco de dados da plataforma pública.
3.  **Intervalo de requisição (Backoff):** Pausar entre 10 e 20 segundos a cada requisição.
4.  **Resiliência a alterações:** Uma mudança na estrutura do array de células retornado no JSON pode quebrar o script de parser, portanto o coletor deve conter verificações robustas de limite e alertas de quebra.

---

## 2. Comparativo de Hosts e Endpoints

| Host | Endpoint / Caminho | Status HTTP | Content-Type | Tamanho (Bytes) | Mensagem / Notas |
| :--- | :--- | :--- | :--- | :--- | :--- |
| `qualidadedoar.inea.rj.gov.br` | `/ConcentrationWithWindArrows/GridData` | 200 | application/json; charset=utf-8 | 21716 | Sucesso. Retornou dados horários válidos. |
| `qualidadedoar.inea.rj.gov.br` | `/AMSTabularData/GridData` | 200 | application/json; charset=utf-8 | 10646 | Sucesso. Retornou dados diários ou horários. |
| `ei.weblakes.com` | `/AMSTabularData/GridData` | 503 | text/html; charset=us-ascii | 326 | Servidor indisponível (HTTP 503 ou erro de rede). |
| `ei.weblakes.com` | `/ConcentrationWithWindArrows/GridData` | 503 | text/html; charset=us-ascii | 326 | Servidor indisponível (HTTP 503). |

---

## 3. Conclusão Diagnóstica

O endpoint oficial do INEA em **`qualidadedoar.inea.rj.gov.br`** está operando corretamente e fornece dados horários de concentração física de poluentes de forma estruturada via JSON (embrulhados em tags HTML). A replicação ética foi comprovada com sucesso utilizando cookies temporários de sessão pública inicializados programaticamente, demonstrando que há evidência pública forte de que medições físicas horárias estão sendo realizadas e expostas publicamente.
