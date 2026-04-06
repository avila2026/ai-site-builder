# Stitch SDK Integration

Referência oficial: https://stitch.withgoogle.com/docs  
SDK oficial: https://github.com/google-labs-code/stitch-sdk

## O que foi integrado

- Provider `stitch` no endpoint `POST /api/generate`
- Fallback opcional para `ollama`
- Health check de configuração (`stitch.connected`)
- Status em `/api/agent/status` (`stitchApiKey`)

## Variáveis de ambiente

```env
STITCH_API_KEY="..."
STITCH_HOST="https://stitch.googleapis.com/mcp" # opcional
SITE_GENERATION_PROVIDER="stitch" # ou ollama
STITCH_FALLBACK_TO_OLLAMA="true"
STITCH_MODEL_ID="GEMINI_3_FLASH"
STITCH_DEVICE_TYPE="DESKTOP"
STITCH_PROJECT_TITLE="AI Site Builder"
```

## Fluxo técnico

1. `/api/generate` escolhe o provider pelo `SITE_GENERATION_PROVIDER`.
2. Em `stitch`, o backend:
   - cria/seleciona projeto no Stitch
   - gera uma screen por prompt
   - obtém `htmlUrl` e `imageUrl`
   - baixa o HTML final e devolve no campo `code`
3. Se `STITCH_FALLBACK_TO_OLLAMA=true`, falhas do Stitch caem para Ollama.

## Resposta de streaming

- `status`: progresso
- `complete`: inclui
  - `provider`
  - `code` (HTML pronto para preview)
  - `artifacts` com `htmlUrl`, `imageUrl`, `projectId`, `screenId`
