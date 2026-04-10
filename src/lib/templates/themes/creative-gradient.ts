import type { Theme } from '../types';

export const creativeGradientTheme: Theme = {
  id: 'creative-gradient',
  name: 'Creative Gradient',
  description: 'Gradientes vibrantes multi-cor - estilo criativo e ousado',
  category: 'creative',
  thumbnail: '/themes/creative-gradient.png',
  colors: {
    primary: '#f97316',
    secondary: '#8b5cf6',
    accent: '#ec4899',
    background: '#0a0a0f',
    foreground: '#fafafa',
    muted: '#a1a1aa',
    border: '#27272a',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  effects: {
    borderRadius: 'full',
    shadows: 'strong',
    animations: true,
    glassMorphism: true,
  },
};