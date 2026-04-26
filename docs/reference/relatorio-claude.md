# Relatório Completo - Claude Code & AI Site Builder

**Data de geração:** 2026-04-13  
**Projeto:** D:\1-WORKFLOW\ai-site-builder  
**Autor:** Jean Carlos

---

## 1. DESCRIÇÃO DO CLAUDE CODE (Eu)

### 1.1 Modelo e Versão
- **Modelo Ativo:** `kimi-k2.5:cloud` (via Claude Code)
- **Versão CLI:** Latest (auto-update habilitado)
- **Canal de Atualização:** `latest`
- **Nível de Esforço:** `high` (configurado em settings.json)

### 1.2 Identidade e Capacidades
Sou o **Claude Code**, assistente CLI oficial da Anthropic para desenvolvimento de software. Minhas principais capacidades incluem:

- **Geração e edição de código** (TypeScript, React, Next.js, CSS, etc.)
- **Refatoração e otimização** de código existente
- **Análise e debugging** de problemas técnicos
- **Integração com ferramentas** (Git, npm, Playwright, etc.)
- **Navegação e análise** de codebase
- **Geração de documentação** e relatórios
- **Testes e validação** de aplicações

### 1.3 Limites de Contexto

| Limite | Valor |
|--------|-------|
| **Context Window** | ~200K tokens (modelo kimi-k2.5) |
| **Max Output Tokens** | 8192 tokens |
| **Timeout de Ferramentas** | 120 segundos (padrão), até 600s configurável |
| **Limite de Arquivos Glob** | Timeout após 20s em diretórios grandes |

### 1.4 Configurações de Permissões

```json
{
  "permissions": {
    "defaultMode": "acceptEdits"  // Aceita edições automaticamente
  }
}
```

**Hooks Configurados:**
- **PreToolUse:** Executa antes de Write/Edit/MultiEdit (via extensão VS Code)
- **PostToolUse:** Executa após Write/Edit/MultiEdit
- **Extensão:** `konan1947.claude-diff-view-1.0.1`

### 1.5 Plugins Oficiais Habilitados

Todos os plugins abaixo estão **ativos** (`enabled: true`):

| Plugin | Propósito |
|--------|-----------|
| `superpowers@claude-plugins-official` | Superpoderes (skills, planejamento, debugging) |
| `frontend-design@claude-plugins-official` | Design de interfaces frontend |
| `code-simplifier@claude-plugins-official` | Simplificação de código |
| `github@claude-plugins-official` | Integração com GitHub |
| `skill-creator@claude-plugins-official` | Criação de skills customizadas |
| `ai-plugins@claude-plugins-official` | Plugins de IA diversos |
| `context7@claude-plugins-official` | Documentação de bibliotecas |
| `code-review@claude-plugins-official` | Revisão de código |
| `feature-dev@claude-plugins-official` | Desenvolvimento de features |
| `playwright@claude-plugins-official` | Automação de browser |
| `plugin-dev@claude-plugins-official` | Desenvolvimento de plugins |
| `figma@claude-plugins-official` | Integração Figma |
| `aws-serverless@claude-plugins-official` | AWS Serverless |

### 1.6 Skills Instaladas (Globais)

