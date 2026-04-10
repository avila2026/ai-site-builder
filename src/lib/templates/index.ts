/**
 * Sistema de Templates e Temas para AI Site Builder
 *
 * Este módulo exporta todos os templates e temas disponíveis,
 * além de funções helper para busca e construção de prompts.
 */

import type { Template, Theme, TemplateCategory, ThemeCategory } from './types';
export * from './types';

// === IMPORTAÇÃO DE TEMPLATES ===
import { businessModernTemplate } from './templates/business-modern';
import { businessCorporateTemplate } from './templates/business-corporate';
import { portfolioMinimalTemplate } from './templates/portfolio-minimal';
import { portfolioCreativeTemplate } from './templates/portfolio-creative';
import { ecommerceCleanTemplate } from './templates/ecommerce-clean';
import { landingGradientTemplate } from './templates/landing-gradient';
import { blogEditorialTemplate } from './templates/blog-editorial';
import { personalCardTemplate } from './templates/personal-card';

// === IMPORTAÇÃO DE TEMAS ===
import { modernDarkTheme } from './themes/modern-dark';
import { modernLightTheme } from './themes/modern-light';
import { minimalWhiteTheme } from './themes/minimal-white';
import { corporateBlueTheme } from './themes/corporate-blue';
import { creativeGradientTheme } from './themes/creative-gradient';
import { darkNeonTheme } from './themes/dark-neon';

// === ARRAYS EXPORTADOS ===

/**
 * Todos os templates disponíveis
 */
export const templates: Template[] = [
  businessModernTemplate,
  businessCorporateTemplate,
  portfolioMinimalTemplate,
  portfolioCreativeTemplate,
  ecommerceCleanTemplate,
  landingGradientTemplate,
  blogEditorialTemplate,
  personalCardTemplate,
];

/**
 * Todos os temas disponíveis
 */
export const themes: Theme[] = [
  modernDarkTheme,
  modernLightTheme,
  minimalWhiteTheme,
  corporateBlueTheme,
  creativeGradientTheme,
  darkNeonTheme,
];

// === HELPERS ===

/**
 * Busca um template pelo ID
 */
export function getTemplateById(id: string): Template | undefined {
  return templates.find(t => t.id === id);
}

/**
 * Busca um tema pelo ID
 */
export function getThemeById(id: string): Theme | undefined {
  return themes.find(t => t.id === id);
}

/**
 * Filtra templates por categoria
 */
export function getTemplatesByCategory(category: TemplateCategory): Template[] {
  return templates.filter(t => t.category === category);
}

/**
 * Filtra temas por categoria
 */
export function getThemesByCategory(category: ThemeCategory): Theme[] {
  return themes.filter(t => t.category === category);
}

/**
 * Constrói a seção de prompt relacionada ao template
 */
export function buildTemplatePromptSection(template: Template | null): string {
  if (!template) return '';

  return `
[ESTRUTURA DO TEMPLATE: ${template.name}]
${template.promptHint}
Features incluídas: ${template.features.join(', ')}
`;
}

/**
 * Constrói a seção de prompt relacionada ao tema
 */
export function buildThemePromptSection(theme: Theme | null): string {
  if (!theme) return '';

  const { colors, typography, effects } = theme;

  return `
[TEMA VISUAL: ${theme.name}]
Cores:
- Primary: ${colors.primary} (cor principal para botões, links, destaques)
- Secondary: ${colors.secondary} (cor secundária para elementos menos importantes)
- Accent: ${colors.accent} (cor de destaque para badges, tags)
- Background: ${colors.background} (cor de fundo principal)
- Foreground: ${colors.foreground} (cor do texto principal)
- Muted: ${colors.muted} (cor para texto secundário)
- Border: ${colors.border} (cor para bordas e divisores)

Tipografia:
- Fonte para títulos: ${typography.headingFont}
- Fonte para texto: ${typography.bodyFont}

Efeitos:
- Border radius: ${effects.borderRadius}
- Sombras: ${effects.shadows}
- Animações: ${effects.animations ? 'Habilitadas' : 'Desabilitadas'}
- Glassmorphism: ${effects.glassMorphism ? 'Habilitado' : 'Desabilitado'}
`;
}

/**
 * Constrói o prompt completo combinando template e tema
 */
export function buildFullPromptSection(
  templateId: string | null | undefined,
  themeId: string | null | undefined
): string {
  const template = templateId ? getTemplateById(templateId) ?? null : null;
  const theme = themeId ? getThemeById(themeId) ?? null : null;

  const templateSection = buildTemplatePromptSection(template);
  const themeSection = buildThemePromptSection(theme);

  return `${templateSection}${themeSection}`;
}

/**
 * Gera CSS custom properties para o tema (para preview)
 */
export function getThemeCSSProperties(theme: Theme): Record<string, string> {
  return {
    '--primary': theme.colors.primary,
    '--secondary': theme.colors.secondary,
    '--accent': theme.colors.accent,
    '--background': theme.colors.background,
    '--foreground': theme.colors.foreground,
    '--muted': theme.colors.muted,
    '--border': theme.colors.border,
  };
}