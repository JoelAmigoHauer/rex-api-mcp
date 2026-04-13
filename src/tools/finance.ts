import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { paginationInputSchema, dateFilterSchema } from "../schemas/common";
import { voucherFilterSchema } from "../schemas/finance";
import { formatSuccess, formatError, stripUndefined } from "../utils";

export function registerFinanceTools(
  server: McpServer,
  client: RexClient
): void {
  // List Vouchers
  server.registerTool("rex_list_vouchers", {
    title: "List Vouchers",
    description:
      "List vouchers in RetailExpress. Supports filtering by type, active status, and date ranges. Use for gift card and voucher auditing.",
    inputSchema: z.object({
      ...paginationInputSchema,
      ...dateFilterSchema,
      ...voucherFilterSchema,
    }).strict(),
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  }, async (params) => {
    try {
      const query = stripUndefined({
        page_number: params.page_number,
        page_size: params.page_size,
        updated_since: params.updated_since,
        created_since: params.created_since,
        voucher_type_id: params.voucher_type_id,
        is_active: params.is_active,
      } as Record<string, unknown>);
      const result = await client.getList("/vouchers", query);
      return formatSuccess({
        vouchers: result.data,
        pagination: {
          page_number: result.page_number,
          page_size: result.page_size,
          total_records: result.total_records,
          has_more: result.has_more,
        },
      });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      return formatError(e.status ?? 500, e.message ?? "Unknown error");
    }
  });
}
