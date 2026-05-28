# Relatório Técnico — Auditoria de Contrato Stateful WebLakes

**Data da Auditoria:** 2026-05-28T15:56:23.752Z  
**Estação Testada:** Retiro (ID: 70)  
**Data Alvo:** 2024-07-01  

---

## 1. Resultados dos Testes de Sessão

| Caso de Teste | Sessão | Parâmetro Solicitado | Valor Retornado às 00:00 (µg/m³) | Observação |
| :--- | :--- | :--- | :--- | :--- |
| **Teste 1** | Limpa (Sessão 1) | PM10 (18) | 5.86919067382813 | Valor piloto diário validado esperado: ~5.87 |
| **Teste 2** | Reutilizada (Sessão 1) | PTS (1955) | 7.54286413126522 | Se for idêntico ao Teste 1, há bug de estado |
| **Teste 3** | Limpa (Sessão 2) | PTS (1955) | 7.54286413126522 | Valor correto de PTS esperado |

### Diagnóstico de Conclusão:

> [!NOTE]
> **COMPORTAMENTO ESPERADO (SEM BUG DETECTADO NESTA EXECUÇÃO)**  
> Os valores das sessões reutilizadas bateram com os das sessões limpas, ou o servidor retornou erro.  
> Valores: PM10 = 5.86919067382813, PTS (Mesma Sessão) = 7.54286413126522, PTS (Sessão Limpa) = 7.54286413126522.

---

## 2. Recomendações de Mitigação

Para evitar a contaminação cruzada de dados históricos, devemos adotar o seguinte comportamento no cliente:
1. **Sessão Isolada por Requisição:** Cada par (Estação, Poluente) deve inicializar uma sessão limpa (`initPublicSession()`), recebendo novos cookies do servidor.
2. **Coleta Stateful Segura:** Implementar o parâmetro `WEBLAKES_COLLECTION_MODE=daily_validated` que isola as consultas de forma transacional.
