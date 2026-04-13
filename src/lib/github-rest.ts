const GITHUB_API_BASE = 'https://api.github.com';
const BASE_DELAY_MS = 1000;
const MAX_RETRIES = 3;

const RETRYABLE_STATUS_CODES = new Set([429, 500, 502, 503, 504]);

export class GitHubRequestError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly details?: unknown,
  ) {
    super(message);
    this.name = 'GitHubRequestError';
  }
}

export interface GitHubRepository {
  name: string;
  fullName: string;
  htmlUrl: string;
  private: boolean;
  owner: string;
  defaultBranch: string;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getGitHubPat() {
  return process.env.GITHUB_PAT?.trim();
}

export function hasGitHubPat() {
  return Boolean(getGitHubPat());
}

function isRetryable(error: unknown) {
  return (
    error instanceof GitHubRequestError &&
    RETRYABLE_STATUS_CODES.has(error.status)
  );
}

async function withRetry<T>(operation: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;

      if (!isRetryable(error) || attempt === MAX_RETRIES) {
        throw error;
      }

      const delayMs = BASE_DELAY_MS * 2 ** (attempt - 1);
      await sleep(delayMs);
    }
  }

  throw lastError;
}

async function githubRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const pat = getGitHubPat();

  if (!pat) {
    throw new Error('GITHUB_PAT environment variable is not configured');
  }

  return withRetry(async () => {
    const response = await fetch(`${GITHUB_API_BASE}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${pat}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ai-site-builder',
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.headers ?? {}),
      },
    });

    if (!response.ok) {
      const contentType = response.headers.get('content-type') ?? '';
      const details = contentType.includes('application/json')
        ? await response.json().catch(() => undefined)
        : await response.text().catch(() => undefined);

      const detailsMessage =
        typeof details === 'object' &&
        details !== null &&
        'message' in details &&
        typeof (details as { message?: unknown }).message === 'string'
          ? (details as { message: string }).message
          : response.statusText;

      throw new GitHubRequestError(
        `GitHub API error (${response.status}): ${detailsMessage}`,
        response.status,
        details,
      );
    }

    return (await response.json()) as T;
  });
}

export async function createRepository(
  name: string,
  isPrivate = true,
): Promise<GitHubRepository> {
  const data = await githubRequest<{
    name: string;
    full_name: string;
    html_url: string;
    private: boolean;
    owner: { login: string };
    default_branch: string;
  }>('/user/repos', {
    method: 'POST',
    body: JSON.stringify({
      name,
      private: isPrivate,
      auto_init: false,
    }),
  });

  return {
    name: data.name,
    fullName: data.full_name,
    htmlUrl: data.html_url,
    private: data.private,
    owner: data.owner.login,
    defaultBranch: data.default_branch || 'main',
  };
}

function encodePath(path: string) {
  return path
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
}

export async function putFile(
  owner: string,
  repo: string,
  path: string,
  contentBase64: string,
  message: string,
  branch = 'main',
) {
  return githubRequest<{
    content: {
      path: string;
      sha: string;
    };
  }>(`/repos/${owner}/${repo}/contents/${encodePath(path)}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: contentBase64,
      branch,
    }),
  });
}
