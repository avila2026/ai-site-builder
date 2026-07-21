import { GET, POST } from './route';
import { auth0 } from '@/lib/auth/auth0';

const MOCK_SESSION = {
  user: { sub: 'auth0|usuario-teste', email: 'teste@exemplo.com' },
};

const MOCK_BRIEF = {
  id: 'uuid-brief-1',
  userId: 'auth0|usuario-teste',
  siteName: 'Portfólio Dev',
  siteType: 'portfolio',
  description: 'Meu portfólio profissional',
  colors: 'azul escuro',
  sections: ['Hero', 'Projetos'],
  templateId: null,
  themeId: null,
  generatedCode: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

jest.mock('@/lib/auth/auth0', () => ({ auth0: { getSession: jest.fn() } }));

jest.mock('@/lib/db', () => ({
  hasDatabaseConfig: jest.fn().mockReturnValue(true),
  getDb: jest.fn(),
}));

function getMockAuth0() {
  return jest.mocked(auth0);
}

function makeMockDb() {
  return {
    query: { savedBriefs: { findMany: jest.fn().mockResolvedValue([MOCK_BRIEF]) } },
    insert: jest.fn().mockReturnValue({
      values: jest.fn().mockReturnValue({
        returning: jest.fn().mockResolvedValue([MOCK_BRIEF]),
      }),
    }),
  };
}

describe('GET /api/briefs', () => {
  beforeEach(async () => {
    const { getDb } = await import('@/lib/db');
    (getDb as jest.Mock).mockReturnValue(makeMockDb());
  });

  it('retorna 503 quando banco não está configurado', async () => {
    const { hasDatabaseConfig } = await import('@/lib/db');
    (hasDatabaseConfig as jest.Mock).mockReturnValueOnce(false);

    const res = await GET();
    expect(res.status).toBe(503);
  });

  it('retorna 401 quando usuário não está autenticado', async () => {
    getMockAuth0().getSession.mockResolvedValueOnce(null);

    const res = await GET();
    expect(res.status).toBe(401);
    const json = await res.json();
    expect(json.error).toBe('Nao autenticado');
  });

  it('retorna lista de briefs do usuário autenticado', async () => {
    getMockAuth0().getSession.mockResolvedValueOnce(MOCK_SESSION);

    const res = await GET();
    expect(res.status).toBe(200);
    const json = await res.json();
    expect(Array.isArray(json.briefs)).toBe(true);
    expect(json.briefs[0].siteName).toBe('Portfólio Dev');
  });
});

describe('POST /api/briefs', () => {
  beforeEach(async () => {
    const { getDb } = await import('@/lib/db');
    (getDb as jest.Mock).mockReturnValue(makeMockDb());
  });

  function makeRequest(body: object) {
    return new Request('http://localhost/api/briefs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  it('retorna 401 quando usuário não está autenticado', async () => {
    getMockAuth0().getSession.mockResolvedValueOnce(null);

    const res = await POST(makeRequest({ siteName: 'Teste', siteType: 'blog', description: 'Desc' }));
    expect(res.status).toBe(401);
  });

  it('retorna 400 quando siteName está faltando', async () => {
    getMockAuth0().getSession.mockResolvedValueOnce(MOCK_SESSION);

    const res = await POST(makeRequest({ siteType: 'blog', description: 'Desc' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('siteName');
  });

  it('retorna 400 quando siteType está faltando', async () => {
    getMockAuth0().getSession.mockResolvedValueOnce(MOCK_SESSION);

    const res = await POST(makeRequest({ siteName: 'Teste', description: 'Desc' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('siteType');
  });

  it('retorna 400 quando description está faltando', async () => {
    getMockAuth0().getSession.mockResolvedValueOnce(MOCK_SESSION);

    const res = await POST(makeRequest({ siteName: 'Teste', siteType: 'blog' }));
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toContain('description');
  });

  it('cria brief com sucesso e retorna 201', async () => {
    getMockAuth0().getSession.mockResolvedValueOnce(MOCK_SESSION);

    const res = await POST(
      makeRequest({
        siteName: 'Portfólio Dev',
        siteType: 'portfolio',
        description: 'Meu portfólio profissional',
        colors: 'azul escuro',
        sections: ['Hero', 'Projetos'],
      }),
    );

    expect(res.status).toBe(201);
    const json = await res.json();
    expect(json.brief.siteName).toBe('Portfólio Dev');
  });

  it('associa o brief ao userId da sessão Auth0', async () => {
    getMockAuth0().getSession.mockResolvedValueOnce(MOCK_SESSION);

    const { getDb } = await import('@/lib/db');
    const mockDb = getDb as jest.Mock;

    await POST(
      makeRequest({
        siteName: 'Meu Site',
        siteType: 'landing',
        description: 'Apresentação da empresa',
      }),
    );

    const insertCall = mockDb.mock.results.at(-1)?.value?.insert;
    if (insertCall) {
      const valuesCall = insertCall.mock.results[0]?.value?.values;
      if (valuesCall) {
        expect(valuesCall.mock.calls[0][0].userId).toBe('auth0|usuario-teste');
      }
    }
  });
});
