import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import { requestAccessToken, revokeAccessToken } from "./src/github.ts";
import {
  createErrorResponse,
  createSuccessResponse,
  parseRequest,
} from "./src/server.ts";

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
