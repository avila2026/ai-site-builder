import { hasDatabaseConfig, checkDatabaseConnection, findOrCreateUser } from './index';

jest.mock('@neondatabase/serverless', () => ({
  neon: jest.fn(),
}));

jest.mock('drizzle-orm/neon-http', () => ({
  drizzle: jest.fn(),
}));

describe('hasDatabaseConfig', () => {
  afterEach(() => { delete process.env.DATABASE_URL; });

  it('retorna false quando DATABASE_URL não está definida', () => {
    expect(hasDatabaseConfig()).toBe(false);
  });

  it('retorna true quando DATABASE_URL está definida', () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';
    expect(hasDatabaseConfig()).toBe(true);
  });
});

describe('checkDatabaseConnection', () => {
  afterEach(() => { delete process.env.DATABASE_URL; });

  it('retorna false quando DATABASE_URL não está definida', async () => {
    const result = await checkDatabaseConnection();
    expect(result).toBe(false);
  });

  it('retorna true quando a query SELECT 1 tem sucesso', async () => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';

    const { neon } = await import('@neondatabase/serverless');
    const mockSql = jest.fn().mockResolvedValue([{ '?column?': 1 }]);
    // Simula sql`select 1` como função template
    mockSql.mockImplementation(() => Promise.resolve([{ '?column?': 1 }]));
    (neon as jest.Mock).mockReturnValue(mockSql);

    const result = await checkDatabaseConnection();
    expect(result).toBe(true);
  });

  it('retorna false quando a conexão falha', async () => {
    process.env.DATABASE_URL = 'postgres://invalido';

    const { neon } = await import('@neondatabase/serverless');
    const mockSql = jest.fn().mockRejectedValue(new Error('Conexão recusada'));
    (neon as jest.Mock).mockReturnValue(mockSql);

    const result = await checkDatabaseConnection();
    expect(result).toBe(false);
  });
});

describe('findOrCreateUser', () => {
  const USER_DATA = {
    auth0Sub: 'auth0|abc123',
    email: 'usuario@exemplo.com',
    name: 'Usuário Teste',
    picture: null,
  };

  const EXISTING_USER = {
    id: 'uuid-existente',
    auth0Sub: 'auth0|abc123',
    email: 'usuario@exemplo.com',
    name: 'Usuário Teste',
    picture: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    process.env.DATABASE_URL = 'postgres://user:pass@host/db';

    const { neon } = require('@neondatabase/serverless');
    const mockSql = jest.fn();
    (neon as jest.Mock).mockReturnValue(mockSql);
  });

  afterEach(() => {
    delete process.env.DATABASE_URL;
    jest.clearAllMocks();
  });

  it('retorna usuário existente quando auth0Sub já está cadastrado', async () => {
    const { drizzle } = await import('drizzle-orm/neon-http');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (drizzle as unknown as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([EXISTING_USER]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([EXISTING_USER]),
      query: { savedBriefs: { findMany: jest.fn() } },
    });

    const result = await findOrCreateUser(USER_DATA);
    expect(result.auth0Sub).toBe('auth0|abc123');
    expect(result.id).toBe('uuid-existente');
  });

  it('cria e retorna novo usuário quando não encontrado', async () => {
    const NEW_USER = { ...EXISTING_USER, id: 'uuid-novo' };
    const { drizzle } = await import('drizzle-orm/neon-http');
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (drizzle as unknown as jest.Mock).mockReturnValue({
      select: jest.fn().mockReturnThis(),
      from: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      limit: jest.fn().mockResolvedValue([]),
      insert: jest.fn().mockReturnThis(),
      values: jest.fn().mockReturnThis(),
      returning: jest.fn().mockResolvedValue([NEW_USER]),
      query: { savedBriefs: { findMany: jest.fn() } },
    });

    const result = await findOrCreateUser(USER_DATA);
    expect(result.id).toBe('uuid-novo');
  });
});
