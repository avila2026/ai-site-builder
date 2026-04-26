import { NextResponse } from "next/server";
import { desc, eq } from "drizzle-orm";

import { auth0 } from "@/lib/auth/auth0";
import { getDb, hasDatabaseConfig } from "@/lib/db";
import { savedBriefs } from "@/lib/db/schema";

type BriefPayload = {
  siteName?: string;
  siteType?: string;
  description?: string;
  colors?: string;
  sections?: string[];
  generatedCode?: string;
};

function validateBriefPayload(payload: BriefPayload) {
  if (!payload.siteName?.trim()) return "siteName e obrigatorio";
  if (!payload.siteType?.trim()) return "siteType e obrigatorio";
  if (!payload.description?.trim()) return "description e obrigatoria";
  return null;
}

export async function GET() {
  if (!auth0 || !hasDatabaseConfig()) {
    return NextResponse.json(
      { error: "Auth0 ou banco nao configurado" },
      { status: 503 },
    );
  }

  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const db = getDb();
  const briefs = await db.query.savedBriefs.findMany({
    where: eq(savedBriefs.userId, session.user.sub),
    orderBy: desc(savedBriefs.createdAt),
    limit: 10,
  });

  return NextResponse.json({ briefs });
}

export async function POST(request: Request) {
  if (!auth0 || !hasDatabaseConfig()) {
    return NextResponse.json(
      { error: "Auth0 ou banco nao configurado" },
      { status: 503 },
    );
  }

  const session = await auth0.getSession();

  if (!session) {
    return NextResponse.json({ error: "Nao autenticado" }, { status: 401 });
  }

  const payload = (await request.json()) as BriefPayload;
  const validationError = validateBriefPayload(payload);

  if (validationError) {
    return NextResponse.json({ error: validationError }, { status: 400 });
  }

  const db = getDb();
  const [brief] = await db
    .insert(savedBriefs)
    .values({
      userId: session.user.sub,
      siteName: payload.siteName!.trim(),
      siteType: payload.siteType!.trim(),
      description: payload.description!.trim(),
      colors: payload.colors?.trim() || null,
      sections: payload.sections ?? [],
      generatedCode: payload.generatedCode ?? null,
    })
    .returning();

  return NextResponse.json({ brief }, { status: 201 });
}
