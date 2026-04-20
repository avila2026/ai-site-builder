import { NextRequest } from 'next/server';
import { POST } from './route';

jest.mock('@/lib/stitch-client', () => ({
  isStitchConfigured: jest.fn().mockReturnValue(false),
  generateSiteWithStitch: jest.fn(),
  StitchGenerationError: class StitchGenerationError extends Error {
    code: string;
    recoverable: boolean;
    constructor(msg: string, opts: { code?: string; recoverable?: boolean } = {}) {
      super(msg);
      this.name = 'StitchGenerationError';
      this.code = opts.code || 'UNKNOWN_ERROR';
      this.recoverable = opts.recoverable ?? false;
    }
  },
}));

jest.mock('@/lib/ollama-client', () => ({
  generateSiteContent: jest.fn().mockResolvedValue({
    title: 'Meu Site',
    tagline: 'Slogan',
    heroText: 'Bem-vindo',
    aboutText: 'Sobre nós',
    servicesText: ['Serviço 1'],
    ctaText: 'Contato',
    colorPalette: { primary: '#000', secondary: '#fff', accent: '#f00' },
  }),
  generateSiteCode: jest.fn().mockResolvedValue('<html><body>Site</body></html>'),
}));

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

async function collectStream(response: Response): Promise<string> {
  const reader = response.body!.getReader();
  const decoder = new TextDecoder();
  let result = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    result += decoder.decode(value);
  }
  return result;
}

describe('POST /api/generate', () => {
  const VALID_BODY = {
    siteName: 'Meu Site',
    siteType: 'landing',
    description: 'Site de apresentação pessoal',
  };

  // Salva e restaura process.env para evitar vazamento entre testes
  const originalEnv = process.env;
  beforeEach(() => { process.env = { ...originalEnv }; });
  afterEach(() => { process.env = originalEnv; });

  it('retorna 400 quando siteName está faltando', async () => {
    const req = makeRequest({ siteType: 'landing', description: 'Desc' });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toBe('Campos obrigatórios faltando');
  });

  it('retorna 400 quando siteType está faltando', async () => {
    const req = makeRequest({ siteName: 'Teste', description: 'Desc' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('retorna 400 quando description está faltando', async () => {
    const req = makeRequest({ siteName: 'Teste', siteType: 'blog' });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it('retorna streaming NDJSON com status "completed" ao usar Ollama', async () => {
    const req = makeRequest(VALID_BODY);
    const res = await POST(req);

    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toContain('ndjson');

    const raw = await collectStream(res);
    const lines = raw
      .trim()
      .split('\n')
      .map(l => JSON.parse(l));

    const complete = lines.find(l => l.type === 'complete');
    expect(complete).toBeDefined();
    expect(complete?.provider).toBe('ollama');
    expect(complete?.code).toContain('<html>');
  });

  it('inclui adjustmentPrompt na descrição enriquecida', async () => {
    const { generateSiteContent } = await import('@/lib/ollama-client');
    const req = makeRequest({ ...VALID_BODY, adjustmentPrompt: 'Adicione seção de FAQ' });
    await POST(req);

    const callArg = (generateSiteContent as jest.Mock).mock.calls.at(-1)?.[0];
    expect(callArg?.description).toContain('AJUSTES SOLICITADOS');
    expect(callArg?.description).toContain('Adicione seção de FAQ');
  });

  it('usa Stitch quando configurado e retorna complete com provider stitch', async () => {
    const stitchModule = await import('@/lib/stitch-client');
    (stitchModule.isStitchConfigured as jest.Mock).mockReturnValueOnce(true);
    (stitchModule.generateSiteWithStitch as jest.Mock).mockResolvedValueOnce({
      code: '<html><body>Stitch Site</body></html>',
      provider: 'stitch',
      artifacts: { htmlUrl: 'https://cdn.com/output.html', projectId: 'p1', screenId: 's1' },
    });

    process.env.SITE_GENERATION_PROVIDER = 'stitch';
    const req = makeRequest(VALID_BODY);
    const res = await POST(req);

    const raw = await collectStream(res);
    const lines = raw
      .trim()
      .split('\n')
      .map(l => JSON.parse(l));

    const complete = lines.find(l => l.type === 'complete');
    expect(complete?.provider).toBe('stitch');
  });

  it('faz fallback para Ollama quando Stitch lança erro recuperável', async () => {
    const stitchModule = await import('@/lib/stitch-client');
    (stitchModule.isStitchConfigured as jest.Mock).mockReturnValueOnce(true);
    (stitchModule.generateSiteWithStitch as jest.Mock).mockRejectedValueOnce(
      new stitchModule.StitchGenerationError('RATE_LIMITED', { code: 'RATE_LIMITED', recoverable: true }),
    );

    process.env.SITE_GENERATION_PROVIDER = 'stitch';
    process.env.STITCH_FALLBACK_TO_OLLAMA = 'true';
    const req = makeRequest(VALID_BODY);
    const res = await POST(req);

    const raw = await collectStream(res);
    const lines = raw
      .trim()
      .split('\n')
      .map(l => JSON.parse(l));

    const fallbackStatus = lines.find(l => l.status === 'fallback_to_ollama');
    const complete = lines.find(l => l.type === 'complete');

    expect(fallbackStatus).toBeDefined();
    expect(complete?.provider).toBe('ollama');
  });
});
