import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexSoapClient } from "../services/soap-client";
import {
  extractSoapResult,
  extractRecords,
  xmlOptional,
} from "../services/soap-client";
import { formatSuccess, formatError } from "../utils";
import {
  getGroupsSchema,
  getDailyStockMovementsSchema,
  getStockReceiptsSchema,
  getStockAdjustmentsSchema,
  getPurchaseOrdersDetailedSchema,
  getPurchaseOrdersWithSupplierInvNoSchema,
} from "../schemas/soap-reads";

export function registerSoapReadTools(
  server: McpServer,
  soapClient: RexSoapClient
): void {
  // 1. GetGroups — replaces list_product_types + list_product_attributes
  server.registerTool(
    "rex_list_product_groups",
    {
      title: "List Product Groups (Attributes)",
      description:
        "List all product attribute groups from RetailExpress: Sizes, Colours, Seasons, Brands, Product Types, and Suppliers. Returns the full taxonomy used for product classification. Uses the IPS SOAP API (replaces REST product-types and product-attributes endpoints).",
      inputSchema: getGroupsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const result = await soapClient.call("GetGroups", "");
        const resultXml = extractSoapResult(result.raw, "GetGroups");

        // Parse each group type
        const groups: Record<string, Record<string, string>[]> = {};
        const groupTypes = [
          "Size",
          "Colour",
          "Season",
          "Brand",
          "ProductType",
          "Supplier",
        ];
        for (const type of groupTypes) {
          groups[type] = extractRecords(resultXml, type);
        }

        // If no typed groups found, try generic parsing
        const hasData = Object.values(groups).some((arr) => arr.length > 0);
        if (!hasData) {
          // Try extracting any Group elements
          groups["All"] = extractRecords(resultXml, "Group");
        }

        return formatSuccess({ groups });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 2. GetDailyStockMovements — replaces list_inventory_movement_logs
  server.registerTool(
    "rex_list_stock_movements",
    {
      title: "List Daily Stock Movements",
      description:
        "List stock movements for a given date in RetailExpress. Optionally filter by SKU or outlet. Returns quantity changes, movement types, and related document references. Uses the IPS SOAP API (replaces REST inventory-movement-logs endpoint).",
      inputSchema: getDailyStockMovementsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:date>${params.date}T00:00:00</ret:date>${xmlOptional("ret:sku", params.sku)}${xmlOptional("ret:outletId", params.outlet_id)}`;

        const result = await soapClient.call("GetDailyStockMovements", body);
        const resultXml = extractSoapResult(
          result.raw,
          "GetDailyStockMovements"
        );

        // Try common element names for movement records
        let movements = extractRecords(resultXml, "StockMovement");
        if (movements.length === 0) {
          movements = extractRecords(resultXml, "Movement");
        }
        if (movements.length === 0) {
          movements = extractRecords(resultXml, "Row");
        }

        return formatSuccess({
          date: params.date,
          movements,
          total_records: movements.length,
          raw_available: movements.length === 0,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 3. GetStockReceipts — replaces list_stock_receipts
  server.registerTool(
    "rex_list_stock_receipts",
    {
      title: "List Stock Receipts",
      description:
        "List stock receipts in RetailExpress from a given date. Filter by source type (PO, ITO). Returns receipt details including quantities received and source documents. Uses the IPS SOAP API.",
      inputSchema: getStockReceiptsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:fromDate>${params.from_date}T00:00:00</ret:fromDate><ret:includeExported>${params.include_exported ?? true}</ret:includeExported>${xmlOptional("ret:sourceType", params.source_type)}`;

        const result = await soapClient.call("GetStockReceipts", body);
        const resultXml = extractSoapResult(result.raw, "GetStockReceipts");

        let receipts = extractRecords(resultXml, "StockReceipt");
        if (receipts.length === 0) {
          receipts = extractRecords(resultXml, "Receipt");
        }
        if (receipts.length === 0) {
          receipts = extractRecords(resultXml, "Row");
        }

        return formatSuccess({
          from_date: params.from_date,
          receipts,
          total_records: receipts.length,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 4. GetStockAdjustments — replaces list_stock_adjustment_reasons (and adds actual adjustment data)
  server.registerTool(
    "rex_list_stock_adjustments",
    {
      title: "List Stock Adjustments",
      description:
        "List stock adjustments in RetailExpress for a date range. Optionally filter by adjustment ID or warehouse/outlet. Returns adjustment details including quantities, reasons, and user who made the adjustment. Uses the IPS SOAP API.",
      inputSchema: getStockAdjustmentsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:dateFrom>${params.date_from}T00:00:00</ret:dateFrom><ret:dateTo>${params.date_to}T23:59:59</ret:dateTo>${params.adjustment_id !== undefined ? `<ret:adjustmentId>${params.adjustment_id}</ret:adjustmentId>` : ""}${params.whid !== undefined ? `<ret:whid>${params.whid}</ret:whid>` : ""}`;

        const result = await soapClient.call("GetStockAdjustments", body);
        const resultXml = extractSoapResult(result.raw, "GetStockAdjustments");

        let adjustments = extractRecords(resultXml, "StockAdjustment");
        if (adjustments.length === 0) {
          adjustments = extractRecords(resultXml, "Adjustment");
        }
        if (adjustments.length === 0) {
          adjustments = extractRecords(resultXml, "Row");
        }

        return formatSuccess({
          date_from: params.date_from,
          date_to: params.date_to,
          adjustments,
          total_records: adjustments.length,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 5. GetPurchaseOrdersDetailed — replaces list_purchase_orders
  server.registerTool(
    "rex_list_purchase_orders_soap",
    {
      title: "List Purchase Orders (Detailed)",
      description:
        "List purchase orders with full detail from RetailExpress. Filter by date range, PO ID, warehouse, or outlet external reference. Returns PO header + line items including supplier, status, quantities, and costs. Uses the IPS SOAP API (replaces REST purchase-orders list endpoint).",
      inputSchema: getPurchaseOrdersDetailedSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:dateFrom>${params.date_from}T00:00:00</ret:dateFrom><ret:dateTo>${params.date_to}T23:59:59</ret:dateTo>${params.poid !== undefined ? `<ret:poid>${params.poid}</ret:poid>` : ""}${params.whid !== undefined ? `<ret:whid>${params.whid}</ret:whid>` : ""}${xmlOptional("ret:outletExtRef", params.outlet_ext_ref)}`;

        const result = await soapClient.call(
          "GetPurchaseOrdersDetailed",
          body
        );
        const resultXml = extractSoapResult(
          result.raw,
          "GetPurchaseOrdersDetailed"
        );

        let purchase_orders = extractRecords(resultXml, "PurchaseOrder");
        if (purchase_orders.length === 0) {
          purchase_orders = extractRecords(resultXml, "Row");
        }

        return formatSuccess({
          date_from: params.date_from,
          date_to: params.date_to,
          purchase_orders,
          total_records: purchase_orders.length,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 6. GetPurchaseOrdersWithSupplierInvNo — replaces list_supplier_invoices
  server.registerTool(
    "rex_list_supplier_invoices_soap",
    {
      title: "List POs with Supplier Invoice Numbers",
      description:
        "List purchase orders that have supplier invoice numbers attached in RetailExpress. Useful for reconciliation and accounts payable. Uses the IPS SOAP API (replaces REST supplier-invoices endpoint).",
      inputSchema: getPurchaseOrdersWithSupplierInvNoSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const result = await soapClient.call(
          "GetPurchaseOrdersWithSupplierInvNo",
          ""
        );
        const resultXml = extractSoapResult(
          result.raw,
          "GetPurchaseOrdersWithSupplierInvNo"
        );

        let purchase_orders = extractRecords(resultXml, "PurchaseOrder");
        if (purchase_orders.length === 0) {
          purchase_orders = extractRecords(resultXml, "Row");
        }

        return formatSuccess({
          purchase_orders,
          total_records: purchase_orders.length,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );
}
