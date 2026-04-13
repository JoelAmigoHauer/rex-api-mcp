import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import type { RexSoapClient } from "../services/soap-client";
import { registerReferenceDataTools } from "./reference-data";
import { registerProductTools } from "./products";
import { registerInventoryTools } from "./inventory";
import { registerOrderTools } from "./orders";
import { registerCustomerTools } from "./customers";
import { registerPurchasingTools } from "./purchasing";
import { registerFinanceTools } from "./finance";
import { registerSoapWriteTools } from "./soap-writes";

export function registerAllTools(
  server: McpServer,
  client: RexClient,
  soapClient?: RexSoapClient
): void {
  // REST API tools (read + basic update)
  registerReferenceDataTools(server, client);
  registerProductTools(server, client);
  registerInventoryTools(server, client);
  registerOrderTools(server, client);
  registerCustomerTools(server, client);
  registerPurchasingTools(server, client);
  registerFinanceTools(server, client);

  // SOAP/IPS API tools (write operations)
  if (soapClient) {
    registerSoapWriteTools(server, soapClient);
  }
}
