import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { registerAllTools } from "./tools/index";
import { getRexClient } from "./services/rex-client";

export function createServer(): McpServer {
  const server = new McpServer({
    name: "rex-api-mcp-server",
    version: "1.0.0",
  });

  const client = getRexClient();
  registerAllTools(server, client);

  return server;
}
