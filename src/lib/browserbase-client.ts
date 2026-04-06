import Browserbase from '@browserbasehq/sdk';
import type { Browserbase as BrowserbaseTypes } from '@browserbasehq/sdk';

const BROWSERBASE_API_KEY = process.env.BROWSERBASE_API_KEY;
const BROWSERBASE_PROJECT_ID = process.env.BROWSERBASE_PROJECT_ID;

if (!BROWSERBASE_API_KEY || !BROWSERBASE_PROJECT_ID) {
  console.warn('⚠️  Browserbase credentials not configured. Session creation will fail.');
}

export interface BrowserbaseSessionRequest {
  projectId?: string;
  keepAlive?: boolean;
  region?: BrowserbaseTypes.SessionCreateParams['region'];
  timeout?: number;
  userMetadata?: Record<string, unknown>;
  browserSettings?: BrowserbaseTypes.SessionCreateParams['browserSettings'];
}

export interface BrowserbaseSessionResponse {
  id: string;
  status: string;
  projectId: string;
  region: string;
  connectUrl: string;
  seleniumRemoteUrl: string;
  debuggerFullscreenUrl?: string;
  debuggerUrl?: string;
  signingKey: string;
  keepAlive: boolean;
  createdAt: string;
  expiresAt: string;
}

function getBrowserbaseClient(): Browserbase {
  if (!BROWSERBASE_API_KEY) {
    throw new Error('Browserbase API key not configured');
  }

  return new Browserbase({
    apiKey: BROWSERBASE_API_KEY,
  });
}

export async function createBrowserbaseSession(
  input: BrowserbaseSessionRequest = {},
): Promise<BrowserbaseSessionResponse> {
  const projectId = input.projectId || BROWSERBASE_PROJECT_ID;

  if (!projectId) {
    throw new Error('Browserbase project ID not configured');
  }

  const client = getBrowserbaseClient();
  const session = await client.sessions.create({
    projectId,
    keepAlive: input.keepAlive,
    region: input.region,
    timeout: input.timeout,
    userMetadata: input.userMetadata,
    browserSettings: input.browserSettings,
  });

  let liveUrls:
    | BrowserbaseTypes.SessionLiveURLs
    | undefined;

  try {
    liveUrls = await client.sessions.debug(session.id);
  } catch {
    liveUrls = undefined;
  }

  return {
    id: session.id,
    status: session.status,
    projectId: session.projectId,
    region: session.region,
    connectUrl: session.connectUrl,
    seleniumRemoteUrl: session.seleniumRemoteUrl,
    debuggerFullscreenUrl: liveUrls?.debuggerFullscreenUrl,
    debuggerUrl: liveUrls?.debuggerUrl,
    signingKey: session.signingKey,
    keepAlive: session.keepAlive,
    createdAt: session.createdAt,
    expiresAt: session.expiresAt,
  };
}
