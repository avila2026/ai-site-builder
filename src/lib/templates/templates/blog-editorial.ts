import type { Template } from '../types';

export const blogEditorialTemplate: Template = {
  id: 'blog-editorial',
  name: 'Blog Editorial',
  description: 'Layout revista, sidebar, artigos em destaque',
  category: 'blog',
  thumbnail: '/templates/blog-editorial.png',
  features: [
    'hero-article',
    'article-grid',
    'sidebar',
    'categories',
    'newsletter',
  ],
  promptHint: `
Estrutura do site:
- Header: Logo, menu de categorias, busca, ícone de assinatura.
- Hero: Artigo em destaque com imagem grande, título e resumo.
- Grid de Artigos: Layout revista com artigos secundários.
- Sidebar: Categorias, artigos populares, newsletter.
- Artigo: Página com artigo completo, autor, data, tags.
- Footer: Links, redes sociais, formulário de newsletter.

Estilo:
- Design editorial estilo revista.
- Tipografia elegante para leitura.
- Layout assimétrico interessante.
- Cores neutras com acentos sutis.
`,
};