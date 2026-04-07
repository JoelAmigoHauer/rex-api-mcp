import { z } from "zod";
import { paginationInputSchema } from "./common";

export const listProductsSchema = z
  .object({
    ...paginationInputSchema,
    sku: z
      .string()
      .optional()
      .describe("Filter by SKU (exact or partial match)"),
    product_type_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by product type ID"),
    outlet_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by outlet/store ID"),
    updated_since: z
      .string()
      .optional()
      .describe(
        "Filter products updated since this date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
      ),
  })
  .strict();

export const updateProductSchema = z
  .object({
    id: z.number().int().describe("The product ID in RetailExpress"),
    description: z
      .string()
      .optional()
      .describe("Product description/name"),
    sku: z.string().optional().describe("Product SKU code"),
    product_type_id: z
      .number()
      .int()
      .optional()
      .describe("Product type classification ID"),
    supplier_id: z
      .number()
      .int()
      .optional()
      .describe("Supplier ID"),
    cost_price: z
      .number()
      .optional()
      .describe("Cost price (ex GST)"),
    sell_price: z
      .number()
      .optional()
      .describe("Sell price (inc GST)"),
    enabled: z
      .boolean()
      .optional()
      .describe("Whether the product is active/enabled"),
  })
  .strict();
