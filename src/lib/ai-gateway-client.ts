/**
 * Cliente AI Gateway para integração com modelos de IA
 *
 * Variáveis de ambiente necessárias:
 * - AI_GATEWAY_API_KEY
 *
 * Docs: https://vercel.com/ai-gateway
 */

const AI_GATEWAY_BASE_URL = 'https://gateway.ai.cloudflare.com/v1';
const API_KEY = process.env.AI_GATEWAY_API_KEY;

// Validação no startup
if (!API_KEY) {
  console.warn('⚠️  AI_GATEWAY_API_KEY not configured.');
}

export interface AICompletionRequest {
  model?: string;
  messages: Array<{ role: string; content: string }>;
  temperature?: number;
  max_tokens?: number;
}

export interface AICompletionResponse {
  id: string;
  choices: Array<{
    message: { role: string; content: string };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

/**
 * Faz chamada de completção via AI Gateway
 */
export async function createCompletion(
  request: AICompletionRequest
): Promise<AICompletionResponse> {
  if (!API_KEY) {
    throw new Error('AI_GATEWAY_API_KEY not configured');
  }

  const response = await fetch(`${AI_GATEWAY_BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: request.model || '@cf/meta/llama-3-8b-instruct',
      messages: request.messages,
      temperature: request.temperature ?? 0.7,
      max_tokens: request.max_tokens ?? 1024,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => 'Unknown error');
    throw new Error(`AI Gateway error (${response.status}): ${errorText}`);
  }

  return await response.json() as AICompletionResponse;
}

/**
 * Lista modelos disponíveis
 */
export async function listModels(): Promise<string[]> {
  if (!API_KEY) {
    throw new Error('AI_GATEWAY_API_KEY not configured');
  }

  const response = await fetch(`${AI_GATEWAY_BASE_URL}/models`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${API_KEY}`,
    },
  });

  if (!response.ok) {
    throw new Error(`AI Gateway error: ${response.status}`);
  }

  const data = await response.json();
  return data.data?.map((m: { id: string }) => m.id) || [];
}
