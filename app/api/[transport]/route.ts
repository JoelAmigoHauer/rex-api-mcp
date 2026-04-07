import { createMcpHandler, withMcpAuth } from "mcp-handler";
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

const handler = withMcpAuth(
  mcpHandler,
  async (_req, bearerToken) => {
    const serverToken = process.env.MCP_AUTH_TOKEN;
    if (!serverToken) {
      // If no token configured, reject all requests for safety
      return undefined;
    }
    if (!bearerToken || bearerToken !== serverToken) {
      return undefined;
    }
    return { token: bearerToken, clientId: "authorized", scopes: [] };
  },
  { required: true }
);

export { handler as GET, handler as POST, handler as DELETE };
