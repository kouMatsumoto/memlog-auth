import { env } from "./environments.ts";

const requestAccessToken = async (
  code: string,
  clientId: string,
  clientSecret: string,
): Promise<{ access_token: string; scope: string; token_type: string }> => {
  const body = new FormData();
  body.append("code", code);
  body.append("client_id", clientId);
  body.append("client_secret", clientSecret);

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body,
  });
  const data = await response.json();
  console.log("GitHub Response", data);

  if (!data) {
    throw new Error("Unexpected result from GitHub");
  } else if (data?.error) {
    throw data.error;
  }

  return data;
};

export const requestAccessTokenForDev = (code: string) => {
  return requestAccessToken(
    code,
    env.githubOAuthAppConfig.dev.clientId,
    env.githubOAuthAppConfig.dev.clientSecret,
  );
};

export const requestAccessTokenForProd = (code: string) => {
  return requestAccessToken(
    code,
    env.githubOAuthAppConfig.prod.clientId,
    env.githubOAuthAppConfig.prod.clientSecret,
  );
};

/**
 * https://docs.github.com/en/rest/apps/oauth-applications#delete-an-app-authorization
 */
const revokeAccessToken = async (
  token: string,
  clientId: string,
  clientSecret: string,
) => {
  const response = await fetch(
    `https://api.github.com/applications/${clientId}/grant`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Basic ${
          btoa(
            `${clientId}:${clientSecret}`,
          )
        }`,
      },
      body: JSON.stringify({ access_token: token }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to revoke access token from GitHub");
  }

  return {};
};

export const revokeAccessTokenForDev = (token: string) => {
  return revokeAccessToken(
    token,
    env.githubOAuthAppConfig.dev.clientId,
    env.githubOAuthAppConfig.dev.clientSecret,
  );
};

export const revokeAccessTokenForProd = (token: string) => {
  return revokeAccessToken(
    token,
    env.githubOAuthAppConfig.prod.clientId,
    env.githubOAuthAppConfig.prod.clientSecret,
  );
};
