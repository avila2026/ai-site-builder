# GitHub MCP Integration Design

**Data:** 2026-04-11
**Status:** Aprovado
**Autor:** AI Site Builder Team

---

## 1. Visão Geral

Integração do AI Site Builder com GitHub via Model Context Protocol (MCP) para automaticamente criar repositórios e enviar código gerado após a geração de sites.

### Problema

Atualmente, após gerar um site, o usuário precisa manualmente:
1. Criar um repositório no GitHub
2. Configurar autenticação
3. Fazer push do código

### Solução

Fluxo automático via MCP:
1. Site gerado → 2. MCP cria repo → 3. MCP faz push → 4. Repo pronto no GitHub

---

## 2. Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Fluxo de Geração de Site                 │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  1. Site gerado via IA (Stitch/Ollama)                      │
│     - /dist (site estático)                                 │
│     - Raiz do projeto (Next.js)                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  2. GitHub MCP Server (OAuth)                               │
│     - POST /user/repos (criar repositório)                  │
│     - PUT /repos/{owner}/{repo}/contents/* (push)           │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  3. Repositório criado no GitHub do usuário                 │
│     - Nome: ai-site-builder                                 │
│     - Visibilidade: privada                                 │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Componentes

### 3.1 Configuração MCP (`.mcp.json`)

```json
{
  "github": {
    "type": "sse",
    "url": "https://mcp.github.com/sse"
  }
}
```

**Tipo:** SSE (Server-Sent Events)
**Autenticação:** OAuth automático (usuário autoriza no browser na primeira vez)

### 3.2 Cliente GitHub (`src/lib/github-mcp.ts`)

Módulo helper que encapsula operações GitHub:

```typescript
// Funções exportadas:
- createRepository(name: string, private: boolean): Promise<Repository>
- pushFiles(repo: string, files: File[]): Promise<void>
- exportToGitHub(siteData: SiteData): Promise<ExportResult>
```

### 3.3 API Route (`src/app/api/github/export/route.ts`)

Endpoint POST que:
1. Recebe dados do site gerado
2. Chama `exportToGitHub()`
3. Retorna URL do repositório criado

---

## 4. Fluxo de Dados

### 4.1 Criação de Repositório

```
POST /api/github/export
  ↓
[github-mcp.ts] exportToGitHub()
  ↓
[GitHub MCP] createRepository("ai-site-builder", private: true)
  ↓
GitHub API → 201 Created
  ↓
Retorna: { owner, repo, html_url }
```

### 4.2 Push de Arquivos

```
[github-mcp.ts] pushFiles(repo, files)
  ↓
Para cada arquivo:
  - Codificar conteúdo em Base64
  - PUT /repos/{owner}/{repo}/contents/{path}
  ↓
GitHub API → 201 Created (por arquivo)
```

### 4.3 Estrutura de Arquivos no Repo

```
ai-site-builder/
├── dist/              # Site estático (build output)
│   ├── index.html
│   ├── styles.css
│   └── assets/
├── src/               # Projeto Next.js
├── package.json
├── next.config.ts
└── README.md
```

---

## 5. Tratamento de Erros

### Cenários de Erro

| Erro | Causa | Ação |
|------|-------|------|
| `401 Unauthorized` | OAuth expirado/não autorizado | Redirecionar para fluxo de auth |
| `403 Forbidden` | Scope insuficiente | Pedir usuário para revisar scopes |
| `422 Unprocessable` | Repo já existe | Sugerir nome alternativo ou update |
| `429 Too Many Requests` | Rate limit | Retry com backoff exponencial |
| `500 Server Error` | MCP/GitHub indisponível | Retry 3x, depois falhar |

### Política de Retry

```typescript
const MAX_RETRIES = 3;
const BASE_DELAY = 1000; // 1s

async function withRetry<T>(fn: () => Promise<T>): Promise<T> {
  for (let i = 0; i < MAX_RETRIES; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === MAX_RETRIES - 1) throw error;
      await delay(BASE_DELAY * Math.pow(2, i));
    }
  }
}
```

---

## 6. Testes

### 6.1 Testes Unitários

- `github-mcp.ts` — Mock do MCP server
- Testar codificação Base64
- Testar retry logic

### 6.2 Testes de Integração

- Criar repo real (em conta de teste)
- Fazer push de arquivos de teste
- Verificar no GitHub

### 6.3 Testes E2E

- Gerar site completo
- Exportar para GitHub
- Verificar repo criado com estrutura correta

---

## 7. Segurança

### Credenciais

- ✅ OAuth gerenciado pelo MCP (sem tokens no código)
- ✅ Scopes mínimos: `repo` (criar repo, push)
- ✅ Nunca commitar `.env` com credenciais

### Boas Práticas

- Validar inputs antes de chamar MCP
- Sanitizar nomes de repositório
- Log sem dados sensíveis
- Rate limiting na API route

---

## 8. Implmentação

### Fase 1: Configuração
1. Criar `.mcp.json` com servidor GitHub
2. Testar conexão com `/mcp` command

### Fase 2: Cliente
3. Criar `src/lib/github-mcp.ts`
4. Implementar `createRepository()`
5. Implementar `pushFiles()`

### Fase 3: API
6. Criar `src/app/api/github/export/route.ts`
7. Integrar com fluxo de geração existente

### Fase 4: Testes
8. Testes unitários
9. Testes de integração
10. Teste E2E completo

---

## 9. Critérios de Sucesso

- [ ] Repositório criado automaticamente após gerar site
- [ ] Código pushado com estrutura correta
- [ ] OAuth funciona sem configuração manual
- [ ] Erros tratados graciosamente
- [ ] Tests passando

---

## 10. Dependências

- `@modelcontextprotocol/server-github` (MCP oficial)
- OAuth do GitHub habilitado na conta do usuário

---

## 11. Notas

- Nome do repositório: fixo (`ai-site-builder`)
- Visibilidade: privada (padrão)
- Conteúdo: site estático + projeto Next.js completo
