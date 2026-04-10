import type { Theme } from '../types';

export const modernDarkTheme: Theme = {
  id: 'modern-dark',
  name: 'Modern Dark',
  description: 'Purple/Pink/Cyan sobre fundo escuro - estilo tech moderno',
  category: 'dark',
  thumbnail: '/themes/modern-dark.png',
  colors: {
    primary: '#8b5cf6',
    secondary: '#ec4899',
    accent: '#06b6d4',
    background: '#0a0a0f',
    foreground: '#fafafa',
    muted: '#71717a',
    border: '#27272a',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  effects: {
    borderRadius: 'lg',
    shadows: 'medium',
    animations: true,
    glassMorphism: true,
  },
};