# Autonoma API Overview

## Objetivo

Este documento resume como usar a API da Autonoma neste projeto, quais credenciais são necessárias, quais cuidados operacionais são importantes e o que o código atual já cobre.

## Visão geral da API

A API da Autonoma permite gerenciar e executar testes de forma programática. Pela documentação oficial, a plataforma suporta cenários como:

- executar testes individuais
- executar pastas inteiras de testes
- recuperar resultados
- acompanhar status de execução

Base URL oficial:

```text
https://autonoma.app/api
```

Neste projeto, essa URL também é o default de `AUTONOMA_BASE_URL`.

## Autenticação

A Autonoma usa autenticação por API key com dois headers obrigatórios em todas as chamadas:

```http
autonoma-client-id: seu-client-id
autonoma-client-secret: seu-client-secret
```

No contexto deste repositório, esses headers são montados a partir das variáveis:

- `AUTONOMA_CLIENT_ID`
- `AUTONOMA_SECRET_ID`

Observação importante:

- o nome da variável local usa `SECRET_ID`
- o header enviado usa `autonoma-client-secret`

## Mapeamento com o código atual

### O que já existe

O arquivo `src/lib/autonoma-client.ts` já implementa duas operações:

- disparar execução de teste individual
- consultar status de um test run

Além disso, o arquivo `src/app/api/autonoma/run/route.ts` expõe uma rota HTTP interna do projeto para acionar um teste.

### O que já está funcional neste projeto

Fluxo implementado hoje:

1. o cliente envia `POST /api/autonoma/run`
2. o body precisa conter `testId`
3. o backend chama a API da Autonoma
4. o backend devolve o resultado bruto da execução inicial

Campos já suportados pela rota local:

- `testId`
- `application_version_id`
- `runtime_metadata`

### O que ainda não está exposto pelo app

Mesmo que a Autonoma suporte mais capacidades na API, este repositório ainda não expõe por rota própria:

- execução de pasta inteira de testes
- leitura detalhada de resultados históricos
- rota pública para consultar status de execução
- sincronização de metadados de projetos ou versions

Hoje, a função `getTestStatus()` existe no cliente, mas não há uma rota HTTP do app para disponibilizar essa consulta para o frontend ou para integrações externas.

## Endpoints usados hoje no projeto

### Disparo de teste individual

No cliente local, o disparo é feito contra:

```text
POST https://autonoma.app/api/test/{testId}/run
```

Headers:

```http
Content-Type: application/json
autonoma-client-id: ...
autonoma-client-secret: ...
```

Body enviado pelo projeto:

```json
{
  "application_version_id": "opcional",
  "source": "api",
  "runtime_metadata": {}
}
```

### Consulta de status

No cliente local, a consulta é feita contra:

```text
GET https://autonoma.app/api/test-run/{testRunId}/status
```

Essa chamada existe em `src/lib/autonoma-client.ts`, mas ainda não foi publicada como rota do app.

## Expiração de URLs de mídia

Segundo a documentação da Autonoma, todas as URLs de mídia retornadas pela API expiram após 1 hora.

Isso inclui, por exemplo:

- screenshots
- vídeos
- outros assets de mídia retornados pela plataforma

### Regras operacionais recomendadas

- não persistir URLs de mídia por mais de 1 hora
- não assumir que uma URL antiga continuará válida depois desse período
- baixar o arquivo imediatamente se ele precisar ser retido
- armazenar a mídia em infraestrutura própria se houver necessidade de retenção longa
- renovar a URL com nova chamada à API quando necessário
- tratar erros de URL expirada explicitamente

Implicação prática para este projeto:

- se você futuramente expuser resultados completos da Autonoma no frontend, não deve salvar apenas a URL da mídia esperando reutilizar depois
- o ideal é baixar e persistir a mídia em storage próprio, se retenção for requisito de negócio

## Tratamento de erros no código atual

Comportamento atual do projeto:

- se `AUTONOMA_CLIENT_ID` ou `AUTONOMA_SECRET_ID` não existirem, o cliente lança erro de credenciais não configuradas
- a rota local converte esse cenário em resposta `503`
- se `testId` não for enviado, a rota responde `400`
- se a API da Autonoma responder com erro, a rota devolve `500` com a mensagem capturada

Isso já cobre o básico para um MVP, mas ainda há espaço para melhorar:

- tipagem mais rica do payload de resposta
- rota dedicada para status
- normalização de erros por código e categoria
- logging estruturado para produção

## Exemplo de uso dentro deste projeto

Exemplo de chamada para a rota local:

```bash
curl -X POST http://localhost:3000/api/autonoma/run \
  -H "Content-Type: application/json" \
  -d "{\"testId\":\"seu-test-id\",\"application_version_id\":\"opcional\"}"
```

Resposta esperada:

- sucesso com `success: true` e dados do test run
- erro `400` se faltar `testId`
- erro `503` se faltarem credenciais
- erro `500` em falhas de integração

## Limites atuais e evolução sugerida

Se a meta for transformar essa integração em um módulo mais completo, a evolução mais natural é:

1. expor uma rota para `getTestStatus()`
2. persistir metadados mínimos dos test runs
3. criar leitura de resultados detalhados
4. decidir como tratar mídia temporária
5. separar claramente chamadas diretas à Autonoma de chamadas internas do app

## Fontes oficiais

- Autonoma Docs: `docs.agent.autonoma.app`
- Base URL oficial da API: `https://autonoma.app/api`
