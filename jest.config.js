const nextJest = require('next/jest');

const createJestConfig = nextJest({ dir: './' });

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testMatch: ['**/__tests__/**/*.test.ts', '**/*.test.ts', '**/*.test.tsx'],
  coverageProvider: 'v8',
  // Coleta cobertura de todos os arquivos para visibilidade, mas thresholds
  // são aplicados apenas nos módulos cobertos pela Fase 1
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/app/layout.tsx',
    '!src/app/page.tsx',
  ],
  coverageThreshold: {
    // Thresholds por arquivo — Fase 1 (módulos já testados)
    './src/lib/stitch-client.ts': {
      branches: 60,
      functions: 90,
      lines: 80,
      statements: 80,
    },
    './src/lib/ollama-client.ts': {
      branches: 80,
      functions: 100,
      lines: 95,
      statements: 95,
    },
    './src/lib/db/index.ts': {
      branches: 80,
      functions: 100,
      lines: 95,
      statements: 95,
    },
    './src/app/api/generate/route.ts': {
      branches: 60,
      functions: 100,
      lines: 80,
      statements: 80,
    },
    './src/app/api/briefs/route.ts': {
      branches: 60,
      functions: 100,
      lines: 80,
      statements: 80,
    },
  },
};

module.exports = createJestConfig(config);

