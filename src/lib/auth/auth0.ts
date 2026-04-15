import { NextResponse } from "next/server";
import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { findOrCreateUser, hasDatabaseConfig } from "@/lib/db";
import { getAppBaseUrl } from "@/lib/auth/app-base-url";

const auth0Config = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  appBaseUrl: getAppBaseUrl(),
};
const appBaseUrl = auth0Config.appBaseUrl;

export function isAuth0Configured() {
  return Boolean(
    auth0Config.domain &&
      auth0Config.clientId &&
      auth0Config.clientSecret &&
      auth0Config.secret,
  );
}

export const auth0 = isAuth0Configured()
  ? new Auth0Client({
      domain: auth0Config.domain!,
      clientId: auth0Config.clientId!,
      clientSecret: auth0Config.clientSecret!,
      secret: auth0Config.secret!,
      appBaseUrl: auth0Config.appBaseUrl,
      // Hook para salvar usuário no banco após login
      onCallback: async (error, context, session) => {
        if (error) {
          console.error("Auth0 callback error:", error);
          return NextResponse.redirect(
            new URL("/", appBaseUrl)
          );
        }

        // Salva usuário no banco se database estiver configurada
        if (session?.user?.sub && hasDatabaseConfig()) {
          try {
            await findOrCreateUser({
              auth0Sub: session.user.sub,
              email: session.user.email ?? "sem-email@auth0.local",
              name: session.user.name,
              picture: session.user.picture,
            });
          } catch (dbError) {
            console.warn("Falha ao salvar usuário no banco:", dbError);
          }
        }

        return NextResponse.redirect(
          new URL(context.returnTo || "/", appBaseUrl)
        );
      },
      // Rotas customizadas (sem prefixo /api)
      routes: {
        login: "/auth/login",
        logout: "/auth/logout",
        callback: "/auth/callback",

        backChannelLogout: "/auth/backchannel-logout",
      },
    })
  : null;
