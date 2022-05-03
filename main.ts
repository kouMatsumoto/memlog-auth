import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

const githubOAuthAppConfig = {
  clientId: Deno.env.get("CLIENT_ID"),
  clientSecret: Deno.env.get("CLIENT_SECRET"),
};

serve(async (req) => {
  console.log("request accepted");

  try {
    if (req.method !== "POST") {
      throw new Error("Method Not Allowed");
    }

    const { code, redirectUri } = JSON.parse(await req.body.text());

    return new Response(JSON.stringify({ code, redirectUri }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e) {
    console.error("Error", e);
    return new Response(JSON.stringify({ error: e }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  }
});
