---
name: neon-github-integration
description: Use para configurar, revisar ou evoluir a integracao entre Neon e GitHub, incluindo GitHub App, secrets, variables e workflows de branch por pull request.
allowed-tools: Read Grep Glob
---

# Neon GitHub Integration

Para qualquer tarefa envolvendo Neon + GitHub Actions, siga este fluxo:

1. Consulte [reference.md](reference.md) para o funcionamento da integracao e o workflow base.
2. Identifique se a tarefa e de:
   - instalar a GitHub App do Neon
   - conectar um projeto Neon a um repositorio GitHub
   - criar workflow de preview branch por PR
   - rodar migrations em branch temporaria
   - publicar schema diff na PR
   - limpar branch Neon ao fechar PR
3. Verifique se o fluxo depende de `NEON_API_KEY` e `NEON_PROJECT_ID`.
4. Ao editar workflows, mantenha a logica de criacao e delecao de branch previsivel e reversivel.

Regras:

- trate o workflow fornecido pelo Neon como template inicial, nao como regra fixa
- nunca exponha `DATABASE_URL`, `NEON_API_KEY` ou outros segredos em logs
- quando precisar usar a URL do banco criada dinamicamente, mantenha migrations e testes no mesmo job que cria a branch
- se houver multiplos projetos Neon, confirme qual `NEON_PROJECT_ID` deve ser usado
- conectar o mesmo repositorio GitHub a projetos Neon diferentes nao e suportado
