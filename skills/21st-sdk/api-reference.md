# API Reference

REST API do runtime de 21st Agents para gerenciar sandboxes, threads, arquivos e respostas de chat em streaming.

## Base URL

`https://relay.an.dev`

Todas as requisicoes usam HTTPS, e os corpos de request e response sao codificados em JSON.

## Authentication

Todos os endpoints exigem bearer token no header `Authorization`. A chave de API deve ser criada no Dashboard.

```http
Authorization: Bearer <your_api_key>
```

## Conventions

- propriedades usam `camelCase`
- timestamps usam ISO 8601, por exemplo `2026-02-26T12:00:00Z`
- IDs usam prefixos, por exemplo `sb_` para sandboxes e `th_` para threads
- o endpoint de chat retorna Server-Sent Events (SSE)
- erros retornam JSON estruturado com `code`, `message` e `status`

## Endpoints

### Sandboxes

- `POST /v1/sandboxes` cria sandbox
- `GET /v1/sandboxes/:id` busca sandbox
- `DELETE /v1/sandboxes/:id` remove sandbox

### Sandbox Operations

- `POST /v1/sandboxes/:id/exec` executa comando
- `POST /v1/sandboxes/:id/files` escreve arquivos
- `GET /v1/sandboxes/:id/files` le arquivo
- `POST /v1/sandboxes/:id/git/clone` clona repositorio

### Threads

- `GET /v1/sandboxes/:id/threads` lista threads
- `POST /v1/sandboxes/:id/threads` cria thread
- `GET /v1/sandboxes/:id/threads/:threadId` busca thread
- `DELETE /v1/sandboxes/:id/threads/:threadId` remove thread

### Chat

- `POST /v1/chat/:slug` envia mensagem
- `GET /v1/chat/:slug/:sandboxId/stream` retoma stream
- `DELETE /v1/chat/:slug/:sandboxId/stream` cancela stream

## SDKs

- `@21st-sdk/nextjs`: abordagem recomendada para Next.js com token exchange server-side
- Server SDK: abordagem server-side para gerenciamento de sandboxes e threads
