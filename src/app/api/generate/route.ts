import { NextRequest, NextResponse } from 'next/server';
import { generateSiteContent, generateSiteCode } from '@/lib/ollama-client';
import type { SiteGenerationRequest } from '@/lib/ollama-client';
import { generateSiteWithStitch, isStitchConfigured } from '@/lib/stitch-client';

type GenerationProvider = 'ollama' | 'stitch';

function getConfiguredProvider(): GenerationProvider {
  const provider = process.env.SITE_GENERATION_PROVIDER?.toLowerCase();
  return provider === 'stitch' ? 'stitch' : 'ollama';
}

function canFallbackToOllama() {
  const value = process.env.STITCH_FALLBACK_TO_OLLAMA?.toLowerCase();
  return value !== 'false';
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json() as SiteGenerationRequest;

    // Validação básica
    if (!body.siteName || !body.siteType || !body.description) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const enqueue = (payload: unknown) => {
          controller.enqueue(encoder.encode(`${JSON.stringify(payload)}\n`));
        };

        const generateWithOllama = async (fallbackReason?: string) => {
          if (fallbackReason) {
            enqueue({
              type: 'status',
              status: 'fallback_to_ollama',
              message: `Stitch indisponivel (${fallbackReason}). Continuando com Ollama...`,
            });
          }

          enqueue({
            type: 'status',
            status: 'generating_content',
            message: 'Gerando conteúdo com IA...',
            provider: 'ollama',
          });

          const content = await generateSiteContent(body);

          enqueue({
            type: 'status',
            status: 'content_generated',
            message: 'Conteúdo gerado! Criando código...',
            provider: 'ollama',
            content,
          });

          enqueue({
            type: 'status',
            status: 'generating_code',
            message: 'Gerando código HTML/Tailwind...',
            provider: 'ollama',
          });

          const code = await generateSiteCode(content, body.siteType);

          enqueue({
            type: 'complete',
            status: 'completed',
            message: 'Site gerado com sucesso!',
            provider: 'ollama',
            content,
            code,
          });
        };

        try {
          const provider = getConfiguredProvider();

          if (provider === 'stitch') {
            enqueue({
              type: 'status',
              status: 'stitch_initializing',
              message: 'Inicializando Stitch...',
              provider: 'stitch',
            });

            if (!isStitchConfigured()) {
              if (!canFallbackToOllama()) {
                throw new Error('STITCH_API_KEY nao configurada');
              }

              await generateWithOllama('chave STITCH_API_KEY ausente');
              controller.close();
              return;
            }

            try {
              enqueue({
                type: 'status',
                status: 'stitch_generating',
                message: 'Gerando layout com Stitch...',
                provider: 'stitch',
              });

              const stitchResult = await generateSiteWithStitch(body);

              enqueue({
                type: 'complete',
                status: 'completed',
                message: 'Site gerado com sucesso via Stitch!',
                provider: 'stitch',
                content: {
                  provider: 'stitch',
                  source: 'stitch-sdk',
                },
                code: stitchResult.code,
                artifacts: stitchResult.artifacts,
              });

              controller.close();
              return;
            } catch (error) {
              if (!canFallbackToOllama()) {
                throw error;
              }

              const reason =
                error instanceof Error ? error.message : 'erro desconhecido do Stitch';
              await generateWithOllama(reason);
              controller.close();
              return;
            }
          }

          await generateWithOllama();

          controller.close();
        } catch (error) {
          enqueue({
            type: 'error',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          });
          controller.close();
        }
      },
    });

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Erro na geração do site:', error);

    if (error instanceof Error && error.message.includes('Ollama')) {
      return NextResponse.json(
        { error: 'Ollama não disponível. Verifique se está rodando em localhost:11434' },
        { status: 503 }
      );
    }

    if (error instanceof Error && error.message.includes('STITCH_API_KEY')) {
      return NextResponse.json(
        { error: 'Stitch não configurado. Defina STITCH_API_KEY no ambiente.' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: 'Falha ao gerar site. Tente novamente.' },
      { status: 500 }
    );
  }
}
