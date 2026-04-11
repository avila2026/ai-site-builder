'use client';

import { useMemo } from 'react';
import type { Theme } from '@/lib/templates';

interface ThemePreviewProps {
  theme: Theme;
  isSelected?: boolean;
}

export default function ThemePreview({ theme, isSelected }: ThemePreviewProps) {
  // Gera preview completo do tema
  const previewData = useMemo(() => {
    const colors = theme.colors;
    const isDark = colors.background.startsWith('#0') || colors.background.startsWith('#1');

    return {
      isDark,
      textColor: isDark ? '#fafafa' : '#18181b',
      previewBg: colors.background,
      previewBorder: isSelected ? colors.primary : colors.border,
    };
  }, [theme.colors, isSelected]);

  return (
    <div className={`space-y-2 rounded-lg border p-3 transition-all duration-300 ${isSelected ? 'border-primary bg-primary/5 shadow-lg shadow-primary/10' : 'border-input bg-background/50'}`}>
      {/* Header com nome */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{theme.name}</h4>
        {isSelected && (
          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
            ✓
          </span>
        )}
      </div>

      {/* Preview Box - Mini demonstração do tema */}
      <div
        className="overflow-hidden rounded-md border p-2"
        style={{
          backgroundColor: previewData.previewBg,
          borderColor: previewData.previewBorder,
        }}
      >
        {/* Button Preview */}
        <div className="mb-2 flex items-center gap-2">
          <div
            className="rounded px-2 py-1 text-[10px] font-medium text-white"
            style={{ backgroundColor: colors.primary }}
          >
            Button
          </div>
          <div
            className="rounded px-2 py-1 text-[10px] font-medium"
            style={{
              backgroundColor: `${colors.secondary}20`,
              color: colors.secondary,
              border: `1px solid ${colors.secondary}40`,
            }}
          >
            Secondary
          </div>
        </div>

        {/* Text Preview */}
        <div className="mb-2 space-y-1">
          <div
            className="text-[9px] font-bold"
            style={{ color: previewData.textColor, fontFamily: theme.typography.headingFont }}
          >
            Heading Aa
          </div>
          <div
            className="text-[8px]"
            style={{ color: colors.muted, fontFamily: theme.typography.bodyFont }}
          >
            Body text sample
          </div>
        </div>

        {/* Effects Preview */}
        <div className="flex items-center gap-2">
          <div
            className="h-3 w-3 rounded"
            style={{
              borderRadius: theme.effects.borderRadius,
              backgroundColor: colors.accent,
            }}
          />
          {theme.effects.shadows && (
            <div
              className="h-3 w-3 rounded bg-primary"
              style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }}
            />
          )}
        </div>
      </div>

      {/* Paleta Completa de Cores */}
      <div className="space-y-1">
        <p className="text-[10px] font-medium text-muted-foreground">Paleta</p>
        <div className="grid grid-cols-7 gap-1">
          {Object.entries(theme.colors).map(([key, value]) => (
            <div
              key={key}
              className="group relative flex flex-col items-center"
              title={`${key}: ${value}`}
            >
              <div
                className="h-4 w-full rounded transition-transform group-hover:scale-110"
                style={{ backgroundColor: value }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Descrição */}
      <p className="text-xs text-muted-foreground">{theme.description}</p>
    </div>
  );
}
