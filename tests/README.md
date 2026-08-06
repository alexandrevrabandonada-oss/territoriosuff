# SEMEAR PWA - Smoke Tests

Testes de UI automatizados com Playwright para validar os fluxos críticos da aplicação.

## Estrutura

```
tests/
├── home.spec.ts       - Página inicial e navegação principal
├── dados.spec.ts      - Interface de monitoramento de estações
├── acervo.spec.ts     - Listagem e navegação do acervo
├── conversar.spec.ts  - Interface de conversas
└── status.spec.ts     - Página de status do sistema
```

## Executar Testes

### Modo padrão (headless)
```bash
npm run test:smoke:ui
```

### Modo debug (com interface visual)
```bash
npx playwright test --headed --grep @smoke
```

### Executar teste específico
```bash
npx playwright test tests/home.spec.ts
```

### Com relatório HTML
```bash
npx playwright test --grep @smoke
npx playwright show-report
```

## Filosofia dos Testes

Os testes são **resilientes** e focam em:
- ✅ Verificar que páginas carregam sem erros
- ✅ Elementos principais da UI estão presentes
- ✅ Navegação entre páginas funciona
- ✅ Estados de loading/empty são tratados corretamente

Os testes **não** dependem de:
- ❌ Dados específicos no banco (conteúdo pode mudar)
- ❌ Texto exato de títulos ou descrições
- ❌ Estruturas de DOM muito específicas

## Manutenção

### Quando atualizar os testes
- Mudanças significativas na estrutura de navegação
- Remoção ou adição de páginas principais
- Alterações em elementos críticos da UI

### Boas práticas
- Use seletores semânticos (roles, labels) quando possível
- Aceite múltiplos estados válidos (loading, empty, populated)
- Prefira verificações de presença vs. conteúdo exato
- Mantenha testes rápidos e focados

## CI/CD

Os testes podem ser integrados no workflow de deployment:
```yaml
- name: Install Playwright
  run: npx playwright install --with-deps chromium

- name: Run smoke tests
  run: npm run test:smoke:ui
```

## Troubleshooting

### Testes falhando localmente
1. Certifique-se de que o servidor dev está configurado corretamente
2. Verifique se as variáveis de ambiente estão carregadas
3. Tente rodar em modo headed para debug visual

### Timeouts
Se os testes estão com timeout, pode ser que:
- O servidor esteja lento para iniciar
- A página esteja aguardando dados da API
- Ajuste o timeout no `playwright.config.ts` se necessário
