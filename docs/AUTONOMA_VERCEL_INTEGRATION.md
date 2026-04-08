# Integração Autonoma + Vercel

## Objetivo

Este documento resume como a integração entre Autonoma e Vercel funciona, como isso se conecta a este projeto e como depurar problemas em deploy.

Ele mistura dois contextos:

- comportamento oficial da integração Autonoma + Vercel
- comportamento real deste repositório hoje

Quando esses dois contextos forem diferentes, isso será explicitado.

## Visão geral

A integração da Autonoma com a Vercel permite rodar testes automaticamente em cada deploy e devolver o resultado para a própria Vercel como deployment checks.

Na prática, a Autonoma cria uma estrutura própria para acompanhar seus ambientes de deploy e usa a URL de preview de cada deploy para validar exatamente o código que acabou de subir.

## Como a integração oficial funciona

### Criação de application e versions

Quando um projeto da Vercel é conectado à Autonoma:

- a Autonoma cria uma application correspondente ao projeto da Vercel
- para cada target selecionado no setup, como `production`, `preview` e `development`, a Autonoma cria uma version separada
- cada version recebe uma URL base para uso em execuções manuais

Preenchimento de URL:

- se o target já tiver deploys anteriores, a URL desses deploys é usada
- se o target ainda não tiver deploys anteriores, a Autonoma usa `https://vercel.com` como URL padrão

Implicação prática:

- targets sem deploy anterior precisam de ajuste manual na URL da version dentro da Autonoma antes de testes manuais fazerem sentido

### Execução de testes

A Autonoma trabalha de duas formas:

- durante um deploy novo, os testes rodam contra a preview URL daquele deploy específico
- em execuções manuais, os testes usam a URL fixa configurada na application version

Isso evita reconfigurar a URL base a cada deploy e, ao mesmo tempo, garante isolamento por build quando o gatilho vem do fluxo de deploy.

### Deployment checks

A cada deploy na Vercel, a Autonoma pode:

- criar uma tag de deployment para o projeto
- executar os testes associados a essa tag
- devolver os resultados como deployment checks na Vercel

Consumo de test runs:

- cada teste conta como uma execução
- se houver 5 testes associados ao projeto, um deploy consome 5 test runs

## Autenticação e Vercel Protection Bypass

Se o projeto usa Vercel Authentication ou Deployment Protection, a Autonoma precisa conseguir acessar o deploy protegido.

Para isso, a configuração de bypass é feita por header HTTP:

```http
x-vercel-protection-bypass: seu-segredo
```

Na operação normal:

- esse bypass é configurado quando o projeto é conectado à Autonoma
- se o valor mudar, ele precisa ser atualizado nas configurações da application version dentro da Autonoma

Sinal de problema comum:

- deploy abre normalmente para pessoas autenticadas, mas testes falham por erro de autenticação ou acesso bloqueado

## Como isso se conecta a este projeto

Hoje, este repositório já possui integração parcial com a Autonoma no código:

- `src/lib/autonoma-client.ts` implementa chamadas para a API da Autonoma
- `src/app/api/autonoma/run/route.ts` expõe uma rota para disparar um teste individual
- `.env.local.example` documenta as variáveis de ambiente usadas no projeto

Variáveis relevantes neste projeto:

- `AUTONOMA_CLIENT_ID`
- `AUTONOMA_SECRET_ID`
- `AUTONOMA_BASE_URL` opcional, com default em `https://autonoma.app/api`

Importante:

- o nome da variável local é `AUTONOMA_SECRET_ID`
- o header HTTP enviado para a Autonoma é `autonoma-client-secret`

O que já está implementado no app:

- disparo de teste individual via API interna do projeto
- passagem opcional de `application_version_id`
- passagem opcional de `runtime_metadata`

O que não depende só do código local:

- conectar o projeto da Vercel à Autonoma
- configurar tags, versions e URLs de ambiente
- habilitar deployment checks
- manter o bypass header correto no dashboard da Autonoma

## Como isso roda na Vercel

Quando este projeto é publicado na Vercel, a rota:

