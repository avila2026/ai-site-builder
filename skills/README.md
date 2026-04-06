Estas skills foram validadas e convertidas para o formato moderno do Claude Code:

- cada skill fica em `skills/<nome>/SKILL.md`
- a estrutura e o frontmatter seguem o padrao documentado em `code.claude.com/docs/en/slash-commands`
- os arquivos foram adaptados do repositorio `anthropics/claude-code-action`

Importante:

- esta pasta `skills/` funciona como biblioteca local de skills prontas para instalar
- para o Claude Code carregar automaticamente em um projeto, copie ou linke cada pasta para `.claude/skills/<nome>/`
- os arquivos de `agents/` do repositorio original nao foram copiados "como skill" porque sao subagentes, nao skills
- os comandos que dependiam de wrappers do GitHub Action foram convertidos para `gh` e `git` genericos

Skills incluidas:

- `21st-sdk`
- `code-quality-reviewer`
- `documentation-accuracy-reviewer`
- `neon-auth0`
- `neon-github-integration`
- `nextjs-installation`
- `performance-reviewer`
- `security-code-reviewer`
- `test-coverage-reviewer`
- `review-pr`
- `label-issue`
- `commit-and-pr`
- `vercel-cli`
