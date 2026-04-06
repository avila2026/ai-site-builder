---
name: commit-and-pr
description: Executa um fluxo de entrega local: validar alteracoes, commitar, subir branch e abrir pull request. Use quando quiser transformar mudancas locais em PR com seguranca e checklist minima.
disable-model-invocation: true
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git commit:*), Bash(git push:*), Bash(npm test:*), Bash(npm run *), Bash(gh pr create:*), Bash(gh pr view:*)
---

Conclua o fluxo de entrega para as alteracoes atuais. Considere `$ARGUMENTS` como contexto opcional para o titulo ou descricao da PR.

Fluxo:

1. Inspecione o estado com `git status` e `git diff --stat`.
2. Execute validacoes relevantes para o projeto:
   - testes
   - lint
   - typecheck
   - build leve, se fizer sentido
3. Se algo falhar, pare e explique a causa.
4. Se estiver tudo consistente, prepare um commit claro.
5. Faca push da branch atual.
6. Abra uma PR com `gh pr create`.

Regras:

- nao faca commit cego sem revisar o escopo
- nao inclua arquivos nao relacionados sem necessidade
- use mensagem de commit objetiva
- se houver alteracoes suspeitas ou muito amplas, pare e sinalize antes de prosseguir
