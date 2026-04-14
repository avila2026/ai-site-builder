# AI Site Builder - Guia do Instalador Electron (Windows)

## Visão geral

O app desktop usa:

1. `Next.js standalone` embutido no pacote.
2. `Electron Builder + NSIS` para gerar o instalador.
3. Runtime desktop com:
   - porta fixa `http://127.0.0.1:39213`
   - leitura de `.env` em `%APPDATA%\AI Site Builder\.env`
   - uploads e logs persistidos em `%APPDATA%\AI Site Builder\`

## Estrutura relevante

```text
ai-site-builder/
├── electron/
│   ├── main.js
│   ├── preload.js
│   └── build-resources/
│       ├── icon.ico
│       ├── icon.png
│       ├── installer.nsh
│       ├── uninstall-launcher.nsi
│       └── LICENSE.txt
├── scripts/
│   ├── build-electron.js
│   └── build-uninstaller-launcher.js
└── electron-builder.json
```

## Build do instalador

```bash
npm install
npm run electron:build:win
```

Artefatos:

```text
release-builder/AI Site Builder-<version>-Setup.exe
release-builder/AI Site Builder-<version>-Uninstall.exe
```

## Configuração no desktop instalado

Arquivo de ambiente do app:

```text
%APPDATA%\AI Site Builder\.env
```

Exemplo mínimo:

```env
SITE_GENERATION_PROVIDER=ollama
OLLAMA_BASE_URL=http://localhost:11434
APP_BASE_URL=http://127.0.0.1:39213
```

## Persistência local

- Uploads: `%APPDATA%\AI Site Builder\uploads`
- Logs do Electron: `%APPDATA%\AI Site Builder\logs`

O desinstalador **não remove** esses dados automaticamente (`deleteAppDataOnUninstall=false`).

Se precisar limpeza completa manual:

1. Desinstale o app.
2. Apague `%APPDATA%\AI Site Builder`.

## Troubleshooting rápido

- Falha no build do instalador: rode `npm run build` e depois `npm run electron:build:win`.
- Ícone ausente: garanta `electron/build-resources/icon.ico` (o script gera a partir de `icon.png` ou `public/icon-512.png`).
- App não abre por porta ocupada: libere `127.0.0.1:39213` ou finalize o processo que está usando a porta.
