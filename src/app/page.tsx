'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/MainLayout';
import BriefForm, { type BriefData } from '@/components/BriefForm';
import SitePreview from '@/components/SitePreview';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useToast } from '@/components/Toast';
import { Zap, Shield, Globe, Sparkles, Loader2, Wand2, Palette, Rocket, ExternalLink } from 'lucide-react';

interface GitHubExportSuccessResponse {
  ok: true;
  repo: {
    name: string;
    fullName: string;
    htmlUrl: string;
    private: boolean;
  };
  branch: string;
}

interface GitHubExportErrorResponse {
  ok: false;
  code: 'MISSING_GITHUB_PAT' | 'REPO_CREATE_FAILED' | 'FILE_PUSH_FAILED' | 'RATE_LIMITED';
  message: string;
}

export default function Home() {
  const { addToast } = useToast();
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [siteName, setSiteName] = useState('');
  const [lastBrief, setLastBrief] = useState<BriefData | null>(null);
  const [lastExport, setLastExport] = useState<{
    fullName: string;
    htmlUrl: string;
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<string>('');
  const [mode, setMode] = useState<'create' | 'adjust'>('create');
  const [particles, setParticles] = useState<{ id: number; left: number; delay: number }[]>([]);

  useEffect(() => {
    // Gerar partículas animadas
    const newParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 15,
    }));
    setParticles(newParticles);
  }, []);

  const handleBriefSubmit = async (data: BriefData) => {
    setSiteName(data.siteName);
    setLastBrief(data);
    setLastExport(null);
    setIsGenerating(true);
    setGenerationStatus(mode === 'adjust' ? 'Aplicando ajustes...' : 'Iniciando geração...');
    addToast('info', mode === 'adjust' ? 'Aplicando ajustes no site...' : 'Iniciando geração do site...');
  };

  const triggerGitHubExport = async (resultCode: string, brief: BriefData | null) => {
    if (!brief?.siteName || !resultCode) {
      return;
    }

    addToast('info', 'Site gerado. Exportando automaticamente para o GitHub...');

    try {
      const response = await fetch('/api/github/export', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          siteName: brief.siteName,
          generatedHtml: resultCode,
          siteType: brief.siteType,
          description: brief.description,
        }),
      });

      const payload = await response.json() as
        | GitHubExportSuccessResponse
        | GitHubExportErrorResponse;

      if (!response.ok || !payload.ok) {
        const message =
          payload && 'message' in payload
            ? payload.message
            : 'Falha ao exportar para o GitHub';

        addToast('warning', `Site gerado, mas exportação falhou: ${message}`);
        return;
      }

      setLastExport({
        fullName: payload.repo.fullName,
        htmlUrl: payload.repo.htmlUrl,
      });

      addToast('success', `Exportado para GitHub: ${payload.repo.fullName}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'erro desconhecido';
      addToast('warning', `Site gerado, mas exportação falhou: ${message}`);
    }
  };

  const handleGenerated = (result: { content: unknown; code: string }) => {
    setGeneratedCode(result.code);
    setIsGenerating(false);
    setGenerationStatus('');
    setMode('adjust'); // Após gerar, muda para modo de ajuste
    addToast('success', mode === 'adjust' ? 'Ajustes aplicados com sucesso!' : 'Site gerado com sucesso!');

    void triggerGitHubExport(result.code, lastBrief);
  };

  const handleProgress = (status: { type: string; status: string; message: string }) => {
    setGenerationStatus(status.message);
    if (status.type === 'error') {
      addToast('error', status.message);
    }
  };

  const handleStartAdjustment = () => {
    setMode('adjust');
    addToast('info', 'Modo de ajustes ativado - descreva o que quer modificar');
  };

  return (
    <MainLayout>
      <ErrorBoundary>
        {/* Partículas de fundo */}
        <div className="particles">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle"
              style={{
                left: `${particle.left}%`,
                animationDelay: `${particle.delay}s`,
                bottom: '-10px',
              }}
            />
          ))}
        </div>

      {/* Loading Overlay com animação */}
      {isGenerating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md">
          <div className="flex flex-col items-center gap-6 rounded-2xl bg-card/80 p-10 shadow-2xl neon-border animate-glow">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="absolute inset-0 rounded-full animate-ping bg-primary/20" />
            </div>
            <div className="text-center">
              <p className="text-xl font-semibold gradient-text">Gerando seu site com IA</p>
              <p className="mt-2 text-sm text-muted-foreground animate-pulse">
                {generationStatus || 'Nossa IA está criando algo incrível para você...'}
              </p>
            </div>
            {/* Barra de progresso animada */}
            <div className="w-64 overflow-hidden rounded-full bg-muted">
              <div className="h-2 animate-gradient rounded-full bg-gradient-to-r from-primary via-secondary to-accent" style={{ width: '100%', animation: 'shimmer 2s infinite' }} />
            </div>
          </div>
        </div>
      )}

      <div className="relative mx-auto max-w-7xl space-y-12 px-4 py-8">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20 p-8 text-center shadow-2xl sm:p-12">
          {/* Efeito de brilho */}
          <div className="absolute -top-24 -left-24 h-64 w-64 rounded-full bg-primary/30 blur-3xl" />
          <div className="absolute -bottom-24 -right-24 h-64 w-64 rounded-full bg-secondary/30 blur-3xl" />

          <div className="relative z-10">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-lg animate-float">
              <Sparkles className="h-10 w-10 text-white" />
            </div>
            <h1 className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-4xl font-bold text-transparent sm:text-5xl md:text-6xl animate-gradient" style={{ backgroundSize: '200% 200%' }}>
              Crie seu site com IA
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground sm:text-xl">
              Descreva o site dos seus sonhos e nossa IA vai construí-lo em segundos.
              <span className="gradient-text font-semibold"> Rápido, bonito e gratuito.</span>
            </p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="group relative overflow-hidden rounded-2xl bg-card p-6 shadow-xl transition-all duration-300 hover:shadow-2xl hover:shadow-primary/10 neon-border">
              {/* Efeito de hover */}
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />

              <BriefForm
                onSubmit={handleBriefSubmit}
                isGenerating={isGenerating}
                onGenerated={handleGenerated}
                onProgress={handleProgress}
                mode={mode}
                existingCode={generatedCode}
              />
            </div>

            {/* Features com animação */}
            <div className="grid gap-4 sm:grid-cols-3">
              <FeatureCard
                icon={Wand2}
                title="Geração Mágica"
                description="Seu site pronto em segundos"
                gradient="from-primary to-secondary"
              />
              <FeatureCard
                icon={Palette}
                title="Design Único"
                description="Cada site é personalizado"
                gradient="from-secondary to-accent"
              />
              <FeatureCard
                icon={Rocket}
                title="Deploy Rápido"
                description="Publique com um clique"
                gradient="from-accent to-primary"
              />
            </div>
          </div>

          {/* Preview Section */}
          <div>
            {generatedCode ? (
              <div className="space-y-4 animate-slide-in">
                {lastExport && (
                  <div className="rounded-xl border border-emerald-400/30 bg-emerald-400/10 p-4 text-sm">
                    <p className="font-semibold text-emerald-300">Exportação para GitHub concluída</p>
                    <a
                      href={lastExport.htmlUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-emerald-200 underline-offset-4 hover:underline"
                    >
                      {lastExport.fullName}
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                )}
                <SitePreview htmlCode={generatedCode} siteName={siteName} onAdjust={handleStartAdjustment} />
              </div>
            ) : (
              <div className="group flex h-full min-h-[600px] items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-muted bg-card/50 p-8 text-center transition-all duration-300 hover:border-primary/50 hover:bg-card">
                <div className="space-y-4">
                  <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-muted/50 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12">
                    <Sparkles className="h-10 w-10 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div>
                    <p className="text-lg font-medium text-foreground">Nenhum site gerado ainda</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      Preencha o formulário ao lado para criar seu site com IA
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Features */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <InfoCard
            icon={Zap}
            title="Ultra Rápido"
            description="Geração em tempo real"
            color="text-yellow-400"
            bgColor="bg-yellow-400/10"
          />
          <InfoCard
            icon={Shield}
            title="100% Gratuito"
            description="Sem custos escondidos"
            color="text-green-400"
            bgColor="bg-green-400/10"
          />
          <InfoCard
            icon={Globe}
            title="Deploy Fácil"
            description="Vercel ou GitHub Pages"
            color="text-blue-400"
            bgColor="bg-blue-400/10"
          />
          <InfoCard
            icon={Sparkles}
            title="IA Avançada"
            description="Tecnologia de ponta"
            color="text-purple-400"
            bgColor="bg-purple-400/10"
          />
        </div>
      </div>
      </ErrorBoundary>
    </MainLayout>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  gradient: string;
}

function FeatureCard({ icon: Icon, title, description, gradient }: FeatureCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-card p-5 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 transition-opacity duration-300 group-hover:opacity-10`} />
      <div className="relative flex flex-col items-center text-center">
        <div className={`mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${gradient} shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

interface InfoCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  color: string;
  bgColor: string;
}

function InfoCard({ icon: Icon, title, description, color, bgColor }: InfoCardProps) {
  return (
    <div className="group flex items-center gap-4 rounded-xl border bg-card p-4 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${bgColor} transition-transform duration-300 group-hover:scale-110`}>
        <Icon className={`h-6 w-6 ${color}`} />
      </div>
      <div>
        <h3 className="font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}
