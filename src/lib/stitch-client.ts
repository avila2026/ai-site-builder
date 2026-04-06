import { Stitch, StitchError, StitchToolClient } from '@google/stitch-sdk';

import type { SiteGenerationRequest } from '@/lib/ollama-client';

const DEFAULT_STITCH_HOST = 'https://stitch.googleapis.com/mcp';
const DEFAULT_PROJECT_TITLE = 'AI Site Builder';

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

function buildStitchPrompt(request: SiteGenerationRequest) {
  const sections = request.sections?.length
    ? request.sections.join(', ')
    : 'Hero, Sobre, Serviços, Contato, FAQ';

  const preferredColors = request.colors?.trim()
    ? request.colors.trim()
    : 'Defina uma paleta equilibrada para legibilidade.';

  return [
    'Crie uma landing page completa em HTML com Tailwind CSS inline.',
    'Idioma: português do Brasil.',
    `Nome do projeto: ${request.siteName}`,
    `Tipo do site: ${request.siteType}`,
    `Objetivo: ${request.description}`,
    `Cores preferidas: ${preferredColors}`,
    `Seções obrigatórias: ${sections}`,
    'Requisitos de UX: responsivo, hierarquia visual clara, CTA primária visível, contraste acessível.',
    'Evite lorem ipsum. Use conteúdo realista e objetivo.',
  ].join('\n');
}

async function getOrCreateProject(stitch: Stitch, title: string) {
  const projects = await stitch.projects();
  const normalizedTitle = title.trim().toLowerCase();

  const found = projects.find((project) => {
    const projectTitle = String(project.data?.title || '').trim().toLowerCase();
    return projectTitle === normalizedTitle;
  });

  if (found) {
    return found;
  }

  return stitch.createProject(title);
}

function normalizeGeneratedHtml(html: string) {
  return html
    .replace(/^\uFEFF/, '')
    .trim();
}

function formatStitchError(error: unknown) {
  if (error instanceof StitchError) {
    return `${error.code}: ${error.message}`;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return 'Falha desconhecida ao chamar Stitch';
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
      throw new Error('Stitch nao retornou URL de HTML');
    }

    const htmlResponse = await fetch(htmlUrl, {
      method: 'GET',
      cache: 'no-store',
    });

    if (!htmlResponse.ok) {
      throw new Error(`Falha ao baixar HTML do Stitch (${htmlResponse.status})`);
    }

    const htmlCode = normalizeGeneratedHtml(await htmlResponse.text());
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
    throw new Error(formatStitchError(error));
  } finally {
    await client.close().catch(() => undefined);
  }
}
