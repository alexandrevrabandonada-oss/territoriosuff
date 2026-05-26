# Estado da Nação — INEA Import XLSX Report

**Data/Hora do Processamento:** 2026-05-26T17:33:59.970Z
**Fonte URL:** https://dadosabertos.rj.gov.br/dataset/fc10bd4a-3cc6-4bd6-9ed7-0fcfde297fa0/resource/21557b65-3f33-4a17-9d7f-daa7ba82af78/download/qualidade_ar.xlsx
**Arquivo Cache Local:** `C:\Projetos\SEMEAR PWA\.cache\inea\qualidade_ar.xlsx`

## Resumo Executivo
Processamento e normalização do arquivo oficial de monitoramento de qualidade do ar do INEA, filtrando especificamente para o município de Volta Redonda-RJ.

## Estatísticas da Ingestão
- **Total de linhas lidas no XLSX:** 39330
- **Linhas encontradas para Volta Redonda:** 2594
- **Estações identificadas em Volta Redonda (4):**
  - `VR-Belmonte`
  - `VR-Retiro`
  - `VR-Santa Cecília`
  - `VR-Nossa Sra. das Graças (Van)`
- **Poluentes identificados em Volta Redonda (6):**
  - `PM10`
  - `SO2`
  - `NO2`
  - `O3`
  - `CO`
  - `PM25`
- **Intervalo temporal dos dados:**
  - **Data inicial:** `2022-01-02T03:00:00.000Z`
  - **Data final:** `2025-02-13T03:00:00.000Z`

## Detecção de Colunas do Excel
O mapeamento automático de colunas identificou os seguintes campos:
- **Estação:** `Estação`
- **Município:** `Cidade`
- **Data/Hora:** `Data`
- **Poluente:** `Não mapeado`
- **Valor:** `Não mapeado`
- **Unidade:** `Não mapeado`
- **Qualidade/Status:** `Não mapeado`

## Próximos Passos
O próximo passo consiste em executar o script de persistência (`npm run inea:ingest`) para inserir/atualizar estas estações e medições no banco de dados Supabase de forma incremental.
