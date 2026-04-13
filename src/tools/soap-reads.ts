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
  getCustomersSchema,
  getCustomersLoyaltyBalanceSchema,
  getITOHistorySchema,
  getITOsSchema,
  getOrdersSchema,
  getOrdersDetailedSchema,
  getOrdersWithLinesSchema,
  getOutletsSchema,
  getPackagesSchema,
  getProductsDetailedSchema,
  getPurchaseOrderHistorySchema,
  getStaffSchema,
  getStockByOutletSchema,
  getStockLimitedSchema,
  getSuppliersSchema,
  getUpdatedITOsSchema,
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

/** Standard error handler for SOAP tools */
function handleError(err: unknown) {
  const e = err as { status?: number; message?: string };
  return formatError(e.status ?? 500, e.message ?? "Unknown error");
}

export function registerSoapReadTools(
  server: McpServer,
  soapClient: RexSoapClient
): void {
  // ═══════════════════════════════════════════════════════════════
  // 1. GetGroups
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_product_groups",
    {
      title: "List Product Groups (Attributes)",
      description:
        "List all product attribute groups from RetailExpress: Sizes (10), Colours (9), Seasons (3), Brands (2), Product Types (4), Suppliers (1), Core Product (5), Custom1-3 (6-8). Each record has Identifier, Value, and Description fields. Rate-limited to once per 5 minutes. Uses the IPS SOAP API.",
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
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 2. GetDailyStockMovements
  // ═══════════════════════════════════════════════════════════════
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
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 3. GetStockReceipts
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_stock_receipts",
    {
      title: "List Stock Receipts",
      description:
        "List stock receipts in RetailExpress from a given date. Filter by source type (PO, ITO). Returns receipt details including ReceiptId, SourceType, SourceId, DateReceived, ProductId, SKU, WHID, OutletExtRef, QtyReceived, BuyEx, DirectCosts. Uses the IPS SOAP API.",
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
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 4. GetStockAdjustments
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_stock_adjustments",
    {
      title: "List Stock Adjustments",
      description:
        "List stock adjustments in RetailExpress for a date range. Optionally filter by adjustment ID or warehouse/outlet. Returns: StockAdjID, Product_ID, SKU, WHID, ExtOutletCode, Qty, QtyStatus, Comment, UserCode, BuyEx, DirectCosts, DateCreated. Uses the IPS SOAP API.",
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
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 5. GetPurchaseOrdersDetailed
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_purchase_orders_soap",
    {
      title: "List Purchase Orders (Detailed)",
      description:
        "List purchase orders with full detail from RetailExpress. Filter by date range, PO ID, warehouse, or outlet external reference. Returns PO header + line items including supplier, status, quantities, costs, shipping info, and container details. Uses the IPS SOAP API.",
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
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 6. GetPurchaseOrdersWithSupplierInvNo
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_supplier_invoices_soap",
    {
      title: "List POs with Supplier Invoice Numbers",
      description:
        "List purchase orders that have supplier invoice numbers attached in RetailExpress. On-Order status with outstanding quantities. Returns SKU, WHID, Supplier, POID, CreateDate, QtyOrdered, ETA, QtyOutstanding, SupplierInvoiceNo. Uses the IPS SOAP API.",
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
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 7. GetCustomers
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_customers_soap",
    {
      title: "List Customers (SOAP)",
      description:
        "List customers from RetailExpress created or modified since a given date. Returns full customer profile: CustomerId, BillFirstName, BillLastName, BillEmail, BillPhone, BillAddress, DelAddress, CreditLimit, IsAccountCustomer, ReceivesNews, LoyaltyPoints, CustomerNumber, CustomerTypeName, FixedPriceGroupName, and more. Uses the IPS SOAP API.",
      inputSchema: getCustomersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:lastUpdated>${params.last_updated}</ret:lastUpdated>`;
        const records = await callAndExtract(soapClient, "GetCustomers", body);

        return formatSuccess({
          last_updated: params.last_updated,
          customers: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 8. GetCustomersLoyaltyBalance
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_customers_loyalty",
    {
      title: "List Customer Loyalty Balances",
      description:
        "List customers whose loyalty points changed since a given date. Returns CustomerID, LastUpdated, LoyaltyPointsToDate, LoyaltyPointsRedeemed, LoyaltyPointsAvailable. Uses the IPS SOAP API.",
      inputSchema: getCustomersLoyaltyBalanceSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:lastUpdated>${params.last_updated}</ret:lastUpdated>`;
        const records = await callAndExtract(
          soapClient,
          "GetCustomersLoyaltyBalance",
          body
        );

        return formatSuccess({
          last_updated: params.last_updated,
          customers: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 9. GetITOHistory
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_ito_history",
    {
      title: "List ITO History (Closed Last 30 Days)",
      description:
        "List Internal Transfer Orders (ITOs) in Closed status that were received in the last 30 days. Returns SKU, WHID_To, WHID_From, ITOID, DateCreated, QtyProposed, ETA, QtyReceived, DateReceived, ExternalReference. No parameters required. Uses the IPS SOAP API.",
      inputSchema: getITOHistorySchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const records = await callAndExtract(soapClient, "GetITOHistory", "");

        return formatSuccess({
          itos: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 10. GetITOs
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_open_itos",
    {
      title: "List Open ITOs (Outstanding Transfers)",
      description:
        "List open Internal Transfer Orders (ITOs) in RetailExpress that are not Closed or Cancelled and have outstanding quantities. Returns SKU, WHID_From, WHID_To, ITOID, TransferDate, ExpectedDate, QtyProposed, QtyToShip, QtyToReceive, ExternalReference, Notes, UserID, UserCode. No parameters required. Uses the IPS SOAP API.",
      inputSchema: getITOsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const records = await callAndExtract(soapClient, "GetITOs", "");

        return formatSuccess({
          itos: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 11. GetOrders (Aggregated Monthly Sales)
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_orders_aggregated",
    {
      title: "List Aggregated Monthly Sales",
      description:
        "List aggregated sales data for each product/outlet combination for the full previous month and current month-to-date. Returns SKU, WarehouseID, Period (first of month), Quantity, COGS, SalesEx. No parameters required. Uses the IPS SOAP API.",
      inputSchema: getOrdersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const records = await callAndExtract(soapClient, "GetOrders", "");

        return formatSuccess({
          orders: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 12. GetOrdersDetailed
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_orders_detailed",
    {
      title: "List Orders (Detailed Headers)",
      description:
        "List detailed order headers for a date range. Returns OrderNumber, WHID, WarehouseName, CustomerNumber, OrderStatus, DateCreated, OrderTotal, FreightTotal, Bill_Name, Bill_Address, Bill_Suburb, Bill_State, Bill_Postcode, BillCountry, BillEmail, Bill_Phone, isRefund, isWebOrder, isWebServiceOrder, OriginalOrderNumber. Date parameters are inclusive. Uses the IPS SOAP API.",
      inputSchema: getOrdersDetailedSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:dateFrom>${params.date_from}</ret:dateFrom><ret:dateTo>${params.date_to}</ret:dateTo>`;
        const records = await callAndExtract(
          soapClient,
          "GetOrdersDetailed",
          body
        );

        return formatSuccess({
          date_from: params.date_from,
          date_to: params.date_to,
          orders: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 13. GetOrdersWithLines
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_orders_with_lines",
    {
      title: "List Orders with Line Items",
      description:
        "List orders with product-level line item detail for a date range. Includes all fields from GetOrdersDetailed PLUS: UserID, Product_ID, Supplier_Product_Id, Quantity, Cost (qty * COGS), SalesEx (qty * sell price ex tax), OrderItemId. One record per order line. Date parameters are inclusive. Uses the IPS SOAP API.",
      inputSchema: getOrdersWithLinesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:dateFrom>${params.date_from}</ret:dateFrom><ret:dateTo>${params.date_to}</ret:dateTo>`;
        const records = await callAndExtract(
          soapClient,
          "GetOrdersWithLines",
          body
        );

        return formatSuccess({
          date_from: params.date_from,
          date_to: params.date_to,
          order_lines: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 14. GetOutlets
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_outlets_soap",
    {
      title: "List Outlets (SOAP)",
      description:
        "List all outlets/warehouses from RetailExpress via SOAP. Returns WHID, WarehouseName, Active, CurrencyCode, Address, Address2, Address3, Suburb, State, PCode, Region, Country, TaxRate, TaxLabel, CurrencyMultiplier, Phone, Email, OutletExtRef. Uses the IPS SOAP API.",
      inputSchema: getOutletsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const records = await callAndExtract(soapClient, "GetOutlets", "");

        return formatSuccess({
          outlets: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 15. GetPackages
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_packages",
    {
      title: "List Packages (Bundles)",
      description:
        "List all package/bundle definitions from RetailExpress. Each record links a package SKU to its component product SKU and quantity. Returns package_code, product_code, product_qty. Uses the IPS SOAP API.",
      inputSchema: getPackagesSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const records = await callAndExtract(soapClient, "GetPackages", "");

        return formatSuccess({
          packages: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 16. GetProductsDetailed
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_products_detailed",
    {
      title: "List Products (Detailed SOAP)",
      description:
        "List all products created or modified since a date from RetailExpress. Returns 30+ fields: Product_ID, Short_Description, Supplier_product_id, Manufacturer_Product_ID, ProductTypeCode/Desc, Weight, Cubic, ShippingCubic, Supplier_Code, Supplier, Brand, CoreProduct, bRequiresAssembly, IsDisabled, PreventDisabling, Carton_Qty, Size, Colour, Season, Custom1-3, Supplier_Buy, Direct_Costs, COGS, Price_POS, DiscountPrice, LastUpdated, rrp_inc, WebPrice, DiscountPrice_Expiry, Length, Depth, Breadth, Freight, LeadTime. Uses the IPS SOAP API.",
      inputSchema: getProductsDetailedSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:lastUpdated>${params.last_updated}</ret:lastUpdated>`;
        const records = await callAndExtract(
          soapClient,
          "GetProductsDetailed",
          body
        );

        return formatSuccess({
          last_updated: params.last_updated,
          products: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 17. GetPurchaseOrderHistory
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_purchase_order_history",
    {
      title: "List PO History (Closed Last 30 Days)",
      description:
        "List purchase orders in Available status that have been closed or received in the last 30 days. Returns SKU, WHID, Supplier, POID, LineNumber, CreateDate, QtyOrdered, ETA, QtyReceived, DateReceived. No parameters required. Uses the IPS SOAP API.",
      inputSchema: getPurchaseOrderHistorySchema,
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
          "GetPurchaseOrderHistory",
          ""
        );

        return formatSuccess({
          purchase_orders: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 18. GetStaff
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_staff",
    {
      title: "List Staff / Users",
      description:
        "List staff/users from RetailExpress. Returns UserID, UserCode, FirstName, Surname, IsAdmin, ProfileName, Enabled. Optionally include RetailExpress system users. Uses the IPS SOAP API.",
      inputSchema: getStaffSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const includeRex = params.include_retail_express_users ? "1" : "0";
        const body = `<ret:includeRetailExpressUsers>${includeRex}</ret:includeRetailExpressUsers>`;
        const records = await callAndExtract(soapClient, "GetStaff", body);

        return formatSuccess({
          staff: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 19. GetStockByOutlet
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_stock_by_outlet",
    {
      title: "List Stock by Outlet (Full Inventory)",
      description:
        "List inventory figures for ALL enabled products at a single outlet. Returns Product_ID, WHID, Supplier_product_id, qtyAvailable, qtyAllocated, qtyOnHand, qtyFaulty, qtyOnOrder, BuyPrice, DirectCosts, COGS, DiscountPrice, Price_POS, qtyPicked, qtyInTransitInbound, qtyReceived, MSL (minimum stock level), Bin. Per-outlet throttled (5 min). Uses the IPS SOAP API.",
      inputSchema: getStockByOutletSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:targetWHID>${params.target_whid}</ret:targetWHID>`;
        const records = await callAndExtract(
          soapClient,
          "GetStockByOutlet",
          body
        );

        return formatSuccess({
          target_whid: params.target_whid,
          stock: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 20. GetStockLimited
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_stock_limited",
    {
      title: "List Stock (Limited/Smart Filter)",
      description:
        "List products for a single outlet where: (1) has stock in any status, (2) sold in last 3 years, (3) has unfulfilled qty, or (4) is a Core product. Returns SKU, WHID, COGS, Supplier_Buy, Price_POS, DiscountPrice, DiscountStartDate, DiscountEndDate, SOH, Allocated, Supplier, LeadTime, MSL, CartonQty, Brand, Season, Size, Colour, ProductType, Core, Custom1-3. Per-outlet throttled (5 min). Uses the IPS SOAP API.",
      inputSchema: getStockLimitedSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:targetWHID>${params.target_whid}</ret:targetWHID>${xmlOptional("ret:AllProductOutlets", params.all_product_outlets)}`;
        const records = await callAndExtract(
          soapClient,
          "GetStockLimited",
          body
        );

        return formatSuccess({
          target_whid: params.target_whid,
          stock: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 21. GetSuppliers
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_suppliers_soap",
    {
      title: "List Suppliers (SOAP)",
      description:
        "List all suppliers from RetailExpress via SOAP. Returns Supplier ID (internal, not the Supplier Code), Supplier (name), Type (unused), LeadTime (unused). No parameters required. Uses the IPS SOAP API.",
      inputSchema: getSuppliersSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      try {
        const records = await callAndExtract(soapClient, "GetSuppliers", "");

        return formatSuccess({
          suppliers: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );

  // ═══════════════════════════════════════════════════════════════
  // 22. GetUpdatedITOs
  // ═══════════════════════════════════════════════════════════════
  server.registerTool(
    "rex_list_updated_itos",
    {
      title: "List Updated ITOs (with Line Items)",
      description:
        "List ITOs created or updated since a given date, with nested line items. Returns ITO header: ITOID, DateCreated, WHIDFromID, OutletFromExtRef, WHIDToID, OutletToExtRef, Status, ExternalReference. Each ITO contains ITOItems with: ITOID, ITOItemID, ProductID, SKU, qty_proposed, qty_requested, qty_allocated, qty_picked, qty_dispatched, qty_received, qty_madeavailable. Optionally filter by status (Picked, Dispatched, Received). Uses the IPS SOAP API.",
      inputSchema: getUpdatedITOsSchema,
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const body = `<ret:lastUpdated>${params.last_updated}</ret:lastUpdated><ret:includeExported>${params.include_exported ? "1" : "0"}</ret:includeExported>${xmlOptional("ret:status", params.status)}`;
        const records = await callAndExtract(
          soapClient,
          "GetUpdatedITOs",
          body
        );

        return formatSuccess({
          last_updated: params.last_updated,
          itos: records,
          total_records: records.length,
        });
      } catch (err: unknown) {
        return handleError(err);
      }
    }
  );
}
