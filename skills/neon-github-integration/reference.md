# Neon GitHub Integration Reference

Baseado na documentacao:

- localizacao: `Tools & Workflows > Integrations (3rd party) > Develop > GitHub integration`
- indice geral da documentacao Neon: `https://neon.com/docs/llms.txt`

## Visao geral

A integracao do Neon com GitHub conecta um projeto Neon Postgres a um repositorio GitHub e facilita a criacao de workflows com GitHub Actions.

Exemplo de uso:

- criar uma branch de banco para cada pull request
- aplicar migrations nessa branch
- comparar schema e comentar a diff na PR
- apagar a branch Neon ao fechar a PR

O Neon instala uma GitHub App e, ao conectar um projeto a um repositorio, cria:

- secret `NEON_API_KEY`
- variable `NEON_PROJECT_ID`

Esses valores permitem que workflows interajam com o projeto Neon via Actions, API ou CLI.

## Pre-requisitos

- conta e projeto no Neon
- conta GitHub
- repositorio GitHub que sera conectado ao projeto Neon

## Como funciona

Fluxo geral:

1. instalar a GitHub App do Neon
2. autorizar todos os repositorios ou apenas alguns
3. conectar um projeto Neon a um repositorio GitHub
4. adicionar um workflow GitHub Actions no repositorio

Observacao:

- o workflow de exemplo do Neon e um template basico que pode e deve ser customizado

## Instalar a GitHub App e conectar o projeto

No Neon Console:

1. abra a pagina `Integrations` do projeto
2. localize o card `GitHub` e clique em `Add`
3. clique em `Install GitHub App`
4. escolha a conta GitHub
5. autorize para todos os repositorios ou apenas os selecionados
6. escolha o repositorio a conectar ao projeto Neon e clique em `Connect`

Ao final, o Neon mostra a aba `Actions` com um workflow de exemplo.

## Workflow de exemplo

O workflow base faz:

- cria branch Neon ao abrir, reabrir ou sincronizar PR
- permite adicionar migration no meio do job
- permite adicionar schema diff comentando na PR
- apaga a branch Neon ao fechar a PR

### Exemplo de workflow

```yaml
name: Create/Delete Branch for Pull Request

on:
  pull_request:
    types:
      - opened
      - reopened
      - synchronize
      - closed

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}

jobs:
  setup:
    name: Setup
    outputs:
      branch: ${{ steps.branch_name.outputs.current_branch }}
    runs-on: ubuntu-latest
    steps:
      - name: Get branch name
        id: branch_name
        uses: tj-actions/branch-names@v8

  create_neon_branch:
    name: Create Neon Branch
    outputs:
      db_url: ${{ steps.create_neon_branch_encode.outputs.db_url }}
      db_url_with_pooler: ${{ steps.create_neon_branch_encode.outputs.db_url_with_pooler }}
    needs: setup
    if: |
      github.event_name == 'pull_request' && (
      github.event.action == 'synchronize'
      || github.event.action == 'opened'
      || github.event.action == 'reopened')
    runs-on: ubuntu-latest
    steps:
      - name: Create Neon Branch
        id: create_neon_branch
        uses: neondatabase/create-branch-action@v5
        with:
          project_id: ${{ vars.NEON_PROJECT_ID }}
          branch_name: preview/pr-${{ github.event.number }}-${{ needs.setup.outputs.branch }}
          api_key: ${{ secrets.NEON_API_KEY }}

  delete_neon_branch:
    name: Delete Neon Branch
    needs: setup
    if: github.event_name == 'pull_request' && github.event.action == 'closed'
    runs-on: ubuntu-latest
    steps:
      - name: Delete Neon Branch
        uses: neondatabase/delete-branch-action@v3
        with:
          project_id: ${{ vars.NEON_PROJECT_ID }}
          branch: preview/pr-${{ github.event.number }}-${{ needs.setup.outputs.branch }}
          api_key: ${{ secrets.NEON_API_KEY }}
```

## Migrations e schema diff

