import { NextRequest, NextResponse } from 'next/server';
import { generateSiteContent, generateSiteCode, type SiteGenerationRequest } from '@/lib/ollama-client';
import {
  generateSiteWithStitch,
  isStitchConfigured,
  StitchGenerationError,
} from '@/lib/stitch-client';

type GenerationProvider = 'ollama' | 'stitch';

// Interface estendida para suportar uploads e ajustes
interface ExtendedGenerationRequest extends SiteGenerationRequest {
  logo?: { url: string; filename: string } | null;
  productImages?: Array<{ url: string; filename: string }>;
  promptReference?: { url: string; filename: string; content?: string } | null;
  paletteReference?: { url: string; filename: string; content?: string } | null;
  adjustmentPrompt?: string;
  baseCode?: string;
}

function getConfiguredProvider(): GenerationProvider {
  const provider = process.env.SITE_GENERATION_PROVIDER?.toLowerCase();
  return provider === 'stitch' ? 'stitch' : 'ollama';
}

function canFallbackToOllama() {
  const value = process.env.STITCH_FALLBACK_TO_OLLAMA?.toLowerCase();
  return value !== 'false';
}

function shouldFallbackToOllama(error: unknown) {
  if (!canFallbackToOllama()) {
    return false;
  }

  return error instanceof StitchGenerationError && error.recoverable;
}

export async function POST(request: NextRequest) {
  const encoder = new TextEncoder();

  try {
    const body = await request.json() as ExtendedGenerationRequest;

    // Validação básica
    if (!body.siteName || !body.siteType || !body.description) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Construir prompt enriquecido com uploads e contexto
    let enrichedDescription = body.description;

    // Adicionar contexto do prompt de ajuste
    if (body.adjustmentPrompt) {
      enrichedDescription += `\n\n[AJUSTES SOLICITADOS]\n${body.adjustmentPrompt}`;
    }

    // Adicionar conteúdo do arquivo de prompt de referência
    if (body.promptReference?.content) {
      enrichedDescription += `\n\n[REFERÊNCIA DO PROMPT]\n${body.promptReference.content}`;
    }

    // Adicionar paleta de cores do arquivo
    if (body.paletteReference?.content) {
      enrichedDescription += `\n\n[PALETA DE CORES]\n${body.paletteReference.content}`;
    }

    // Adicionar informações da logo
    if (body.logo) {
      enrichedDescription += `\n\n[LOGO]\nFilename: ${body.logo.filename}\nURL: ${body.logo.url}`;
    }

    // Adicionar informações das imagens de produto
    if (body.productImages && body.productImages.length > 0) {
      enrichedDescription += `\n\n[IMAGENS DE PRODUTO]\n${body.productImages.map(img => `- ${img.filename}: ${img.url}`).join('\n')}`;
    }

    // Adicionar código base para ajustes
    if (body.baseCode) {
      enrichedDescription += `\n\n[CÓDIGO BASE PARA AJUSTES]\n${body.baseCode.substring(0, 5000)}...`;
    }

    // Criar objeto estendido com descrição enriquecida
    const extendedBody: ExtendedGenerationRequest = {
      ...body,
      description: enrichedDescription,
    };

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

          const content = await generateSiteContent(extendedBody);

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
              throw new Error('STITCH_API_KEY nao configurada');
            }

            try {
              enqueue({
                type: 'status',
                status: 'stitch_generating',
                message: 'Gerando layout com Stitch...',
                provider: 'stitch',
              });

              const stitchResult = await generateSiteWithStitch(extendedBody);

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
              if (!shouldFallbackToOllama(error)) {
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
        'Content-Type': 'application/x-ndjson; charset=utf-8',
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
