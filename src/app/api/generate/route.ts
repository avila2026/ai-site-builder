import { NextRequest, NextResponse } from 'next/server';
import { generateSiteContent, generateSiteCode } from '@/lib/ollama-client';
import type { SiteGenerationRequest } from '@/lib/ollama-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as SiteGenerationRequest;

    // Validação básica
    if (!body.siteName || !body.siteType || !body.description) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      );
    }

    // Gera o conteúdo com IA
    const content = await generateSiteContent(body);

    // Gera o código do site
    const code = await generateSiteCode(content, body.siteType);

    return NextResponse.json({
      success: true,
      content,
      code,
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
