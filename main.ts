import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

const githubOAuthAppConfig = {
  clientId: Deno.env.get("CLIENT_ID"),
  clientSecret: Deno.env.get("CLIENT_SECRET"),
};

type GitHubAccessTokenResponse = {
  data: { access_token: string; scope: string; token_type: string };
  error?: never;
} | { data?: never; error: string };

const requestAccessToken = async (code: string): Promise<GitHubAccessTokenResponse> => {
  const data = new FormData();
  data.append("client_id", githubOAuthAppConfig.clientId);
  data.append("client_secret", githubOAuthAppConfig.clientSecret);
  data.append("code", code);

  return await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body: data,
  }).then((res) => res.json());
};

serve(async (req: Request) => {
  try {
    if (req.method !== "POST") {
      throw new Error("Method Not Allowed");
    }

    const { code } = await req.json();
    const { data, error } = await requestAccessToken(code);
    if (error) {
      throw error;
    }

    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    });
  } catch (e) {
    console.error("Error", e);
    return new Response(JSON.stringify({ error: e }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    });
  }
});
