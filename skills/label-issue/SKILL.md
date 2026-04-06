---
name: label-issue
description: Analisa uma issue no GitHub e aplica labels usando o gh CLI. Use quando quiser classificar bugs, features, prioridades e duplicatas sem comentar na issue.
disable-model-invocation: true
allowed-tools: Bash(gh label list:*), Bash(gh issue view:*), Bash(gh issue edit:*), Bash(gh search:*)
---

Analise e rotule a issue `$ARGUMENTS`.

Fluxo:

1. Rode `gh label list`.
2. Rode `gh issue view $ARGUMENTS`.
3. Use `gh search issues` quando precisar encontrar issues parecidas.
4. Escolha labels que representem:
   - tipo da issue
   - area tecnica
   - impacto e prioridade
   - plataforma, quando aplicavel
   - duplicidade, apenas se for realmente duplicata de issue aberta
5. Aplique labels com `gh issue edit $ARGUMENTS --add-label`.

Regras:

- nao publique comentarios
- nao invente labels que nao existem no repositorio
- se nao houver label adequada, nao aplique
- prefira precisao a excesso de labels
