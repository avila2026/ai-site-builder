'use client';

import { useState, useEffect } from 'react';
import { Menu, X, Sparkles, Database, Zap, Server, Cloud, Shield, Link } from 'lucide-react';
import Tooltip from '@/components/ui/Tooltip';

interface MainLayoutProps {
  children: React.ReactNode;
}

interface IntegrationStatus {
  ollama: { connected: boolean; checking: boolean };
  autonoma: { connected: boolean };
  browserbase: { connected: boolean };
  stitch: { connected: boolean };
  database: { connected: boolean };
  auth0: { connected: boolean };
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [status, setStatus] = useState<IntegrationStatus>({
    ollama: { connected: false, checking: true },
    autonoma: { connected: false },
    browserbase: { connected: false },
    stitch: { connected: false },
    database: { connected: false },
    auth0: { connected: false },
  });

  const menuItems = [
    { id: 'builder', label: 'Criar Site', icon: Sparkles },
  ];

  // Check integrations health on mount
  useEffect(() => {
    const checkHealth = async () => {
      try {
        const response = await fetch('/api/health');
        const data = await response.json();
        setStatus(prev => ({
          ...prev,
          ollama: {
            connected: data.ollama?.connected === true,
            checking: false,
          },
          autonoma: { connected: data.autonoma?.connected === true },
          browserbase: { connected: data.browserbase?.connected === true },
          stitch: { connected: data.stitch?.connected === true },
          database: { connected: data.database?.connected === true },
          auth0: { connected: data.auth0?.connected === true },
        }));
      } catch {
        setStatus(prev => ({
          ...prev,
          ollama: { connected: false, checking: false },
        }));
      }
    };

    checkHealth();
  }, []);

  return (
    <div className="flex h-screen bg-background">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-card border-r border-border transition-transform duration-300 lg:static lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary" />
              <span className="text-lg font-semibold">AI Site Builder</span>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 hover:bg-accent rounded-lg"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 px-3 py-4">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  className="flex w-full items-center gap-3 rounded-lg bg-primary px-3 py-2.5 text-sm font-medium text-primary-foreground"
                >
                  <Icon className="h-5 w-5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Footer - Integration Status */}
          <div className="border-t border-border p-4">
            <div className="space-y-3 text-xs">
              <p className="font-semibold text-muted-foreground mb-2 flex items-center gap-2">
                <Link className="h-3 w-3" />
                Integrações
              </p>

              {/* Ollama Status */}
              <Tooltip content={status.ollama.checking ? 'Verificando conexão...' : status.ollama.connected ? 'Ollama conectado e pronto para usar' : 'Ollama não disponível - verifique se está rodando'} position="right">
                <div className="flex items-center gap-2 cursor-help group">
                  {status.ollama.checking ? (
                    <div className="h-2 w-2 rounded-full bg-yellow-500 animate-pulse" />
                  ) : status.ollama.connected ? (
                    <div className="h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-connection-pulse" />
                  ) : (
                    <div className="h-2 w-2 rounded-full bg-red-500" />
                  )}
                  <div className="flex items-center gap-1.5">
                    <Server className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Ollama</span>
                  </div>
                </div>
              </Tooltip>

              {/* Autonoma Status */}
              <Tooltip content={status.autonoma.connected ? 'Autonoma conectado' : 'Autonoma não conectado'} position="right">
                <div className="flex items-center gap-2 cursor-help group">
                  <div className={`h-2 w-2 rounded-full transition-all duration-300 ${status.autonoma.connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-connection-pulse' : 'bg-gray-500'}`} />
                  <div className="flex items-center gap-1.5">
                    <Cloud className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Autonoma</span>
                  </div>
                </div>
              </Tooltip>

              {/* BrowserBase Status */}
              <Tooltip content={status.browserbase.connected ? 'BrowserBase conectado' : 'BrowserBase não conectado'} position="right">
                <div className="flex items-center gap-2 cursor-help group">
                  <div className={`h-2 w-2 rounded-full transition-all duration-300 ${status.browserbase.connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-connection-pulse' : 'bg-gray-500'}`} />
                  <div className="flex items-center gap-1.5">
                    <Cloud className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">BrowserBase</span>
                  </div>
                </div>
              </Tooltip>

              {/* Stitch Status */}
              <Tooltip content={status.stitch.connected ? 'Stitch conectado' : 'Stitch não conectado'} position="right">
                <div className="flex items-center gap-2 cursor-help group">
                  <div className={`h-2 w-2 rounded-full transition-all duration-300 ${status.stitch.connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-connection-pulse' : 'bg-gray-500'}`} />
                  <div className="flex items-center gap-1.5">
                    <Cloud className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Stitch</span>
                  </div>
                </div>
              </Tooltip>

              {/* Database Status */}
              <Tooltip content={status.database.connected ? 'Neon DB conectado' : 'Neon DB não conectado'} position="right">
                <div className="flex items-center gap-2 cursor-help group">
                  <div className={`h-2 w-2 rounded-full transition-all duration-300 ${status.database.connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-connection-pulse' : 'bg-gray-500'}`} />
                  <div className="flex items-center gap-1.5">
                    <Database className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Neon DB</span>
                  </div>
                </div>
              </Tooltip>

              {/* Auth0 Status */}
              <Tooltip content={status.auth0.connected ? 'Auth0 conectado - autenticação ativa' : 'Auth0 não conectado'} position="right">
                <div className="flex items-center gap-2 cursor-help group">
                  <div className={`h-2 w-2 rounded-full transition-all duration-300 ${status.auth0.connected ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)] animate-connection-pulse' : 'bg-gray-500'}`} />
                  <div className="flex items-center gap-1.5">
                    <Shield className="h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors" />
                    <span className="text-muted-foreground group-hover:text-foreground transition-colors">Auth0</span>
                  </div>
                </div>
              </Tooltip>
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="glass sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden p-2 hover:bg-accent/50 rounded-lg transition-colors"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Logo em mobile */}
          <div className="lg:hidden flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-secondary">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <span className="font-semibold gradient-text">AI Site Builder</span>
          </div>

          {/* Status badges */}
          <div className="flex items-center gap-3">
            {/* Ollama Badge */}
            {status.ollama.connected && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-500/10 px-3 py-1 text-xs text-green-400 border border-green-500/20">
                <Zap className="h-3 w-3" />
                <span>IA Ativa</span>
              </div>
            )}

            {/* Database Badge */}
            {status.database.connected && (
              <div className="hidden sm:flex items-center gap-1.5 rounded-full bg-blue-500/10 px-3 py-1 text-xs text-blue-400 border border-blue-500/20">
                <Database className="h-3 w-3" />
                <span>DB Conectado</span>
              </div>
            )}

            {/* Project info */}
            <div className="hidden lg:block text-right">
              <p className="text-sm font-medium text-foreground">AI Site Builder</p>
              <p className="text-xs text-muted-foreground">v1.0.0</p>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 overflow-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
