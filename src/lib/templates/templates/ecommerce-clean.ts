import type { Template } from '../types';

export const ecommerceCleanTemplate: Template = {
  id: 'ecommerce-clean',
  name: 'E-commerce Clean',
  description: 'Grid de produtos, filtros laterais, carrinho visível',
  category: 'ecommerce',
  thumbnail: '/templates/ecommerce-clean.png',
  features: [
    'hero-banner',
    'product-grid',
    'filter-sidebar',
    'cart-preview',
    'product-detail',
  ],
  promptHint: `
Estrutura do site:
- Header: Logo, barra de busca, ícone de carrinho, menu de categorias.
- Hero: Banner promocional com imagem e CTA.
- Produtos: Grid de cards com imagem, nome, preço e botão de compra.
- Filtros: Sidebar com filtros por categoria, preço, cor.
- Produto: Modal ou página com detalhes do produto, galeria, descrição.
- Footer: Links, informações de pagamento, redes sociais.

Estilo:
- Design clean focado nos produtos.
- Muito espaço em branco.
- Ícones e botões claros.
- Navegação intuitiva.
`,
};