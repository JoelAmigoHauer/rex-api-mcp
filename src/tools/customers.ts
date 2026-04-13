import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { formatSuccess, formatError, stripUndefined } from "../utils";
import { idParamSchema, paginationInputSchema } from "../schemas/common";
import { listCustomersSchema } from "../schemas/customers";
import { z } from "zod";

const paginationOnlySchema = z.object({
  ...paginationInputSchema,
}).strict();

export function registerCustomerTools(server: McpServer, client: RexClient): void {
  server.registerTool(
    "rex_list_customers",
    {
      description:
        "List customers from RetailExpress. Filter by name, email, customer type, or date range. Returns paginated results.",
      inputSchema: listCustomersSchema,
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
          "/customers",
          query
        );
        return formatSuccess(result as unknown as Record<string, unknown>);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  server.registerTool(
    "rex_get_customer",
    {
      description:
        "Get a single customer by ID from RetailExpress with full profile detail including contact info, type, and history.",
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
          `/customers/${params.id}`
        );
        return formatSuccess(result);
      } catch (err) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  server.registerTool(
    "rex_list_customer_survey_segments",
    {
      description:
        "List customer survey segment data from RetailExpress. Returns paginated results.",
      inputSchema: paginationOnlySchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const query = stripUndefined({
          page_number: params.page_number?.toString(),
          page_size: params.page_size?.toString(),
        });
        const result = await client.getList<Record<string, unknown>>(
          "/customer-survey-segments",
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
