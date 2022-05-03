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

const commonResponseHeaders = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
} as const;

const makeAppResponse = (body: Record<string, string>) => {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: commonResponseHeaders,
  });
};

const handleLogin = async ({ code }: Record<string, string>) => {
  return await requestAccessToken(code);
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
        const result = makeAppResponse(await handleLogin(body));
        console.log("Result: ", result);
      }
      default: {
        throw new Error("Unsupported operation");
      }
    }
  } catch (e) {
    console.error("Error", e);
    return makeAppResponse({ error: e ?? "Internal Server Error" });
  }
});
