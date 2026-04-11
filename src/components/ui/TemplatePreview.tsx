'use client';

import { useMemo } from 'react';
import type { Template } from '@/lib/templates';

interface TemplatePreviewProps {
  template: Template;
  isSelected?: boolean;
}

interface FeatureIcon {
  feature: string;
  icon: string;
}

const featureIcons: FeatureIcon[] = [
  { feature: 'hero-section', icon: '🎯' },
  { feature: 'gallery', icon: '🎨' },
  { feature: 'contact-form', icon: '📧' },
  { feature: 'pricing', icon: '💰' },
  { feature: 'testimonials', icon: '💬' },
  { feature: 'blog', icon: '📝' },
  { feature: 'faq', icon: '❓' },
  { feature: 'services', icon: '⚙️' },
  { feature: 'about', icon: '👤' },
  { feature: 'portfolio', icon: '📁' },
  { feature: 'nav-sidebar', icon: '📱' },
  { feature: 'nav-top', icon: '📊' },
  { feature: 'footer', icon: '📍' },
  { feature: 'masonry-gallery', icon: '🖼️' },
  { feature: 'product-grid', icon: '🛒' },
  { feature: 'cta-section', icon: '📣' },
  { feature: 'stats-section', icon: '📈' },
  { feature: 'team-section', icon: '👥' },
];

