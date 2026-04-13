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
      .describe("Filter by product SKU (SupplierSKU) or Product ID"),
    outlet_id: z
      .string()
      .optional()
      .describe("Filter by outlet/warehouse ID (WHID) or External Outlet Code"),
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
      .describe("Filter by source type: 'PO' or 'ITO'"),
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

// ─── NEW SCHEMAS (remaining IPS GET methods) ───

// GetCustomers
export const getCustomersSchema = z
  .object({
    last_updated: z
      .string()
      .describe("Return customers created or modified since this date/time. Format: YYYY-MM-DDTHH:MM:SSZ"),
  })
  .strict();

// GetCustomersLoyaltyBalance
export const getCustomersLoyaltyBalanceSchema = z
  .object({
    last_updated: z
      .string()
      .describe("Return customers whose loyalty points changed since this date/time. Format: YYYY-MM-DDTHH:MM:SSZ"),
  })
  .strict();

// GetITOHistory — no parameters (closed ITOs received in last 30 days)
export const getITOHistorySchema = z.object({}).strict();

// GetITOs — no parameters (open transfers with outstanding quantities)
export const getITOsSchema = z.object({}).strict();

// GetOrders — no parameters (aggregated monthly sales)
export const getOrdersSchema = z.object({}).strict();

// GetOrdersDetailed
export const getOrdersDetailedSchema = z
  .object({
    date_from: z
      .string()
      .describe("Start date of the sales period in YYYY-MM-DD format (inclusive)"),
    date_to: z
      .string()
      .describe("End date of the sales period in YYYY-MM-DD format (inclusive)"),
  })
  .strict();

// GetOrdersWithLines
export const getOrdersWithLinesSchema = z
  .object({
    date_from: z
      .string()
      .describe("Start date of the sales period in YYYY-MM-DD format (inclusive)"),
    date_to: z
      .string()
      .describe("End date of the sales period in YYYY-MM-DD format (inclusive)"),
  })
  .strict();

// GetOutlets — no parameters
export const getOutletsSchema = z.object({}).strict();

// GetPackages — no parameters
export const getPackagesSchema = z.object({}).strict();

// GetProductsDetailed
export const getProductsDetailedSchema = z
  .object({
    last_updated: z
      .string()
      .describe("Return products created or modified since this date/time. Format: YYYY-MM-DDTHH:MM:SSZ"),
  })
  .strict();

// GetPurchaseOrderHistory — no parameters (closed/received POs last 30 days)
export const getPurchaseOrderHistorySchema = z.object({}).strict();

// GetStaff
export const getStaffSchema = z
  .object({
    include_retail_express_users: z
      .boolean()
      .optional()
      .describe("Whether to include RetailExpress system users (default false)"),
  })
  .strict();

// GetStockByOutlet
export const getStockByOutletSchema = z
  .object({
    target_whid: z
      .number()
      .int()
      .describe("The outlet/warehouse ID to return stock data for"),
  })
  .strict();

// GetStockLimited
export const getStockLimitedSchema = z
  .object({
    target_whid: z
      .number()
      .int()
      .describe("The outlet/warehouse ID to return stock data for"),
    all_product_outlets: z
      .string()
      .optional()
      .describe("Comma-separated list of outlet IDs where ALL products should be returned regardless of stock/sales rules"),
  })
  .strict();

// GetSuppliers — no parameters
export const getSuppliersSchema = z.object({}).strict();

// GetUpdatedITOs
export const getUpdatedITOsSchema = z
  .object({
    last_updated: z
      .string()
      .describe("Return ITOs created or updated since this date/time. Format: YYYY-MM-DDTHH:MM:SSZ"),
    include_exported: z
      .boolean()
      .optional()
      .describe("Include previously exported ITOs (default false)"),
    status: z
      .string()
      .optional()
      .describe("Filter by ITO status: 'Picked', 'Dispatched', or 'Received'"),
  })
  .strict();
