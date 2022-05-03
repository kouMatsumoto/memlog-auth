import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

const CLIENT_ID = Deno.env.get("CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("CLIENT_SECRET");
if (!CLIENT_ID) {
  throw new Error("env.CLIENT_ID is not set");
}
if (!CLIENT_SECRET) {
  throw new Error("env.CLIENT_SECRET is not set");
}

type GitHubAccessTokenResponse = {
  data: { access_token: string; scope: string; token_type: string };
  error?: never;
} | { data?: never; error: string };

const requestAccessToken = async (
  code: string,
): Promise<GitHubAccessTokenResponse> => {
  const body = new FormData();
  body.append("client_id", CLIENT_ID);
  body.append("client_secret", CLIENT_SECRET);
  body.append("code", code);

  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json" },
    body,
  });
  const data = await response.json();

  return { data };
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

    return new Response(JSON.stringify({ data }), {
      status: 200,
      headers: {
        "content-type": "application/json",
        "access-control-allow-origin": "*",
      },
    });
  } catch (e) {
    console.error("Error", e);
    return new Response(
      JSON.stringify({ error: e ?? "Internal Server Error" }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
          "access-control-allow-origin": "*",
        },
      },
    );
  }
});
