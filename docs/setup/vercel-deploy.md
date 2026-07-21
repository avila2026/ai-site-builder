# Deploy na Vercel - Guia Completo

## Pré-requisitos

1. Conta na Vercel (https://vercel.com)
2. Vercel CLI instalada: `npm i -g vercel`
3. Projeto vinculado: `vercel link`

## Passo a Passo

### 1. Vincular ao Projeto Vercel

```bash
# Login na Vercel
vercel login

# Vincular projeto existente
vercel link

# Ou criar novo projeto
vercel
```

O projeto já está vinculado ao ID: `prj_GOPqthxRaYOgVQB1n6uAzr6CbJCX`

### 2. Configurar Variáveis de Ambiente

No dashboard da Vercel, acesse **Settings > Environment Variables** e adicione:

#### Obrigatórias (Preview com Stitch)

```env
STITCH_API_KEY="AQ.Ab8RN6LmdgFzVIkq1Fq0rS0xPPXyPY3XXGnG1wgS5kQVNr1-2Q"
STITCH_PROJECT_ID="1827742389953977950"
SITE_GENERATION_PROVIDER="stitch"
```

#### Opcionais (Funcionalidades Adicionais)

```env
# Auth0 (Autenticação)
AUTH0_DOMAIN="seu-tenant.us.auth0.com"
AUTH0_CLIENT_ID="seu-client-id"
AUTH0_CLIENT_SECRET="seu-client-secret"
AUTH0_SECRET="gere-com-openssl-rand-hex-32"
APP_BASE_URL="https://seu-app.vercel.app"

# Database (Neon PostgreSQL)
DATABASE_URL="postgresql://usuario:senha@host/database?sslmode=require"

# 21st.dev (Design Components)
TWENTY_FIRST_DEV_API_KEY="sua-api-key"

# BrowserBase (Browser Automation)
BROWSERBASE_API_KEY="sua-api-key"
BROWSERBASE_PROJECT_ID="seu-project-id"

# AI Gateway (Fallback entre providers)
AI_GATEWAY_API_KEY="sua-api-key"
AI_GATEWAY_BYOK="seu-byok-key"
```

### 3. Validar Configuração Local

Antes de fazer deploy, valide localmente:

```bash
npm run vercel:preflight
```

Saída esperada:
```
Vercel preflight
- linked project: ai-site-builder
- active provider: stitch
- stitch project target: 1827742389953977950
- optional envs: todas presentes (ou lista de ausentes)
- result: preview-ready
```

### 4. Deploy

```bash
# Deploy de preview (branch não-main)
vercel

# Deploy de produção (branch main)
vercel --prod
```

### 5. Acessar Preview

Após o deploy, acesse:
- Preview: `https://<branch>-<hash>.vercel.app`
- Produção: `https://<seu-domínio>.vercel.app`

## Configurações do Projeto

### Node.js Version

O projeto usa Node.js 22.x (definido em `package.json`):

```json
"engines": {
  "node": "22.x"
}
```

### Build & Output

Configurado em `next.config.ts`:
- Output: `standalone` (otimizado para Vercel)
- Imagens: domínios externos permitidos (Stitch, etc.)

### Scripts Disponíveis

```bash
npm run dev          # Desenvolvimento local
npm run build        # Build de produção
npm run start        # Start em produção
npm run vercel:preflight  # Validação pré-deploy
npm run stitch:smoke # Smoke test da integração Stitch
```

## Integrações Verificadas

| Integração | Status | Env Required |
|------------|--------|--------------|
| Stitch SDK | ✅ Configurado | `STITCH_API_KEY`, `STITCH_PROJECT_ID` |
| Ollama | ✅ Cloud/Local | `OLLAMA_MODEL` |
| Neon Database | ✅ Configurado | `DATABASE_URL` |
| Auth0 | ✅ Pronto | `AUTH0_*` |
| BrowserBase | ✅ Configurado | `BROWSERBASE_*` |
| 21st.dev | ✅ Configurado | `TWENTY_FIRST_DEV_API_KEY` |

## Troubleshooting

### Build Falha

```bash
# Verifique logs detalhados
vercel logs <deployment-url>

# Teste build localmente
npm run build
```

### Stitch Não Funciona no Preview

1. Verifique se `SITE_GENERATION_PROVIDER=stitch`
2. Confirme `STITCH_API_KEY` e `STITCH_PROJECT_ID` estão no Vercel
3. Rode `npm run vercel:preflight` localmente

### Database Error

```bash
# Verifique conexão local primeiro
npm run db:push

# Confirme DATABASE_URL no Vercel
# Formato: postgresql://user:pass@host/db?sslmode=require
```

### Auth0 Não Redireciona

1. `APP_BASE_URL` deve bater com o domínio da Vercel
2. No Auth0, adicione o domínio da Vercel em:
   - Allowed Callback URLs
   - Allowed Logout URLs
   - Allowed Web Origins

## Domínio Personalizado

1. No Vercel Dashboard: **Settings > Domains**
2. Adicione seu domínio
3. Configure DNS conforme instruído
4. Atualize `APP_BASE_URL` no Vercel

## Rollback

```bash
# Listar deployments
vercel ls

# Rollback para deployment anterior
vercel rollback <deployment-id>
```

## Links Úteis

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Next.js Deploy Docs](https://nextjs.org/docs/app/building-your-application/deploying)
- [Vercel CLI Docs](https://vercel.com/docs/cli)
