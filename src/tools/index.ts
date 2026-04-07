import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { registerReferenceDataTools } from "./reference-data";
import { registerProductTools } from "./products";
import { registerInventoryTools } from "./inventory";
import { registerOrderTools } from "./orders";
import { registerCustomerTools } from "./customers";
import { registerPurchasingTools } from "./purchasing";
import { registerFinanceTools } from "./finance";

export function registerAllTools(server: McpServer, client: RexClient): void {
  registerReferenceDataTools(server, client);
  registerProductTools(server, client);
  registerInventoryTools(server, client);
  registerOrderTools(server, client);
  registerCustomerTools(server, client);
  registerPurchasingTools(server, client);
  registerFinanceTools(server, client);
}
