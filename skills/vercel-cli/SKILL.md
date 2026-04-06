---
name: vercel-cli
description: Use para tarefas com Vercel CLI, como deploy, link de projeto, pull de envs, logs, inspect, rollback e operacao de projetos Vercel via terminal.
allowed-tools: Bash(vercel *)
---

# Vercel CLI

Para qualquer tarefa envolvendo operacao de projeto na Vercel via terminal, siga este fluxo:

1. Consulte [reference.md](reference.md) para os comandos e padroes principais.
2. Identifique se a tarefa e de:
   - deploy
   - ambiente local
   - variaveis de ambiente
   - logs e debug
   - dominio e DNS
   - rollback ou redeploy
3. Use o menor conjunto de comandos necessario para concluir a tarefa.
4. Em CI/CD, prefira autenticacao com `--token` em vez de fluxo interativo.

Regras:

- antes de deploy, verifique se o projeto esta linkado
- para sincronizar ambiente, prefira `vercel pull`
- para debug, priorize `vercel inspect`, `vercel logs`, `vercel httpstat` e `vercel curl`
- para a maioria dos projetos Next.js, o fluxo padrao comeca em `vercel link`, `vercel pull`, `vercel dev` e `vercel deploy`
- se a acao puder afetar producao, confirme o alvo e o ambiente antes de executar
