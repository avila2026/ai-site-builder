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
STITCH_PROJECT_ID="1827742389953977950" # opcional (usa projeto fixo)
SITE_GENERATION_PROVIDER="stitch" # ou ollama
STITCH_FALLBACK_TO_OLLAMA="true"
STITCH_MODEL_ID="GEMINI_3_FLASH"
STITCH_DEVICE_TYPE="DESKTOP"
STITCH_PROJECT_TITLE="AI Site Builder"
STITCH_HTML_FETCH_TIMEOUT_MS="45000" # opcional
STITCH_HEALTH_TIMEOUT_MS="5000" # opcional
```

## Fluxo técnico

1. `/api/generate` escolhe o provider pelo `SITE_GENERATION_PROVIDER`.
2. Em `stitch`, o backend:
   - cria/seleciona projeto no Stitch
   - gera uma screen por prompt
   - obtém `htmlUrl` e `imageUrl`
   - baixa o HTML final e devolve no campo `code`
3. Se `STITCH_FALLBACK_TO_OLLAMA=true`, falhas do Stitch caem para Ollama.
   - Apenas erros recuperáveis fazem fallback (ex.: timeout/rede/rate limit).
   - Erro de autenticação/configuração do Stitch retorna erro direto.

## Preview no Vercel

Env mínimo para preview:

```env
STITCH_API_KEY="..."
STITCH_PROJECT_ID="1827742389953977950"
SITE_GENERATION_PROVIDER="stitch"
```

Validação local antes do deploy:

```bash
npm run vercel:preflight
```

O preflight:
- valida o conjunto mínimo de envs para preview
- alerta sobre integrações opcionais ausentes
- imprime o projeto Vercel vinculado, o provider ativo e o projeto Stitch alvo

## Resposta de streaming

- `status`: progresso
- `complete`: inclui
  - `provider`
  - `code` (HTML pronto para preview)
  - `artifacts` com `htmlUrl`, `imageUrl`, `projectId`, `screenId`

## Protocolo de stream

- O endpoint usa **NDJSON** (`application/x-ndjson`), uma linha JSON por evento.
- O frontend usa parser incremental com buffer para lidar com chunks fragmentados.
