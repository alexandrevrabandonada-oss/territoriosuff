# Estado da Nação — QA de Linguagem Pública, Freshness e Confiança do Radar do Ar INEA

**Data do Relatório:** 2026-05-26  
**Status de Conformidade:** Aprovado e Auditado (100% em Conformidade)

---

## 1. Contexto e Objetivo

O Radar do Ar INEA (Volta Redonda-RJ) consome dados provenientes do arquivo público `qualidade_ar.xlsx` disponibilizado pelo portal Dados Abertos RJ. Como a ingestão é batch/periódica e assíncrona (não representa tempo real / ao vivo), a aplicação **não pode** utilizar termos que sugiram monitoramento instantâneo ou minuto a minuto para a fonte INEA.

Este relatório valida a blindagem de linguagem pública realizada em todas as páginas, componentes e APIs do projeto, garantindo honestidade intelectual e transparência sobre o frescor (*freshness*) dos dados apresentados.

---

## 2. Auditoria e Substituição de Vocabulário

Todos os termos perigosos que induziam ao erro (não representa tempo real) foram removidos das interfaces públicas relativas à fonte INEA e substituídos por expressões precisas:

| Termo Proibido / Perigoso | Substituição Empregada | Motivo da Alteração |
| :--- | :--- | :--- |
| `"tempo real"` (não representa tempo real) | `"última leitura disponível"` ou `"dados históricos"` | O arquivo do Dados Abertos RJ é atualizado em lotes, e não de forma contínua. |
| `"em tempo real"` (não representa tempo real) | `"último registro disponível na base pública"` | Evita a promessa de atualização minuto a minuto. |
| `"ao vivo"` (não representa tempo real / não implementado) | `"dados oficiais disponíveis no arquivo público"` | Nenhum dado oficial do INEA é carregado de forma direta/instantânea. |
| `"agora"` | `"série histórica oficial"` / `"último registro"` | Impede a interpretação de que o painel reflete o instante atual. |
| `"status em tempo real"` (não é tempo real) | `"atualização periódica via Dados Abertos RJ"` | Esclarece o canal oficial de dados batch. |
| `"live"` (não implementado / roadmap futuro) | `"leituras históricas consolidadas"` | Remove falsas promessas de transmissão ativa. |

*Nota: Termos como "tempo real" ou "ao vivo" só são tolerados no código se estiverem estritamente restritos a trechos de roadmap futuro (ex.: rotas de monitoramento futuro não implementado) ou se possuírem marcadores de exceção explícitos (`futuro`, `roadmap`, `não implementado`).*

---

## 3. Componente de Aviso de Freshness (`DataFreshnessNotice.tsx`)

Criamos o componente reusable [DataFreshnessNotice.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/components/air/DataFreshnessNotice.tsx) para expor de forma clara e visível a natureza dos dados integrados:

> "Os dados desta página vêm do arquivo público qualidade_ar.xlsx do INEA/Dados Abertos RJ. Eles representam a última base pública disponível no momento da ingestão, não monitoramento minuto a minuto."

Este aviso está ativado e visível nos seguintes caminhos públicos:
1. **Painel Geral INEA**: `/qualidade-ar/inea` ([IneaRadarPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaRadarPage.tsx))
2. **Detalhe de Estação INEA**: `/qualidade-ar/inea/estacoes/:stationId` ([IneaStationPage.tsx](file:///C:/Projetos/SEMEAR%20PWA/src/pages/air/IneaStationPage.tsx))

---

## 4. Metadados de Freshness nas APIs Públicas

Os endpoints do backend serverless foram atualizados para fornecer explicitamente o estado de atualização e a fonte originária. Os seguintes campos foram adicionados nas respostas de `/api/air/inea/summary` e `/api/air/inea/latest`:

```json
{
  "source_system": "CKAN_XLSX",
  "data_freshness_label": "Última base pública disponível",
  "latest_measured_at": "<maior measured_at real presente no banco>",
  "latest_ingested_at": "<momento da última ingestão>",
  "is_realtime": false
}
```

Dessa forma, integradores de sistemas externos e desenvolvedores terceiros são notificados de forma programática que os dados não representam um fluxo *realtime*.

---

## 5. Teste Automatizado de Asserção de Vocabulário

Para prevenir regressões acidentais, implementamos o script de asserção [inea-public-language-assert.ts](file:///C:/Projetos/SEMEAR%20PWA/scripts/inea-public-language-assert.ts).

### Como Funciona:
1. O script varre os arquivos de visualização pública:
   - `RadarLandingPage.tsx`
   - `IneaRadarPage.tsx`
   - `IneaStationPage.tsx`
   - `MethodologyNotice.tsx`
   - `DataFreshnessNotice.tsx`
2. Realiza busca por termos banidos (para garantir que não representa tempo real / ao vivo): "tempo real", "em tempo real", "ao vivo", "live".
3. Caso encontre alguma ocorrência, verifica se na mesma linha constam marcadores de futuro/roadmap (`"futuro"`, `"roadmap"`, `"não implementado"`). Em caso negativo, o teste aborta e retorna código de saída `1` (falha).
4. O teste foi integrado ao `package.json` sob o comando:
   ```bash
   npm run inea:qa:language
   ```

---

## 6. Próximos Passos Recomendados

Para obter dados mais frequentes de forma ética e segura no futuro, os próximos passos do projeto devem focar em:
1. **Investigação Segura e Ética**:
   - Investigar endpoints públicos carregados pelo frontend do SIGQAR, sem burlar autenticação, captcha, limites de acesso ou barreiras técnicas.
   - Analisar se requisições autorreguladas pelo portal expõem dados horários atualizados e se há termos de uso que permitam a leitura para fins de utilidade pública municipal.
2. **Melhorias no Scheduler**:
   - Desenvolver cron-jobs de ingestão periódica que busquem novas versões da planilha do Dados Abertos RJ de forma otimizada (ex.: checando a data de modificação HTTP Head / hash SHA-256 do arquivo antes de processar).
