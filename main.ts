import { serve } from "https://deno.land/std@0.114.0/http/server.ts";

console.log("Listening on http://localhost:8000");

const githubOAuthAppConfig = {
  clientId: Deno.env.get("CLIENT_ID"),
  clientSecret: Deno.env.get("CLIENT_SECRET"),
};

serve((_req) => {
  return new Response("OK" + githubOAuthAppConfig.clientId, {
    headers: { "content-type": "text/plain" },
  });
});
