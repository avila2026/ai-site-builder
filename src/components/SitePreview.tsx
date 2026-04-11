'use client';

import { useState, useMemo, useEffect } from 'react';
import { ExternalLink, RefreshCw, Download, Check, Edit3, Copy, Globe, Save } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

interface SitePreviewProps {
  htmlCode: string;
  siteName: string;
  onAdjust?: () => void;
}

export default function SitePreview({ htmlCode, siteName, onAdjust }: SitePreviewProps) {
  const [copied, setCopied] = useState(false);

  // Derived state — useMemo instead of useEffect + setState (React 19 requirement)
  const blobUrl = useMemo(() => {
    if (!htmlCode) return '';
    const blob = new Blob([htmlCode], { type: 'text/html' });
    return URL.createObjectURL(blob);
  }, [htmlCode]);

  // Cleanup: revoke blob URLs to prevent memory leaks
  useEffect(() => {
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [blobUrl]);

  const handleOpenInNewTab = () => {
    if (blobUrl) {
      window.open(blobUrl, '_blank');
    }
  };

  const handleDownload = () => {
    if (htmlCode) {
      const blob = new Blob([htmlCode], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${siteName.toLowerCase().replace(/\s+/g, '-')}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(htmlCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="group relative overflow-hidden rounded-xl border bg-card p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:shadow-primary/5">
        {/* Efeito de brilho no hover */}
        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

        <div className="relative flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          {/* Nome do Site */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold gradient-text">{siteName}</h3>
          </div>

          {/* Ações */}
          <div className="flex flex-wrap items-center gap-2">
            {onAdjust && (
              <Tooltip content="Fazer ajustes no site" position="bottom">
                <button
                  onClick={onAdjust}
                  className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-secondary to-secondary-glow px-3 py-1.5 text-sm font-medium text-secondary-foreground shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg"
                >
                  <Edit3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Ajustar</span>
                </button>
              </Tooltip>
            )}

            <Tooltip content={copied ? 'Código copiado!' : 'Copiar código HTML'} position="bottom">
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1.5 rounded-lg border border-input bg-background/50 px-3 py-1.5 text-sm transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:bg-accent/50"
              >
                {copied ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
              </button>
            </Tooltip>

            <Tooltip content="Baixar arquivo HTML" position="bottom">
              <button
                onClick={handleDownload}
                className="flex items-center gap-1.5 rounded-lg border border-input bg-background/50 px-3 py-1.5 text-sm transition-all duration-300 hover:scale-105 hover:border-primary/50 hover:bg-accent/50"
              >
                <Save className="h-4 w-4" />
                <span className="hidden sm:inline">Baixar</span>
              </button>
            </Tooltip>

            <Tooltip content="Abrir em nova aba" position="bottom">
              <button
                onClick={handleOpenInNewTab}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-primary to-primary-glow px-3 py-1.5 text-sm font-medium text-primary-foreground shadow-md shadow-primary/20 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-primary/30"
              >
                <ExternalLink className="h-4 w-4" />
                <span className="hidden sm:inline">Abrir</span>
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="group/iframe relative overflow-hidden rounded-xl border bg-background shadow-lg transition-all duration-300 hover:shadow-xl">
        {blobUrl ? (
          <iframe
            src={blobUrl}
            className="h-[600px] w-full transition-opacity duration-300 group-hover/iframe:opacity-95"
            title={`Preview de ${siteName}`}
            sandbox="allow-scripts"
          />
        ) : (
          <div className="flex h-[600px] items-center justify-center text-muted-foreground">
            <div className="flex flex-col items-center gap-3">
              <RefreshCw className="h-8 w-8 animate-spin text-primary" />
              <p>Carregando preview...</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
