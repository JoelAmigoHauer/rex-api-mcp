import { z } from "zod";

// GetGroups — no parameters needed
export const getGroupsSchema = z.object({}).strict();

// GetDailyStockMovements
export const getDailyStockMovementsSchema = z
  .object({
    date: z
      .string()
      .describe("Date for stock movements in YYYY-MM-DD format"),
    sku: z
      .string()
      .optional()
      .describe("Filter by product SKU (SupplierSKU)"),
    outlet_id: z
      .string()
      .optional()
      .describe("Filter by outlet/warehouse ID"),
  })
  .strict();

// GetStockReceipts
export const getStockReceiptsSchema = z
  .object({
    from_date: z
      .string()
      .describe("Start date in YYYY-MM-DD format"),
    include_exported: z
      .boolean()
      .optional()
      .default(true)
      .describe("Include previously exported receipts (default true)"),
    source_type: z
      .string()
      .optional()
      .describe("Filter by source type (e.g. 'PO', 'ITO')"),
  })
  .strict();

// GetStockAdjustments
export const getStockAdjustmentsSchema = z
  .object({
    date_from: z
      .string()
      .describe("Start date in YYYY-MM-DD format"),
    date_to: z
      .string()
      .describe("End date in YYYY-MM-DD format"),
    adjustment_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by specific adjustment ID"),
    whid: z
      .number()
      .int()
      .optional()
      .describe("Filter by warehouse/outlet ID"),
  })
  .strict();

// GetPurchaseOrdersDetailed
export const getPurchaseOrdersDetailedSchema = z
  .object({
    date_from: z
      .string()
      .describe("Start date in YYYY-MM-DD format"),
    date_to: z
      .string()
      .describe("End date in YYYY-MM-DD format"),
    poid: z
      .number()
      .int()
      .optional()
      .describe("Filter by specific purchase order ID"),
    whid: z
      .number()
      .int()
      .optional()
      .describe("Filter by warehouse/outlet ID"),
    outlet_ext_ref: z
      .string()
      .optional()
      .describe("Filter by outlet external reference"),
  })
  .strict();

// GetPurchaseOrdersWithSupplierInvNo — no parameters
export const getPurchaseOrdersWithSupplierInvNoSchema = z.object({}).strict();
