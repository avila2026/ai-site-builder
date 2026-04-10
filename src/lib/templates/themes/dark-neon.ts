import type { Theme } from '../types';

export const darkNeonTheme: Theme = {
  id: 'dark-neon',
  name: 'Dark Neon',
  description: 'Cores neon sobre fundo preto - estilo futurista',
  category: 'dark',
  thumbnail: '/themes/dark-neon.png',
  colors: {
    primary: '#00ff88',
    secondary: '#00d4ff',
    accent: '#ff00ff',
    background: '#000000',
    foreground: '#ffffff',
    muted: '#666666',
    border: '#333333',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  effects: {
    borderRadius: 'lg',
    shadows: 'strong',
    animations: true,
    glassMorphism: true,
  },
};