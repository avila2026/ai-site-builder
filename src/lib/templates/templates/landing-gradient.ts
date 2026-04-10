import type { Template } from '../types';

export const landingGradientTemplate: Template = {
  id: 'landing-gradient',
  name: 'Landing Gradient',
  description: 'Hero com gradiente animado, features em cards, CTA final',
  category: 'landing',
  thumbnail: '/templates/landing-gradient.png',
  features: [
    'hero-gradient',
    'features-cards',
    'pricing-table',
    'testimonials',
    'cta-final',
  ],
  promptHint: `
Estrutura do site:
- Hero: Seção com gradiente animado, título principal, subtítulo e botão CTA grande.
- Features: Grid de 3-6 cards com ícone, título e descrição.
- Como Funciona: Passos numerados com ícones.
- Depoimentos: Cards com foto, nome e citação.
- Preços: Tabela de preços com 3 planos.
- CTA Final: Seção final com chamada para ação.

Estilo:
- Gradientes vibrantes e animados.
- Design moderno e impactante.
- CTAs grandes e visíveis.
- Animações suaves no scroll.
`,
};