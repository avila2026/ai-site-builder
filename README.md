# AI Site Builder

Construtor de sites com IA usando Next.js 15, Stitch SDK (Google), Ollama e Auth0.

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Framework | Next.js 15 (App Router) + React 19 |
| Linguagem | TypeScript 5 |
| Estilos | Tailwind CSS 4 |
| IA — cloud | Stitch SDK (Google) |
| IA — local | Ollama |
| Database | Neon PostgreSQL + Drizzle ORM |
| Auth | Auth0 v4 |
| Desktop | Electron 41 (Windows) |
| Deploy | Vercel |

## Quick Start

```bash
# 1. Instalar dependências
npm install

# 2. Configurar ambiente
cp .env.local.example .env.local
# Edite .env.local com suas credenciais

# 3. Rodar em desenvolvimento
npm run dev
```

Acesse: http://localhost:3000

## Comandos

| Comando | Descrição |
|---------|-----------|
| `npm run dev` | Dev server (Next.js 15 + Turbopack) |
| `npm run build` | Build de produção |
| `npm run start` | Servidor de produção |
| `npm run vercel:preflight` | Validação pré-deploy Vercel |
| `npm run stitch:smoke` | Smoke test da integração Stitch |
| `npm run db:generate` | Gerar migrations Drizzle |
| `npm run db:push` | Aplicar migrations no Neon |
| `npm run electron:dev` | App desktop em desenvolvimento |
| `npm run electron:build:win` | Gerar instalador Windows (.exe) |

## Variáveis de Ambiente

```env
# Provedor de geração (obrigatório: "stitch" ou "ollama")
SITE_GENERATION_PROVIDER="stitch"

# Stitch (Google)
STITCH_API_KEY="..."
STITCH_PROJECT_ID="..."

# Ollama (local ou cloud)
OLLAMA_MODEL="gemma4:31b-cloud"
OLLAMA_BASE_URL="http://localhost:11434"   # padrão local

# Auth0 (opcional — se não configurado, auth é bypassada)
AUTH0_DOMAIN="..."
AUTH0_CLIENT_ID="..."
AUTH0_CLIENT_SECRET="..."
AUTH0_SECRET="..."                          # string aleatória ≥ 32 chars

# Database Neon (opcional — necessário para salvar briefs)
DATABASE_URL="postgresql://..."

# Outros providers (opcionais)
TWENTY_FIRST_DEV_API_KEY="..."
BROWSERBASE_API_KEY="..."
BROWSERBASE_PROJECT_ID="..."
AUTONOMA_CLIENT_ID="..."
AUTONOMA_SECRET_ID="..."
GITHUB_PAT="..."                            # para exportar sites como repositório
```

Consulte [.env.local.example](.env.local.example) para a lista completa.

## Arquitetura

### Fluxo de Geração

```
POST /api/generate
       │
       ├── SITE_GENERATION_PROVIDER=stitch
       │       └── Stitch SDK → HTML gerado
       │               └── (erro recuperável) → fallback Ollama
       │
       └── SITE_GENERATION_PROVIDER=ollama
               └── Ollama → conteúdo → código HTML/Tailwind
                       └── stream NDJSON → frontend → <SitePreview>
```

### Estrutura do Projeto

```
ai-site-builder/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── agent/          # sandbox 21st.dev e status de integrações
│   │   │   ├── autonoma/       # trigger de testes Autonoma
│   │   │   ├── briefs/         # CRUD de briefs salvos (requer auth + db)
│   │   │   ├── browserbase/    # sessões de browser remoto
│   │   │   ├── generate/       # geração de sites (Stitch ou Ollama)
│   │   │   ├── github/         # exportar site como repositório GitHub
│   │   │   ├── health/         # status de todas as integrações
│   │   │   ├── upload/         # upload de arquivos (logo, imagens, prompt)
│   │   │   └── uploads/        # servir arquivos uploaded
│   │   ├── auth/               # rotas Auth0 (login, logout, callback)
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── components/
│   │   ├── BriefForm.tsx        # formulário principal de geração
│   │   ├── FileUpload.tsx       # upload de arquivos
│   │   ├── SitePreview.tsx      # iframe de preview do HTML gerado
│   │   ├── Toast.tsx            # notificações
│   │   └── ui/                 # TemplatePreview, ThemePreview
│   ├── lib/
│   │   ├── auth/               # auth0.ts, app-base-url.ts
│   │   ├── db/                 # schema Drizzle, conexão Neon
│   │   ├── providers/          # stitch-client, ollama-client, github-rest,
│   │   │                       # autonoma-client, browserbase-client, 21st-client
│   │   ├── templates/          # 8 templates, 6 temas, prompt builder
│   │   └── utils/              # integration-status, cacheConfig
│   └── middleware.ts           # proteção de rotas via Auth0
│
├── electron/
│   ├── main.js                 # processo principal (IPC, janela, .env parser)
│   └── preload.js              # bridge contextIsolation
│
├── scripts/
│   ├── build-electron.js       # prepara build Electron
│   ├── vercel-preflight.mjs    # valida envs antes do deploy
│   └── stitch-smoke.mjs        # smoke test Stitch
│
├── docs/
│   ├── setup/                  # auth0.md, ollama.md, vercel-deploy.md
│   ├── integrations/           # stitch.md, autonoma-api.md, autonoma-vercel.md
│   ├── guides/                 # installer.md, design-improvements.md
│   └── reference/              # performance.md
│
├── drizzle/                    # migrations geradas pelo Drizzle Kit
├── projects/                   # sites de exemplo/gerados
└── public/
```

## Deploy na Vercel

```bash
# 1. Vincular projeto
vercel link

# 2. Validar envs localmente
npm run vercel:preflight

# 3. Deploy
vercel          # preview
vercel --prod   # produção
```

Veja [docs/setup/vercel-deploy.md](docs/setup/vercel-deploy.md) para detalhes completos.

## Ollama Local

```bash
# Instale Ollama em https://ollama.ai e baixe o modelo
ollama pull gemma4:12b

# Configure no .env.local
OLLAMA_MODEL=gemma4:12b
OLLAMA_BASE_URL=http://localhost:11434
SITE_GENERATION_PROVIDER=ollama
```

Veja [docs/setup/ollama.md](docs/setup/ollama.md).

## Desktop Electron (Windows)

- **Dev**: `npm run electron:dev` (abre Next.js + janela Electron)
- **Build**: `npm run electron:build:win` → gera `.exe` instalador em `release/`
- **Porta no instalado**: `http://127.0.0.1:39213`
- **Arquivo de ambiente**: `%APPDATA%\AI Site Builder\.env`
- **Uploads**: `%APPDATA%\AI Site Builder\uploads`

Veja [docs/guides/installer.md](docs/guides/installer.md).

## Auth0

Auth0 é **opcional**. Se as variáveis `AUTH0_*` não estiverem definidas, o middleware bypassa autenticação (útil em desenvolvimento local e modo Electron offline).

Veja [docs/setup/auth0.md](docs/setup/auth0.md).

## Integrações

| Serviço | Docs |
|---------|------|
| Stitch SDK | [docs/integrations/stitch.md](docs/integrations/stitch.md) |
| Autonoma | [docs/integrations/autonoma-api.md](docs/integrations/autonoma-api.md) |
| Vercel | [docs/setup/vercel-deploy.md](docs/setup/vercel-deploy.md) |
| Auth0 | [docs/setup/auth0.md](docs/setup/auth0.md) |
| Ollama | [docs/setup/ollama.md](docs/setup/ollama.md) |

## Autor

Jean Carlos — MIT
