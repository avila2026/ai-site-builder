import { NextRequest, NextResponse } from "next/server";

import {
  create21stSandbox,
  delete21stSandbox,
  get21stSandbox,
  has21stApiKey,
} from "@/lib/providers/21st-client";

export async function GET(request: NextRequest) {
  if (!has21stApiKey()) {
    return NextResponse.json(
      { error: "API_KEY_21ST nao configurada" },
      { status: 503 },
    );
  }

  const sandboxId = request.nextUrl.searchParams.get("sandboxId");

  if (!sandboxId) {
    return NextResponse.json(
      { error: "sandboxId e obrigatorio" },
      { status: 400 },
    );
  }

  try {
    const sandbox = await get21stSandbox(sandboxId);
    return NextResponse.json({ sandbox });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao buscar sandbox" },
      { status: 502 },
    );
  }
}

export async function POST(request: Request) {
  if (!has21stApiKey()) {
    return NextResponse.json(
      { error: "API_KEY_21ST nao configurada" },
      { status: 503 },
    );
  }

  const body = (await request.json().catch(() => ({}))) as {
    template?: string;
    metadata?: Record<string, unknown>;
  };

  try {
    const sandbox = await create21stSandbox({
      template: body.template,
      metadata: body.metadata,
    });

    return NextResponse.json({ sandbox }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao criar sandbox" },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  if (!has21stApiKey()) {
    return NextResponse.json(
      { error: "API_KEY_21ST nao configurada" },
      { status: 503 },
    );
  }

  const sandboxId = request.nextUrl.searchParams.get("sandboxId");

  if (!sandboxId) {
    return NextResponse.json(
      { error: "sandboxId e obrigatorio" },
      { status: 400 },
    );
  }

  try {
    await delete21stSandbox(sandboxId);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erro ao remover sandbox" },
      { status: 502 },
    );
  }
}
