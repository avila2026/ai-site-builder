import { NextResponse } from 'next/server';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';

export async function GET() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: 'GET',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Ollama responded with status ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json({
      status: 'connected',
      ollama: true,
      models: data.models?.length || 0,
      url: OLLAMA_BASE_URL,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'disconnected',
        ollama: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        url: OLLAMA_BASE_URL,
      },
      { status: 503 }
    );
  }
}
