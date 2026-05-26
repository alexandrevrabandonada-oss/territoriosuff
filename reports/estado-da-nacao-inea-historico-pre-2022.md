# Auditoria Histórica dos Dados INEA antes de 2022

**Data do Relatório:** 2026-05-26  
**Status da Auditoria:** Concluído  

---

## 1. Contexto e Objetivos

O Radar do Ar INEA consolidou e importou dados oficiais de qualidade do ar para Volta Redonda que começam em **janeiro de 2022**. O objetivo desta auditoria é investigar a existência e a disponibilidade pública de séries históricas de monitoramento anteriores a 2022 para as estações de Volta Redonda, mapeando a cobertura física e digital das estações e fornecendo subsídios para demandas de transparência ativa e acesso à informação (LAI).

---

## 2. Tabela de Cobertura Histórica por Estação

Com base em cruzamentos de bancos de dados internos, estudos acadêmicos e consulta às plataformas públicas de meio ambiente (INEA, IEMA e Dados Abertos RJ), mapeamos a disponibilidade dos dados históricos das estações de Volta Redonda:

| Estação | Primeiro Ano Encontrado | Último Ano Encontrado | Fonte dos Dados | Tipo de Dado Disponível |
| :--- | :---: | :---: | :--- | :--- |
| **VR-Belmonte** | 2022 (Série aberta)<br>~2010 (Série física) | 2025 | Dados Abertos RJ / INEA (Público)<br>Relatórios CSN e INEA (Interno) | Planilha XLSX (2022-2025) / Médias horárias e diárias nos arquivos internos de licenciamento |
| **VR-Retiro** | 2022 (Série aberta)<br>~2010 (Série física) | 2025 | Dados Abertos RJ / INEA (Público)<br>Relatórios CSN e INEA (Interno) | Planilha XLSX (2022-2025) / Médias horárias e diárias nos arquivos internos de licenciamento |
| **VR-Santa Cecília** | 2022 (Série aberta)<br>~2010 (Série física) | 2025 | Dados Abertos RJ / INEA (Público)<br>Relatórios CSN e INEA (Interno) | Planilha XLSX (2022-2025) / Médias horárias e diárias nos arquivos internos de licenciamento |
| **VR-Nossa Sra. das Graças (Van)** | 2023 (Série aberta)<br>Não existia antes | 2025 | Dados Abertos RJ / INEA (Público) | Planilha XLSX (2023-2025) / Estação móvel automática instalada em 27/10/2023 |

---

## 3. Respostas às Perguntas Políticas e Metodológicas

### 3.1. A estação existia antes de 2022?
**Sim, para as estações fixas.** As três estações fixas automáticas — **VR-Retiro**, **VR-Belmonte** e **VR-Santa Cecília** — foram instaladas e estavam físicas e operacionalmente ativas muito antes de 2022. Elas integram a rede de monitoramento mantida pela Companhia Siderúrgica Nacional (CSN) como exigência das condicionantes de sua Licença de Operação (LO) emitida pelo INEA. Trabalhos acadêmicos e relatórios institucionais (como o Relatório da Qualidade do Ar do Estado do Rio de Janeiro: Ano Base 2018) citam expressamente a existência e o funcionamento dessas estações em séries históricas que retrocedem pelo menos até 2010.

A estação móvel **VR-Nossa Sra. das Graças (Van)** é a única que **não existia** antes de 2022. Ela foi instalada em **27 de outubro de 2023** no campus do IFRJ (bairro Aterrado) pelo INEA, com o propósito de monitorar as partículas sedimentáveis ("pó preto") após forte mobilização da sociedade civil.

### 3.2. Há dado público antes de 2022?
**Não de forma estruturada e acessível.** Não há planilhas (CSV, XLSX), arquivos JSON ou endpoints de API pública disponibilizados para download contendo o histórico diário ou horário das medições das estações de Volta Redonda antes de 1º de janeiro de 2022. A única base descarregável aberta é a série iniciada em 2022 no portal Dados Abertos RJ. 

### 3.3. Se há, onde está?
Os dados consolidados anteriores a 2022 existem sob duas formas:
1. **Dados Brutos de Telemetria:** Armazenados nos servidores internos do INEA (banco de dados do sistema SIGQAr) e nos sistemas de monitoramento da própria CSN.
2. **Dados Agregados e Relatórios:** Fragmentos e médias estão publicados em relatórios anuais consolidados em formato PDF (como o RQAR 2018 do INEA, publicado em 2020) ou compilados em dissertações e artigos acadêmicos da UFF e do UniFOA. Não há, contudo, um repositório para exportação das séries completas.

