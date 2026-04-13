# 🚀 AI Site Builder - Guia do Instalador

## ✅ O que foi criado

Sistema completo de instalação local com:

1. **Electron** - Empacotamento como aplicativo desktop
2. **Electron Builder** - Criação do instalador `.exe`
3. **NSIS Personalizado** - Script de instalação com atalho automático
4. **Next.js Standalone** - Servidor embutido para distribuição local

## 📁 Arquivos Criados

```text
ai-site-builder/
├── electron/
│   ├── main.js              # Ponto de entrada do Electron
│   └── preload.js           # Bridge segura entre renderer e main
├── build/
│   ├── installer.nsh        # Script NSIS (atalhos, idioma PT-BR)
│   ├── uninstall-launcher.nsi # Launcher NSIS do desinstalador standalone
│   ├── LICENSE.txt          # Licença do software
│   ├── README-INSTALLACAO.md # Guia detalhado
│   └── generate-icons.js    # Script para gerar ícones
├── scripts/
│   └── build-uninstaller-launcher.js # Gera o .exe de desinstalação
├── electron-builder.json    # Configuração do build
└── INSTALLER-GUIDE.md       # Este arquivo
```

## 🔧 Como Criar o Instalador

### Passo 1: Instalar dependências

```bash
npm install
```

### Passo 2: (Opcional) Adicionar ícone

1. Crie uma imagem 512x512 PNG do seu ícone
2. Salve como `build/source.png`
3. Converta para `.ico` usando:
   - Online: <https://convertio.co/pt/png-ico/>
   - Ou: `electron-icon-builder --input=build/source.png --output=build`

### Passo 3: Criar o instalador

```bash
npm run electron:build:win
```

### Passo 4: Encontrar os executáveis

Os artefatos estarão em:

```text
release-builder/AI Site Builder-0.1.0-Setup.exe
release-builder/AI Site Builder-0.1.0-Uninstall.exe
```

## 📦 O Instalador Faz

- ✅ Instala o aplicativo no diretório escolhido pelo usuário
- ✅ Cria atalho na **Área de Trabalho**
- ✅ Cria atalho no **Menu Iniciar**
- ✅ Adiciona em "Adicionar ou Remover Programas"
- ✅ Abre o aplicativo automaticamente após instalação
- ✅ Permite escolher diretório de instalação
- ✅ Interface em **Português Brasileiro**
- ✅ Gera um segundo `.exe` para acionar a desinstalação depois da instalação

## 🛠️ Scripts Disponíveis

| Comando | Descrição |
| --- | --- |
| `npm run electron:dev` | Roda em modo desenvolvimento (Hot Reload) |
| `npm run electron:build` | Build completo para Windows |
| `npm run electron:build:win` | Build específico para Windows |
| `npm run electron:build:uninstaller` | Regera apenas o `.exe` standalone de desinstalação |
| `npm run electron:pack` | Apenas empacota (sem criar installer) |

## 🧪 Modo Desenvolvimento

Para testar sem criar o instalador:

```bash
npm run electron:dev
```

Isso vai:

1. Iniciar o Next.js em `http://localhost:3000`
2. Abrir automaticamente no Electron
3. Ativar DevTools para debug

## ⚙️ Configurações

### electron-builder.json

```json
{
  "appId": "com.ai-site-builder.app",
  "productName": "AI Site Builder",
  "win": {
    "target": "nsis"
  },
  "nsis": {
    "oneClick": false,           // Instalador assistido
    "createDesktopShortcut": true,
    "runAfterFinish": true,      // Abre após instalar
    "language": "1046"
  }
}
```

## 📝 Notas Importantes

1. **Standalone do Next.js**: o app desktop sobe o `server.js` do build standalone dentro do Electron. Não depende de `next start` externo.

2. **Autenticação**: se usar Auth0, certifique-se que as URLs de callback incluem o caminho local.

3. **API Routes**: como o app roda com servidor Next embutido, as rotas `/api/*` continuam disponíveis localmente.

4. **Tamanho**: O instalador terá ~150-200MB devido ao Electron + Node.js embutido.

## 🐛 Solução de Problemas

### Erro: "next export" não encontrado

Nas versões mais recentes do Next.js, use:

```bash
npx next build && npx next export
```

### Ícone não aparece

Crie ícones `.ico` na pasta `build/`:

- `icon.ico` - Ícone principal
- `installer-icon.ico` - Ícone do instalador

### Build falha

Limpe e tente novamente:

```bash
./build/clean-release.ps1
npm run electron:build:win
```

## 📤 Distribuição

Após criar o instalador:

1. Teste em uma máquina limpa (sem Node.js instalado)
2. Verifique se todos os atalhos são criados
3. Teste a desinstalação
4. Distribua os arquivos `.exe` da pasta `release-builder/`

## 🔐 Assinatura de Código (Opcional)

Para evitar avisos do Windows Defender:

```json
{
  "win": {
    "sign": "path/to/signing-script.js"
  }
}
```

Mais info: <https://www.electron.build/code-signing>

---

**Pronto!** Agora você tem um instalador profissional para distribuir seu AI Site Builder! 🎉
