import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { formatSuccess, formatError, stripUndefined } from "../utils";
import { paginationInputSchema } from "../schemas/common";
import {
  listInventorySchema,
  listMovementLogsSchema,
} from "../schemas/inventory";

export function registerInventoryTools(
  server: McpServer,
  client: RexClient
): void {
  // 1. List inventory/stock levels
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

  // 2. List inventory movement logs
  server.registerTool("rex_list_inventory_movement_logs", {
    title: "List Inventory Movement Logs",
    description:
      "List stock movement history in RetailExpress. Filter by product ID, outlet ID, or date. Paginated.",
    inputSchema: listMovementLogsSchema,
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
        updated_since: params.updated_since,
      });
      const data = await client.getList<Record<string, unknown>>(
        "/inventory-movement-logs",
        queryParams
      );
      return formatSuccess({
        movement_logs: data.data,
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

  // 3. List stock receipts
  server.registerTool("rex_list_stock_receipts", {
    title: "List Stock Receipts",
    description:
      "List stock receipt records in RetailExpress. Paginated.",
    inputSchema: z
      .object({
        ...paginationInputSchema,
      })
      .strict(),
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
      });
      const data = await client.getList<Record<string, unknown>>(
        "/stock-receipts",
        queryParams
      );
      return formatSuccess({
        stock_receipts: data.data,
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

  // 4. List stock adjustment reasons
  server.registerTool("rex_list_stock_adjustment_reasons", {
    title: "List Stock Adjustment Reasons",
    description:
      "List configured reasons for stock adjustments in RetailExpress (e.g. damaged, shrinkage, correction). Paginated.",
    inputSchema: z
      .object({
        ...paginationInputSchema,
      })
      .strict(),
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
      });
      const data = await client.getList<Record<string, unknown>>(
        "/stock-adjustment-reasons",
        queryParams
      );
      return formatSuccess({
        stock_adjustment_reasons: data.data,
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
