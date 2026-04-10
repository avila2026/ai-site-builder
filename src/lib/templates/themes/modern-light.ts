import type { Theme } from '../types';

export const modernLightTheme: Theme = {
  id: 'modern-light',
  name: 'Modern Light',
  description: 'Purple/Pink/Cyan sobre fundo claro - clean e moderno',
  category: 'light',
  thumbnail: '/themes/modern-light.png',
  colors: {
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#06b6d4',
    background: '#fafafa',
    foreground: '#0a0a0f',
    muted: '#71717a',
    border: '#e5e5e5',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  effects: {
    borderRadius: 'lg',
    shadows: 'subtle',
    animations: true,
    glassMorphism: false,
  },
};