# Estado da Nação — INEA Ingestion Report

**ID da Execução:** `b5c27736-492d-47ea-bc79-9c1cf4d76db8`
**Status:** `SUCCESS`
**Início:** `2026-05-26T17:33:57.552Z`
**Fim:** `2026-05-26T17:34:13.743Z`

## Resumo da Ingestão
Os dados do arquivo XLSX do INEA foram processados e importados com sucesso para o banco de dados do Supabase.

## Estatísticas de Banco de Dados
- **Estações Inseridas/Atualizadas:** 4
- **Medições Lidas:** 15780
- **Medições Inseridas/Atualizadas:** 15696

## Estações Mapeadas
- **VR-Nossa Sra. das Graças (Van)** (Lat: `-22.50656`, Lng: `-44.09669`)
- **VR-Retiro** (Lat: `-22.502349`, Lng: `-44.12281`)
- **VR-Santa Cecília** (Lat: `-22.52253`, Lng: `-44.106564`)
- **VR-Belmonte** (Lat: `-22.517677`, Lng: `-44.13254`)

## Validação e Consistência
- Todas as medições duplicadas foram tratadas no banco de dados através da restrição exclusiva composto `ux_air_measurements_prevent_duplicates`.
- Registros sem data ou sem valores válidos de medição foram devidamente ignorados durante o processamento.
