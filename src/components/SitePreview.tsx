'use client';

import { useState, useMemo, useEffect } from 'react';
import { ExternalLink, RefreshCw, Download, Check, Edit3 } from 'lucide-react';

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
      <div className="flex items-center justify-between rounded-lg border bg-card p-3">
        <h3 className="font-semibold">{siteName}</h3>
        <div className="flex items-center gap-2">
          {onAdjust && (
            <button
              onClick={onAdjust}
              className="flex items-center gap-1.5 rounded-md bg-secondary px-3 py-1.5 text-sm text-secondary-foreground hover:bg-secondary/90"
            >
              <Edit3 className="h-4 w-4" />
              Ajustar
            </button>
          )}
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm hover:bg-accent"
          >
            {copied ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {copied ? 'Copiado' : 'Copiar'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm hover:bg-accent"
          >
            <Download className="h-4 w-4" />
            Baixar
          </button>
          <button
            onClick={handleOpenInNewTab}
            className="flex items-center gap-1.5 rounded-md bg-primary px-3 py-1.5 text-sm text-primary-foreground hover:bg-primary/90"
          >
            <ExternalLink className="h-4 w-4" />
            Abrir
          </button>
        </div>
      </div>

      {/* Preview iframe */}
      <div className="overflow-hidden rounded-lg border bg-background">
        {blobUrl ? (
          <iframe
            src={blobUrl}
            className="h-[600px] w-full"
            title={`Preview de ${siteName}`}
            sandbox="allow-scripts"
          />
        ) : (
          <div className="flex h-[600px] items-center justify-center text-muted-foreground">
            Carregando preview...
          </div>
        )}
      </div>
    </div>
  );
}
