# Estado da Nação — INEA Discovery Report

**Data/Hora do Diagnóstico:** 2026-05-26T17:12:02.230Z
**Target URL:** https://portalsigqar.inea.rj.gov.br/
**HTTP Status do Portal:** 200

## Resumo Executivo
Este relatório detalha a descoberta de endpoints públicos a partir do portal oficial SIGQAR do INEA. O objetivo é mapear se existe uma API de dados abertos ou interna acessível de forma pública para coletar medições de qualidade do ar.

## Arquivos JavaScript Encontrados
Foram identificados os seguintes arquivos JavaScript públicos na página inicial:
- [bootstrap.bundle.min.js](https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js)
- [runtime.fd76739822912795.js](https://portalsigqar.inea.rj.gov.br/runtime.fd76739822912795.js)
- [polyfills.0ac476517b9ab817.js](https://portalsigqar.inea.rj.gov.br/polyfills.0ac476517b9ab817.js)
- [main.38014a26c1cd8470.js](https://portalsigqar.inea.rj.gov.br/main.38014a26c1cd8470.js)

## Endpoints Candidatos Detectados
A análise estática do código-fonte dos scripts JS revelou os seguintes candidatos de endpoint contendo termos-chave (como `api`, `estacao`, `qualidade`):
- `https://qualidadedoar.inea.rj.gov.br/`
- `https://www.gov.br/mma/pt-br/assuntos/meio-ambiente-urbano-recursos-hidricos-qualidade-ambiental/qualidade-do-ar/indice-de-qualidade-do-ar-iqar/orientacao-tecnica-indice-de-qualidade-do-ar-jan-25.pdf`
- `http://localhost:5385/api/Publicacao/ListarPorId/a57b4cdd-03d5-4f11-87aa-6f20dbadde33`
- `https://qualidadedoar.inea.rj.gov.br/INEAPublico/Nav/Module/AMS/AMS`
- `https://qualidadedoar.inea.rj.gov.br/INEAPublico/NavPage/Index/Analytics`

## Resultados dos Testes de Conexão
Foram testados os seguintes endpoints candidatos (respeitando o limite ético de 1 requisição por endpoint):


### https://qualidadedoar.inea.rj.gov.br/
- **Status HTTP:** 0
- **Retorna JSON?** Não
- **Erro:** fetch failed



### https://www.gov.br/mma/pt-br/assuntos/meio-ambiente-urbano-recursos-hidricos-qualidade-ambiental/qualidade-do-ar/indice-de-qualidade-do-ar-iqar/orientacao-tecnica-indice-de-qualidade-do-ar-jan-25.pdf
- **Status HTTP:** 200
- **Retorna JSON?** Não

- **Amostra de dados:**
```json
%PDF-1.7
%����
1 0 obj
<</Type/Catalog/Pages 2 0 R/Lang(pt) /StructTreeRoot 82 0 R/MarkInfo<</Marked true>>/Metadata 535 0 R/ViewerPreferences 536 0 R>>
endobj
2 0 obj
<</Type/Pages/Count 9/Kids
```


### http://localhost:5385/api/Publicacao/ListarPorId/a57b4cdd-03d5-4f11-87aa-6f20dbadde33
- **Status HTTP:** 0
- **Retorna JSON?** Não
- **Erro:** fetch failed



### https://qualidadedoar.inea.rj.gov.br/INEAPublico/Nav/Module/AMS/AMS
- **Status HTTP:** 0
- **Retorna JSON?** Não
- **Erro:** fetch failed



### https://qualidadedoar.inea.rj.gov.br/INEAPublico/NavPage/Index/Analytics
- **Status HTTP:** 0
- **Retorna JSON?** Não
- **Erro:** fetch failed



## Conclusões do Diagnóstico
1. **Disponibilidade da API**: Não foi possível confirmar uma API REST estruturada pública ativa nos scripts analisados.
2. **Fonte MVP**: Como não há API documentada ou pública identificada com sucesso, usaremos o arquivo XLSX oficial do Portal de Dados Abertos do RJ como a fonte canônica para o MVP.
