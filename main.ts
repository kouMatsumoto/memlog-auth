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
  console.log("GitHub Response", data);

  return { data };
};

const commonResponseHeaders = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
} as const;

const makeApplicationResponse = (body: Record<string, string>) => {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: commonResponseHeaders,
  });
};

const handleLogin = async ({ code }: Record<string, string>) => {
  const { data, error } = await requestAccessToken(code);
  if (error) {
    throw error;
  } else if (!data) {
    throw new Error("Unexpected result from GitHub");
  }

  return data;
};

const parseRequest = async (req: Request) => {
  return {
    path: new URL(req.url).pathname,
    method: req.method,
    body: await req.json() ?? {}, // TODO(fix): validate value is Record<string, string>
  };
};

serve(async (req: Request) => {
  const { path, method, body } = await parseRequest(req);
  console.log("Request: ", { path, method, body });

  try {
    switch (true) {
      case path === "/login" && method === "POST": {
        return makeApplicationResponse(await handleLogin(body));
      }
      default: {
        throw new Error("Unsupported operation");
      }
    }
  } catch (e) {
    console.error("Error", e);
    return makeApplicationResponse({ error: e ?? "Internal Server Error" });
  }
});
