# AI Site Builder - Memória de Sessão

## 📋 Estado Atual (última atualização)

O build do Electron para Windows (NSIS installer) **ainda não foi concluído com sucesso**. Estamos muito próximos, mas ainda há um erro de idioma no NSIS para resolver.

---

## 🔧 Correções já aplicadas

### 1. ✅ package.json — adicionados description e author
```json
"description": "AI Site Builder - Crie sites inteligentes com IA",
"author": "AI Site Builder Team",
```

### 2. ✅ electron-builder.json — asar habilitado
- Mudou de `"asar": false` para `"asar": true`

### 3. ✅ electron-builder.json — cache no mesmo drive (D:)
- Adicionado `"electronDownload": { "cache": "D:/1-WORKFLOW/ai-site-builder/.electron-cache" }`
- Problema original: cache do electron-builder ficava em `C:\Users\Jeanc\AppData\Local\electron-builder\Cache` (drive C:) mas o projeto está no drive D:. O NSIS não conseguia mover arquivos entre drives diferentes.
- Cache foi criado em `D:\1-WORKFLOW\ai-site-builder\.electron-cache\`
- NSIS 3.0.4.1 foi copiado manualmente para o cache no drive D

### 4. ⏳ electron-builder.json — código de idioma NSIS (EM PROGRESSO)
- Original: `"language": "pt_BR"`, `"installerLanguages": ["pt_BR", "en_US"]`
- Erro: `VIAddVersionKey: "/LANG=pt_BR" is not a valid language code!`
- Tentativa 1: `"PortugueseBR"` — falhou com `Language name is unknown for portuguesebr`
- Tentativa 2: `"pt-BR"` — **AINDA NÃO TESTADA** ← próximo passo

---

## ❌ Erros enfrentados (histórico)

### Erro 1: Cross-drive file move
```
cannot move downloaded into final location → The system cannot move the file to a different disk drive
ENOENT: no such file or directory, copyfile
```
- **Causa**: Cache do electron-builder em C: mas projeto em D:
- **Solução**: Configurar `electronDownload.cache` para caminho no D:
- **Status**: ✅ Resolvido

### Erro 2: Código de idioma NSIS inválido (pt_BR)
```
VIAddVersionKey: "/LANG=pt_BR" is not a valid language code!
```
- **Causa**: NSIS não reconhece `pt_BR` como código de idioma
- **Solução**: Precisa usar formato que o electron-builder mapeia corretamente para NSIS
- **Status**: ⏳ Tentando `pt-BR` (BCP-47)

### Erro 3: Nome de idioma desconhecido (PortugueseBR)
```
Language name is unknown for portuguesebr
```
- **Causa**: electron-builder não reconhece `PortugueseBR` no mapeamento interno
- **Solução**: Voltar para formato BCP-47 (`pt-BR`)
- **Status**: ⏳ Pendente de teste

---

## 🗂️ Arquivos importantes

| Arquivo | Caminho |
|---------|---------|
| Config do build | `D:\1-WORKFLOW\ai-site-builder\electron-builder.json` |
| Package.json | `D:\1-WORKFLOW\ai-site-builder\package.json` |
| Entry point Electron | `D:\1-WORKFLOW\ai-site-builder\electron\main.js` |
| Script de build | `D:\1-WORKFLOW\ai-site-builder\scripts\build-electron.js` |
| NSIS custom script | `D:\1-WORKFLOW\ai-site-builder\build\installer.nsh` |
| Ícone | `D:\1-WORKFLOW\ai-site-builder\build\icon.png` |
| Licença | `D:\1-WORKFLOW\ai-site-builder\build\LICENSE.txt` |
| Cache local | `D:\1-WORKFLOW\ai-site-builder\.electron-cache\` |
| Saída do build | `D:\1-WORKFLOW\ai-site-builder\release-builder\` |

---

## 📌 Próximos passos (o que fazer ao retomar)

1. **Testar build com `pt-BR`** — já está no electron-builder.json, só precisa rodar:
   ```bash
   cd "D:\1-WORKFLOW\ai-site-builder" && ELECTRON_BUILDER_CACHE="D:/1-WORKFLOW/ai-site-builder/.electron-cache" npx electron-builder --win nsis --publish never
   ```
   Usar timeout de 600s (10 min) pois a compressão NSIS demora.

2. **Se `pt-BR` também falhar**, tentar as alternativas:
   - Locale ID numérico: `"language": "1046"` (Brazilian Portuguese)
   - Remover `language` e `installerLanguages` completamente (usa inglês padrão)
   - Usar apenas `"language": "en-US"` para garantir o build primeiro

3. **Verificar o installer.nsh** — o `$(br)` pode não ser uma variável NSIS válida. O correto para quebra de linha no NSIS é `$\r$\n` ou `$\n`. Corrigir se necessário.

4. **Após build bem-sucedido**, verificar se o `AI Site Builder-0.1.0-Setup.exe` foi gerado em `release-builder/`

---

## 💡 Contexto do projeto

- **Tipo**: Electron + Next.js (standalone)
- **Electron**: v41.2.0
- **Next.js**: v15.5.14
- **electron-builder**: v26.8.1
- **Node**: 22.x
- **Plataforma alvo**: Windows (NSIS installer)
- **Modo**: `asar: true`, compressão `maximum`
- **Build Next.js standalone**: ✅ Já existe em `.next/standalone`

---

## 📊 Estado dos arquivos de saída (release-builder)

Arquivos presentes na última verificação:
- `win-unpacked/` — diretório com app descompactada ✅
- `ai-site-builder-0.1.0-x64.nsis.7z` — arquivo 7z compactado ✅
- `builder-debug.yml` — metadata ✅
- `AI Site Builder-0.1.0-Setup.exe` — ❌ AINDA NÃO GERADO (este é o objetivo final)