import type { Template } from '../types';

export const portfolioCreativeTemplate: Template = {
  id: 'portfolio-creative',
  name: 'Portfolio Criativo',
  description: 'Hero animado, projetos em masonry, interações dinâmicas',
  category: 'portfolio',
  thumbnail: '/templates/portfolio-creative.png',
  features: [
    'hero-animated',
    'masonry-gallery',
    'project-detail',
    'skills-visual',
    'contact-form',
  ],
  promptHint: `
Estrutura do site:
- Hero: Seção animada com texto dinâmico, gradientes ou partículas.
- Projetos: Layout masonry com projetos de tamanhos variados. Click abre modal com detalhes.
- Habilidades: Visualização criativa de skills (barras, círculos, ícones).
- Sobre: Seção com foto e texto pessoal.
- Contato: Formulário estilizado com animação.

Estilo:
- Design criativo e experimental.
- Animações elaboradas (parallax, hover effects).
- Gradientes e cores vibrantes.
- Tipografia expressiva.
`,
};