# Assets do site

Esta pasta centraliza os arquivos trocaveis do layout sem precisar reorganizar o `index.html`.

## Estrutura

- `logos/`: logos principais do site
- `animations/`: animacoes visuais do hero
- `dividers/`: divisores entre secoes
- `icons/`: fotos, GIFs e icones de categorias e servicos

## Arquivos esperados pelo HTML

- `./assets/logos/site-logo.svg`
- `./assets/animations/hero-animation.svg`
- `./assets/dividers/section-divider.svg`

## Como trocar

1. Substitua o arquivo desejado dentro da pasta correta.
2. Mantenha o mesmo nome do arquivo.
3. Recarregue a pagina.

Se um asset nao existir, o HTML usa um fallback visual:

- Logo: volta para a marca textual `AV`
- Hero: volta para a animacao interna ja embutida no layout
- Divider: mostra apenas a linha decorativa

## Formato atual

- Padrao atual: `SVG`
- Lottie pode ser adicionado depois com player no navegador, sem mudar esta estrutura base

## Icons adicionados

- `./assets/icons/leaf-spring.jpg`
- `./assets/icons/truck.gif`
- `./assets/icons/service-gear.gif`
- `./assets/icons/tire.gif`
- `./assets/icons/mechanic.gif`
