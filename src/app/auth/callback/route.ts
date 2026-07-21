import { auth0 } from "@/lib/auth/auth0";

export async function GET() {
  if (!auth0) {
    return Response.json(
      { error: "Auth0 não configurado" },
      { status: 503 }
    );
  }

  // O callback é processado automaticamente pelo middleware via onCallback hook
  // Esta rota é apenas um placeholder para o SDK
  return new Response(null, { status: 204 });
}
