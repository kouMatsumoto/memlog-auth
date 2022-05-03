import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

console.log("Listening on http://localhost:8000");

const githubOAuthAppConfig = {
  clientId: Deno.env.get("CLIENT_ID"),
  clientSecret: Deno.env.get("CLIENT_SECRET"),
};

serve(async (req) => {
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method Not Allowed" }), {
        status: 405,
        headers: { "content-type": "application/json" },
      });
    }

    const { code, redirectUri } = await req.body.json();

    return new Response(JSON.stringify({ code, redirectUri }), {
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: e }), {
      status: 502,
      headers: { "content-type": "application/json" },
    });
  }
});
