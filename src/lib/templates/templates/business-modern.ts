import type { Template } from '../types';

export const businessModernTemplate: Template = {
  id: 'business-modern',
  name: 'Business Moderno',
  description: 'Hero fullscreen impactante, serviços em grid moderno, CTA forte e chamativo',
  category: 'business',
  thumbnail: '/templates/business-modern.png',
  features: [
    'hero-fullscreen',
    'grid-services',
    'cta-destacado',
    'testimonials-carousel',
    'contato-form',
  ],
  promptHint: `
Estrutura do site:
- Hero: Seção fullscreen com título grande, subtítulo e botão CTA principal. Fundo com gradiente ou imagem de fundo.
- Serviços: Grid de 3-4 cards com ícones, título e descrição de cada serviço.
- Sobre: Seção com texto e imagem lado a lado.
- Depoimentos: Carrossel ou grid de cards com foto, nome e citação.
- Contato: Formulário de contato com campos nome, email, mensagem.

Estilo:
- Design moderno com espaçamento generoso.
- Animações sutis no hover.
- Cores contrastantes para CTAs.
- Tipografia limpa e hierarquia visual clara.
`,
};