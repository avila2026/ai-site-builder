import type { Theme } from '../types';

export const minimalWhiteTheme: Theme = {
  id: 'minimal-white',
  name: 'Minimal White',
  description: 'Cinza/Branco com acentos sutis - máximo minimalismo',
  category: 'minimal',
  thumbnail: '/themes/minimal-white.png',
  colors: {
    primary: '#18181b',
    secondary: '#71717a',
    accent: '#27272a',
    background: '#ffffff',
    foreground: '#0a0a0a',
    muted: '#a1a1aa',
    border: '#e5e5e5',
  },
  typography: {
    headingFont: 'Inter',
    bodyFont: 'Inter',
  },
  effects: {
    borderRadius: 'sm',
    shadows: 'subtle',
    animations: false,
    glassMorphism: false,
  },
};