O job que cria a branch pode usar a URL do banco criada dinamicamente:

- `steps.create_neon_branch.outputs.db_url_with_pooler`

Exemplo de migration:

```yaml
- name: Run Migrations
  run: npm run db:migrate
  env:
    DATABASE_URL: "${{ steps.create_neon_branch.outputs.db_url_with_pooler }}"
```

Exemplo de schema diff:

```yaml
- name: Post Schema Diff Comment to PR
  uses: neondatabase/schema-diff-action@v1
  with:
    project_id: ${{ vars.NEON_PROJECT_ID }}
    compare_branch: preview/pr-${{ github.event.number }}-${{ needs.setup.outputs.branch }}
    api_key: ${{ secrets.NEON_API_KEY }}
```

Para comentar na PR, o job precisa de permissoes:

```yaml
permissions:
  contents: read
  pull-requests: write
```

## Dica importante sobre outputs

Os outputs do `create_neon_branch` ficam disponiveis apenas no mesmo job.

Implicacao pratica:

- rode migrations, testes e passos que dependem da `DATABASE_URL` no mesmo job
- se precisar quebrar em jobs separados, use padroes proprios do GitHub Actions para transportar dados com seguranca

## Reset de branch Neon

O Neon tambem fornece `reset-branch-action`, util para resetar uma branch de desenvolvimento para o estado atual da branch pai.

Exemplo:

```yaml
reset_neon_branch:
  name: Reset Neon Branch
  needs: setup
  if: |
    contains(github.event.pull_request.labels.*.name, 'Reset Neon Branch') &&
    github.event_name == 'pull_request' &&
    (github.event.action == 'synchronize' ||
     github.event.action == 'opened' ||
     github.event.action == 'reopened' ||
     github.event.action == 'labeled')
  runs-on: ubuntu-latest
  steps:
    - name: Reset Neon Branch
      uses: neondatabase/reset-branch-action@v1
      with:
        project_id: ${{ vars.NEON_PROJECT_ID }}
        parent: true
        branch: preview/pr-${{ github.event.number }}-${{ needs.setup.outputs.branch }}
        api_key: ${{ secrets.NEON_API_KEY }}
```

## Actions disponiveis

- `neondatabase/create-branch-action`
- `neondatabase/delete-branch-action`
- `neondatabase/schema-diff-action`
- `neondatabase/reset-branch-action`

## Segredos e variaveis criados pela integracao

Quando um projeto Neon e conectado a um repositorio GitHub, a integracao:

- gera uma Neon API key
- cria o secret `NEON_API_KEY` no repositorio
- cria a variable `NEON_PROJECT_ID` no repositorio

Esses itens sao usados pelos workflows para operar no projeto Neon.

### O que cada um faz

- `NEON_API_KEY`
  Permite usar Neon API ou Neon CLI
- `NEON_PROJECT_ID`
  Define em qual projeto Neon o workflow deve operar

## Limites e observacoes

- conectar o mesmo repositorio GitHub a projetos Neon diferentes nao e suportado
- ao desconectar a integracao, os secrets e variables sao removidos
- workflows que dependem deles deixam de funcionar

## Desconectar um projeto Neon do GitHub

Ao desconectar:

- remove a API key criada para a integracao
- remove o secret `NEON_API_KEY` do repositorio
- remove a variable `NEON_PROJECT_ID` do repositorio

Caminho:

1. Neon Console
2. `Integrations`
3. `GitHub`
4. `Manage`
5. `Disconnect`

## Remover a integracao inteira

Ao remover a integracao da conta Neon:

- remove todas as API keys criadas para integracoes Neon-GitHub
- remove os secrets GitHub relacionados
- remove as variables GitHub relacionadas

Caminho:

1. perfil da conta Neon
2. `Account settings`
3. `Integrations`
4. `Remove`

## Exemplos citados na documentacao

- branching automatizado com GitHub Actions
- preview branches com Cloudflare Pages
- preview branches com Vercel
- preview branches com Fly.io
- validacao de schema e migrations em app de exemplo
