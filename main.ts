import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

const githubOAuthAppConfig = {
  clientId: Deno.env.get("CLIENT_ID"),
  clientSecret: Deno.env.get("CLIENT_SECRET"),
};

const requestAccessToken = async (code: string) => {
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
    const data = await requestAccessToken(code);
    console.log("github response", data);

    return new Response(JSON.stringify({ data }), {
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
