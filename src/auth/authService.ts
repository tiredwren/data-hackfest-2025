// src/auth/authService.ts
import { createAuth0Client, Auth0Client } from "@auth0/auth0-spa-js";

let auth0: Auth0Client | null = null;

export const initAuth0 = async (): Promise<Auth0Client> => {
  if (!auth0) {
    auth0 = await createAuth0Client({
                    domain: 'dev-a2jy8021kbq84xg3.us.auth0.com',
                    client_id: 'YITB8EnOGXSV22ueSqQPJnht678kYVXP',
                    redirect_uri: 'clarity://dev-a2jy8021kbq84xg3.us.auth0.com/android/com.duodevelopers.clarity/callback',
      cacheLocation: "localstorage",
      useRefreshTokens: true,
    });
  }
  return auth0;
};

export const login = async () => {
  const client = await initAuth0();
  await client.loginWithRedirect();
};

export const handleRedirectCallback = async (url?: string) => {
  const client = await initAuth0();
  await client.handleRedirectCallback(url);
};


export const getUser = async () => {
  const client = await initAuth0();
  return await client.getUser();
};

export const logout = async () => {
  const client = await initAuth0();
  client.logout({
    returnTo: import.meta.env.VITE_AUTH0_LOGOUT_REDIRECT_URI!,
  });
};