export default function TemplatePreview({ template, isSelected }: TemplatePreviewProps) {
  // Gera preview SVG baseado na categoria e features do template
  const svgPreview = useMemo(() => {
    const baseClasses = "transition-all duration-300";
    const strokeColor = isSelected ? '#8b5cf6' : '#3f3f46';
    const fillColor = isSelected ? 'rgba(139, 92, 246, 0.1)' : 'rgba(63, 63, 70, 0.05)';

    const categoryLayouts: Record<string, JSX.Element> = {
      business: (
        <svg viewBox="0 0 100 60" className={baseClasses}>
          {/* Header */}
          <rect x="5" y="5" width="90" height="8" rx="1" fill={strokeColor} opacity="0.3" />
          <rect x="10" y="7" width="15" height="4" rx="0.5" fill={strokeColor} />
          {/* Hero Section */}
          <rect x="5" y="16" width="60" height="20" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="10" y="20" width="30" height="3" rx="0.5" fill={strokeColor} opacity="0.5" />
          <rect x="10" y="25" width="20" height="2" rx="0.5" fill={strokeColor} opacity="0.3" />
          {/* 3 Columns */}
          <rect x="68" y="16" width="27" height="20" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="70" y="19" width="8" height="8" rx="0.5" fill={strokeColor} opacity="0.2" />
          <rect x="80" y="19" width="8" height="8" rx="0.5" fill={strokeColor} opacity="0.2" />
          <rect x="90" y="19" width="3" height="8" rx="0.5" fill={strokeColor} opacity="0.2" />
          {/* Footer */}
          <rect x="5" y="39" width="90" height="6" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
        </svg>
      ),
      portfolio: (
        <svg viewBox="0 0 100 60" className={baseClasses}>
          {/* Hero Image */}
          <rect x="5" y="5" width="90" height="25" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="15" y="15" width="20" height="5" rx="0.5" fill={strokeColor} opacity="0.3" />
          {/* Grid Gallery */}
          <rect x="5" y="33" width="28" height="12" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="36" y="33" width="28" height="12" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="67" y="33" width="28" height="12" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
        </svg>
      ),
      ecommerce: (
        <svg viewBox="0 0 100 60" className={baseClasses}>
          {/* Header with cart */}
          <rect x="5" y="5" width="90" height="8" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <circle cx="85" cy="9" r="2" fill={strokeColor} opacity="0.5" />
          {/* Product Grid */}
          <rect x="5" y="16" width="20" height="18" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="8" y="19" width="14" height="8" rx="0.5" fill={strokeColor} opacity="0.2" />
          <rect x="28" y="16" width="20" height="18" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="31" y="19" width="14" height="8" rx="0.5" fill={strokeColor} opacity="0.2" />
          <rect x="51" y="16" width="20" height="18" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="54" y="19" width="14" height="8" rx="0.5" fill={strokeColor} opacity="0.2" />
          <rect x="74" y="16" width="20" height="18" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="77" y="19" width="14" height="8" rx="0.5" fill={strokeColor} opacity="0.2" />
          {/* CTA */}
          <rect x="25" y="38" width="50" height="6" rx="1" fill={strokeColor} opacity="0.3" />
        </svg>
      ),
      landing: (
        <svg viewBox="0 0 100 60" className={baseClasses}>
          {/* Fullscreen Hero */}
          <rect x="5" y="5" width="90" height="35" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="25" y="12" width="50" height="6" rx="1" fill={strokeColor} opacity="0.5" />
          <rect x="30" y="20" width="40" height="3" rx="0.5" fill={strokeColor} opacity="0.3" />
          <rect x="35" y="30" width="30" height="5" rx="1" fill={strokeColor} opacity="0.4" />
          {/* Features */}
          <rect x="5" y="43" width="28" height="12" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="36" y="43" width="28" height="12" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="67" y="43" width="28" height="12" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
        </svg>
      ),
      blog: (
        <svg viewBox="0 0 100 60" className={baseClasses}>
          {/* Header */}
          <rect x="5" y="5" width="90" height="8" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          {/* Featured Post */}
          <rect x="5" y="16" width="60" height="20" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="8" y="19" width="25" height="12" rx="0.5" fill={strokeColor} opacity="0.2" />
          <rect x="36" y="19" width="20" height="3" rx="0.5" fill={strokeColor} opacity="0.5" />
          <rect x="36" y="24" width="15" height="2" rx="0.5" fill={strokeColor} opacity="0.3" />
          {/* Sidebar */}
          <rect x="68" y="16" width="27" height="20" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <rect x="72" y="19" width="19" height="2" rx="0.5" fill={strokeColor} opacity="0.3" />
          <rect x="72" y="23" width="19" height="2" rx="0.5" fill={strokeColor} opacity="0.3" />
          <rect x="72" y="27" width="19" height="2" rx="0.5" fill={strokeColor} opacity="0.3" />
          {/* Posts List */}
          <rect x="5" y="39" width="90" height="6" rx="1" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
        </svg>
      ),
      personal: (
        <svg viewBox="0 0 100 60" className={baseClasses}>
          {/* Profile Card */}
          <rect x="20" y="10" width="60" height="40" rx="2" fill={fillColor} stroke={strokeColor} strokeWidth="0.5" />
          <circle cx="50" cy="22" r="8" fill={strokeColor} opacity="0.3" />
          <rect x="30" y="32" width="40" height="3" rx="0.5" fill={strokeColor} opacity="0.5" />
          <rect x="35" y="38" width="30" height="2" rx="0.5" fill={strokeColor} opacity="0.3" />
          <rect x="35" y="43" width="30" height="2" rx="0.5" fill={strokeColor} opacity="0.3" />
        </svg>
      ),
    };

    return categoryLayouts[template.category] || categoryLayouts.business;
  }, [template.category, isSelected]);

  // Mapeia features para ícones
  const mappedFeatures = useMemo(() => {
    return template.features.slice(0, 4).map((feature) => {
      const match = featureIcons.find(fi => feature.toLowerCase().includes(fi.feature));
      return match ? match.icon : '✨';
    });
  }, [template.features]);

  return (
    <div className="space-y-2">
      {/* Preview SVG */}
      <div className={`h-16 w-full rounded-lg bg-background/50 p-1 transition-all duration-300 ${isSelected ? 'ring-2 ring-primary ring-offset-2 ring-offset-background' : ''}`}>
        {svgPreview}
      </div>

      {/* Info */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-foreground">{template.name}</h4>
        <span className="text-xs text-muted-foreground">{template.features.length} features</span>
      </div>

      {/* Feature Icons */}
      <div className="flex items-center gap-1" title={template.features.join(', ')}>
        {mappedFeatures.map((icon, idx) => (
          <span key={idx} className="text-xs" title={template.features[idx]}>
            {icon}
          </span>
        ))}
        {template.features.length > 4 && (
          <span className="text-xs text-muted-foreground">+{template.features.length - 4}</span>
        )}
      </div>
    </div>
  );
}
