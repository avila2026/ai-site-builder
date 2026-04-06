---
name: nextjs-installation
description: Use para criar, instalar, inicializar ou revisar a configuracao base de projetos Next.js com App Router, TypeScript, linting, aliases e create-next-app.
allowed-tools: Read Grep Glob Bash(pnpm *) Bash(npm *) Bash(npx *) Bash(yarn *) Bash(bun *)
---

# Next.js Installation

Para qualquer tarefa de criacao ou instalacao de projeto Next.js, siga este fluxo:

1. Consulte [reference.md](reference.md) para os comandos e convencoes atuais.
2. Verifique se o objetivo e:
   - criar um app novo com `create-next-app`
   - instalar manualmente Next.js
   - configurar TypeScript
   - configurar linting
   - configurar aliases de importacao
   - validar requisitos minimos de ambiente
3. Prefira o caminho mais simples e atualizado para chegar a um projeto funcional.
4. Em projetos novos, priorize App Router, TypeScript e configuracao moderna de lint.

Regras:

- prefira `create-next-app@latest` para bootstrap rapido
- considere que o setup padrao atual inclui TypeScript, Tailwind CSS, ESLint, App Router, Turbopack e alias `@/*`
- lembre que Next.js 16 nao roda lint automaticamente no `next build`
- se o projeto usa App Router, mantenha `app/layout.tsx` e `app/page.tsx` como base minima
- se houver instrucao local do projeto, como `AGENTS.md`, ela tem prioridade sobre memoria geral
