import type { Theme } from '../types';

export const corporateBlueTheme: Theme = {
  id: 'corporate-blue',
  name: 'Corporate Blue',
  description: 'Azul/Cinza/Branco profissional - ideal para empresas',
  category: 'corporate',
  thumbnail: '/themes/corporate-blue.png',
  colors: {
    primary: '#2563eb',
    secondary: '#1e40af',
    accent: '#3b82f6',
    background: '#f8fafc',
    foreground: '#0f172a',
    muted: '#64748b',
    border: '#e2e8f0',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  effects: {
    borderRadius: 'md',
    shadows: 'medium',
    animations: true,
    glassMorphism: false,
  },
};