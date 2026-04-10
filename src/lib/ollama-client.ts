/**
 * Cliente Ollama para geração de conteúdo com IA
 * Usa modelo kimi-k2.5:cloud (gratuito) ou modelos locais
 */

import { buildFullPromptSection } from './templates';

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'qwen3.5:cloud';

export interface SiteGenerationRequest {
  siteName: string;
  siteType: string;
  description: string;
  colors?: string;
  sections?: string[];
  templateId?: string;
  themeId?: string;
}

export interface GeneratedContent {
  title: string;
  tagline: string;
  heroText: string;
  aboutText: string;
  servicesText: string[];
  ctaText: string;
  colorPalette: {
    primary: string;
    secondary: string;
    accent: string;
  };
}

const OLLAMA_TIMEOUT_MS = parseInt(process.env.OLLAMA_TIMEOUT_MS || '30000', 10);
const OLLAMA_MAX_RETRIES = 2;

/**
 * Chama Ollama diretamente via fetch API com timeout e retry
 */
async function callOllama(prompt: string, system: string, attempt = 1): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OLLAMA_TIMEOUT_MS);

  try {
    const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        system,
        stream: false,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new Error(`Ollama error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.response;
  } catch (error) {
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Ollama timeout: não respondeu em ${OLLAMA_TIMEOUT_MS / 1000}s`);
    }

    // Retry para erros transitórios
    if (attempt <= OLLAMA_MAX_RETRIES) {
      console.warn(`Ollama falhou (tentativa ${attempt}/${OLLAMA_MAX_RETRIES}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, 1000 * attempt)); // Backoff exponencial
      return callOllama(prompt, system, attempt + 1);
    }

    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

/**
 * Gera conteúdo para o site baseado no brief do usuário
 */
export async function generateSiteContent(
  request: SiteGenerationRequest
): Promise<GeneratedContent> {
  const prompt = buildGenerationPrompt(request);

  try {
    const text = await callOllama(
      prompt,
      'Você é um especialista em criação de conteúdo para websites. Gere conteúdo profissional, conciso e persuasivo em português do Brasil. Retorne APENAS JSON válido.'
    );

    return parseGeneratedContent(text);
  } catch (error) {
    console.error('Erro ao gerar conteúdo com Ollama:', error);
    throw new Error('Falha ao gerar conteúdo. Verifique se o Ollama está rodando.');
  }
}

function buildGenerationPrompt(request: SiteGenerationRequest): string {
  const sections = request.sections?.length
    ? `Seções desejadas: ${request.sections.join(', ')}`
    : 'Seções: Hero, Sobre, Serviços, Contato';

  // Adiciona seção de template/tema se selecionados
  const templateThemeSection = buildFullPromptSection(request.templateId, request.themeId);

  return `
Crie conteúdo para um website com as seguintes características:

- Nome: ${request.siteName}
- Tipo: ${request.siteType}
- Descrição: ${request.description}
- Cores preferidas: ${request.colors || 'A IA deve sugerir uma paleta'}
- ${sections}
${templateThemeSection}

Retorne APENAS um JSON válido no seguinte formato, sem markdown ou explicações:

{
  "title": "Título principal do site",
  "tagline": "Subtítulo ou slogan",
  "heroText": "Texto de introdução para a seção hero (2-3 frases)",
  "aboutText": "Texto sobre a empresa/pessoa (3-4 frases)",
  "servicesText": ["Serviço 1", "Serviço 2", "Serviço 3"],
  "ctaText": "Texto de call-to-action",
  "colorPalette": {
    "primary": "#HEX",
    "secondary": "#HEX",
    "accent": "#HEX"
  }
}
`.trim();
}

function parseGeneratedContent(text: string): GeneratedContent {
  try {
    // Remove markdown code blocks se presentes
    const cleanText = text
      .replace(/```json\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/```/g, '')
      .trim();

    const parsed = JSON.parse(cleanText);

    return {
      title: parsed.title || 'Bem-vindo',
      tagline: parsed.tagline || '',
      heroText: parsed.heroText || '',
      aboutText: parsed.aboutText || '',
      servicesText: Array.isArray(parsed.servicesText) ? parsed.servicesText : [],
      ctaText: parsed.ctaText || 'Entre em contato',
      colorPalette: parsed.colorPalette || {
        primary: '#18181b',
        secondary: '#71717a',
        accent: '#27272a',
      },
    };
  } catch (error) {
    console.error('Erro ao parsear conteúdo gerado:', error, text);
    throw new Error('Formato de resposta inválido da IA');
  }
}

/**
 * Gera código HTML/CSS para o site
 */
export async function generateSiteCode(
  content: GeneratedContent,
  siteType: string
): Promise<string> {
  const prompt = `
Com base no conteúdo abaixo, gere um arquivo HTML completo com Tailwind CSS embutido para um site do tipo ${siteType}.

Conteúdo:
${JSON.stringify(content, null, 2)}

Requisitos:
- Use Tailwind CSS via CDN (https://cdn.tailwindcss.com)
- Design moderno e responsivo
- Inclua todas as seções mencionadas
- Use a paleta de cores fornecida
- Retorne APENAS o código HTML, sem explicações
`.trim();

  try {
    const text = await callOllama(
      prompt,
      'Você é um desenvolvedor frontend especialista em HTML, CSS e Tailwind. Gere código limpo e moderno. Retorne APENAS o código HTML completo.'
    );

    return text
      .replace(/```html\s*/g, '')
      .replace(/```\s*/g, '')
      .replace(/```/g, '')
      .trim();
  } catch (error) {
    console.error('Erro ao gerar código:', error);
    throw new Error('Falha ao gerar código do site');
  }
}
