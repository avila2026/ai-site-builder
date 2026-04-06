'use client';

import { useState } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';

interface BriefData {
  siteName: string;
  siteType: string;
  description: string;
  colors: string;
  sections: string[];
}

interface BriefFormProps {
  onSubmit: (data: BriefData) => void;
  isGenerating?: boolean;
}

const siteTypes = [
  { id: 'portfolio', label: 'Portfólio' },
  { id: 'business', label: 'Business' },
  { id: 'ecommerce', label: 'E-commerce' },
  { id: 'blog', label: 'Blog' },
  { id: 'landing', label: 'Landing Page' },
  { id: 'personal', label: 'Site Pessoal' },
];

const commonSections = [
  'Hero',
  'Sobre',
  'Serviços',
  'Portfólio',
  'Depoimentos',
  'Contato',
  'FAQ',
];

export default function BriefForm({ onSubmit, isGenerating = false, onGenerated }: BriefFormProps & { onGenerated?: (result: { content: any; code: string }) => void }) {
  const [formData, setFormData] = useState<BriefData>({
    siteName: '',
    siteType: '',
    description: '',
    colors: '',
    sections: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BriefData, string>>>({});

  const validate = () => {
    const newErrors: Partial<Record<keyof BriefData, string>> = {};

    if (!formData.siteName.trim()) {
      newErrors.siteName = 'Nome do site é obrigatório';
    }

    if (!formData.siteType) {
      newErrors.siteType = 'Tipo de site é obrigatório';
    }

    if (!formData.description.trim()) {
      newErrors.description = 'Descrição é obrigatória';
    } else if (formData.description.trim().length < 20) {
      newErrors.description = 'Descreva com pelo menos 20 caracteres';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      return;
    }

    onSubmit(formData);

    // Chama a API para gerar o site
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Falha ao gerar site');
      }

      onGenerated?.({ content: data.content, code: data.code });
    } catch (error) {
      console.error('Erro na geração:', error);
      alert('Erro ao gerar site. Verifique se o Ollama está rodando.');
    }
  };

  const toggleSection = (section: string) => {
    setFormData(prev => ({
      ...prev,
      sections: prev.sections.includes(section)
        ? prev.sections.filter(s => s !== section)
        : [...prev.sections, section],
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome do Site */}
      <div className="space-y-2">
        <label htmlFor="siteName" className="block text-sm font-medium">
          Nome do Site / Empresa <span className="text-destructive">*</span>
        </label>
        <input
          type="text"
          id="siteName"
          value={formData.siteName}
          onChange={(e) => setFormData(prev => ({ ...prev, siteName: e.target.value }))}
          placeholder="Ex: Minha Empresa Ltda"
          className={`w-full rounded-lg border bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors.siteName ? 'border-destructive' : 'border-input'
          }`}
        />
        {errors.siteName && (
          <p className="text-sm text-destructive">{errors.siteName}</p>
        )}
      </div>

      {/* Tipo de Site */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Tipo de Site <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {siteTypes.map((type) => (
            <button
              key={type.id}
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, siteType: type.id }))}
              className={`rounded-lg border px-4 py-3 text-sm font-medium transition-all ${
                formData.siteType === type.id
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent'
              }`}
            >
              {type.label}
            </button>
          ))}
        </div>
        {errors.siteType && (
          <p className="text-sm text-destructive">{errors.siteType}</p>
        )}
      </div>

      {/* Descrição */}
      <div className="space-y-2">
        <label htmlFor="description" className="block text-sm font-medium">
          Descreva seu site <span className="text-destructive">*</span>
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Ex: Quero um site moderno para minha empresa de consultoria. Deve transmitir profissionalismo e inovação..."
          rows={4}
          className={`w-full resize-none rounded-lg border bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 ${
            errors.description ? 'border-destructive' : 'border-input'
          }`}
        />
        {errors.description && (
          <p className="text-sm text-destructive">{errors.description}</p>
        )}
      </div>

      {/* Cores Preferidas */}
      <div className="space-y-2">
        <label htmlFor="colors" className="block text-sm font-medium">
          Cores Preferidas (opcional)
        </label>
        <input
          type="text"
          id="colors"
          value={formData.colors}
          onChange={(e) => setFormData(prev => ({ ...prev, colors: e.target.value }))}
          placeholder="Ex: Azul escuro e branco, ou deixe em branco para sugerirmos"
          className="w-full rounded-lg border border-input bg-background px-4 py-2.5 text-sm transition-colors focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
        />
      </div>

      {/* Seções Desejadas */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">
          Seções Desejadas (opcional)
        </label>
        <div className="flex flex-wrap gap-2">
          {commonSections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => toggleSection(section)}
              className={`rounded-full border px-4 py-1.5 text-sm transition-all ${
                formData.sections.includes(section)
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-input bg-background hover:bg-accent'
              }`}
            >
              {section}
            </button>
          ))}
        </div>
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isGenerating}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isGenerating ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            Gerando site...
          </>
        ) : (
          <>
            <Sparkles className="h-5 w-5" />
            Gerar Site com IA
          </>
        )}
      </button>
    </form>
  );
}
