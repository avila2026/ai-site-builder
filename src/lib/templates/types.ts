/**
 * Tipos para o sistema de Templates e Temas
 */

// === TEMPLATES ===

export type TemplateCategory = 'business' | 'portfolio' | 'ecommerce' | 'blog' | 'landing' | 'personal';

export interface Template {
  /** ID único do template */
  id: string;
  /** Nome de exibição */
  name: string;
  /** Descrição curta */
  description: string;
  /** Categoria do template */
  category: TemplateCategory;
  /** URL da imagem de preview */
  thumbnail: string;
  /** Lista de features/características */
  features: string[];
  /** Texto injetado no prompt da IA para guiar a geração */
  promptHint: string;
}

// === TEMAS ===

export type ThemeCategory = 'modern' | 'minimal' | 'corporate' | 'creative' | 'dark' | 'light';

export interface ThemeColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  foreground: string;
  muted: string;
  border: string;
}

export interface ThemeTypography {
  /** Google Font para títulos */
  headingFont: string;
  /** Google Font para texto */
  bodyFont: string;
}

export interface ThemeEffects {
  /** Raio das bordas */
  borderRadius: 'none' | 'sm' | 'md' | 'lg' | 'full';
  /** Intensidade das sombras */
  shadows: 'none' | 'subtle' | 'medium' | 'strong';
  /** Animações habilitadas */
  animations: boolean;
  /** Efeito glassmorphism */
  glassMorphism: boolean;
}

export interface Theme {
  /** ID único do tema */
  id: string;
  /** Nome de exibição */
  name: string;
  /** Descrição curta */
  description: string;
  /** Categoria do tema */
  category: ThemeCategory;
  /** URL da imagem de preview */
  thumbnail: string;
  /** Paleta de cores */
  colors: ThemeColors;
  /** Configurações de tipografia */
  typography: ThemeTypography;
  /** Efeitos visuais */
  effects: ThemeEffects;
}

// === SELEÇÃO ===

export interface TemplateThemeSelection {
  templateId: string | null;
  themeId: string | null;
}

// === CATEGORIAS PARA UI ===

export const TEMPLATE_CATEGORIES: { id: TemplateCategory; label: string }[] = [
  { id: 'business', label: 'Business' },
  { id: 'portfolio', label: 'Portfólio' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'blog', label: 'Blog' },
  { id: 'landing', label: 'Landing Page' },
  { id: 'personal', label: 'Pessoal' },
];

export const THEME_CATEGORIES: { id: ThemeCategory; label: string }[] = [
  { id: 'modern', label: 'Moderno' },
  { id: 'minimal', label: 'Minimalista' },
  { id: 'corporate', label: 'Corporativo' },
  { id: 'creative', label: 'Criativo' },
  { id: 'dark', label: 'Escuro' },
  { id: 'light', label: 'Claro' },
];