---
name: neon-auth0
description: Use para integrar Neon Postgres com Auth0 em aplicacoes Next.js, incluindo setup do projeto, variaveis de ambiente, Drizzle ORM, rotas de autenticacao e persistencia de dados por usuario autenticado.
allowed-tools: Read Grep Glob
---

# Neon + Auth0

Para qualquer tarefa envolvendo Neon com Auth0 em Next.js, siga este fluxo:

1. Consulte [reference.md](reference.md) para o fluxo completo de integracao.
2. Identifique se a tarefa e de:
   - bootstrap de projeto Next.js
   - configuracao do Auth0
   - conexao com Neon
   - modelagem com Drizzle
   - geracao de migrations
   - rotas e sessao de autenticacao
   - leitura e escrita associadas ao usuario autenticado
3. Mantenha separacao clara entre codigo server-only, auth e UI.
4. Trate `user.sub` do Auth0 como identificador estavel do usuario na tabela da aplicacao.

Regras:

- use `DATABASE_URL` apenas no servidor
- nao exponha `AUTH0_CLIENT_SECRET`, `AUTH0_SECRET` ou segredos do banco no client
- prefira `@neondatabase/serverless` com Drizzle para integracao simples com Next.js
- valide se o projeto precisa mesmo de Auth0 antes de adotar dependencia externa, pois Neon Auth pode ser uma alternativa mais simples
- se usar o workaround de `esmExternals: 'loose'`, trate isso como compatibilidade temporaria e reavalie depois
