const commonResponseHeaders = {
  "content-type": "application/json",
  "access-control-allow-origin": "*",
} as const;

export const createSuccessResponse = (data: Record<string, string>) => {
  return new Response(JSON.stringify({ data }), {
    status: 200,
    headers: commonResponseHeaders,
  });
};

export const createErrorResponse = (error: unknown) => {
  return new Response(JSON.stringify({ error }), {
    status: 200,
    headers: commonResponseHeaders,
  });
};

export const parseRequest = async (req: Request) => {
  const url = new URL(req.url);

  return {
    hostname: url.hostname,
    pathname: url.pathname,
    method: req.method,
    body: await req.json() ?? {}, // TODO(fix): validate value is Record<string, string>
  };
};
