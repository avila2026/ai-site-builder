---
name: 21st-sdk
description: Use para qualquer interacao com pacotes @21st-sdk ou 21st Agents. Se a tarefa envolver arquivos em ./agents/, provavelmente se refere ao 21st SDK.
allowed-tools: WebFetch Read Grep Glob
---

# 21st SDK / 21st Agents

Para qualquer tarefa envolvendo `@21st-sdk`, `21st Agents` ou arquivos em `./agents/`, siga este fluxo:

1. Faca um fetch de `https://21st-search-engine.fly.dev/help` antes de qualquer outra acao.
2. Trate esse endpoint como a fonte de verdade para entender como pesquisar a documentacao, o codigo-fonte e os exemplos do 21st SDK.
3. Use o `/help` como ponto de entrada primario para descobrir:
   - como buscar na documentacao
   - como buscar no codigo-fonte
   - como buscar exemplos
   - quais endpoints ou formatos de consulta estao disponiveis
4. Se a tarefa envolver integracao HTTP direta com o runtime, consulte tambem [api-reference.md](api-reference.md) para base URL, autenticacao, convencoes e endpoints principais.
5. So depois disso prossiga com a implementacao, analise ou resposta.

Regras:

- nao responda de memoria se a duvida depender de comportamento especifico do 21st SDK
- quando houver ambiguidade, priorize o que estiver descrito pelo servidor de busca oficial
- se a tarefa mencionar `./agents/`, assuma por padrao que faz parte do ecossistema 21st, a menos que o contexto mostre o contrario
- ao usar informacao encontrada via servidor, sintetize de forma objetiva e aplicada ao problema atual
- para chamadas REST diretas, respeite bearer token, JSON, camelCase, IDs prefixados e streaming via SSE quando aplicavel
