import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth/auth0";
import { getAppBaseUrl } from "@/lib/auth/app-base-url";

export async function GET() {
  if (!auth0) {
    return Response.json(
      { error: "Auth0 não configurado" },
      { status: 503 }
    );
  }

  // Auth0 v4: logout via redirect
  const appBaseUrl = getAppBaseUrl();
  const logoutUrl = process.env.AUTH0_DOMAIN
    ? `https://${process.env.AUTH0_DOMAIN}/v2/logout?client_id=${process.env.AUTH0_CLIENT_ID}&returnTo=${encodeURIComponent(appBaseUrl)}`
    : "/";

  return NextResponse.redirect(logoutUrl);
}
