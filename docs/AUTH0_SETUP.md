# Auth0 - Guia de Configuração

## Visão Geral

O AI Site Builder integra Auth0 para autenticação de usuários com:
- Login social (Google, GitHub, etc.)
- Sessão persistente
- Salvamento de briefs no banco de dados

## Configuração no Auth0

### 1. Criar Aplicação

1. Acesse https://manage.auth0.com
2. **Applications > Create Application**
3. Nome: `AI Site Builder`
4. Tipo: **Single Page Web Applications**

### 2. Configurar URLs

Em **Settings > Application URIs**, configure:

```
Allowed Callback URLs:
- http://localhost:3000/api/auth/callback
- https://seu-app.vercel.app/api/auth/callback

Allowed Logout URLs:
- http://localhost:3000
- https://seu-app.vercel.app

Allowed Web Origins:
- http://localhost:3000
- https://seu-app.vercel.app
```

### 3. Configurar Conexões

Em **Authentication > Social**:

1. Ative **Google** (recomendado)
2. Ative **GitHub** (opcional)
3. Configure as credenciais de cada provider

### 4. Obter Credenciais

Em **Settings > Basic Information**:

- **Domain**: `seu-tenant.us.auth0.com`
- **Client ID**: `seu-client-id`
- **Client Secret**: Clique em "Reveal" para ver

## Configuração no Projeto

### 1. Gerar AUTH0_SECRET

```bash
# Linux/Mac
openssl rand -hex 32

# Windows (PowerShell)
[System.Web.Security.Membership]::GeneratePassword(64, 0)
```

### 2. Adicionar ao .env.local

```env
# Auth0
AUTH0_DOMAIN="seu-tenant.us.auth0.com"
AUTH0_CLIENT_ID="seu-client-id"
AUTH0_CLIENT_SECRET="seu-client-secret"
AUTH0_SECRET="gerado-acima-minimo-32-caracteres"
APP_BASE_URL="http://localhost:3000"
```

### 3. Para Produção (Vercel)

No dashboard da Vercel, adicione:

```env
AUTH0_DOMAIN="seu-tenant.us.auth0.com"
AUTH0_CLIENT_ID="seu-client-id"
AUTH0_CLIENT_SECRET="seu-client-secret"
AUTH0_SECRET="mesmo-segredo-ou-gerar-novo"
APP_BASE_URL="https://seu-app.vercel.app"
```

## Como Funciona

### Endpoints Criados

| Endpoint | Descrição |
|----------|-----------|
| `GET /api/auth/login` | Inicia fluxo de login |
| `GET /api/auth/logout` | Encerra sessão |
| `GET /api/auth/callback` | Callback do Auth0 |

### Fluxo de Login

```
1. Usuário clica "Entrar"
   └─▶ /api/auth/login?returnTo=/
       │
2. Auth0 SDK redireciona para Auth0
   │
3. Usuário autentica (Google, GitHub, etc.)
   │
4. Auth0 redireciona para /api/auth/callback
   │
5. Callback valida e salva usuário no DB
   │
6. Redireciona para / (com sessão)
```

### Componente AuthBar

O layout (`src/app/layout.tsx`) inclui uma barra de autenticação:

- **Não logado**: Mostra link "Entrar com Auth0"
- **Logado**: Mostra nome do usuário e link "Sair"

## Banco de Dados

O Auth0 integration salva usuários na tabela `users`:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth0_sub TEXT NOT NULL UNIQUE,  -- ID do Auth0
  email TEXT NOT NULL,
  name TEXT,
  picture TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Aplicar Schema

```bash
npm run db:generate  # Criar migration
npm run db:push      # Aplicar no Neon
```

## Testar Localmente

1. Configure as variáveis no `.env.local`
2. Rode `npm run dev`
3. Acesse http://localhost:3000
4. Clique em "Entrar com Auth0"
5. Autentique com Google

## Troubleshooting

### "Auth0 não configurado"

Verifique se todas as 4 variáveis estão no `.env.local`:
- `AUTH0_DOMAIN`
- `AUTH0_CLIENT_ID`
- `AUTH0_CLIENT_SECRET`
- `AUTH0_SECRET`

### Callback Error 400

Verifique no Auth0 Dashboard:
- Allowed Callback URLs inclui `/api/auth/callback`
- URL está correta (localhost vs produção)

### Sessão Não Persiste

- `AUTH0_SECRET` deve ter mínimo 32 caracteres
- Mesmo segredo entre localhost e produção (ou diferente por ambiente)

### Usuário Não Salva no DB

- Verifique se `DATABASE_URL` está configurada
- Rode `npm run db:push` para criar tabelas
- Logs mostram warning, mas login ainda funciona

## Customização

### Proteger Rotas

```typescript
import { auth0 } from "@/lib/auth0";

export default async function ProtectedPage() {
  const session = await auth0.getSession();
  
  if (!session) {
    redirect("/api/auth/login");
  }
  
  // Conteúdo protegido
}
```

### Obter Usuário Logado

```typescript
import { auth0 } from "@/lib/auth0";

const session = await auth0.getSession();
const user = session?.user;
// user.email, user.name, user.picture, user.sub
```

## Links Úteis

- [Auth0 Docs](https://auth0.com/docs)
- [@auth0/nextjs-auth0 SDK](https://github.com/auth0/nextjs-auth0)
- [Auth0 Dashboard](https://manage.auth0.com)
