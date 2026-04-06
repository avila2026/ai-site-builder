---
name: review-pr
description: Revisa uma pull request com foco em qualidade, performance, seguranca, testes e documentacao. Use quando quiser uma revisao manual assistida de PR via GitHub CLI.
disable-model-invocation: true
allowed-tools: Bash(gh pr view:*), Bash(gh pr diff:*), Bash(gh pr comment:*)
---

Revise a pull request indicada em `$ARGUMENTS`.

Fluxo:

1. Rode `gh pr view $ARGUMENTS`.
2. Rode `gh pr diff $ARGUMENTS`.
3. Analise a PR com esta checklist:
   - qualidade e manutenibilidade
   - risco de seguranca
   - impactos de performance
   - lacunas de teste
   - divergencias de documentacao
4. Gere apenas feedback realmente relevante.
5. Se houver pontos objetivos e acionaveis, publique um comentario conciso com `gh pr comment`.

Regras:

- nao faca comentarios triviais
- nao force critica se a PR estiver boa
- priorize bugs, riscos, regressao comportamental e falta de testes
- mantenha o comentario curto e util
- se nao houver achados relevantes, responda ao usuario que a PR parece saudavel e nao publique comentario
