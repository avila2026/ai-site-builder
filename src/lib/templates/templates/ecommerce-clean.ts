import type { Template } from '../types';

export const ecommerceCleanTemplate: Template = {
  id: 'ecommerce-clean',
  name: 'Catálogo Industrial AVILA',
  description: 'Catálogo de consulta técnica com conversão direta para WhatsApp',
  category: 'ecommerce',
  thumbnail: '/templates/ecommerce-clean.png',
  features: [
    'hero-banner',
    'product-grid',
    'filter-sidebar',
    'whatsapp-conversion',
    'product-detail',
  ],
  promptHint: `
Estrutura do site:
- Header: Logo AVILA, barra de busca técnica (por SKU/Nome), menu de categorias industriais.
- Hero: Banner robusto com imagem de molas/suspensão e CTA "Consultar Especialista".
- Produtos: Grid de cards técnicos com Imagem, Nome da Peça, Código SKU e botão "Pedir Orçamento via WhatsApp".
- Filtros: Sidebar com categorias: Suspensão, Freios, Motor e Serviços.
- Produto: Modal de detalhes com especificações técnicas e botão direto para WhatsApp com a mensagem do produto.
- Footer: Endereço em Rio Branco - AC, Horário de Funcionamento e Redes Sociais.

Estilo:
- Estética Industrial: Cores Slate-900 e Orange-600.
- Bordas retas (rounded-sm), visual técnico e confiável.
- Foco total em lead generation via WhatsApp, sem sistema de carrinho/pagamento.
`,
};