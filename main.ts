import { serve } from "https://deno.land/std@0.114.0/http/server.ts";
import {
  requestAccessTokenForDev,
  requestAccessTokenForProd,
  revokeAccessTokenForDev,
  revokeAccessTokenForProd,
} from "./src/github.ts";
import {
  createErrorResponse,
  createSuccessResponse,
  parseRequest,
} from "./src/server.ts";

const handleLogin = async (
  { code, isDev }: Record<string, string>,
) => {
  return isDev
    ? await requestAccessTokenForDev(code)
    : await requestAccessTokenForProd(code);
};

const handleLogout = async (
  { token, isDev }: Record<string, string>,
) => {
  return isDev
    ? await revokeAccessTokenForDev(token)
    : await revokeAccessTokenForProd(token);
};

serve(async (req: Request) => {
  const { pathname, method, body } = await parseRequest(req);

  try {
    switch (true) {
      case pathname === "/login" && method === "POST": {
        return createSuccessResponse(await handleLogin(body));
      }
      case pathname === "/logout" && method === "POST": {
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
