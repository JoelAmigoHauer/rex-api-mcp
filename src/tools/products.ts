import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { formatSuccess, formatError, stripUndefined } from "../utils";
import { paginationInputSchema, idParamSchema } from "../schemas/common";
import { listProductsSchema, updateProductSchema } from "../schemas/products";

export function registerProductTools(
  server: McpServer,
  client: RexClient
): void {
  // 1. List/search products
  server.registerTool("rex_list_products", {
    title: "List Products",
    description:
      "Search and list products in RetailExpress. Filter by SKU, product type, outlet, or date range. Paginated.",
    inputSchema: listProductsSchema,
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
        sku: params.sku,
        product_type_id: params.product_type_id,
        outlet_id: params.outlet_id,
        updated_since: params.updated_since,
      });
      const data = await client.getList<Record<string, unknown>>(
        "/products",
        queryParams
      );
      return formatSuccess({
        products: data.data,
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

  // 2. Get single product by ID
  server.registerTool("rex_get_product", {
    title: "Get Product",
    description:
      "Get a single product by ID with full detail including pricing, stock, attributes.",
    inputSchema: idParamSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  }, async (params) => {
    try {
      const data = await client.get<Record<string, unknown>>(
        `/products/${params.id}`
      );
      return formatSuccess({ product: data });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      return formatError(e.status ?? 500, e.message ?? "Unknown error");
    }
  });

  // 3. Update product fields
  server.registerTool("rex_update_product", {
    title: "Update Product",
    description:
      "Update product fields in RetailExpress. Provide the product ID and any fields to change.",
    inputSchema: updateProductSchema,
    annotations: {
      readOnlyHint: false,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  }, async (params) => {
    try {
      const { id, ...body } = params;
      const data = await client.put<Record<string, unknown>>(
        `/products/${id}`,
        body
      );
      return formatSuccess({ product: data });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      return formatError(e.status ?? 500, e.message ?? "Unknown error");
    }
  });

  // 4. List product barcodes
  server.registerTool("rex_list_product_barcodes", {
    title: "List Product Barcodes",
    description:
      "List product barcodes in RetailExpress. Optionally filter by product ID.",
    inputSchema: z
      .object({
        ...paginationInputSchema,
        product_id: z
          .number()
          .int()
          .optional()
          .describe("Filter barcodes by product ID"),
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
        product_id: params.product_id,
      });
      const data = await client.getList<Record<string, unknown>>(
        "/product-barcodes",
        queryParams
      );
      return formatSuccess({
        product_barcodes: data.data,
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

  // 5. List product prices
  server.registerTool("rex_list_product_prices", {
    title: "List Product Prices",
    description:
      "List product prices in RetailExpress. Optionally filter by product ID or price group ID.",
    inputSchema: z
      .object({
        ...paginationInputSchema,
        product_id: z
          .number()
          .int()
          .optional()
          .describe("Filter prices by product ID"),
        price_group_id: z
          .number()
          .int()
          .optional()
          .describe("Filter prices by price group ID"),
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
        product_id: params.product_id,
        price_group_id: params.price_group_id,
      });
      const data = await client.getList<Record<string, unknown>>(
        "/product-prices",
        queryParams
      );
      return formatSuccess({
        product_prices: data.data,
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