### 3.4. Se não há, isso é ausência real ou ausência de transparência?
**Trata-se de uma lacuna de transparência ativa.** Não há ausência real de monitoramento físico, visto que as estações coletaram os dados e estes serviram de base para fiscalizações e estudos técnicos. A ausência se dá na disponibilização pública e no formato aberto dos dados. As antigas plataformas de divulgação do INEA (Portal Qualiar e o sistema `MonitorQualidadeDoAr` hospedados sob o IP público `200.20.53.25`) ficaram inoperantes ou inacessíveis, e o atual portal SIGQAr não fornece ferramenta de download histórico para dados pré-2022.

### 3.5. Que pedido de LAI devemos fazer?
Para reaver a série histórica e viabilizar análises de longo prazo, deve-se formular um pedido de Lei de Acesso à Informação (LAI) direcionado ao INEA. O pedido deve requerer especificamente as concentrações horárias físicas de poluentes e os índices de qualidade do ar diários calculados, delimitando as estações fixas operadas em Volta Redonda para o período de 2010 a 2021.

---

## 4. Minuta para Pedido de Informação (LAI)

Abaixo está o texto recomendado para o protocolo de pedido de informação por meio do e-SIC (Sistema Eletrônico do Serviço de Informação ao Cidadão) do Estado do Rio de Janeiro, direcionado ao **Instituto Estadual do Ambiente (INEA)**:

> **Destinatário:** Instituto Estadual do Ambiente (INEA) — Diretoria de Informação, Monitoramento e Fiscalização (DIMF) / Diretoria de Licenciamento Ambiental (DILAM)
>
> **Assunto:** Solicitação de série histórica de dados de monitoramento da qualidade do ar em Volta Redonda (2010-2021)
>
> **Texto da Solicitação:**
>
> Prezados,
>
> Com amparo na Lei Federal de Acesso à Informação (Lei nº 12.527/2011) e na Lei Estadual do Rio de Janeiro nº 9.176/2021 (que rege as obrigações de transparência ativa), solicito o fornecimento, em formato aberto, estruturado e legível por máquina (como CSV, XLSX ou equivalente), da série histórica de dados de monitoramento de qualidade do ar obtidos pelas estações automáticas oficiais localizadas no município de Volta Redonda/RJ.
>
> Especificamente, requerem-se as informações conforme as seguintes especificações:
>
> 1. **Estações Monitoradas:**
>    - **VR-Retiro** (localização aproximada: Av. Jaraguá, nº 800, bairro Retiro - Lat: -22.502349, Long: -44.122810);
>    - **VR-Belmonte** (localização aproximada: Bairro Belmonte - Lat: -22.517677, Long: -44.132540);
>    - **VR-Santa Cecília** (localização aproximada: Av. Vinte e Um, Vila Santa Cecília - Lat: -22.522530, Long: -44.106564).
>
> 2. **Período dos Dados:**
>    - De 01 de janeiro de 2010 (ou desde a data de instalação/início de operação de cada estação, caso posterior) até 31 de dezembro de 2021.
>
> 3. **Variáveis e Parâmetros Requeridos:**
>    - Registros com resolução temporal de **médias horárias** e **médias diárias** contendo:
>      - Concentrações físicas dos poluentes monitorados em suas respectivas unidades físicas de medida ($\mu\text{g/m}^3$ ou $\text{ppm}$), incluindo Material Particulado ($MP_{10}$ e $MP_{2.5}$), Dióxido de Enxofre ($SO_2$), Dióxido de Nitrogênio ($NO_2$), Ozônio ($O_3$) e Monóxido de Carbono ($CO$);
>      - Subíndices de qualidade do ar calculados para cada poluente e o Índice de Qualidade do Ar consolidado ($IQAr$) diário;
>      - Sinalizações de validação técnica do registro (flags de qualidade) e identificação de dados ausentes ou inválidos por falha técnica.
>
> Solicito que os dados sejam enviados por meio de arquivos digitais anexos ou disponibilização de link de download direto, conforme preconiza o art. 8º, § 3º, inciso II da Lei nº 12.527/2011, evitando o envio de arquivos digitalizados em formato de imagem ou documentos PDF que impeçam o tratamento computacional dos dados.
>
> Agradeço a atenção e aguardo o retorno no prazo legal.
