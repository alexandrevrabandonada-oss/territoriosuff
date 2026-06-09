# Estado da Nação — Radar INEA UX Sprint 5 — Checklist de QA Visual

Este documento apresenta a verificação visual detalhada das modificações estéticas e estruturais introduzidas na página `/qualidade-ar/inea` (Radar INEA) durante a **UX Sprint 5: Acabamento visual, consistência e polish final**.

---

## 1. Compactação do Hero e Contraste
- [x] **Redução de Padding Vertical**: O Hero foi ajustado de `min-h-[18rem]` para uso de paddings compactos (`py-8 md:py-10`), garantindo rápido acesso visual aos modos de navegação sem necessidade de rolagem excessiva.
- [x] **Alinhamento de KPIs**: As estatísticas de controle cívico foram organizadas em um grid flexível de 4 colunas em telas de desktop (1366px de largura) e 2x2 em telas mobile, evitando quebras desnecessárias.
- [x] **Correção de Contraste**: Substituição de textos escuros (`text-slate-800`) sobre o fundo escuro do gradiente do Hero por classes de alto contraste (`text-white` e `text-slate-300`), assegurando legibilidade de nível profissional (WCAG AA).

## 2. Padronização e Subnavegação Sticky
- [x] **Subnav Pills**: Botões de navegação lateral/subnavegação agora usam o formato de cápsulas com área de toque ampliada (`px-4 py-2.5`) e bordas leves.
- [x] **Rolagem Horizontal**: Mobile exibe rolagem horizontal suave (`overflow-x-auto whitespace-nowrap`) com indicação discreta de continuidade de conteúdo.
- [x] **Feedback de Estado Ativo**: A aba ativa possui destaque de cor (`bg-slate-800 text-white`) e sombra sutil para imediata orientação do usuário.

## 3. Estruturação dos Modos (Abas)
- [x] **Modo Geral / Overview**: Cabeçalho com pergunta-chave e rodapé apontando para próximo passo.
- [x] **Modo Mapa (Atlas Temático)**: Header limpo, controles agrupados (1. O que ver? / 2. Quando? / 3. Como comparar?), mapa integrado e painel lateral reajustado.
- [x] **Modo Tempo (Episódios de Atenção)**: Apresentação sazonal unificada com ranking de integridade de dados e matriz de sazonalidade mensal.
- [x] **Modo Território (Exposição Social)**: Mapa interativo integrando setores censitários (Censo 2022) e equipamentos vulneráveis.
- [x] **Modo Estações**: Grid limpo de cartões analíticos com destaque visual de conformidade/ultrapassagem de limites.
- [x] **Modo Metodologia e Dados**: Tabela unificada de Downloads de microdados e FAQ estruturado em cartões informativos consistentes.

## 4. Alinhamento de Cartões (Três Famílias)
- [x] **Cartões Informativos**: Uso consistente de fundos claros (`bg-slate-50/50 border border-slate-200/60`) para explicações pedagógicas, downloads e FAQ.
- [x] **Cartões Analíticos**: Fundos escuros de alto contraste (`bg-slate-950 border border-slate-800 text-slate-300`) ou padrões claros com bordas fortes (`border-2 border-slate-800`) para grids de monitoramento de estações.
- [x] **Cartões de Ação**: Uso de gradientes ricos (`from-slate-900 to-slate-800 border border-slate-800`) para banners de engajamento social (ex: canal de denúncias ou LAI).

## 5. Contraste de Painéis Escuros (Sidebars)
- [x] **Sidebar do Atlas Temático (`AirAtlasMap.tsx`)**: Fundo `bg-slate-950`, rótulos em `text-slate-300` e valores expressivos em `text-white` para assegurar legibilidade em notebooks e telas com reflexo.
- [x] **Sidebar de Exposição Social (`SocialExposureMap.tsx`)**: Fundo `bg-slate-950`, rótulos em `text-slate-300`, nota do setor em `text-slate-300` sobre `bg-slate-900/60` e valores demográficos em `text-white font-mono` de alto contraste.
- [x] **Remoção de Ghost Classes**: Eliminação total de classes de cores de Tailwind não existentes, como `text-slate-350`, `text-slate-250`, `to-slate-850` e `border-slate-750`.

---
*Checklist de QA Visual gerado e verificado pelo time SEMEAR em 01/06/2026.*
