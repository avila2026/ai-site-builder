import { auth0, isAuth0Configured } from "@/lib/auth0";
import { checkDatabaseConnection, hasDatabaseConfig } from "@/lib/db";
import { hasGitHubPat } from "@/lib/github-rest";
import {
  checkStitchReachability,
  getStitchHost,
  isStitchConfigured,
} from "@/lib/stitch-client";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

type IntegrationStatusItem = {
  configured: boolean;
  connected: boolean;
  message: string;
};

async function checkOllamaConnection() {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);
    const response = await fetch(`${OLLAMA_BASE_URL}/api/tags`, {
      method: "GET",
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    return false;
  }
}

function buildStatus(
  configured: boolean,
  connected: boolean,
  messages: {
    connected: string;
    misconfigured: string;
    unavailable: string;
  },
): IntegrationStatusItem {
  if (!configured) {
    return {
      configured: false,
      connected: false,
      message: messages.misconfigured,
    };
  }

  if (!connected) {
    return {
      configured: true,
      connected: false,
      message: messages.unavailable,
    };
  }

  return {
    configured: true,
    connected: true,
    message: messages.connected,
  };
}

export async function getIntegrationStatus() {
  const stitchConfigured = isStitchConfigured();
  const databaseConfigured = hasDatabaseConfig();
  const auth0Configured = isAuth0Configured();
  const autonomaConfigured = Boolean(
    process.env.AUTONOMA_CLIENT_ID && process.env.AUTONOMA_SECRET_ID,
  );
  const browserbaseConfigured = Boolean(
    process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID,
  );
  const githubConfigured = hasGitHubPat();

  const [ollamaConnected, stitchReachable, databaseConnected] = await Promise.all([
    checkOllamaConnection(),
    stitchConfigured ? checkStitchReachability() : Promise.resolve(false),
    databaseConfigured ? checkDatabaseConnection() : Promise.resolve(false),
  ]);

  const stitchConnected = stitchConfigured && stitchReachable;
  const auth0Connected = auth0Configured && Boolean(auth0);

  return {
    ollama: {
      ...buildStatus(true, ollamaConnected, {
        connected: `Ollama conectado em ${OLLAMA_BASE_URL}`,
        misconfigured: "Ollama não configurado.",
        unavailable: `Ollama indisponível em ${OLLAMA_BASE_URL}`,
      }),
      url: OLLAMA_BASE_URL,
    },
    autonoma: buildStatus(autonomaConfigured, autonomaConfigured, {
      connected: "Credenciais da Autonoma configuradas.",
      misconfigured: "Configure AUTONOMA_CLIENT_ID e AUTONOMA_SECRET_ID.",
      unavailable: "Credenciais da Autonoma inválidas ou indisponíveis.",
    }),
    browserbase: buildStatus(browserbaseConfigured, browserbaseConfigured, {
      connected: "Credenciais da BrowserBase configuradas.",
      misconfigured: "Configure BROWSERBASE_API_KEY e BROWSERBASE_PROJECT_ID.",
      unavailable: "Credenciais da BrowserBase inválidas ou indisponíveis.",
    }),
    stitch: {
      ...buildStatus(stitchConfigured, stitchConnected, {
        connected: "Stitch conectado e acessível.",
        misconfigured: "Configure STITCH_API_KEY.",
        unavailable: "Stitch configurado, mas host indisponível.",
      }),
      host: getStitchHost(),
      reachable: stitchReachable,
    },
    database: buildStatus(databaseConfigured, databaseConnected, {
      connected: "Banco Neon conectado.",
      misconfigured: "Configure DATABASE_URL.",
      unavailable: "DATABASE_URL configurada, mas conexão falhou.",
    }),
    auth0: buildStatus(auth0Configured, auth0Connected, {
      connected: "Auth0 configurado e ativo.",
      misconfigured: "Configure AUTH0_DOMAIN, AUTH0_CLIENT_ID, AUTH0_CLIENT_SECRET e AUTH0_SECRET.",
      unavailable: "Auth0 configurado, mas sessão indisponível.",
    }),
    github: buildStatus(githubConfigured, githubConfigured, {
      connected: "GITHUB_PAT configurado para exportação.",
      misconfigured: "Configure GITHUB_PAT para exportação automática.",
      unavailable: "GITHUB_PAT configurado, mas indisponível.",
    }),
  };
}
