# Next.js Installation Reference

Baseado na documentacao:

- titulo: `Installation`
- URL: `https://nextjs.org/docs/app/getting-started/installation`
- versao: `16.2.2`
- atualizado em: `2026-04-02`

## Quick start

Criar um novo app e rodar localmente:

```bash
pnpm create next-app@latest my-app --yes
cd my-app
pnpm dev
```

Alternativas:

```bash
npx create-next-app@latest my-app --yes
cd my-app
npm run dev
```

```bash
yarn create next-app@latest my-app --yes
cd my-app
yarn dev
```

```bash
bun create next-app@latest my-app --yes
cd my-app
bun dev
```

`--yes` pula prompts e usa defaults ou preferencias salvas. O setup padrao atual inclui:

- TypeScript
- Tailwind CSS
- ESLint
- App Router
- Turbopack
- alias `@/*`
- `AGENTS.md` com `CLAUDE.md` apontando para ele

## Requisitos de sistema

- Node.js minimo: `20.9`
- sistemas suportados: macOS, Windows, WSL e Linux

## Navegadores suportados

- Chrome 111+
- Edge 111+
- Firefox 111+
- Safari 16.4+

## Criacao com CLI

O caminho mais rapido:

```bash
pnpm create next-app
```

Ou:

```bash
npx create-next-app@latest
```

Prompts principais:

- nome do projeto
- defaults recomendados ou configuracao customizada
- TypeScript
- ESLint ou Biome
- React Compiler
- Tailwind CSS
- `src/`
- App Router
- alias de importacao
- inclusao de `AGENTS.md`

## Instalacao manual

Instale os pacotes:

```bash
pnpm i next@latest react@latest react-dom@latest
```

Scripts recomendados em `package.json`:

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

Observacoes:

- `next dev` usa Turbopack por padrao
- para Webpack: `next dev --webpack` ou `next build --webpack`
- App Router usa React canary embutido, mas `react` e `react-dom` continuam no `package.json`

## Estrutura minima com App Router

Arquivo obrigatorio:

```tsx
// app/layout.tsx
export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
```

Pagina inicial minima:

```tsx
// app/page.tsx
export default function Page() {
  return <h1>Hello, Next.js!</h1>
}
```

Se faltar o root layout, o Next.js pode criá-lo automaticamente ao rodar `next dev`.

## Pasta public

Opcional para assets estaticos como imagens e fontes.

Exemplo:

```tsx
import Image from 'next/image'

export default function Page() {
  return <Image src="/profile.png" alt="Profile" width={100} height={100} />
}
```

## Rodando localmente

1. Rode `npm run dev` ou equivalente do gerenciador
2. Acesse `http://localhost:3000`
3. Edite `app/page.tsx`

## TypeScript

- versao minima: `5.1.0`
- o Next.js tem suporte embutido
- ao renomear arquivos para `.ts` ou `.tsx` e rodar `next dev`, o projeto instala dependencias e gera `tsconfig.json`

### Plugin da IDE

No VS Code:

1. abra a command palette
2. procure `TypeScript: Select TypeScript Version`
3. escolha `Use Workspace Version`

## Linting

Pode usar ESLint ou Biome.

### ESLint

```json
{
  "scripts": {
    "lint": "eslint",
    "lint:fix": "eslint --fix"
  }
}
```

### Biome

```json
{
  "scripts": {
    "lint": "biome check",
    "format": "biome format --write"
  }
}
```

Migracao do antigo `next lint`:

```bash
npx @next/codemod@canary next-lint-to-eslint-cli .
```

Importante:

- a partir do Next.js 16, `next build` nao roda lint automaticamente
- o recomendado e manter configuracao explicita, como `eslint.config.mjs`

## Absolute imports e aliases

Exemplo no `tsconfig.json`:

```json
{
  "compilerOptions": {
    "baseUrl": "src/",
    "paths": {
      "@/styles/*": ["styles/*"],
      "@/components/*": ["components/*"]
    }
  }
}
```

Os caminhos em `paths` sao relativos ao `baseUrl`.
