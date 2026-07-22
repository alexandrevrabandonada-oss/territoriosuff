# TWA - Trusted Web Activity para Android

Este diretório contém a configuração para gerar o aplicativo Android do SEMEAR usando Bubblewrap.

## Pré-requisitos

1. **Node.js** 18+ e **npm** instalados
2. **Java JDK** 17+ configurado (`JAVA_HOME`)
3. **Android SDK** instalado (via Android Studio ou command line tools)
4. **Bubblewrap CLI** instalado globalmente:
   ```bash
   npm install -g @bubblewrap/cli
   ```

## Configuração Inicial

### 1. Copiar arquivo de exemplo
```bash
cp bubblewrap.config.json.example bubblewrap.config.json
```

### 2. Editar configuração
Ajuste os seguintes campos no `bubblewrap.config.json`:
- `host`: Seu domínio em produção
- `packageId`: Package name único (ex: `br.org.semear.pwa`)
- `iconUrl`: URL completa do ícone 512x512
- `maskableIconUrl`: URL do ícone maskable adaptativo

### 3. Validar assetlinks.json
Certifique-se de que o arquivo `.well-known/assetlinks.json` está publicado e acessível em:
```
https://seu-dominio.com/.well-known/assetlinks.json
```

Consulte `docs/TWA.md` para o checklist completo.

## Gerar Aplicativo

### Inicializar projeto TWA
```bash
cd twa
bubblewrap init --manifest=https://www.semearsf.org/manifest.webmanifest
```

### Criar keystore (primeira vez)
```bash
bubblewrap update
```

Responda as perguntas:
- Keystore password: (senha segura)
- Key alias: `semear-key`
- Key password: (mesma senha ou diferente)

### Build do APK (teste local)
```bash
bubblewrap build
```

O APK será gerado em `./app-release-signed.apk`.

### Build do AAB (Play Store)
```bash
bubblewrap build --targetSigningMode=apk
```

O arquivo `.aab` será gerado para upload na Play Console.

## Testar Localmente

```bash
# Instalar APK em dispositivo conectado
adb install app-release-signed.apk
```

## Publicar na Play Store

1. Acesse [Google Play Console](https://play.google.com/console)
2. Crie um novo aplicativo
3. Configure a página da loja (ícones, screenshots, descrições)
4. Envie o arquivo `.aab` gerado
5. Configure assinatura do app (se necessário)
6. Submeta para revisão

## Arquivos Importantes

- **bubblewrap.config.json**: Configuração do TWA
- **android.keystore**: Chave de assinatura (NUNCA commitar!)
- **.well-known/assetlinks.json**: Link verification (deploy no domínio)

## Troubleshooting

### Erro "Digital Asset Links verification failed"
- Verifique se `assetlinks.json` está acessível publicamente
- Confirme que o SHA-256 fingerprint está correto
- Use o [Asset Links Tester](https://developers.google.com/digital-asset-links/tools/generator)

### Keystore perdido
Se você perder o keystore, **não será possível atualizar o app** na Play Store. Mantenha backup seguro!

## Links Úteis

- [Bubblewrap Documentation](https://github.com/GoogleChromeLabs/bubblewrap)
- [TWA Quality Criteria](https://developer.chrome.com/docs/android/trusted-web-activity/)
- [Play Console](https://play.google.com/console)
