
import { NextRequest, NextResponse } from 'next/server';
import { triggerTestRun } from '@/lib/providers/autonoma-client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { testId, application_version_id, runtime_metadata } = body;

    if (!testId) {
      return NextResponse.json(
        { error: 'testId é obrigatório' },
        { status: 400 }
      );
    }

    const result = await triggerTestRun({
      testId,
      application_version_id,
      runtime_metadata,
    });

    return NextResponse.json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('Erro ao executar teste na Autonoma:', error);

    if (error instanceof Error && error.message.includes('credentials')) {
      return NextResponse.json(
        { error: 'Credenciais da Autonoma não configuradas' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao executar teste' },
      { status: 500 }
    );
  }
}
