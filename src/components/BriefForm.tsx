'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Loader2, Check, X } from 'lucide-react';

export interface BriefData {
  siteName: string;
  siteType: string;
  description: string;
  colors: string;
  sections: string[];
}

interface BriefFormProps {
  onSubmit: (data: BriefData) => void;
  isGenerating?: boolean;
  onGenerated?: (result: { content: unknown; code: string }) => void;
  onProgress?: (status: { type: string; status: string; message: string }) => void;
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

// Validação em tempo real
function validateField(field: keyof BriefData, value: unknown): string | null {
  if (field === 'siteName') {
    if (!value || typeof value === 'string' && !value.trim()) {
      return 'Nome do site é obrigatório';
    }
  }
  if (field === 'siteType') {
    if (!value || typeof value === 'string' && !value) {
      return 'Tipo de site é obrigatório';
    }
  }
  if (field === 'description') {
    if (!value || typeof value === 'string' && !value.trim()) {
      return 'Descrição é obrigatória';
    }
    if (typeof value === 'string' && value.trim().length < 20) {
      return 'Mínimo de 20 caracteres';
    }
  }
  return null;
}

export default function BriefForm({ onSubmit, isGenerating = false, onGenerated, onProgress }: BriefFormProps) {
  const [formData, setFormData] = useState<BriefData>({
    siteName: '',
    siteType: '',
    description: '',
    colors: '',
    sections: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof BriefData, string | null>>>({});
  const [touched, setTouched] = useState<Record<keyof BriefData, boolean>>({
    siteName: false,
    siteType: false,
    description: false,
    colors: false,
    sections: false,
  });

  // Validação em tempo real quando o campo é tocado
  useEffect(() => {
    const newErrors: Partial<Record<keyof BriefData, string | null>> = {};

    if (touched.siteName) {
      newErrors.siteName = validateField('siteName', formData.siteName);
    }
    if (touched.siteType) {
      newErrors.siteType = validateField('siteType', formData.siteType);
    }
    if (touched.description) {
      newErrors.description = validateField('description', formData.description);
    }

    setErrors(newErrors);
  }, [formData, touched]);

  const handleFieldChange = (field: keyof BriefData, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (!touched[field]) {
      setTouched(prev => ({ ...prev, [field]: true }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Marca todos como tocados
    setTouched({
      siteName: true,
      siteType: true,
      description: true,
      colors: true,
      sections: true,
    });

    // Validação final
    const hasErrors = Object.values({
      siteName: validateField('siteName', formData.siteName),
      siteType: validateField('siteType', formData.siteType),
      description: validateField('description', formData.description),
    }).some(error => error !== null);

    if (hasErrors) {
      return;
    }

    onSubmit(formData);

    // Chama a API com streaming para gerar o site
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Falha ao gerar site');
      }

      // Processa o stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error('Stream não disponível');
      }

      let code: string | undefined;
      let content: unknown;
      let buffer = '';

      const processLine = (line: string) => {
        try {
          const data = JSON.parse(line);

          // Notifica progresso
          if (data.type === 'status' || data.type === 'complete' || data.type === 'error') {
            onProgress?.(data);
          }

          if (data.type === 'complete') {
            code = data.code;
            content = data.content;
          }
        } catch {
          // Linha inválida/fragmentada é ignorada para manter resiliência do stream.
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          buffer += decoder.decode();
          break;
        }

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const normalized = line.trim();
          if (!normalized) {
            continue;
          }
          processLine(normalized);
        }
      }

      const tail = buffer.trim();
      if (tail) {
        processLine(tail);
      }

      if (code) {
        await fetch('/api/briefs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            ...formData,
            generatedCode: code,
          }),
        }).catch(() => {
          // Persistencia e opcional: ignoramos falhas quando auth/db nao estiverem configurados.
        });
      }

      if (code && content) {
        onGenerated?.({ content, code });
      }
    } catch (error) {
      console.error('Erro na geração:', error);
      alert('Erro ao gerar site. Verifique suas integrações de IA.');
    }
  };

  const toggleSection = (section: string) => {
    handleFieldChange('sections',
      formData.sections.includes(section)
        ? formData.sections.filter(s => s !== section)
        : [...formData.sections, section]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nome do Site */}
      <div className="group space-y-2">
        <label htmlFor="siteName" className="block text-sm font-medium text-foreground/80">
          Nome do Site / Empresa <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            id="siteName"
            value={formData.siteName}
            onChange={(e) => handleFieldChange('siteName', e.target.value)}
            placeholder="Ex: Minha Empresa Ltda"
            className={`w-full rounded-lg border bg-background/50 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:border-primary/30 ${
              errors.siteName ? 'border-destructive' : 'border-input'
            }`}
          />
          {/* Ícone de validação */}
          {touched.siteName && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {errors.siteName ? (
                <X className="h-5 w-5 text-destructive animate-pulse" />
              ) : formData.siteName.trim().length > 0 ? (
                <Check className="h-5 w-5 text-green-500" />
              ) : null}
            </div>
          )}
        </div>
        {errors.siteName && (
          <p className="flex items-center gap-1 text-sm text-destructive animate-slide-in">
            <X className="h-3 w-3" />
            {errors.siteName}
          </p>
        )}
      </div>

      {/* Tipo de Site */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground/80">
          Tipo de Site <span className="text-destructive">*</span>
        </label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {siteTypes.map((type, index) => (
            <button
              key={type.id}
              type="button"
              onClick={() => handleFieldChange('siteType', type.id)}
              className={`relative overflow-hidden rounded-lg border px-3 py-3 text-sm font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg ${
                formData.siteType === type.id
                  ? 'border-primary bg-gradient-to-br from-primary to-primary-glow text-primary-foreground shadow-lg shadow-primary/30'
                  : 'border-input bg-background/50 hover:bg-accent/50'
              }`}
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <span className="relative z-10">{type.label}</span>
            </button>
          ))}
        </div>
        {errors.siteType && (
          <p className="flex items-center gap-1 text-sm text-destructive animate-slide-in">
            <X className="h-3 w-3" />
            {errors.siteType}
          </p>
        )}
      </div>

      {/* Descrição */}
      <div className="group space-y-2">
        <label htmlFor="description" className="block text-sm font-medium text-foreground/80">
          Descreva seu site <span className="text-destructive">*</span>
        </label>
        <div className="relative">
          <textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleFieldChange('description', e.target.value)}
            placeholder="Ex: Quero um site moderno para minha empresa de consultoria. Deve transmitir profissionalismo e inovação..."
            rows={4}
            className={`w-full resize-none rounded-lg border bg-background/50 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 group-hover:border-primary/30 ${
              errors.description ? 'border-destructive' : 'border-input'
            }`}
          />
          {/* Contador de caracteres */}
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            <span className={formData.description.length >= 20 ? 'text-green-500' : ''}>
              {formData.description.length}
            </span>
            /20
          </div>
        </div>
        {errors.description && (
          <p className="flex items-center gap-1 text-sm text-destructive animate-slide-in">
            <X className="h-3 w-3" />
            {errors.description}
          </p>
        )}
      </div>

      {/* Cores Preferidas */}
      <div className="space-y-2">
        <label htmlFor="colors" className="block text-sm font-medium text-foreground/80">
          Cores Preferidas <span className="text-muted-foreground">(opcional)</span>
        </label>
        <input
          type="text"
          id="colors"
          value={formData.colors}
          onChange={(e) => handleFieldChange('colors', e.target.value)}
          placeholder="Ex: Azul e branco, ou deixe em branco para sugerirmos"
          className="w-full rounded-lg border border-input bg-background/50 px-4 py-2.5 text-sm transition-all duration-300 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 hover:border-primary/30"
        />
      </div>

      {/* Seções Desejadas */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-foreground/80">
          Seções Desejadas <span className="text-muted-foreground">(opcional)</span>
        </label>
        <div className="flex flex-wrap gap-2">
          {commonSections.map((section) => (
            <button
              key={section}
              type="button"
              onClick={() => toggleSection(section)}
              className={`relative overflow-hidden rounded-full border px-4 py-1.5 text-sm transition-all duration-300 hover:scale-105 ${
                formData.sections.includes(section)
                  ? 'border-primary bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-md shadow-primary/20'
                  : 'border-input bg-background/50 hover:bg-accent/50'
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
        className="group relative w-full overflow-hidden rounded-lg bg-gradient-to-r from-primary via-secondary to-accent bg-size-200 bg-pos-0 px-6 py-4 text-sm font-semibold text-white shadow-lg shadow-primary/25 transition-all duration-300 hover:bg-pos-100 hover:shadow-xl hover:shadow-primary/40 hover:scale-[1.02] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        style={{ backgroundSize: '200% 100%' }}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {isGenerating ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" />
              <span className="gradient-text">Gerando site...</span>
            </>
          ) : (
            <>
              <Sparkles className="h-5 w-5 transition-transform group-hover:rotate-12" />
              <span className="gradient-text">Gerar Site com IA</span>
            </>
          )}
        </span>
        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </button>
    </form>
  );
}
