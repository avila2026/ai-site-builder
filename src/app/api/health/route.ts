import { NextResponse } from "next/server";

import { getIntegrationStatus } from "@/lib/utils/integration-status";

export async function GET() {
  try {
    const integrations = await getIntegrationStatus();
    const generatorConnected = integrations.ollama.connected || integrations.stitch.connected;

    return NextResponse.json({
      status: generatorConnected ? "connected" : "degraded",
      ...integrations,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "disconnected",
        ollama: {
          configured: true,
          connected: false,
          message: "Falha ao checar Ollama.",
        },
        autonoma: {
          configured: false,
          connected: false,
          message: "Falha ao checar Autonoma.",
        },
        browserbase: {
          configured: false,
          connected: false,
          message: "Falha ao checar BrowserBase.",
        },
        stitch: {
          configured: false,
          connected: false,
          message: "Falha ao checar Stitch.",
          reachable: false,
        },
        database: {
          configured: false,
          connected: false,
          message: "Falha ao checar banco.",
        },
        auth0: {
          configured: false,
          connected: false,
          message: "Falha ao checar Auth0.",
        },
        github: {
          configured: false,
          connected: false,
          message: "Falha ao checar GitHub.",
        },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
