import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { formatSuccess, formatError, stripUndefined } from "../utils";
import { listInventorySchema } from "../schemas/inventory";

export function registerInventoryTools(
  server: McpServer,
  client: RexClient
): void {
  // List inventory/stock levels
  server.registerTool("rex_list_inventory", {
    title: "List Inventory",
    description:
      "List stock levels in RetailExpress. Filter by product ID or outlet/store ID. Paginated.",
    inputSchema: listInventorySchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  }, async (params) => {
    try {
      const queryParams = stripUndefined({
        page_number: params.page_number,
        page_size: params.page_size,
        product_id: params.product_id,
        outlet_id: params.outlet_id,
      });
      const data = await client.getList<Record<string, unknown>>(
        "/inventory",
        queryParams
      );
      return formatSuccess({
        inventory: data.data,
        pagination: {
          page_number: data.page_number,
          page_size: data.page_size,
          total_records: data.total_records,
          has_more: data.has_more,
        },
      });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      return formatError(e.status ?? 500, e.message ?? "Unknown error");
    }
  });
}
