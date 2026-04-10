import type { Template } from '../types';

export const personalCardTemplate: Template = {
  id: 'personal-card',
  name: 'Personal Card',
  description: 'One-page, card central, links sociais, minimalista',
  category: 'personal',
  thumbnail: '/templates/personal-card.png',
  features: [
    'centered-card',
    'avatar',
    'social-links',
    'bio-short',
    'contact-links',
  ],
  promptHint: `
Estrutura do site:
- Card Central: Card no centro da tela com avatar, nome, título.
- Bio: Texto curto sobre a pessoa (2-3 frases).
- Links: Botões para redes sociais, portfólio, contato.
- Footer: Créditos discretos.

Estilo:
- Design minimalista centralizado.
- Muito espaço em branco.
- Tipografia grande.
- Animações sutis no hover dos links.
`,
};