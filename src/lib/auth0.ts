import { Auth0Client } from "@auth0/nextjs-auth0/server";

const auth0Config = {
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  secret: process.env.AUTH0_SECRET,
  appBaseUrl: process.env.APP_BASE_URL,
};

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
      domain: auth0Config.domain,
      clientId: auth0Config.clientId,
      clientSecret: auth0Config.clientSecret,
      secret: auth0Config.secret,
      appBaseUrl: auth0Config.appBaseUrl,
    })
  : null;
