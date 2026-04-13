import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexSoapClient } from "../services/soap-client";
import {
  extractAndDecodeSoapResult,
  extractRecords,
  detectRecordTag,
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

/** Call SOAP, decode base64+gzip result, auto-detect record tag, extract records. */
async function callAndExtract(
  soapClient: RexSoapClient,
  action: string,
  body: string,
  recordTag?: string
): Promise<Record<string, string>[]> {
  const result = await soapClient.call(action, body);
  const decodedXml = await extractAndDecodeSoapResult(result.raw, action);
  if (!decodedXml) return [];

  // Auto-detect the record element from the inline XSD schema
  const detectedTag = detectRecordTag(decodedXml);
  const candidates = recordTag
    ? [recordTag, ...(detectedTag ? [detectedTag] : []), "Table", "Table1", "Row"]
    : [...(detectedTag ? [detectedTag] : []), "Table", "Table1", "Row"];

  for (const tag of candidates) {
    const records = extractRecords(decodedXml, tag);
    if (records.length > 0) return records;
  }
  return [];
}

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
        "List all product attribute groups from RetailExpress: Sizes, Colours, Seasons, Brands, Product Types, and Suppliers. Each record has Identifier, Value, and Description fields. Rate-limited to once per 5 minutes. Uses the IPS SOAP API.",
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
        const records = await callAndExtract(soapClient, "GetGroups", "");
        return formatSuccess({
          groups: records,
          total_records: records.length,
        });
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
        "List stock movements for a given date in RetailExpress. Optionally filter by SKU or outlet. Returns fields: Date, Product_Id, SKU, WHID, WarehouseName, ExtOutletCode, TransactionType, StockOnHand, InTransitOutbound, InTransitInBound, Faulty. Uses the IPS SOAP API.",
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
        const records = await callAndExtract(
          soapClient,
          "GetDailyStockMovements",
          body
        );

        return formatSuccess({
          date: params.date,
          movements: records,
          total_records: records.length,
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
        const records = await callAndExtract(
          soapClient,
          "GetStockReceipts",
          body
        );

        return formatSuccess({
          from_date: params.from_date,
          receipts: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 4. GetStockAdjustments — replaces list_stock_adjustment_reasons
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
        const records = await callAndExtract(
          soapClient,
          "GetStockAdjustments",
          body
        );

        return formatSuccess({
          date_from: params.date_from,
          date_to: params.date_to,
          adjustments: records,
          total_records: records.length,
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
        "List purchase orders with full detail from RetailExpress. Filter by date range, PO ID, warehouse, or outlet external reference. Returns PO header + line items including supplier, status, quantities, and costs. Uses the IPS SOAP API.",
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
        const records = await callAndExtract(
          soapClient,
          "GetPurchaseOrdersDetailed",
          body
        );

        return formatSuccess({
          date_from: params.date_from,
          date_to: params.date_to,
          purchase_orders: records,
          total_records: records.length,
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
        "List purchase orders that have supplier invoice numbers attached in RetailExpress. Useful for reconciliation and accounts payable. Uses the IPS SOAP API.",
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
        const records = await callAndExtract(
          soapClient,
          "GetPurchaseOrdersWithSupplierInvNo",
          ""
        );

        return formatSuccess({
          purchase_orders: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );
}
