import { NextRequest, NextResponse } from 'next/server';
import { createBrowserbaseSession } from '@/lib/browserbase-client';

export const runtime = 'nodejs';

interface CreateSessionBody {
  projectId?: string;
  keepAlive?: boolean;
  region?: 'us-west-2' | 'us-east-1' | 'eu-central-1' | 'ap-southeast-1';
  timeout?: number;
  userMetadata?: Record<string, unknown>;
  browserSettings?: {
    advancedStealth?: boolean;
    blockAds?: boolean;
    logSession?: boolean;
    os?: 'windows' | 'mac' | 'linux' | 'mobile' | 'tablet';
    recordSession?: boolean;
    solveCaptchas?: boolean;
    viewport?: {
      width?: number;
      height?: number;
    };
  };
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({})) as CreateSessionBody;

    if (body.timeout !== undefined && (!Number.isFinite(body.timeout) || body.timeout <= 0)) {
      return NextResponse.json(
        { error: 'timeout deve ser um número positivo em segundos' },
        { status: 400 },
      );
    }

    const session = await createBrowserbaseSession({
      projectId: body.projectId,
      keepAlive: body.keepAlive,
      region: body.region,
      timeout: body.timeout,
      userMetadata: body.userMetadata,
      browserSettings: body.browserSettings,
    });

    return NextResponse.json({
      success: true,
      session,
    });
  } catch (error) {
    console.error('Erro ao criar sessão no Browserbase:', error);

    if (error instanceof Error && error.message.includes('not configured')) {
      return NextResponse.json(
        { error: 'Credenciais ou projeto do Browserbase não configurados' },
        { status: 503 },
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Falha ao criar sessão no Browserbase' },
      { status: 500 },
    );
  }
}
