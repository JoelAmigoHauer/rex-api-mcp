import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { paginationInputSchema, dateFilterSchema } from "../schemas/common";
import { voucherFilterSchema, creditNoteFilterSchema } from "../schemas/finance";
import { formatSuccess, formatError, stripUndefined } from "../utils";

export function registerFinanceTools(
  server: McpServer,
  client: RexClient
): void {
  // 1. List Vouchers
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

  // 2. List Voucher Types
  server.registerTool("rex_list_voucher_types", {
    title: "List Voucher Types",
    description:
      "List all voucher classification types in RetailExpress. Returns type names used for categorising gift cards and vouchers.",
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
      const result = await client.getList("/voucher-types", query);
      return formatSuccess({
        voucher_types: result.data,
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

  // 3. List Credit Notes
  server.registerTool("rex_list_credit_notes", {
    title: "List Credit Notes",
    description:
      "List credit notes in RetailExpress. Supports filtering by customer, active status, and date ranges.",
    inputSchema: z.object({
      ...paginationInputSchema,
      ...dateFilterSchema,
      ...creditNoteFilterSchema,
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
        customer_id: params.customer_id,
        is_active: params.is_active,
      } as Record<string, unknown>);
      const result = await client.getList("/credit-notes", query);
      return formatSuccess({
        credit_notes: result.data,
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

  // 4. List Fixed Price Groups
  server.registerTool("rex_list_price_groups_fixed", {
    title: "List Fixed Price Groups",
    description:
      "List all fixed price groups in RetailExpress. Fixed price groups override standard pricing for specific products or customers.",
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
      const result = await client.getList("/price-groups-fixed", query);
      return formatSuccess({
        price_groups_fixed: result.data,
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

  // 5. List Standard Price Groups
  server.registerTool("rex_list_price_groups_standard", {
    title: "List Standard Price Groups",
    description:
      "List all standard price groups in RetailExpress. Standard price groups define percentage-based pricing tiers.",
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
      const result = await client.getList("/price-groups-standard", query);
      return formatSuccess({
        price_groups_standard: result.data,
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

  // 6. List Max Discount Rules
  server.registerTool("rex_list_max_discount_rules", {
    title: "List Max Discount Rules",
    description:
      "List all maximum discount rules in RetailExpress. Controls the maximum discount percentage that can be applied at POS or online.",
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
      const result = await client.getList("/max-discount-rules", query);
      return formatSuccess({
        max_discount_rules: result.data,
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

  // 7. List Loyalty Adjustment Reasons
  server.registerTool("rex_list_loyalty_adjustment_reasons", {
    title: "List Loyalty Adjustment Reasons",
    description:
      "List all loyalty point adjustment reasons in RetailExpress. Used when manually adjusting customer loyalty balances.",
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
      const result = await client.getList("/loyalty-adjustment-reasons", query);
      return formatSuccess({
        loyalty_adjustment_reasons: result.data,
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
