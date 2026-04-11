---
name: Skill UI/UX Pro Max instalada
description: Skill UI/UX Pro Max v2.5.0 instalada manualmente via Git clone em .claude/skills/
type: reference
---

A skill **UI/UX Pro Max** (https://github.com/nextlevelbuilder/ui-ux-pro-max-skill) foi instalada manualmente no diretório `.claude/skills/ui-ux-pro-max/`.

**Por que instalação manual:** O comando `npx skills add` apresentou problemas com o debugger do Node no Windows, ficando travado em "Debugger attached." sem completar.

**Solução:** Clone direto do repositório Git para `.claude/skills/ui-ux-pro-max/`.

**Funcionalidades disponíveis:**
- 67 estilos UI com prompts e CSS keywords
- 161 paletas de cores por tipo de produto
- 57 combinações de fontes (Google Fonts)
- 99 diretrizes de UX e anti-patterns
- 25 tipos de gráficos
- Suporte a 10+ stacks: React, Next.js, Vue, Svelte, Tailwind, Astro, Flutter, SwiftUI, React Native

**Como usar:** A skill é ativada automaticamente pelo Claude Code quando o contexto envolve UI/UX, ou pode ser invocada via `/ui-ux-pro-max`.

**Scripts de busca disponíveis:** `python3 .claude/skills/ui-ux-pro-max/src/ui-ux-pro-max/scripts/search.py "<query>" --domain <domain>`