Skills disponíveis em `C:\Users\Jeanc\.claude\skills\` e `C:\Users\Jeanc\.agents\skills\`:

#### Anthropic (Oficiais)
- `algorithmic-art`, `brand-guidelines`, `canvas-design`
- `doc-coauthoring`, `docx`, `frontend-design`
- `internal-comms`, `mcp-builder`, `pdf`, `pptx`
- `skill-creator`, `slack-gif-creator`, `template-skill`
- `theme-factory`, `web-artifacts-builder`, `webapp-testing`, `xlsx`

#### Vercel Labs
- `agent-browser`, `electron`
- `vercel-react-best-practices`, `web-design-guidelines`
- `find-skills`

#### Google
- `stitch-design`, `react-components`, `design-md`, `stitch-loop`
- `gemini-api-dev`, `gemini-interactions-api`, `gemini-live-api-dev`
- `vertex-ai-api-dev`

#### Microsoft
- `playwright-cli`

#### Outros
- `browser-use` (browser-use/browser-use)
- `qwen-image-2-pro` (inferen-sh/skills)
- `shadcn` (shadcn/ui)
- `remotion-best-practices` (remotion-dev)
- `industrial-brutalist-ui`, `minimalist-ui` (leonxlnx)
- `charting`, `coder`, `coingecko`, `twitter`, `wallet` (starchild-ai-agent)
- `responsive-design` (supercent-io)

### 1.7 MCP Servers Configurados

```json
{
  "mcpServers": {
    "playwright": {
      "command": "npx",
      "args": ["@playwright/test@mcp", "--headless"],
      "env": {}
    }
  }
}
```

### 1.8 Integrações Disponíveis

- **Browser/Playwright:** Automação de browser via MCP
- **Git:** Comandos git nativos (status, commit, push, etc.)
- **Shell/Bash:** Execução de comandos shell
- **File System:** Leitura/escrita de arquivos
- **Skills:** Execução de skills especializadas
- **Subagentes:** Agente parallelism para tarefas complexas

### 1.9 Memória Persistente

**Local do projeto:** `D:\1-WORKFLOW\ai-site-builder\.claude\memory\`

**Global:** `C:\Users\Jeanc\.claude\projects\D--1-WORKFLOW-ai-site-builder\memory\`

Memórias atuais:
- Configurações do Projeto
- Fluxo de Geração
- Auth0 Setup
- Bugs Corrigidos
- Funcionalidades
- Sistema de Templates e Temas
- Skill UI/UX Pro Max
- Instalador Electron
- Automação Canva
- Obsidian Vault
- Memória Observações

---

## 2. PROJETO: AI SITE BUILDER

### 2.1 Visão Geral

**Nome:** AI Site Builder  
**Versão:** 0.1.0  
**Status:** Produção Ready  
**Tipo:** Aplicação Next.js 15 com Electron Desktop  
**Node:** 22.x

### 2.2 Tech Stack

| Categoria | Tecnologia |
|-----------|------------|
| **Framework** | Next.js 15.5.14 (App Router) |
| **Runtime** | Node.js 22.x |
| **Linguagem** | TypeScript 5 |
| **Estilos** | Tailwind CSS 4 |
| **UI/UX** | Framer Motion, Lucide React |
| **Database** | Neon PostgreSQL + Drizzle ORM |
| **Auth** | Auth0 v4 |
| **IA** | Stitch SDK (Google) + Ollama |
| **Desktop** | Electron 41.2.0 + Electron Builder |
| **Deploy** | Vercel |

### 2.3 Estrutura de Pastas

```
D:\1-WORKFLOW\ai-site-builder
├── .agents/                    # Configurações de agentes
├── .claude/                     # Memória e skills do Claude
├── .electron-cache/             # Cache do Electron Builder
├── .next/                       # Build do Next.js
├── .playwright-cli/             # Config Playwright
├── .playwright-mcp/             # MCP Playwright
├── .vscode/                     # Configurações VS Code
├── build/                       # Recursos do Electron (ícones, installer.nsh)
├── descrição claude/            # ⬅️ ESTE DOCUMENTO
├── dist/                        # Distribuição
├── docs/                        # Documentação (superpowers, guides)
├── drizzle/                     # Migrations do banco
├── electron/                    # Código Electron (main.js, preload.js)
├── public/                      # Assets públicos
│   └── uploads/                 # Uploads de arquivos
├── release/                     # Build do instalador (output)
├── release-builder/             # Build alternativo
├── scripts/                     # Scripts utilitários
│   ├── build-electron.js        # Build para Electron
│   ├── stitch-smoke.mjs         # Teste Stitch
│   └── vercel-preflight.mjs     # Validação pré-deploy
├── skills/                      # Skills customizadas do projeto
│   ├── 21st-sdk/
│   ├── code-quality-reviewer/
│   ├── commit-and-pr/
│   ├── documentation-accuracy-reviewer/
│   ├── label-issue/
│   ├── neon-auth0/
│   ├── neon-github-integration/
│   ├── nextjs-installation/
│   ├── performance-reviewer/
│   ├── review-pr/
│   ├── security-code-reviewer/
│   ├── test-coverage-reviewer/
│   └── vercel-cli/
├── src/                         # Código fonte
│   ├── app/                     # App Router (Next.js 15)
│   │   ├── api/                 # API Routes
│   │   │   ├── agent/
│   │   │   ├── autonoma/
│   │   │   ├── briefs/
│   │   │   ├── browserbase/
│   │   │   ├── generate/        # ⭐ Geração de sites
│   │   │   ├── github/
│   │   │   ├── health/
│   │   │   └── upload/
│   │   ├── auth/                # Auth0 callbacks
│   │   ├── globals.css          # Estilos globais
│   │   ├── layout.tsx           # Layout raiz
│   │   ├── page.tsx             # Página inicial
│   │   └── global-error.tsx     # Tratamento de erros
│   ├── components/              # Componentes React
│   │   ├── ui/                  # Componentes UI reutilizáveis
│   │   │   ├── TemplatePreview.tsx
│   │   │   ├── ThemePreview.tsx
│   │   │   └── Tooltip.tsx
│   │   ├── BriefForm.tsx        # ⭐ Formulário de brief
│   │   ├── FileUpload.tsx       # Upload de arquivos
│   │   ├── MainLayout.tsx       # Layout principal
│   │   ├── PreloadResources.tsx # Pré-carregamento
│   │   ├── SitePreview.tsx      # Preview do site gerado
│   │   ├── Toast.tsx            # Notificações
│   │   ├── ErrorBoundary.tsx    # Boundary de erros
│   │   └── GlobalErrorFallback.tsx
│   └── lib/                     # Bibliotecas/utilitários
│       ├── db/                  # Database
│       │   ├── index.ts
│       │   └── schema.ts        # Schema Drizzle
│       ├── templates/           # Templates e temas
│       │   ├── index.ts
│       │   ├── templates/       # 8 templates
│       │   └── themes/          # 6 temas
│       ├── 21st-client.ts       # Cliente 21st.dev
│       ├── auth0.ts             # Config Auth0
│       ├── autonoma-client.ts   # Cliente Autonoma
│       ├── browserbase-client.ts
│       ├── cacheConfig.ts
│       ├── github-rest.ts
│       ├── integration-status.ts
│       ├── ollama-client.ts     # ⭐ Cliente Ollama
│       └── stitch-client.ts     # ⭐ Cliente Stitch
├── .env.local.example           # Template de envs
├── .env.local                   # ⭐ Variáveis de ambiente
├── .mcp.json                    # Config MCP
├── CLAUDE.md                    # Instruções do Claude
├── AGENTS.md                    # Regras para agentes
├── DESIGN_IMPROVEMENTS.md       # Melhorias de design
├── INSTALLER-GUIDE.md           # Guia do instalador
├── README.md                    # Documentação principal
├── electron-builder.json        # ⭐ Config Electron
├── next.config.ts               # Config Next.js
├── package.json                 # Dependências
├── skills.json                  # Skills instaladas
└── drizzle.config.ts            # Config Drizzle
```

### 2.4 Integrações e Providers

#### Geração de Sites (IA)

| Provider | Status | Modelo Padrão | Fallback |
|----------|--------|---------------|----------|
| **Stitch SDK** | ✅ Ativo | GEMINI_3_FLASH | Ollama |
| **Ollama** | ✅ Ativo | qwen3.5:cloud | - |

**Fluxo:**
```
Usuário → BriefForm → /api/generate → Provider (Stitch/Ollama) → HTML + Tailwind
```

#### Banco de Dados
- **Provider:** Neon PostgreSQL (serverless)
- **ORM:** Drizzle ORM
- **Schema:** Briefs, usuários (Auth0)

#### Autenticação
- **Provider:** Auth0 v4 (@auth0/nextjs-auth0)
- **Features:** Login social (Google, etc.), sessões, callbacks

#### Automação de Browser
- **Provider:** BrowserBase (@browserbasehq/sdk)
- **Use case:** Automação Canva, screenshots

#### API Externas
- **21st.dev:** Componentes prontos
- **Autonoma:** Execução de agentes
- **GitHub:** Exportação de código (PAT)

### 2.5 Variáveis de Ambiente (Integrações)

#### Obrigatórias
```env
# Ollama
OLLAMA_MODEL=qwen3.5:cloud

