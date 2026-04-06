import { NextRequest, NextResponse } from 'next/server';
import { generateSiteContent, generateSiteCode } from '@/lib/ollama-client';
import type { SiteGenerationRequest } from '@/lib/ollama-client';

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
        try {
          // Envia status inicial
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'status',
            status: 'generating_content',
            message: 'Gerando conteúdo com IA...',
          }) + '\n'));

          // Gera o conteúdo com IA
          const content = await generateSiteContent(body);

          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'status',
            status: 'content_generated',
            message: 'Conteúdo gerado! Criando código...',
            content,
          }) + '\n'));

          // Gera o código do site
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'status',
            status: 'generating_code',
            message: 'Gerando código HTML/Tailwind...',
          }) + '\n'));

          const code = await generateSiteCode(content, body.siteType);

          // Envia resultado final
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'complete',
            status: 'completed',
            message: 'Site gerado com sucesso!',
            content,
            code,
          }) + '\n'));

          controller.close();
        } catch (error) {
          controller.enqueue(encoder.encode(JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Erro desconhecido',
          }) + '\n'));
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

    return NextResponse.json(
      { error: 'Falha ao gerar site. Tente novamente.' },
      { status: 500 }
    );
  }
}
