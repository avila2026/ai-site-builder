import { Stitch, StitchError, StitchToolClient } from '@google/stitch-sdk';

import type { SiteGenerationRequest } from '@/lib/ollama-client';
import { buildFullPromptSection } from '@/lib/templates';

const DEFAULT_STITCH_HOST = 'https://stitch.googleapis.com/mcp';
const DEFAULT_PROJECT_TITLE = 'AI Site Builder';
const DEFAULT_HTML_FETCH_TIMEOUT_MS = 45_000;
const DEFAULT_STITCH_HEALTH_TIMEOUT_MS = 5_000;

const SUPPORTED_DEVICE_TYPES = new Set([
  'DEVICE_TYPE_UNSPECIFIED',
  'MOBILE',
  'DESKTOP',
  'TABLET',
  'AGNOSTIC',
] as const);

const SUPPORTED_MODEL_IDS = new Set([
  'MODEL_ID_UNSPECIFIED',
  'GEMINI_3_PRO',
  'GEMINI_3_FLASH',
  'GEMINI_3_1_PRO',
] as const);

const RECOVERABLE_STITCH_CODES = new Set([
  'RATE_LIMITED',
  'NETWORK_ERROR',
  'NETWORK_TIMEOUT',
  'UNKNOWN_ERROR',
]);

type StitchDeviceType =
  | 'DEVICE_TYPE_UNSPECIFIED'
  | 'MOBILE'
  | 'DESKTOP'
  | 'TABLET'
  | 'AGNOSTIC';

type StitchModelId =
  | 'MODEL_ID_UNSPECIFIED'
  | 'GEMINI_3_PRO'
  | 'GEMINI_3_FLASH'
  | 'GEMINI_3_1_PRO';

type StitchGenerationArtifacts = {
  htmlUrl: string;
  imageUrl?: string;
  projectId: string;
  screenId: string;
};

export type StitchGenerationResult = {
  code: string;
  provider: 'stitch';
  artifacts: StitchGenerationArtifacts;
};

type StitchGenerationErrorOptions = {
  code?: string;
  recoverable?: boolean;
  cause?: unknown;
};

export class StitchGenerationError extends Error {
  readonly code: string;
  readonly recoverable: boolean;

  constructor(message: string, options: StitchGenerationErrorOptions = {}) {
    super(message, { cause: options.cause });
    this.name = 'StitchGenerationError';
    this.code = options.code || 'UNKNOWN_ERROR';
    this.recoverable = options.recoverable ?? false;
  }
}

const projectIdCache = new Map<string, string>();

