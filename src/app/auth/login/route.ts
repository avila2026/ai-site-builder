import { auth0 } from "@/lib/auth0";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  if (!auth0) {
    return Response.json(
      { error: "Auth0 não configurado. Configure as variáveis de ambiente AUTH0_*" },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const returnTo = searchParams.get("returnTo") || "/";

  return auth0.startInteractiveLogin({ returnTo });
}
