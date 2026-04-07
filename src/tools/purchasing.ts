import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexClient } from "../services/rex-client";
import { idParamSchema } from "../schemas/common";
import {
  listPurchaseOrdersSchema,
  listPurchaseOrderItemsSchema,
  listTransfersSchema,
  listTransferItemsSchema,
  listSuppliersSchema,
  listSupplierInvoicesSchema,
  listSupplierReturnsSchema,
} from "../schemas/purchasing";
import { formatSuccess, formatError, stripUndefined } from "../utils";

export function registerPurchasingTools(
  server: McpServer,
  client: RexClient
): void {
  // 1. List Purchase Orders
  server.registerTool("rex_list_purchase_orders", {
    title: "List Purchase Orders",
    description:
      "List purchase orders in RetailExpress with optional filters for supplier, outlet, status, and date. Returns paginated PO summaries.",
    inputSchema: listPurchaseOrdersSchema,
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
        supplier_id: params.supplier_id,
        outlet_id: params.outlet_id,
        status: params.status,
        updated_since: params.updated_since,
      } as Record<string, unknown>);
      const result = await client.getList("/purchase-orders", query);
      return formatSuccess({
        purchase_orders: result.data,
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

  // 2. Get Purchase Order by ID
  server.registerTool("rex_get_purchase_order", {
    title: "Get Purchase Order",
    description:
      "Get a single purchase order by ID. Returns full PO details including supplier, outlet, status, dates, and totals.",
    inputSchema: idParamSchema,
    annotations: {
      readOnlyHint: true,
      destructiveHint: false,
      idempotentHint: true,
      openWorldHint: false,
    },
  }, async (params) => {
    try {
      const result = await client.get<Record<string, unknown>>(
        `/purchase-orders/${params.id}`
      );
      return formatSuccess({ purchase_order: result });
    } catch (err: unknown) {
      const e = err as { status?: number; message?: string };
      return formatError(e.status ?? 500, e.message ?? "Unknown error");
    }
  });

  // 3. List Purchase Order Items
  server.registerTool("rex_list_purchase_order_items", {
    title: "List Purchase Order Items",
    description:
      "List line items on purchase orders in RetailExpress. Optionally filter by purchase order ID. Returns product, quantity, and cost details per line.",
    inputSchema: listPurchaseOrderItemsSchema,
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
        purchase_order_id: params.purchase_order_id,
      } as Record<string, unknown>);
      const result = await client.getList("/purchase-order-items", query);
      return formatSuccess({
        purchase_order_items: result.data,
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

  // 4. List Transfers
  server.registerTool("rex_list_transfers", {
    title: "List Transfers",
    description:
      "List inter-outlet stock transfers in RetailExpress. Filter by source outlet, destination outlet, or date. Returns paginated transfer summaries.",
    inputSchema: listTransfersSchema,
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
        source_outlet_id: params.source_outlet_id,
        destination_outlet_id: params.destination_outlet_id,
        updated_since: params.updated_since,
      } as Record<string, unknown>);
      const result = await client.getList("/transfers", query);
      return formatSuccess({
        transfers: result.data,
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

  // 5. List Transfer Items
  server.registerTool("rex_list_transfer_items", {
    title: "List Transfer Items",
    description:
      "List line items on inter-outlet transfers in RetailExpress. Optionally filter by transfer ID. Returns product and quantity details per line.",
    inputSchema: listTransferItemsSchema,
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
        transfer_id: params.transfer_id,
      } as Record<string, unknown>);
      const result = await client.getList("/transfer-items", query);
      return formatSuccess({
        transfer_items: result.data,
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

  // 6. List Suppliers
  server.registerTool("rex_list_suppliers", {
    title: "List Suppliers",
    description:
      "List suppliers in RetailExpress. Optionally filter by last updated date. Returns paginated supplier records.",
    inputSchema: listSuppliersSchema,
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
      } as Record<string, unknown>);
      const result = await client.getList("/suppliers", query);
      return formatSuccess({
        suppliers: result.data,
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

  // 7. List Supplier Invoices
  server.registerTool("rex_list_supplier_invoices", {
    title: "List Supplier Invoices",
    description:
      "List supplier invoices in RetailExpress. Filter by supplier ID or date. Returns paginated invoice records.",
    inputSchema: listSupplierInvoicesSchema,
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
        supplier_id: params.supplier_id,
        updated_since: params.updated_since,
      } as Record<string, unknown>);
      const result = await client.getList("/supplier-invoices", query);
      return formatSuccess({
        supplier_invoices: result.data,
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

  // 8. List Supplier Returns
  server.registerTool("rex_list_supplier_returns", {
    title: "List Supplier Returns",
    description:
      "List supplier return records in RetailExpress. Filter by supplier ID or date. Returns paginated supplier return records.",
    inputSchema: listSupplierReturnsSchema,
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
        supplier_id: params.supplier_id,
        updated_since: params.updated_since,
      } as Record<string, unknown>);
      const result = await client.getList("/supplier-returns", query);
      return formatSuccess({
        supplier_returns: result.data,
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
