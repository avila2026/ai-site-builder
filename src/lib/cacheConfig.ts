/**
 * Configurações de cache para otimização de performance
 *
 * Estratégias:
 * - stale-while-revalidate: Para conteúdo que pode ficar desatualizado brevemente
 * - public + max-age: Para assets estáticos
 * - no-store: Para dados sensíveis ou em tempo real
 */

type CacheType = 'static' | 'page' | 'api' | 'dynamic';

interface CacheEntry {
  swr?: number;
  maxAge?: number;
  revalidate?: number;
}

const cacheMap: Record<CacheType, CacheEntry> = {
  static: {
    swr: 31536000, // 1 ano
    maxAge: 31536000,
  },
  page: {
    swr: 60,
    maxAge: 300,
  },
  api: {
    swr: 10,
    maxAge: 60,
  },
  dynamic: {
    revalidate: 60,
  },
};

export const headersConfig = {
  cacheControl: (type: CacheType): string => {
    const config = cacheMap[type];
    if (!config) return 'no-store';

    if (type === 'static') {
      return `public, max-age=${config.maxAge}, immutable`;
    }

    return `public, max-age=${config.maxAge ?? 0}, stale-while-revalidate=${config.swr ?? 0}`;
  },
};
