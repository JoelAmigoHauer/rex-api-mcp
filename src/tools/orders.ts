import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { formatSuccess, formatError, stripUndefined } from "../utils";
import { idParamSchema } from "../schemas/common";
import {
  listOrdersSchema,
  listOrderItemsSchema,
  listOrderFulfilmentsSchema,
  listOrderPaymentsSchema,
} from "../schemas/orders";

export function registerOrderTools(server: McpServer, client: RexClient): void {
  // ── rex_list_orders ──────────────────────────────────────────────────
  server.registerTool(
    "rex_list_orders",
    {
      description:
        "List orders from RetailExpress. Filter by status, date range, customer, or outlet. Returns paginated results.",
      inputSchema: listOrdersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const { page_number, page_size, ...filters } = params;
        const query = stripUndefined({
          page_number: page_number?.toString(),
          page_size: page_size?.toString(),
          ...filters,
        });
        const result = await client.getList<Record<string, unknown>>(
          "/orders",
          query
        );
        return formatSuccess(result as unknown as Record<string, unknown>);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // ── rex_get_order ────────────────────────────────────────────────────
  server.registerTool(
    "rex_get_order",
    {
      description:
        "Get a single order by ID from RetailExpress with full detail including line items, payments, and fulfilment status.",
      inputSchema: idParamSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const result = await client.get<Record<string, unknown>>(
          `/orders/${params.id}`
        );
        return formatSuccess(result);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // ── rex_list_order_items ─────────────────────────────────────────────
  server.registerTool(
    "rex_list_order_items",
    {
      description:
        "List order line items from RetailExpress. Optionally filter by order_id to get items for a specific order.",
      inputSchema: listOrderItemsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const { page_number, page_size, ...filters } = params;
        const query = stripUndefined({
          page_number: page_number?.toString(),
          page_size: page_size?.toString(),
          ...filters,
        });
        const result = await client.getList<Record<string, unknown>>(
          "/order-items",
          query
        );
        return formatSuccess(result as unknown as Record<string, unknown>);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // ── rex_list_order_fulfilments ───────────────────────────────────────
  server.registerTool(
    "rex_list_order_fulfilments",
    {
      description:
        "List order fulfilments from RetailExpress. Optionally filter by order_id to see fulfilment status for a specific order.",
      inputSchema: listOrderFulfilmentsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const { page_number, page_size, ...filters } = params;
        const query = stripUndefined({
          page_number: page_number?.toString(),
          page_size: page_size?.toString(),
          ...filters,
        });
        const result = await client.getList<Record<string, unknown>>(
          "/order-fulfilments",
          query
        );
        return formatSuccess(result as unknown as Record<string, unknown>);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // ── rex_list_order_payments ──────────────────────────────────────────
  server.registerTool(
    "rex_list_order_payments",
    {
      description:
        "List order payments from RetailExpress. Optionally filter by order_id to see payments for a specific order.",
      inputSchema: listOrderPaymentsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: true,
      },
    },
    async (params) => {
      try {
        const { page_number, page_size, ...filters } = params;
        const query = stripUndefined({
          page_number: page_number?.toString(),
          page_size: page_size?.toString(),
          ...filters,
        });
        const result = await client.getList<Record<string, unknown>>(
          "/order-payments",
          query
        );
        return formatSuccess(result as unknown as Record<string, unknown>);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );
}
