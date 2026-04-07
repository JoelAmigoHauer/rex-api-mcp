import { z } from "zod";
import { paginationInputSchema } from "./common";

export const listPurchaseOrdersSchema = z
  .object({
    ...paginationInputSchema,
    supplier_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by supplier ID"),
    outlet_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by destination outlet/store ID"),
    status: z
      .string()
      .optional()
      .describe("Filter by purchase order status"),
    updated_since: z
      .string()
      .optional()
      .describe(
        "Filter by last updated date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
      ),
  })
  .strict();

export const listPurchaseOrderItemsSchema = z
  .object({
    ...paginationInputSchema,
    purchase_order_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by purchase order ID"),
  })
  .strict();

export const listTransfersSchema = z
  .object({
    ...paginationInputSchema,
    source_outlet_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by source outlet/store ID"),
    destination_outlet_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by destination outlet/store ID"),
    updated_since: z
      .string()
      .optional()
      .describe(
        "Filter by last updated date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
      ),
  })
  .strict();

export const listTransferItemsSchema = z
  .object({
    ...paginationInputSchema,
    transfer_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by transfer ID"),
  })
  .strict();

export const listSuppliersSchema = z
  .object({
    ...paginationInputSchema,
    updated_since: z
      .string()
      .optional()
      .describe(
        "Filter by last updated date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
      ),
  })
  .strict();

export const listSupplierInvoicesSchema = z
  .object({
    ...paginationInputSchema,
    supplier_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by supplier ID"),
    updated_since: z
      .string()
      .optional()
      .describe(
        "Filter by last updated date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
      ),
  })
  .strict();

export const listSupplierReturnsSchema = z
  .object({
    ...paginationInputSchema,
    supplier_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by supplier ID"),
    updated_since: z
      .string()
      .optional()
      .describe(
        "Filter by last updated date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
      ),
  })
  .strict();
