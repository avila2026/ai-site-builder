import { NextResponse } from "next/server";

import { getIntegrationStatus } from "@/lib/integration-status";

export async function GET() {
  try {
    const status = await getIntegrationStatus();

    return NextResponse.json({
      status: status.ollama.connected ? "connected" : "degraded",
      ...status,
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: "disconnected",
        ollama: { connected: false },
        autonoma: { connected: false },
        browserbase: { connected: false },
        stitch: { connected: false, configured: false, reachable: false },
        database: { connected: false },
        auth0: { connected: false },
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 503 }
    );
  }
}
