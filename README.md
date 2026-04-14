# AI Site Builder

Construtor de sites com IA usando Next.js 15, Stitch SDK, Ollama e múltiplos providers de IA.

## Status do Projeto

✅ **Produção Ready** - Integrado com Vercel, Stitch SDK, Neon Database e Auth0

## Features

- **Geração com IA**: Stitch SDK (Google) ou Ollama (cloud/local)
- **Fallback Automático**: Se Stitch falhar, usa Ollama automaticamente
- **Preview na Vercel**: Deploy rápido com validação prévia
- **Auth0**: Autenticação opcional com login social
- **Database**: Neon PostgreSQL para salvar briefs e usuários
- **Streaming**: Resposta em tempo real com NDJSON

## Quick Start

### 1. Instalar dependências

```bash
npm install
```

### 2. Configurar ambiente

```bash
cp .env.local.example .env.local
# Edite .env.local com suas credenciais
```

### 3. Rodar em desenvolvimento

```bash
npm run dev
```

Acesse: http://localhost:3000

## Comandos Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Servidor de desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Start em produção |
| `npm run vercel:preflight` | Validação pré-deploy Vercel |
| `npm run stitch:smoke` | Smoke test da integração Stitch |
| `npm run db:generate` | Gerar migrations do banco |
| `npm run db:push` | Aplicar migrations no banco |
| `npm run electron:dev` | Rodar app desktop em desenvolvimento |
| `npm run electron:build:win` | Gerar instalador Windows do desktop |

## Variáveis de Ambiente

### Obrigatórias (Stitch)

```env
STITCH_API_KEY="..."
STITCH_PROJECT_ID="1827742389953977950"
SITE_GENERATION_PROVIDER="stitch"
```

### Obrigatórias (Ollama)

```env
OLLAMA_MODEL="gemma4:31b-cloud"
```

### Opcionais

```env
# Auth0
AUTH0_DOMAIN="..."
AUTH0_CLIENT_ID="..."
AUTH0_CLIENT_SECRET="..."
AUTH0_SECRET="..."

# Database (Neon)
DATABASE_URL="postgresql://..."

# 21st.dev
TWENTY_FIRST_DEV_API_KEY="..."

# BrowserBase
BROWSERBASE_API_KEY="..."
BROWSERBASE_PROJECT_ID="..."
```

## Arquitetura

### Providers de Geração

```
┌─────────────────┐
│  /api/generate  │
└────────┬────────┘
         │
    ┌────┴────┐
    │  Escolhe provider pelo SITE_GENERATION_PROVIDER
    ├─────────────────────┬──────────────────────┐
    │                     │                      │
┌───▼────┐          ┌────▼─────┐           ┌────▼────┐
│ Stitch │          │  Ollama  │           │ Fallback│
│  SDK   │─────────▶│  Cloud   │◀──────────│ Automático│
└────────┘          └──────────┘           └─────────┘
```

### Fluxo de Geração

1. Usuário preenche brief no frontend
2. `/api/generate` escolhe provider (Stitch ou Ollama)
3. IA gera HTML com Tailwind CSS
4. Streaming NDJSON envia progresso em tempo real
5. Frontend renderiza preview

## Estrutura do Projeto

```
ai-site-builder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/       # Endpoints Auth0
│   │   │   ├── generate/   # Geração de sites
│   │   │   ├── health/     # Health check
│   │   │   └── ...
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   ├── lib/
│   │   ├── auth0.ts        # Configuração Auth0
│   │   ├── stitch-client.ts # Cliente Stitch
│   │   ├── ollama-client.ts # Cliente Ollama
│   │   └── db/             # Database (Neon)
│   └── ...
├── scripts/
│   ├── vercel-preflight.mjs # Validação pré-deploy
│   └── stitch-smoke.mjs     # Smoke test Stitch
├── docs/
│   ├── OLLAMA_SETUP.md      # Setup Ollama local
│   └── VERCEL_DEPLOY.md     # Guia de deploy
└── .env.local.example
```

## Deploy na Vercel

### 1. Vincular projeto

```bash
vercel link
```

### 2. Configurar envs no Dashboard

Adicione as variáveis em **Settings > Environment Variables**

### 3. Validar localmente

```bash
npm run vercel:preflight
```

### 4. Deploy

```bash
vercel          # Preview
vercel --prod   # Produção
```

Veja [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md) para detalhes.

## Ollama Local

Para usar Ollama local ao invés de cloud:

1. Instale Ollama: https://ollama.ai
2. Baixe modelo: `ollama pull gemma4:31b-cloud`
3. Configure no `.env.local`:

```env
OLLAMA_MODEL=gemma4:31b-cloud
OLLAMA_BASE_URL=http://localhost:11434
SITE_GENERATION_PROVIDER=ollama
```

Veja [docs/OLLAMA_SETUP.md](docs/OLLAMA_SETUP.md) para detalhes.

## Desktop Electron (Windows)

- Porta local fixa no app instalado: `http://127.0.0.1:39213`
- Arquivo de ambiente no desktop instalado: `%APPDATA%\\AI Site Builder\\.env`
- Uploads persistidos em: `%APPDATA%\\AI Site Builder\\uploads`

Guia completo: [INSTALLER-GUIDE.md](INSTALLER-GUIDE.md)

## Integrações

| Serviço | Status | Docs |
|---------|--------|------|
| Stitch SDK | ✅ Ativo | [docs/STITCH_INTEGRATION.md](docs/STITCH_INTEGRATION.md) |
| Ollama | ✅ Cloud/Local | [docs/OLLAMA_SETUP.md](docs/OLLAMA_SETUP.md) |
| Vercel | ✅ Deploy | [docs/VERCEL_DEPLOY.md](docs/VERCEL_DEPLOY.md) |
| Neon DB | ✅ Configurado | - |
| Auth0 | ✅ Pronto | [docs/AUTH0_SETUP.md](docs/AUTH0_SETUP.md) |
| BrowserBase | ✅ Configurado | - |
| 21st.dev | ✅ Configurado | - |
| Autonoma | ✅ Configurado | [docs/AUTONOMA_API_OVERVIEW.md](docs/AUTONOMA_API_OVERVIEW.md) |

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Linguagem**: TypeScript 5
- **Estilos**: Tailwind CSS 4
- **UI**: Framer Motion, Lucide React
- **IA**: Stitch SDK, Ollama
- **Database**: Neon PostgreSQL + Drizzle ORM
- **Auth**: Auth0
- **Deploy**: Vercel

## Contribuidores

- Jean Carlos

## Licença

MIT