function normalizeProjectId(projectId: string) {
  return projectId.replace(/^projects\//, '').trim();
}

function getStitchApiKey() {
  const apiKey = process.env.STITCH_API_KEY;

  if (!apiKey) {
    throw new Error('STITCH_API_KEY nao configurada');
  }

  return apiKey;
}

export function isStitchConfigured() {
  return Boolean(process.env.STITCH_API_KEY);
}

export function getStitchHost() {
  return process.env.STITCH_HOST || DEFAULT_STITCH_HOST;
}

export async function checkStitchReachability() {
  if (!isStitchConfigured()) {
    return false;
  }

  const timeoutMs =
    parsePositiveInt(process.env.STITCH_HEALTH_TIMEOUT_MS) ||
    DEFAULT_STITCH_HEALTH_TIMEOUT_MS;

  const client = new StitchToolClient({
    apiKey: getStitchApiKey(),
    baseUrl: getStitchHost(),
    timeout: timeoutMs,
  });

  try {
    await client.listTools();
    return true;
  } catch {
    return false;
  } finally {
    await client.close().catch(() => undefined);
  }
}

function getStitchDeviceType(): StitchDeviceType {
  const configured = process.env.STITCH_DEVICE_TYPE?.toUpperCase();

  if (configured && SUPPORTED_DEVICE_TYPES.has(configured as StitchDeviceType)) {
    return configured as StitchDeviceType;
  }

  return 'DESKTOP';
}

function getStitchModelId(): StitchModelId {
  const configured = process.env.STITCH_MODEL_ID?.toUpperCase();

  if (configured && SUPPORTED_MODEL_IDS.has(configured as StitchModelId)) {
    return configured as StitchModelId;
  }

  return 'GEMINI_3_FLASH';
}

function getProjectTitle(siteName: string) {
  return process.env.STITCH_PROJECT_TITLE || siteName || DEFAULT_PROJECT_TITLE;
}

function getPreferredProjectId() {
  const configured = process.env.STITCH_PROJECT_ID;
  if (!configured) {
    return null;
  }

  const projectId = normalizeProjectId(configured);
  return projectId || null;
}

function parsePositiveInt(value: string | undefined) {
  if (!value) {
    return null;
  }

  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

function buildStitchPrompt(request: SiteGenerationRequest) {
  const sections = request.sections?.length
    ? request.sections.join(', ')
    : 'Hero, Sobre, Serviços, Contato, FAQ';

  const preferredColors = request.colors?.trim()
    ? request.colors.trim()
    : 'Defina uma paleta equilibrada para legibilidade.';

  // Adiciona seção de template/tema se selecionados
  const templateThemeSection = buildFullPromptSection(request.templateId, request.themeId);

  const lines = [
    'Crie uma landing page completa em HTML com Tailwind CSS inline.',
    'Idioma: português do Brasil.',
    `Nome do projeto: ${request.siteName}`,
    `Tipo do site: ${request.siteType}`,
    `Objetivo: ${request.description}`,
    `Cores preferidas: ${preferredColors}`,
    `Seções obrigatórias: ${sections}`,
    'Requisitos de UX: responsivo, hierarquia visual clara, CTA primária visível, contraste acessível.',
    'Evite lorem ipsum. Use conteúdo realista e objetivo.',
  ];

  // Adiciona instruções de template/tema se presentes
  if (templateThemeSection) {
    lines.push('');
    lines.push('---');
    lines.push('INSTRUÇÕES ADICIONAIS DE TEMPLATE E TEMA:');
    lines.push(templateThemeSection);
  }

  return lines.join('\n');
}

async function getOrCreateProject(stitch: Stitch, title: string) {
  const preferredProjectId = getPreferredProjectId();
  if (preferredProjectId) {
    return stitch.project(preferredProjectId);
  }

  const projects = await stitch.projects();
  const normalizedTitle = title.trim().toLowerCase();
  const cachedProjectId = projectIdCache.get(normalizedTitle);

  if (cachedProjectId) {
    return stitch.project(cachedProjectId);
  }

  const found = projects.find((project) => {
    const projectTitle = String(project.data?.title || '').trim().toLowerCase();
    return projectTitle === normalizedTitle;
  });

  if (found) {
    projectIdCache.set(normalizedTitle, found.id);
    return found;
  }

  const created = await stitch.createProject(title);
  projectIdCache.set(normalizedTitle, created.id);

  return created;
}

function normalizeGeneratedHtml(html: string) {
  return html
    .replace(/^\uFEFF/, '')
    .trim();
}

function toStitchGenerationError(error: unknown) {
  if (error instanceof StitchGenerationError) {
    return error;
  }

  if (error instanceof StitchError) {
    const code = String(error.code || 'UNKNOWN_ERROR');
    const recoverable =
      typeof error.recoverable === 'boolean'
        ? error.recoverable
        : RECOVERABLE_STITCH_CODES.has(code);

    return new StitchGenerationError(`${code}: ${error.message}`, {
      code,
      recoverable,
      cause: error,
    });
  }

  if (error instanceof DOMException && error.name === 'AbortError') {
    return new StitchGenerationError('NETWORK_TIMEOUT: timeout na requisição ao Stitch', {
      code: 'NETWORK_TIMEOUT',
      recoverable: true,
      cause: error,
    });
  }

  if (error instanceof Error) {
    return new StitchGenerationError(error.message, {
      code: 'UNKNOWN_ERROR',
      recoverable: false,
      cause: error,
    });
  }

  return new StitchGenerationError('Falha desconhecida ao chamar Stitch', {
    code: 'UNKNOWN_ERROR',
    recoverable: false,
    cause: error,
  });
}

async function fetchHtmlArtifact(htmlUrl: string) {
  const timeoutMs =
    parsePositiveInt(process.env.STITCH_HTML_FETCH_TIMEOUT_MS) ||
    DEFAULT_HTML_FETCH_TIMEOUT_MS;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const htmlResponse = await fetch(htmlUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    if (!htmlResponse.ok) {
      throw new StitchGenerationError(
        `ARTIFACT_FETCH_FAILED: falha ao baixar HTML do Stitch (${htmlResponse.status})`,
        {
          code: 'ARTIFACT_FETCH_FAILED',
          recoverable: htmlResponse.status >= 500 || htmlResponse.status === 429,
        },
      );
    }

    const htmlCode = normalizeGeneratedHtml(await htmlResponse.text());

    if (!htmlCode || htmlCode.length < 64) {
      throw new StitchGenerationError(
        'INVALID_ARTIFACT: Stitch retornou HTML vazio ou inválido',
        {
          code: 'INVALID_ARTIFACT',
          recoverable: false,
        },
      );
    }

    return htmlCode;
  } finally {
    clearTimeout(timeoutId);
  }
}

export async function generateSiteWithStitch(
  request: SiteGenerationRequest,
): Promise<StitchGenerationResult> {
  const client = new StitchToolClient({
    apiKey: getStitchApiKey(),
    baseUrl: getStitchHost(),
    timeout: 300_000,
  });

  const stitch = new Stitch(client);

  try {
    const project = await getOrCreateProject(stitch, getProjectTitle(request.siteName));
    const screen = await project.generate(
      buildStitchPrompt(request),
      getStitchDeviceType(),
      getStitchModelId(),
    );

    const htmlUrl = await screen.getHtml();

    if (!htmlUrl) {
      throw new StitchGenerationError('INVALID_ARTIFACT: Stitch nao retornou URL de HTML', {
        code: 'INVALID_ARTIFACT',
        recoverable: false,
      });
    }

    const htmlCode = await fetchHtmlArtifact(htmlUrl);
    const imageUrl = await screen.getImage().catch(() => undefined);

    return {
      code: htmlCode,
      provider: 'stitch',
      artifacts: {
        htmlUrl,
        imageUrl,
        projectId: project.id,
        screenId: screen.id,
      },
    };
  } catch (error) {
    throw toStitchGenerationError(error);
  } finally {
    await client.close().catch(() => undefined);
  }
}
