import { NextRequest, NextResponse } from 'next/server';
import {
  createRepository,
  GitHubRequestError,
  hasGitHubPat,
  putFile,
} from '@/lib/providers/github-rest';

export const runtime = 'nodejs';

type ExportErrorCode =
  | 'MISSING_GITHUB_PAT'
  | 'REPO_CREATE_FAILED'
  | 'FILE_PUSH_FAILED'
  | 'RATE_LIMITED';

interface ExportRequestBody {
  siteName?: string;
  generatedHtml?: string;
  siteType?: string;
  description?: string;
}

interface RepoFile {
  path: string;
  content: string;
  message: string;
}

const MAX_REPO_CREATE_ATTEMPTS = 5;

function toErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Erro desconhecido';
}

function isRateLimitedError(error: unknown) {
  if (!(error instanceof GitHubRequestError)) {
    return false;
  }

  if (error.status === 429) {
    return true;
  }

  if (error.status !== 403) {
    return false;
  }

  const details = error.details;
  if (
    typeof details === 'object' &&
    details !== null &&
    'message' in details &&
    typeof (details as { message?: unknown }).message === 'string'
  ) {
    return (details as { message: string }).message
      .toLowerCase()
      .includes('rate limit');
  }

  return false;
}

function isRepositoryAlreadyExists(error: unknown) {
  if (!(error instanceof GitHubRequestError) || error.status !== 422) {
    return false;
  }

  const details = error.details;

  if (
    typeof details === 'object' &&
    details !== null &&
    'message' in details &&
    typeof (details as { message?: unknown }).message === 'string'
  ) {
    return (details as { message: string }).message
      .toLowerCase()
      .includes('already exists');
  }

  return false;
}

function sanitizeForRepoName(value: string) {
  const normalized = value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

  return normalized || 'site';
}

function randomSuffix(length = 6) {
  return Math.random().toString(36).slice(2, 2 + length);
}

function buildRepositoryName(siteName: string) {
  const base = sanitizeForRepoName(siteName);
  const suffix = randomSuffix();
  const maxBaseLength = Math.max(1, 100 - (suffix.length + 1));
  const truncatedBase = base.slice(0, maxBaseLength).replace(/-$/g, '') || 'site';
  return `${truncatedBase}-${suffix}`;
}

function createScaffoldFiles({
  siteName,
  siteType,
  description,
  generatedHtml,
}: Required<Pick<ExportRequestBody, 'siteName' | 'generatedHtml'>> &
  Pick<ExportRequestBody, 'siteType' | 'description'>): RepoFile[] {
  const safeSiteName = siteName.trim() || 'Generated Site';
  const safeDescription =
    description?.trim() || 'Site exportado automaticamente pelo AI Site Builder.';
  const safeSiteType = siteType?.trim() || 'website';

  const packageJson = {
    name: sanitizeForRepoName(safeSiteName),
    version: '0.1.0',
    private: true,
    scripts: {
      dev: 'next dev',
      build: 'next build',
      start: 'next start',
      lint: 'next lint',
    },
    dependencies: {
      next: '15.5.14',
      react: '19.1.0',
      'react-dom': '19.1.0',
    },
    devDependencies: {
      typescript: '^5.0.0',
      '@types/node': '^20.0.0',
      '@types/react': '^19.0.0',
      '@types/react-dom': '^19.0.0',
      eslint: '^9.0.0',
      'eslint-config-next': '15.5.14',
    },
  };

  return [
    {
      path: 'package.json',
      content: `${JSON.stringify(packageJson, null, 2)}\n`,
      message: 'chore: add package.json',
    },
    {
      path: 'next.config.ts',
      content: `import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
};

export default nextConfig;
`,
      message: 'chore: add next config',
    },
    {
      path: 'tsconfig.json',
      content: `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": false,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
`,
      message: 'chore: add typescript config',
    },
    {
      path: 'src/app/layout.tsx',
      content: `import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "${safeSiteName.replace(/"/g, '\\"')}",
  description: "${safeDescription.replace(/"/g, '\\"')}",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body>{children}</body>
    </html>
  );
}
`,
      message: 'feat: add app layout',
    },
    {
      path: 'src/app/page.tsx',
      content: `export default function HomePage() {
  return (
    <main className="page">
      <section className="hero">
        <p className="badge">Exportado por AI Site Builder</p>
        <h1>${safeSiteName.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</h1>
        <p>
          Tipo: <strong>${safeSiteType.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</strong>
        </p>
      </section>

      <section className="preview">
        <iframe
          title="Preview do site gerado"
          src="/generated-site.html"
          className="frame"
        />
      </section>
    </main>
  );
}
`,
      message: 'feat: add generated site page',
    },
    {
      path: 'src/app/globals.css',
      content: `:root {
  color-scheme: light dark;
}

* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: "Segoe UI", Arial, sans-serif;
  background: #0a0a0f;
  color: #f4f4f5;
}

.page {
  min-height: 100vh;
  display: grid;
  grid-template-rows: auto 1fr;
  gap: 1rem;
  padding: 1.5rem;
}

.hero {
  border: 1px solid #27272a;
  border-radius: 12px;
  padding: 1rem;
  background: #111113;
}

.badge {
  display: inline-block;
  padding: 0.25rem 0.5rem;
  border-radius: 999px;
  background: #27272a;
  font-size: 0.8rem;
}

.preview {
  border: 1px solid #27272a;
  border-radius: 12px;
  overflow: hidden;
  background: #09090b;
}

.frame {
  width: 100%;
  height: 75vh;
  border: 0;
  background: #fff;
}
`,
      message: 'feat: add base styles',
    },
    {
      path: 'public/generated-site.html',
      content: generatedHtml,
      message: 'feat: add raw generated html',
    },
    {
      path: 'README.md',
      content: `# ${safeSiteName}

Repositório exportado automaticamente pelo **AI Site Builder**.

## Conteúdo

- ` + '`src/app/page.tsx`' + `: preview do site dentro de um iframe.
- ` + '`public/generated-site.html`' + `: HTML bruto gerado pela IA.
- Projeto Next.js pronto para rodar localmente e evoluir.

## Como rodar

\`\`\`bash
npm install
npm run dev
\`\`\`

## Metadata de exportação

- Tipo de site: ${safeSiteType}
- Descrição: ${safeDescription}
`,
      message: 'docs: add readme',
    },
    {
      path: '.gitignore',
      content: `node_modules
.next
out
dist
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.env*
`,
      message: 'chore: add gitignore',
    },
  ];
}

