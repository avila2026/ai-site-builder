'use client';

import { useState } from 'react';
import MainLayout from '@/components/MainLayout';
import BriefForm from '@/components/BriefForm';
import SitePreview from '@/components/SitePreview';
import { Zap, Shield, Globe } from 'lucide-react';

export default function Home() {
  const [generatedCode, setGeneratedCode] = useState<string>('');
  const [siteName, setSiteName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleBriefSubmit = (data: any) => {
    setSiteName(data.siteName);
    setIsGenerating(true);
  };

  const handleGenerated = (result: { content: any; code: string }) => {
    setGeneratedCode(result.code);
    setIsGenerating(false);
  };

  return (
    <MainLayout>
      <div className="mx-auto max-w-6xl space-y-8">
        {/* Header Section */}
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Crie seu site com IA
          </h1>
          <p className="mt-3 text-muted-foreground sm:text-lg">
            Descreva o site dos seus sonhos e nossa IA vai construí-lo em segundos.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form Section */}
          <div className="space-y-6">
            <div className="rounded-xl border bg-card p-6 shadow-sm">
              <BriefForm
                onSubmit={handleBriefSubmit}
                isGenerating={isGenerating}
                onGenerated={handleGenerated}
              />
            </div>

            {/* Features */}
            <div className="grid gap-4">
              <FeatureCard
                icon={Zap}
                title="Geração Rápida"
                description="Seu site pronto em segundos usando IA avançada."
              />
              <FeatureCard
                icon={Shield}
                title="100% Gratuito"
                description="Sem custos escondidos. Tudo gratuito para sempre."
              />
              <FeatureCard
                icon={Globe}
                title="Deploy Fácil"
                description="Publique no Vercel ou GitHub Pages com um clique."
              />
            </div>
          </div>

          {/* Preview Section */}
          <div>
            {generatedCode ? (
              <SitePreview htmlCode={generatedCode} siteName={siteName} />
            ) : (
              <div className="flex h-full min-h-[600px] items-center justify-center rounded-xl border border-dashed bg-card p-8 text-center">
                <div>
                  <p className="text-lg font-medium">Nenhum site gerado ainda</p>
                  <p className="mt-2 text-sm text-muted-foreground">
                    Preencha o formulário ao lado para criar seu site com IA
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

interface FeatureCardProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}

function FeatureCard({ icon: Icon, title, description }: FeatureCardProps) {
  return (
    <div className="flex flex-col items-center rounded-lg border bg-card p-6 text-center shadow-sm">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-6 w-6 text-primary" />
      </div>
      <h3 className="font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
