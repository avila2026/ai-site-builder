import { auth0, isAuth0Configured } from "@/lib/auth0";
import { checkDatabaseConnection, hasDatabaseConfig } from "@/lib/db";
import {
  checkStitchReachability,
  getStitchHost,
  isStitchConfigured,
} from "@/lib/stitch-client";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

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

export async function getIntegrationStatus() {
  const stitchConfigured = isStitchConfigured();

  const [ollama, database, stitchReachable] = await Promise.all([
    checkOllamaConnection(),
    hasDatabaseConfig() ? checkDatabaseConnection() : Promise.resolve(false),
    stitchConfigured ? checkStitchReachability() : Promise.resolve(false),
  ]);

  return {
    ollama: {
      connected: ollama,
      url: OLLAMA_BASE_URL,
    },
    autonoma: {
      connected: Boolean(
        process.env.AUTONOMA_CLIENT_ID && process.env.AUTONOMA_SECRET_ID,
      ),
    },
    browserbase: {
      connected: Boolean(
        process.env.BROWSERBASE_API_KEY && process.env.BROWSERBASE_PROJECT_ID,
      ),
    },
    stitch: {
      connected: stitchConfigured && stitchReachable,
      configured: stitchConfigured,
      reachable: stitchReachable,
      host: getStitchHost(),
    },
    database: {
      connected: hasDatabaseConfig() && database,
    },
    auth0: {
      connected: Boolean(auth0) && isAuth0Configured(),
    },
  };
}
