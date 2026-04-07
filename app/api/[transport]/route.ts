import { createMcpHandler } from "mcp-handler";
import { registerAllTools } from "@/tools/index";
import { getRexClient } from "@/services/rex-client";

const mcpHandler = createMcpHandler(
  (server) => {
    const client = getRexClient();
    registerAllTools(server, client);
  },
  {
    serverInfo: {
      name: "rex-api-mcp-server",
      version: "1.0.0",
    },
  },
  {
    basePath: "/api",
    maxDuration: 30,
  }
);

async function authHandler(request: Request): Promise<Response> {
  const serverToken = process.env.MCP_AUTH_TOKEN;

  if (!serverToken) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: MCP_AUTH_TOKEN not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Accept token from Authorization header OR ?token= query param
  const authHeader = request.headers.get("Authorization");
  const url = new URL(request.url);
  const queryToken = url.searchParams.get("token");

  let token: string | null = null;
  if (authHeader?.startsWith("Bearer ")) {
    token = authHeader.slice(7);
  } else if (queryToken) {
    token = queryToken;
  }

  if (!token || token !== serverToken) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Valid Bearer token or ?token= query parameter required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  return mcpHandler(request);
}

export {
  authHandler as GET,
  authHandler as POST,
  authHandler as DELETE,
};
