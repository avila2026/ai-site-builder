/**
 * Cliente Ollama para geração de conteúdo com IA
 * Usa modelo kimi-k2.5:cloud (gratuito) ou modelos locais
 */

const OLLAMA_BASE_URL = 'http://localhost:11434';

export interface SiteGenerationRequest {
  siteName: string;
  siteType: string;
  description: string;
  colors?: string;
  sections?: string[];
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

/**
 * Chama Ollama diretamente via fetch API
 */
async function callOllama(prompt: string, system: string): Promise<string> {
  const response = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'kimi-k2.5:cloud',
      prompt,
      system,
      stream: false,
    }),
  });

  if (!response.ok) {
    throw new Error(`Ollama error: ${response.status}`);
  }

  const data = await response.json();
  return data.response;
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

  return `
Crie conteúdo para um website com as seguintes características:

- Nome: ${request.siteName}
- Tipo: ${request.siteType}
- Descrição: ${request.description}
- Cores preferidas: ${request.colors || 'A IA deve sugerir uma paleta'}
- ${sections}

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
