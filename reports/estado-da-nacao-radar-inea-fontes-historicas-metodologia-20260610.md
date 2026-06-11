# Estado da Nacao - Radar INEA: fontes historicas e metodologia

Data: 2026-06-10

## Objetivo

Registrar a pesquisa de fontes externas para ampliar o Radar INEA sem misturar dado auditado, dado citado em literatura e hipotese de coleta.

## Achados principais

1. O conjunto oficial "Seguranca hidrica, qualidade ambiental do ar, agua e solo", no portal Dados Abertos RJ, lista o recurso `qualidade_ar.xlsx` como arquivo XLSX associado ao INEA.
2. O mesmo conjunto informa que os dados sao extraidos da plataforma Ambiente+ e declara periodicidade de atualizacao/extracao semestral.
3. A literatura sobre qualidade do ar em Volta Redonda cita dados INEA em janelas historicas anteriores ao recorte operacional consolidado no portal, especialmente 2010-2014 e 2013-2015.
4. Estudos sobre rede de monitoramento do RJ citam relatorios de qualidade do ar do INEA entre 2007 e 2015, indicando que ha trilhas documentais para resgate historico adicional.
5. A Plataforma da Qualidade do Ar do IEMA aparece como fonte secundaria relevante para diagnostico nacional e organizacao de dados historicos de orgaos estaduais, mas nao substitui auditoria local do SEMEAR.

## Decisao metodologica

Nenhum numero novo deve entrar nos paineis consolidados apenas por aparecer em artigo, relatorio ou base secundaria. Essas fontes devem orientar:

- busca de relatorios anuais e anexos;
- pedidos LAI quando o microdado horario nao estiver publico;
- validacao cruzada de ordem de grandeza;
- priorizacao de poluentes e anos para scraping incremental.

## Regra de incorporacao

Uma nova serie historica so pode virar interface publica quando cumprir os filtros abaixo:

1. Fonte rastreavel e citavel.
2. Unidade nativa conferida.
3. Janela temporal documentada.
4. Cobertura minima calculada.
5. Tratamento de zeros, picos extremos e lacunas registrado.
6. Comparacao com pelo menos uma fonte externa quando houver literatura disponivel.
7. Relatorio de auditoria publicado antes ou junto da UI.

## Fontes consultadas

- Portal Dados Abertos RJ: conjunto "Seguranca hidrica, qualidade ambiental do ar, agua e solo".
- Artigo "Estudo da qualidade do ar e a atividade siderurgica na cidade de Volta Redonda", com analise de dados INEA entre 2010 e 2014.
- Revisao sobre poluicao atmosferica em Volta Redonda e saude da populacao, com periodo 2013 a 2015.
- Estudo sobre diagnostico das tecnologias e rede de monitoramento, citando relatorios INEA 2007-2015.
- Artigo sobre uso de dados abertos e Plataforma da Qualidade do Ar do IEMA.

## Proxima fila segura

- Mapear URLs e PDFs oficiais de relatorios anuais INEA.
- Tentar identificar anexos ou tabelas de Volta Redonda por ano.
- Comparar PM10, PTS e O3 2013-2015 com o dataset de memoria ja recuperado.
- Manter NO2 bloqueado ate auditoria de linha de base.
- Manter O3 fora dos paineis consolidados ate resolver divergencia de metrica.
