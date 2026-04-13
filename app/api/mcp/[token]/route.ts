import { createMcpHandler } from "mcp-handler";
import { registerAllTools } from "@/tools/index";
import { getRexClient } from "@/services/rex-client";
import { getSoapClient } from "@/services/soap-client";

const mcpHandler = createMcpHandler(
  (server) => {
    const client = getRexClient();
    let soapClient;
    try {
      soapClient = getSoapClient();
    } catch {
      // SOAP env vars not configured - REST-only mode
    }
    registerAllTools(server, client, soapClient);
  },
  {
    serverInfo: {
      name: "rex-api-mcp-server",
      version: "1.0.0",
    },
  },
  {
    basePath: "/api/mcp",
    maxDuration: 30,
  }
);

async function authHandler(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
): Promise<Response> {
  const serverToken = process.env.MCP_AUTH_TOKEN;
  const { token } = await params;

  if (!serverToken) {
    return new Response(
      JSON.stringify({ error: "Server misconfigured: MCP_AUTH_TOKEN not set" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!token || token !== serverToken) {
    return new Response(
      JSON.stringify({ error: "Unauthorized" }),
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