- `src/app/api/autonoma/run/route.ts`

passa a executar como uma Vercel Function.

Com base na documentação oficial da Vercel:

- cada request para a rota gera uma invocation
- a plataforma escala automaticamente sem gerenciamento manual de servidores
- instâncias recentes podem ser reaproveitadas para reduzir custo e latência
- sem tráfego, a function pode escalar a zero
- funções Node.js executam por padrão na região `iad1` (Washington, D.C., EUA), salvo configuração diferente no projeto

Implicações práticas para esta integração:

- como a rota faz chamadas HTTP para a API da Autonoma, ela é um caso típico de workload I/O-bound
- a latência final depende da região da function, da rede e do tempo de resposta da Autonoma
- o custo operacional na Vercel depende de invocações, CPU ativa, memória provisionada e região configurada

## Logs e debug em produção

Para debugar essa integração em deploy, o caminho principal é a aba `Logs` do projeto na Vercel.

### O que são Runtime Logs

Runtime Logs registram a execução das Vercel Functions em:

- `preview`
- `production`

Eles incluem:

- logs de invocação da function
- `console.log`
- `console.error`
- status HTTP da request
- `RequestId`
- domínio, método e tipo do recurso executado

Importante:

- runtime logs ficam na aba `Logs`
- build logs ficam em outro lugar e não substituem o debug da execução da rota

### Comportamento útil para debug

Segundo a documentação oficial da Vercel:

- logs aparecem em tempo real
- logs ficam agrupados por request
- cada `console.log` gera uma entrada separada

Filtros mais úteis para esta integração:

- `route`
- `deployment`
- `status code`
- `environment`
- `branch`
- `request method`

Leitura prática:

- `4xx` tende a apontar problema de request inválida, proteção, rota ou input
- `5xx` tende a apontar erro interno da function ou falha ao falar com a API externa

### Retenção de logs por plano

Retenção informada na documentação da Vercel:

- Hobby: 1 hora
- Pro: 1 dia
- Enterprise: 3 dias
- Observability Plus: 30 dias

### Checklist de troubleshooting

Se um teste falhar em deploy:

1. confira se a request chegou na rota `/api/autonoma/run`
2. filtre os Runtime Logs pela rota e pelo deployment afetado
3. valide o status HTTP retornado
4. procure `console.error` com detalhes da falha
5. confirme se as variáveis `AUTONOMA_CLIENT_ID` e `AUTONOMA_SECRET_ID` estão definidas no ambiente correto
6. confirme se `AUTONOMA_BASE_URL` não foi sobrescrita incorretamente
7. verifique se o target da Autonoma possui URL válida
8. se o deploy estiver protegido, revise o `x-vercel-protection-bypass` na Autonoma

Erros comuns deste projeto:

- `400`: `testId` ausente no corpo da request
- `503`: credenciais da Autonoma ausentes
- `500`: falha na chamada externa para a API da Autonoma ou erro interno de execução

## Limites deste repositório hoje

Este projeto não substitui a integração oficial da Autonoma com a Vercel.

Hoje ele oferece:

- uma rota própria para disparar testes manualmente ou por automação customizada
- um cliente simples para comunicação com a API da Autonoma

Hoje ele não implementa por conta própria:

- recebimento automático de webhooks de deploy da Vercel
- criação automática de tags de deployment na Autonoma
- publicação automática de deployment checks
- sincronização automática de application versions

## Próximos passos sugeridos

Se a meta for fechar o fluxo fim a fim:

1. conectar formalmente o projeto da Vercel à Autonoma
2. validar URL e bypass de cada application version
3. testar um deploy de preview protegido e outro sem proteção
4. confirmar se os deployment checks aparecem na Vercel
5. se necessário, expor mais rotas locais para status de execução e leitura de resultados

## Fontes oficiais

- Autonoma Docs: `docs.agent.autonoma.app`
- Vercel Functions: `https://vercel.com/docs/functions` (última atualização consultada: 5 de março de 2026)
- Vercel Runtime Logs: `https://vercel.com/docs/logs/runtime` (última atualização consultada: 17 de março de 2026)
