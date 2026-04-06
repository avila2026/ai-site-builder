'use client';

import { useEffect, useState } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import Link from 'next/link';

interface GlobalErrorFallbackProps {
  error?: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalErrorFallback({ error, reset }: GlobalErrorFallbackProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-destructive/30 bg-card p-8 text-center shadow-2xl">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="h-10 w-10 text-destructive" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold gradient-text">Erro na Aplicação</h1>
          <p className="text-sm text-muted-foreground">
            {error?.message || 'Ocorreu um erro inesperado'}
          </p>
          {error?.digest && (
            <p className="text-xs text-muted-foreground font-mono">
              ID: {error.digest}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <button
            onClick={reset}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            <RefreshCw className="h-4 w-4" />
            Tentar Novamente
          </button>

          <Link
            href="/"
            className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-input bg-background px-4 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-accent/50"
          >
            <Home className="h-4 w-4" />
            Página Inicial
          </Link>
        </div>

        <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Bug className="h-3 w-3" />
          <span>Se o erro persistir, verifique o console do navegador</span>
        </div>
      </div>
    </div>
  );
}