function errorResponse(
  code: ExportErrorCode,
  message: string,
  status: number,
) {
  return NextResponse.json(
    {
      ok: false,
      code,
      message,
    },
    { status },
  );
}

export async function POST(request: NextRequest) {
  let body: ExportRequestBody;

  try {
    body = (await request.json()) as ExportRequestBody;
  } catch {
    return errorResponse('REPO_CREATE_FAILED', 'Payload JSON inválido', 400);
  }

  const siteName = body.siteName?.trim();
  const generatedHtml = body.generatedHtml;

  if (!siteName || typeof generatedHtml !== 'string' || !generatedHtml.trim()) {
    return errorResponse(
      'REPO_CREATE_FAILED',
      'Campos obrigatórios: siteName e generatedHtml',
      400,
    );
  }

  if (!hasGitHubPat()) {
    return errorResponse(
      'MISSING_GITHUB_PAT',
      'GITHUB_PAT não configurado no ambiente do servidor',
      503,
    );
  }

  let repository:
    | Awaited<ReturnType<typeof createRepository>>
    | null = null;
  let lastRepoError: unknown;

  for (let attempt = 1; attempt <= MAX_REPO_CREATE_ATTEMPTS; attempt += 1) {
    try {
      repository = await createRepository(buildRepositoryName(siteName), true);
      break;
    } catch (error) {
      lastRepoError = error;

      if (isRepositoryAlreadyExists(error)) {
        continue;
      }

      if (isRateLimitedError(error)) {
        return errorResponse(
          'RATE_LIMITED',
          'GitHub rate limit atingido durante criação do repositório',
          429,
        );
      }

      return errorResponse(
        'REPO_CREATE_FAILED',
        `Falha ao criar repositório: ${toErrorMessage(error)}`,
        502,
      );
    }
  }

  if (!repository) {
    if (isRateLimitedError(lastRepoError)) {
      return errorResponse(
        'RATE_LIMITED',
        'GitHub rate limit atingido durante criação do repositório',
        429,
      );
    }

    return errorResponse(
      'REPO_CREATE_FAILED',
      `Falha ao criar repositório: ${toErrorMessage(lastRepoError)}`,
      502,
    );
  }

  const files = createScaffoldFiles({
    siteName,
    generatedHtml,
    siteType: body.siteType,
    description: body.description,
  });

  try {
    for (const file of files) {
      await putFile(
        repository.owner,
        repository.name,
        file.path,
        Buffer.from(file.content, 'utf8').toString('base64'),
        file.message,
        repository.defaultBranch,
      );
    }
  } catch (error) {
    if (isRateLimitedError(error)) {
      return errorResponse(
        'RATE_LIMITED',
        'GitHub rate limit atingido durante upload dos arquivos',
        429,
      );
    }

    return errorResponse(
      'FILE_PUSH_FAILED',
      `Falha ao enviar arquivos para o repositório: ${toErrorMessage(error)}`,
      502,
    );
  }

  return NextResponse.json({
    ok: true,
    repo: {
      name: repository.name,
      fullName: repository.fullName,
      htmlUrl: repository.htmlUrl,
      private: repository.private,
    },
    branch: repository.defaultBranch,
  });
}
