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

  const authHeader = request.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Bearer token required" }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  const token = authHeader.slice(7);
  if (token !== serverToken) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Invalid token" }),
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
