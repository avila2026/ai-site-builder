import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

import { auth0 } from "@/lib/auth0";

export async function middleware(request: NextRequest) {
  if (!auth0) {
    // Auth0 não configurado: bypass em desenvolvimento ou quando não há creds
    console.log('[middleware] Auth0 não configurado, bypassando autenticação');
    return NextResponse.next();
  }

  return auth0.middleware(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
