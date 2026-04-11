---
name: Melhorias de Design UI/UX
description: Componentes e padrões de design implementados em 2026-04-10
type: project
---

## Melhorias de Design Implementadas

### Novos Componentes UI (src/components/ui/)

1. **Tooltip.tsx** - Componente reutilizável com:
   - Posicionamento: top, bottom, left, right
   - Delay configurável (padrão: 200ms)
   - Seta indicativa baseada na posição
   - Animação fade-in

2. **TemplatePreview.tsx** - Preview estrutural de templates:
   - Gera SVG baseado na categoria (business, portfolio, ecommerce, landing, blog, personal)
   - Mostra ícones das features (🎯 hero, 🎨 gallery, 📧 contact, etc.)
   - Contador de features
   - Highlight quando selecionado

3. **ThemePreview.tsx** - Preview completo de temas:
   - Preview box com botão e texto de exemplo
   - Paleta completa de 7 cores
   - Indicador de tipografia
   - Preview de border-radius e shadows

### Componentes Atualizados

**BriefForm.tsx:**
- Usa TemplatePreview e ThemePreview
- Tooltips em todos os cards
- Removeu seções redundantes de descrição

**SitePreview.tsx:**
- Toolbar com gradientes e sombras
- Tooltips em todos os botões
- Ícones atualizados (Copy, Save, Globe)
- Efeito shimmer no hover
- Botões com scale on hover
- Iframe com transição de opacidade

**FileUpload.tsx:**
- Barra de progresso animada
- Drag-over state com pulse animation
- Preview com zoom on hover
- Efeito shimmer no card

**Toast.tsx:**
- Stacking animation
- Barra de progresso temporal
- Ícones maiores (Check, AlertCircle, Info, AlertTriangle)
- Animação slideIn/slideOut

**MainLayout.tsx:**
- Tooltips nos status indicators
- Ícones por tipo (Server, Cloud, Database, Shield)
- Animation connectionPulse nos status ativos

**globals.css:**
- Scrollbar com gradiente + glow
- Utilitários: hover-lift, card-glow, badge-pulse, skeleton, focus-ring
- Keyframes: slideIn, slideOut, connectionPulse

### Padrões Estabelecidos

- Transições: 300ms duration
- Cores: primary (#8b5cf6), secondary (#ec4899), accent (#06b6d4)
- Border radius: 1rem (variável --radius)
- Glow effects: box-shadow com rgba(139, 92, 246, 0.3)
