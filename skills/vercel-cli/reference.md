# Vercel CLI Reference

Resumo pratico da Vercel CLI com base na documentacao atualizada em 11 de marco de 2026.

## Instalacao

```bash
pnpm i -g vercel
```

## Atualizacao

```bash
pnpm i -g vercel@latest
```

## Versao instalada

```bash
vercel --version
```

## CI/CD

Em ambiente sem interacao manual, use token:

```bash
vercel deploy --token=$VERCEL_TOKEN
```

## Fluxo comum de projeto

```bash
vercel link
vercel pull .env.local
vercel dev
vercel deploy
```

## Comandos principais

### Deploy e ambiente local

- `vercel`
- `vercel deploy`
- `vercel deploy --prod`
- `vercel dev`
- `vercel build`

### Projeto e vinculacao

- `vercel link`
- `vercel open`
- `vercel project ls`
- `vercel project inspect [project-name]`

### Variaveis de ambiente

- `vercel env ls`
- `vercel env add [name] [environment]`
- `vercel env update [name] [environment]`
- `vercel env rm [name] [environment]`
- `vercel env pull [file]`
- `vercel env run -- <command>`
- `vercel pull`

### Logs e debug

- `vercel list`
- `vercel inspect [deployment-id-or-url]`
- `vercel inspect [deployment-id-or-url] --logs`
- `vercel inspect [deployment-id-or-url] --wait`
- `vercel logs [deployment-url]`
- `vercel logs [deployment-url] --follow`
- `vercel httpstat [path]`
- `vercel curl [path]`

### API e integracoes

- `vercel api [endpoint]`
- `vercel integration discover`
- `vercel integration add <integration-name>`
- `vercel integration list [project-name]`
- `vercel install <integration-name>`
- `vercel mcp`

### Dominio e DNS

- `vercel alias set [deployment-url] [custom-domain]`
- `vercel alias rm [custom-domain]`
- `vercel alias ls`
- `vercel domains ls`
- `vercel domains add [domain] [project]`
- `vercel dns ls [domain]`
- `vercel dns add [domain] [name] [type] [value]`

### Operacao e recuperacao

- `vercel redeploy [deployment-id-or-url]`
- `vercel rollback [deployment-id-or-url]`
- `vercel promote [deployment-id-or-url]`
- `vercel remove [deployment-url]`
- `vercel cache purge`

## Heuristica de uso

- para primeiro setup local: `vercel link` + `vercel pull`
- para rodar local parecendo a Vercel: `vercel dev`
- para investigar deploy quebrado: `vercel inspect --logs` + `vercel logs`
- para testar endpoint protegido: `vercel curl`
- para medir latencia HTTP: `vercel httpstat`
- para operar envs: `vercel env *`