# Stitch (alternativa)
STITCH_API_KEY="..."
SITE_GENERATION_PROVIDER="ollama" | "stitch"
```

#### Opcionais (Features)
```env
# Auth0
AUTH0_DOMAIN="..."
AUTH0_CLIENT_ID="..."
AUTH0_CLIENT_SECRET="..."
AUTH0_SECRET="..."

# Database
DATABASE_URL="postgresql://..."

# 21st.dev
API_KEY_21ST="..."

# BrowserBase
BROWSERBASE_API_KEY="..."
BROWSERBASE_PROJECT_ID="..."

# GitHub Export
GITHUB_PAT="ghp_..."

# Autonoma
AUTONOMA_CLIENT_ID="..."
AUTONOMA_SECRET_ID="..."

# AI Gateway
AI_GATEWAY_API_KEY="..."
```

### 2.6 Scripts NPM

```json
{
  "dev": "next dev --turbo",
  "build": "next build",
  "start": "next start",
  "lint": "eslint .",
  "db:generate": "drizzle-kit generate",
  "db:push": "drizzle-kit push",
  "electron:dev": "concurrently -k \"npm run dev\" \"wait-on http://localhost:3000 && electron .\"",
  "electron:build": "node scripts/build-electron.js && electron-builder",
  "electron:build:win": "node scripts/build-electron.js && electron-builder --win",
  "stitch:smoke": "node scripts/stitch-smoke.mjs",
  "vercel:preflight": "node scripts/vercel-preflight.mjs"
}
```

### 2.7 Sistema de Templates e Temas

#### Templates (8 disponíveis)
1. **business-corporate** - Corporativo formal
2. **business-modern** - Moderno empresarial
3. **portfolio-creative** - Portfólio criativo
4. **portfolio-minimal** - Portfólio minimalista
5. **ecommerce-clean** - E-commerce limpo
6. **landing-gradient** - Landing page com gradientes
7. **blog-editorial** - Blog editorial
8. **personal-card** - Cartão pessoal

#### Temas (6 disponíveis)
1. **corporate-blue** - Azul corporativo
2. **creative-gradient** - Gradiente criativo
3. **dark-neon** - Neon escuro
4. **minimal-white** - Minimalista branco
5. **modern-dark** - Moderno escuro
6. **modern-light** - Moderno claro

### 2.8 Electron Desktop App

**Configuração:** `electron-builder.json`

```json
{
  "appId": "com.ai-site-builder.app",
  "productName": "AI Site Builder",
  "output": "release-builder",
  "win": {
    "target": "nsis",
    "oneClick": false,
    "createDesktopShortcut": true,
    "runAfterFinish": true,
    "language": "PTBR"
  }
}
```

**Instalador Windows:**
- Arquivo: `AI Site Builder-0.1.0-Setup.exe`
- Tamanho: ~150-200MB
- Idioma: Português Brasileiro
- Atalhos: Desktop + Menu Iniciar
- Local de instalação: `C:\Program Files\AI Site Builder`

### 2.9 Design System (Implementado)

#### Cores Principais
```css
--primary: #8b5cf6      /* Roxo */
--primary-glow: #7c3aed
--secondary: #ec4899    /* Rosa */
--secondary-glow: #db2777
--accent: #06b6d4       /* Ciano */
--accent-glow: #0891b2
```

#### Padrões UI
- **Transições:** 300ms, easing ease/ease-out
- **Border Radius:** 1rem (variável --radius)
- **Hover Scale:** 1.05 - 1.10
- **Glow Effects:** box-shadow com rgba(139, 92, 246, 0.3)

#### Componentes UI Custom
1. **Tooltip** - 4 posições, delay 200ms
2. **TemplatePreview** - SVG dinâmico por categoria
3. **ThemePreview** - Preview de paleta completa
4. **Toast** - Stacking, progress bar temporal
5. **FileUpload** - Drag & drop com animações

---

## 3. HIERARQUIA DE CONFIGURAÇÕES

### 3.1 Ordem de Precedência

1. **CLAUDE.md** - Instruções do projeto (aponta para AGENTS.md)
2. **AGENTS.md** - Regras para agentes (Next.js breaking changes)
3. **settings.json** - Configurações globais do Claude
4. **.env.local** - Variáveis de ambiente do projeto
5. **skills.json** - Skills disponíveis no projeto

### 3.2 Instruções Críticas (AGENTS.md)

> **⚠️ WARNING:** This is NOT the Next.js you know
> 
> This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

**Impacto:** Devio verificar documentação do Next.js 15 antes de escrever código.

---

## 4. RESUMO DAS CAPACIDADES

### 4.1 O que posso fazer neste projeto

✅ **Geração de Sites**
- Criar briefs personalizados
- Escolher templates (8 opções)
- Escolher temas (6 opções)
- Gerar via Stitch SDK (Google) ou Ollama
- Preview em tempo real
- Exportar HTML

✅ **Automação Canva**
- Criar designs em lote
- Baixar automaticamente
- Scripts Playwright configurados

✅ **Instalador Desktop**
- Build para Windows (.exe)
- NSIS com PT-BR
- Atalhos automáticos

✅ **Desenvolvimento**
- Criar/editar componentes React/Next.js
- Gerenciar banco Drizzle/Neon
- Configurar Auth0
- Deploy na Vercel

### 4.2 Minhas Restrições

❌ **Não posso:**
- Acessar APIs sem chaves configuradas
- Modificar .env.local (arquivo local do usuário)
- Deploy automático sem confirmação
- Ações destrutivas sem permissão (rm -rf, git push --force)

⚠️ **Requer confirmação:**
- Push para main/master
- Excluir arquivos/branches
- Modificar CI/CD
- Commits com secrets

---

## 5. PRÓXIMOS PASSOS SUGERIDOS

### Melhorias Técnicas
1. [ ] Adicionar testes E2E com Playwright
2. [ ] Implementar cache de geração no Redis
3. [ ] Adicionar rate limiting na API
4. [ ] Melhorar error boundaries

### Features de Produto
1. [ ] Exportar para mais formatos (PDF, ZIP)
2. [ ] Integração com mais providers (OpenAI, Anthropic)
3. [ ] Sistema de planos/billing
4. [ ] Analytics de uso

### Documentação
1. [ ] API documentation (OpenAPI/Swagger)
2. [ ] Storybook para componentes
3. [ ] Tutorial em vídeo

---

## 6. REFERÊNCIAS RÁPIDAS

### Comandos Úteis
```bash
# Desenvolvimento
npm run dev                    # Iniciar dev server
npm run electron:dev           # Modo Electron

# Build
npm run build                  # Build Next.js
npm run electron:build:win     # Criar instalador

# Database
npm run db:generate            # Gerar migrations
npm run db:push                # Aplicar migrations

# Testes
npm run stitch:smoke           # Testar Stitch
npm run vercel:preflight       # Validação Vercel
```

### Links Importantes
- **Stitch:** https://stitch.withgoogle.com/
- **Neon:** https://neon.tech/
- **Auth0:** https://auth0.com/
- **Vercel:** https://vercel.com/
- **Ollama:** https://ollama.ai/

### Memória de Longo Prazo
- **Obsidian Vault:** `D:/1-WORKFLOW/Obsidian/vault/`
- **Claude Memory:** `C:\Users\Jeanc\.claude\projects\D--1-WORKFLOW-ai-site-builder\memory\`

---

**Fim do Relatório**  
Gerado por Claude Code em 2026-04-13
