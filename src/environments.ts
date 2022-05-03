const githubOAuthAppConfig = {
  // for development in localhost
  // https://github.com/settings/applications/1893257
  dev: {
    clientId: "5cb413dcbc4c7e0dccf9",
    clientSecret: Deno.env.get("CLIENT_SECRET_DEV") ?? "",
  },
  // https://github.com/settings/applications/1896203
  prod: {
    clientId: "d63100b983d6c453f86e",
    clientSecret: Deno.env.get("CLIENT_SECRET_PROD") ?? "",
  },
};

if (!githubOAuthAppConfig.dev.clientSecret) {
  throw new Error("env.CLIENT_SECRET_DEV is not set");
}
if (!githubOAuthAppConfig.prod.clientSecret) {
  throw new Error("env.CLIENT_SECRET_PROD is not set");
}

export const env = {
  githubOAuthAppConfig,
} as const;
