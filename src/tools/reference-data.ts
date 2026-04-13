import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { paginationInputSchema } from "../schemas/common";
import { idParamSchema } from "../schemas/common";
import { formatSuccess, formatError, stripUndefined } from "../utils";

export function registerReferenceDataTools(
  server: McpServer,
  client: RexClient
): void {
  // 1. List Outlets
  server.registerTool("rex_list_outlets", {
    title: "List Outlets",
    description:
      "List all retail outlets/locations in RetailExpress. Returns outlet names, addresses, and configuration.",
    inputSchema: z.object({ ...paginationInputSchema }).strict(),
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
      } as Record<string, unknown>);
      const result = await client.getList("/outlets", query);
      return formatSuccess({
        outlets: result.data,
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

  // 2. Get Outlet by ID
  server.registerTool("rex_get_outlet", {
    title: "Get Outlet",
    description:
      "Get a single retail outlet/location by ID. Returns full outlet details including address and configuration.",
    inputSchema: idParamSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  }, async (params) => {
    try {
      const result = await client.get<Record<string, unknown>>(
        `/outlets/${params.id}`
      );
      return formatSuccess({ outlet: result });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      return formatError(e.status ?? 500, e.message ?? "Unknown error");
    }
  });

  // 3. List Countries
  server.registerTool("rex_list_countries", {
    title: "List Countries",
    description:
      "List all available countries in RetailExpress. Used for supplier and customer address configuration.",
    inputSchema: z.object({ ...paginationInputSchema }).strict(),
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
      } as Record<string, unknown>);
      const result = await client.getList("/countries", query);
      return formatSuccess({
        countries: result.data,
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

  // 4. List Currencies
  server.registerTool("rex_list_currencies", {
    title: "List Currencies",
    description:
      "List all available currencies in RetailExpress. Used for pricing and supplier cost configuration.",
    inputSchema: z.object({ ...paginationInputSchema }).strict(),
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
      } as Record<string, unknown>);
      const result = await client.getList("/currencies", query);
      return formatSuccess({
        currencies: result.data,
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

  // 5. List Users
  server.registerTool("rex_list_users", {
    title: "List Users",
    description:
      "List all system users in RetailExpress. Returns user names, emails, and active status.",
    inputSchema: z.object({ ...paginationInputSchema }).strict(),
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
      } as Record<string, unknown>);
      const result = await client.getList("/users", query);
      return formatSuccess({
        users: result.data,
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
