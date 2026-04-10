import type { Template } from '../types';

export const businessCorporateTemplate: Template = {
  id: 'business-corporate',
  name: 'Business Corporate',
  description: 'Layout tradicional profissional, navegação lateral, estrutura mais formal',
  category: 'business',
  thumbnail: '/templates/business-corporate.png',
  features: [
    'nav-sidebar',
    'hero-classic',
    'services-list',
    'team-section',
    'contact-info',
  ],
  promptHint: `
Estrutura do site:
- Header: Navegação com logo, menu e botão de contato.
- Hero: Seção clássica com título, subtítulo e botão CTA. Imagem de fundo sutil.
- Quem Somos: Seção com texto institucional e foto da equipe.
- Serviços: Lista vertical de serviços com ícone, título e descrição.
- Equipe: Grid de cards com foto, nome e cargo de cada membro.
- Contato: Informações de contato (endereço, telefone, email) e formulário.

Estilo:
- Design corporativo e profissional.
- Cores sóbrias (azul, cinza, branco).
- Tipografia tradicional.
- Layout estruturado e organizado.
`,
};