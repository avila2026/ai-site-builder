import type { Template } from '../types';

export const portfolioMinimalTemplate: Template = {
  id: 'portfolio-minimal',
  name: 'Portfolio Minimal',
  description: 'Galeria clean, sobre minimalista, foco no conteúdo visual',
  category: 'portfolio',
  thumbnail: '/templates/portfolio-minimal.png',
  features: [
    'hero-simple',
    'gallery-grid',
    'about-minimal',
    'contact-subtle',
  ],
  promptHint: `
Estrutura do site:
- Hero: Nome grande no centro, subtítulo sutil, sem botões chamativos.
- Portfólio: Grid de projetos com imagem, título e categoria. Hover revela mais detalhes.
- Sobre: Seção breve com foto e texto curto.
- Contato: Links para redes sociais e email, sem formulário.

Estilo:
- Design minimalista com muito espaço em branco.
- Tipografia grande e clean.
- Animações sutis no hover.
- Foco no conteúdo visual.
`,
};