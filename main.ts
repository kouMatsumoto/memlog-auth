import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

const CLIENT_ID = Deno.env.get("CLIENT_ID");
const CLIENT_SECRET = Deno.env.get("CLIENT_SECRET");
if (!CLIENT_ID) {
  throw new Error("env.CLIENT_ID is not set");
}
if (!CLIENT_SECRET) {
  throw new Error("env.CLIENT_SECRET is not set");
}

const requestAccessToken = async (
  code: string,
): Promise<{ access_token: string; scope: string; token_type: string }> => {
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
const revokeAccessToken = async (token: string) => {
  const response = await fetch(
    `https://api.github.com/applications/${CLIENT_ID}/grant`,
    {
      method: "DELETE",
      headers: {
        Accept: "application/vnd.github.v3+json",
        Authorization: `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`,
      },
      body: JSON.stringify({ access_token: token }),
    },
  );

  if (!response.ok) {
    throw new Error("Failed to revoke access token from GitHub");
  }

  return {};
};

const commonResponseHeaders = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
} as const;

const createSuccessResponse = (data: Record<string, string>) => {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: commonResponseHeaders,
  });
};

const createErrorResponse = (error: unknown) => {
  return new Response(JSON.stringify({ error }), {
    status: 200,
    headers: commonResponseHeaders,
  });
};

const parseRequest = async (req: Request) => {
  return {
    path: new URL(req.url).pathname,
    method: req.method,
    body: await req.json() ?? {}, // TODO(fix): validate value is Record<string, string>
  };
};

const handleLogin = async ({ code }: Record<string, string>) => {
  return await requestAccessToken(code);
};

const handleLogout = async ({ token }: Record<string, string>) => {
  return await revokeAccessToken(token);
};

serve(async (req: Request) => {
  const { path, method, body } = await parseRequest(req);
  console.log("Request: ", { path, method, body });

  try {
    switch (true) {
      case path === "/login" && method === "POST": {
        return createSuccessResponse(await handleLogin(body));
      }
      case path === "/logout" && method === "POST": {
        return createSuccessResponse(await handleLogout(body));
      }
      default: {
        throw new Error("Unsupported operation");
      }
    }
  } catch (e) {
    console.error("Error", e);
    return createErrorResponse(e ?? "Internal Server Error");
  }
});
