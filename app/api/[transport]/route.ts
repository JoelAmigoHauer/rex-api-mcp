import { createMcpHandler } from "mcp-handler";
import { registerAllTools } from "@/tools/index";
import { getRexClient } from "@/services/rex-client";

const handler = createMcpHandler(
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

export { handler as GET, handler as POST, handler as DELETE };
