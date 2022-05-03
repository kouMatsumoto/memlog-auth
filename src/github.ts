import { env } from "./environments.ts";

export const requestAccessToken = async (
  code: string,
): Promise<{ access_token: string; scope: string; token_type: string }> => {
  const body = new FormData();
  body.append("client_id", env.githubOAuthAppConfig.dev.clientId);
  body.append("client_secret", env.githubOAuthAppConfig.dev.clientSecret);
  body.append("code", code);

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

/**
 * https://docs.github.com/en/rest/apps/oauth-applications#delete-an-app-authorization
 */
export const revokeAccessToken = async (token: string) => {
  const response = await fetch(
    `https://api.github.com/applications/${env.githubOAuthAppConfig.dev.clientId}/grant`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Basic ${
          btoa(
            `${env.githubOAuthAppConfig.dev.clientId}:${env.githubOAuthAppConfig.dev.clientSecret}`,
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
