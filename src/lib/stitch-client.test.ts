import {
  isStitchConfigured,
  getStitchHost,
  checkStitchReachability,
  generateSiteWithStitch,
  StitchGenerationError,
} from './providers/stitch-client';
import type { SiteGenerationRequest } from './providers/ollama-client';

jest.mock('@google/stitch-sdk', () => {
  const mockScreen = {
    id: 'screen-123',
    getHtml: jest.fn().mockResolvedValue('https://cdn.stitch.com/output.html'),
    getImage: jest.fn().mockResolvedValue('https://cdn.stitch.com/output.png'),
  };
  const mockProject = {
    id: 'project-456',
    data: { title: 'AI Site Builder' },
    generate: jest.fn().mockResolvedValue(mockScreen),
  };
  const mockStitchInstance = {
    projects: jest.fn().mockResolvedValue([mockProject]),
    project: jest.fn().mockReturnValue(mockProject),
    createProject: jest.fn().mockResolvedValue(mockProject),
  };
  const mockToolClient = {
    listTools: jest.fn().mockResolvedValue([]),
    close: jest.fn().mockResolvedValue(undefined),
  };

  return {
    Stitch: jest.fn().mockImplementation(() => mockStitchInstance),
    StitchToolClient: jest.fn().mockImplementation(() => mockToolClient),
    StitchError: class StitchError extends Error {
      code: string;
      recoverable: boolean;
      constructor(msg: string, opts: { code?: string; recoverable?: boolean } = {}) {
        super(msg);
        this.code = opts.code || 'UNKNOWN_ERROR';
        this.recoverable = opts.recoverable ?? false;
      }
    },
  };
}, { virtual: true });

const BASE_REQUEST: SiteGenerationRequest = {
  siteName: 'Minha Loja',
  siteType: 'ecommerce',
  description: 'Loja de produtos orgânicos',
};

describe('isStitchConfigured', () => {
  afterEach(() => { delete process.env.STITCH_API_KEY; });

  it('retorna false quando STITCH_API_KEY não está definida', () => {
    expect(isStitchConfigured()).toBe(false);
  });

  it('retorna true quando STITCH_API_KEY está definida', () => {
    process.env.STITCH_API_KEY = 'chave-qualquer';
    expect(isStitchConfigured()).toBe(true);
  });
});

describe('getStitchHost', () => {
  afterEach(() => { delete process.env.STITCH_HOST; });

  it('retorna o host padrão quando STITCH_HOST não está definido', () => {
    expect(getStitchHost()).toBe('https://stitch.googleapis.com/mcp');
  });

  it('retorna o host customizado quando STITCH_HOST está definido', () => {
    process.env.STITCH_HOST = 'https://meu-stitch.com/mcp';
    expect(getStitchHost()).toBe('https://meu-stitch.com/mcp');
  });
});

describe('StitchGenerationError', () => {
  it('define o nome, code e recoverable corretamente', () => {
    const err = new StitchGenerationError('Falha', { code: 'RATE_LIMITED', recoverable: true });
    expect(err.name).toBe('StitchGenerationError');
    expect(err.code).toBe('RATE_LIMITED');
    expect(err.recoverable).toBe(true);
    expect(err.message).toBe('Falha');
  });

  it('usa defaults quando opções não são fornecidas', () => {
    const err = new StitchGenerationError('Erro genérico');
    expect(err.code).toBe('UNKNOWN_ERROR');
    expect(err.recoverable).toBe(false);
  });
});

describe('checkStitchReachability', () => {
  afterEach(() => { delete process.env.STITCH_API_KEY; });

  it('retorna false quando Stitch não está configurado', async () => {
    const result = await checkStitchReachability();
    expect(result).toBe(false);
  });

  it('retorna true quando Stitch responde corretamente', async () => {
    process.env.STITCH_API_KEY = 'api-key-valida';
    const result = await checkStitchReachability();
    expect(result).toBe(true);
  });

  it('retorna false quando StitchToolClient lança exceção', async () => {
    const { StitchToolClient } = await import('@google/stitch-sdk');
    (StitchToolClient as jest.Mock).mockImplementationOnce(() => ({
      listTools: jest.fn().mockRejectedValue(new Error('Sem conexão')),
      close: jest.fn().mockResolvedValue(undefined),
    }));

    process.env.STITCH_API_KEY = 'api-key-invalida';
    const result = await checkStitchReachability();
    expect(result).toBe(false);
  });
});

describe('generateSiteWithStitch', () => {
  beforeEach(() => {
    process.env.STITCH_API_KEY = 'api-key-teste';
  });

  afterEach(() => {
    delete process.env.STITCH_API_KEY;
    jest.clearAllMocks();
  });

  it('retorna código HTML e artefatos em caso de sucesso', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      // Mínimo de 64 caracteres exigido pelo fetchHtmlArtifact
      text: async () =>
        '<!DOCTYPE html><html><body><main><h1>Site Gerado com Sucesso</h1></main></body></html>',
    }) as jest.Mock;

    const result = await generateSiteWithStitch(BASE_REQUEST);

    expect(result.provider).toBe('stitch');
    expect(result.code).toContain('<html>');
    expect(result.artifacts.projectId).toBe('project-456');
    expect(result.artifacts.screenId).toBe('screen-123');
  });

  it('lança Error quando STITCH_API_KEY não está definida', async () => {
    delete process.env.STITCH_API_KEY;
    // getStitchApiKey() é chamado antes do try/catch, então lança Error simples
    await expect(generateSiteWithStitch(BASE_REQUEST)).rejects.toThrow('STITCH_API_KEY nao configurada');
  });

  it('lança StitchGenerationError quando o HTML retornado é muito curto', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => '<p>ok</p>',
    }) as jest.Mock;

    await expect(generateSiteWithStitch(BASE_REQUEST)).rejects.toMatchObject({
      code: 'INVALID_ARTIFACT',
    });
  });

  it('lança StitchGenerationError quando o fetch do artefato falha', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 500,
    }) as jest.Mock;

    await expect(generateSiteWithStitch(BASE_REQUEST)).rejects.toMatchObject({
      code: 'ARTIFACT_FETCH_FAILED',
      recoverable: true,
    });
  });
});
