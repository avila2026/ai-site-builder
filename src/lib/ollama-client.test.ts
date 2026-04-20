import {
  generateSiteContent,
  generateSiteCode,
  type SiteGenerationRequest,
  type GeneratedContent,
} from './ollama-client';

const BASE_REQUEST: SiteGenerationRequest = {
  siteName: 'Escritório Digital',
  siteType: 'servicos',
  description: 'Consultoria em tecnologia para PMEs',
  colors: 'azul e branco',
  sections: ['Hero', 'Serviços', 'Contato'],
};

const VALID_CONTENT: GeneratedContent = {
  title: 'Escritório Digital',
  tagline: 'Tecnologia que transforma negócios',
  heroText: 'Soluções modernas para sua empresa crescer.',
  aboutText: 'Somos especialistas em transformação digital.',
  servicesText: ['Consultoria', 'Desenvolvimento', 'Suporte'],
  ctaText: 'Fale conosco',
  colorPalette: { primary: '#1e40af', secondary: '#93c5fd', accent: '#2563eb' },
};

function makeOllamaResponse(body: unknown) {
  return {
    ok: true,
    json: async () => ({ response: JSON.stringify(body) }),
    text: async () => JSON.stringify(body),
  };
}

describe('generateSiteContent', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retorna conteúdo estruturado quando Ollama responde corretamente', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeOllamaResponse(VALID_CONTENT)) as jest.Mock;

    const result = await generateSiteContent(BASE_REQUEST);

    expect(result.title).toBe(VALID_CONTENT.title);
    expect(result.tagline).toBe(VALID_CONTENT.tagline);
    expect(Array.isArray(result.servicesText)).toBe(true);
    expect(result.colorPalette.primary).toBe('#1e40af');
  });

  it('usa valores fallback quando campos do JSON estão ausentes', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeOllamaResponse({})) as jest.Mock;

    const result = await generateSiteContent(BASE_REQUEST);

    expect(result.title).toBe('Bem-vindo');
    expect(result.ctaText).toBe('Entre em contato');
    expect(result.servicesText).toEqual([]);
  });

  it('lida com resposta JSON dentro de blocos markdown', async () => {
    const rawWithMarkdown = {
      ok: true,
      json: async () => ({
        response: `\`\`\`json\n${JSON.stringify(VALID_CONTENT)}\n\`\`\``,
      }),
    };
    global.fetch = jest.fn().mockResolvedValue(rawWithMarkdown) as jest.Mock;

    const result = await generateSiteContent(BASE_REQUEST);
    expect(result.title).toBe(VALID_CONTENT.title);
  });

  it('lança erro quando Ollama retorna status não-OK', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 503,
      text: async () => 'Service Unavailable',
    }) as jest.Mock;

    await expect(generateSiteContent(BASE_REQUEST)).rejects.toThrow();
  });

  it('lança erro quando a resposta JSON é inválida', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: 'isso não é json valido {{{' }),
    }) as jest.Mock;

    await expect(generateSiteContent(BASE_REQUEST)).rejects.toThrow('Falha ao gerar conteúdo');
  });

  it('constrói o prompt incluindo seções e template/tema quando fornecidos', async () => {
    global.fetch = jest.fn().mockResolvedValue(makeOllamaResponse(VALID_CONTENT)) as jest.Mock;

    await generateSiteContent({
      ...BASE_REQUEST,
      templateId: 'business-modern',
      themeId: 'modern-dark',
    });

    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    const body = JSON.parse(fetchCall[1].body);
    expect(body.prompt).toContain('Hero');
  });
});

describe('generateSiteCode', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('retorna código HTML limpo quando Ollama responde com sucesso', async () => {
    const htmlCode = '<html><body><h1>Site</h1></body></html>';
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ response: htmlCode }),
    }) as jest.Mock;

    const result = await generateSiteCode(VALID_CONTENT, 'servicos');

    expect(result).toContain('<html>');
    expect(result).not.toContain('```');
  });

  it('remove blocos markdown do HTML gerado', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        response: '```html\n<html><body>Conteúdo</body></html>\n```',
      }),
    }) as jest.Mock;

    const result = await generateSiteCode(VALID_CONTENT, 'servicos');

    expect(result).not.toContain('```html');
    expect(result).toContain('<html>');
  });

  it('lança erro quando Ollama não está disponível', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('ECONNREFUSED')) as jest.Mock;

    await expect(generateSiteCode(VALID_CONTENT, 'servicos')).rejects.toThrow(
      'Falha ao gerar código do site',
    );
  });
});

describe('retry logic em callOllama', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  it('tenta novamente após falha transitória e retorna sucesso', async () => {
    const htmlCode = '<html><body>OK</body></html>';
    global.fetch = jest
      .fn()
      .mockRejectedValueOnce(new Error('ECONNREFUSED'))
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ response: htmlCode }),
      }) as jest.Mock;

    const promise = generateSiteCode(VALID_CONTENT, 'servicos');

    // Avança o timer para o backoff de 1 segundo
    await jest.runAllTimersAsync();

    const result = await promise;
    expect(result).toContain('<html>');
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
