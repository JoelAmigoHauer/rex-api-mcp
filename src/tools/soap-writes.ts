import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import type { RexSoapClient } from "../services/soap-client";
import { xmlElement, xmlOptional, xmlMoney } from "../services/soap-client";
import { formatSuccess, formatError } from "../utils";
import {
  createStockAdjustmentsSchema,
  createUpdateITOsSchema,
  createUpdatePurchaseOrdersSchema,
  createUpdateSuppliersSchema,
  saveProductAttributesSchema,
  saveProductOutletDetailsSchema,
  saveProductsSchema,
} from "../schemas/soap-writes";

export function registerSoapWriteTools(
  server: McpServer,
  soapClient: RexSoapClient
): void {
  // 1. CreateStockAdjustments
  server.registerTool(
    "rex_create_stock_adjustments",
    {
      title: "Create Stock Adjustments",
      description:
        "Adjust stock quantities in RetailExpress by PLU and outlet. Supports positive (add) and negative (subtract) adjustments. Uses the IPS SOAP API.",
      inputSchema: createStockAdjustmentsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const adjustmentsXml = params.adjustments
          .map(
            (adj) =>
              `<Adjustment>${xmlElement("PLU", adj.plu)}${adj.whid ? xmlElement("WHID", adj.whid) : ""}${adj.outlet_ext_ref ? xmlElement("OutletExtRef", adj.outlet_ext_ref) : ""}${xmlElement("Qty", adj.qty)}${xmlElement("Status", adj.status)}${xmlOptional("Comment", adj.comment)}${xmlOptional("UserCode", adj.user_code)}</Adjustment>`
          )
          .join("");

        const result = await soapClient.call(
          "CreateStockAdjustments",
          `<ret:adjustmentsXml><![CDATA[<Adjustments>${adjustmentsXml}</Adjustments>]]></ret:adjustmentsXml>`
        );

        if (!result.success) {
          return formatError(400, JSON.stringify(result.data));
        }
        return formatSuccess({
          action: "CreateStockAdjustments",
          status: result.status,
          ...result.data,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 2. CreateUpdateITOs
  server.registerTool(
    "rex_create_update_itos",
    {
      title: "Create/Update Inter-Store Transfers",
      description:
        "Create or update inter-store transfers (ITOs) in RetailExpress. Specify source and destination outlets with product SKUs and quantities. Uses the IPS SOAP API.",
      inputSchema: createUpdateITOsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const itemsXml = params.transfer_items
          .map(
            (item) =>
              `<TransferItem>${xmlElement("SKU", item.sku)}${xmlElement("Quantity", item.quantity)}</TransferItem>`
          )
          .join("");

        const itoXml = `<ITO>${params.ito_id ? xmlElement("ItoId", params.ito_id) : ""}${params.from_whid ? xmlElement("FromWHID", params.from_whid) : ""}${params.to_whid ? xmlElement("ToWHID", params.to_whid) : ""}${xmlOptional("Notes", params.notes)}${xmlOptional("ExternalReference", params.external_reference)}<TransferItems>${itemsXml}</TransferItems></ITO>`;

        const result = await soapClient.call(
          "CreateUpdateITOs",
          `<ret:itosXml><![CDATA[<ITOs>${itoXml}</ITOs>]]></ret:itosXml>`
        );

        if (!result.success) {
          return formatError(400, JSON.stringify(result.data));
        }
        return formatSuccess({
          action: "CreateUpdateITOs",
          status: result.status,
          ...result.data,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 3. CreateUpdatePurchaseOrders
  server.registerTool(
    "rex_create_update_purchase_orders",
    {
      title: "Create/Update Purchase Orders",
      description:
        "Create or update purchase orders with line items in RetailExpress. Supports supplier, outlet, ETA, shipping details, and PO items with SKU/quantity/price. Uses the IPS SOAP API.",
      inputSchema: createUpdatePurchaseOrdersSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const itemsXml = params.items
          .map(
            (item) =>
              `<PurchaseOrderItem>${xmlElement("SKU", item.sku)}${xmlElement("QuantityOrdered", item.quantity_ordered)}${item.supplier_buy_price !== undefined ? xmlMoney("SupplierBuyPrice", item.supplier_buy_price) : ""}</PurchaseOrderItem>`
          )
          .join("");

        const poXml = `<PurchaseOrder>${params.po_id ? xmlElement("POID", params.po_id) : ""}${params.supplier_id ? xmlElement("SupplierId", params.supplier_id) : ""}${params.whid ? xmlElement("WHID", params.whid) : ""}${xmlOptional("SupplierInvoiceNo", params.supplier_invoice_no)}${xmlOptional("ETA", params.eta)}${xmlOptional("ContainerNumber", params.container_number)}${xmlOptional("DateSailed", params.date_sailed)}${xmlOptional("DateDepositDue", params.date_deposit_due)}${xmlOptional("DateBalanceDue", params.date_balance_due)}${xmlOptional("PaymentTerms", params.payment_terms)}${xmlOptional("ShippingTerms", params.shipping_terms)}${xmlOptional("ExternalOrderID", params.external_order_id)}${xmlOptional("Status", params.status)}<PurchaseOrderItems>${itemsXml}</PurchaseOrderItems></PurchaseOrder>`;

        const result = await soapClient.call(
          "CreateUpdatePurchaseOrders",
          `<ret:PurchaseOrdersXml><![CDATA[<PurchaseOrders>${poXml}</PurchaseOrders>]]></ret:PurchaseOrdersXml>`
        );

        if (!result.success) {
          return formatError(400, JSON.stringify(result.data));
        }
        return formatSuccess({
          action: "CreateUpdatePurchaseOrders",
          status: result.status,
          ...result.data,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 4. CreateUpdateSuppliers
  server.registerTool(
    "rex_create_update_suppliers",
    {
      title: "Create/Update Suppliers",
      description:
        "Create or update supplier records in RetailExpress. SupplierCode is immutable after creation. Uses the IPS SOAP API.",
      inputSchema: createUpdateSuppliersSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const supplierXml = `<Supplier>${params.supplier_id ? xmlElement("SupplierID", params.supplier_id) : ""}${xmlOptional("SupplierCode", params.supplier_code)}${xmlOptional("SupplierName", params.supplier_name)}${xmlOptional("ContactName", params.contact_name)}${xmlOptional("StreetAddress", params.street_address)}${xmlOptional("State", params.state)}${xmlOptional("Suburb", params.suburb)}${xmlOptional("PostCode", params.post_code)}${xmlOptional("Phone", params.phone)}${xmlOptional("ContactEmail", params.contact_email)}${xmlOptional("Fax", params.fax)}${xmlOptional("OrderEmail", params.order_email)}${xmlOptional("Comments", params.comments)}${params.admin_orders_only !== undefined ? xmlElement("AdminOrdersOnly", params.admin_orders_only) : ""}${params.deposit_required !== undefined ? xmlElement("DepositRequired", params.deposit_required) : ""}${xmlOptional("PaymentTerms", params.payment_terms)}${xmlOptional("ShippingTerms", params.shipping_terms)}${xmlOptional("ExternalReference", params.external_reference)}</Supplier>`;

        const result = await soapClient.call(
          "CreateUpdateSuppliers",
          `<ret:suppliersXML><![CDATA[<Suppliers>${supplierXml}</Suppliers>]]></ret:suppliersXML>`
        );

        if (!result.success) {
          return formatError(400, JSON.stringify(result.data));
        }
        return formatSuccess({
          action: "CreateUpdateSuppliers",
          status: result.status,
          ...result.data,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 5. SaveProductAttributes
  server.registerTool(
    "rex_save_product_attributes",
    {
      title: "Save Product Attributes",
      description:
        "Create or update product attributes in RetailExpress: Sizes, Colours, Seasons, Brands, Product Types, Suppliers. Use this to fix taxonomy (e.g. clean up Season codes, add missing Colour values). Uses the IPS SOAP API.",
      inputSchema: saveProductAttributesSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const attrsXml = params.attributes
          .map(
            (attr) =>
              `<Attribute>${xmlElement("Type", attr.type)}${attr.id ? xmlElement("ID", attr.id) : ""}${xmlOptional("Code", attr.code)}${xmlElement("Text", attr.text)}${xmlOptional("ExtRef", attr.ext_ref)}</Attribute>`
          )
          .join("");

        const result = await soapClient.call(
          "SaveProductAttributes",
          `<ret:attributesXml><![CDATA[<Attributes>${attrsXml}</Attributes>]]></ret:attributesXml>`
        );

        if (!result.success) {
          return formatError(400, JSON.stringify(result.data));
        }
        return formatSuccess({
          action: "SaveProductAttributes",
          status: result.status,
          ...result.data,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 6. SaveProductOutletDetails
  server.registerTool(
    "rex_save_product_outlet_details",
    {
      title: "Save Product Outlet Details",
      description:
        "Update product details at a specific outlet: pricing (POS, discount), stock levels, bin locations. Monetary values use dollar format. Uses the IPS SOAP API.",
      inputSchema: saveProductOutletDetailsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const productsXml = params.products
          .map(
            (p) =>
              `<Product>${xmlElement("SupplierSKU", p.supplier_sku)}${p.min_qty !== undefined ? xmlElement("MinQty", p.min_qty) : ""}${p.qty !== undefined ? xmlElement("Qty", p.qty) : ""}${xmlMoney("BuyPriceEx", p.buy_price_ex)}${xmlMoney("DirectCosts", p.direct_costs)}${xmlMoney("POSPrice", p.pos_price)}${xmlMoney("DiscountPrice", p.discount_price)}${xmlOptional("DiscountStart", p.discount_start)}${xmlOptional("DiscountEnd", p.discount_end)}${xmlOptional("Bin", p.bin)}${p.includes_tax !== undefined ? xmlElement("IncludesTax", p.includes_tax) : ""}</Product>`
          )
          .join("");

        const result = await soapClient.call(
          "SaveProductOutletDetails",
          `<ret:productsXml><![CDATA[<Products>${productsXml}</Products>]]></ret:productsXml>
      <ret:outletRef>${params.outlet_ref}</ret:outletRef>`
        );

        if (!result.success) {
          return formatError(400, JSON.stringify(result.data));
        }
        return formatSuccess({
          action: "SaveProductOutletDetails",
          status: result.status,
          ...result.data,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );

  // 7. SaveProducts
  server.registerTool(
    "rex_save_products",
    {
      title: "Save Products (Full Record)",
      description:
        "Create or update full product records in RetailExpress via SOAP. Supports 30+ fields including dimensions, weights, custom fields, and pricing. For new products: SupplierSKU, ShortDescription, ProductType, SupplierCode, POSPrice, and BuyPriceEx are required. Colour/Size/Season/Brand/ProductType values must match existing attributes (use rex_save_product_attributes to create them first). Uses the IPS SOAP API.",
      inputSchema: saveProductsSchema,
      annotations: {
        readOnlyHint: false,
        destructiveHint: false,
        idempotentHint: false,
        openWorldHint: false,
      },
    },
    async (params) => {
      try {
        const productsXml = params.products
          .map((p) => {
            let xml = "<Product>";
            xml += xmlOptional("ProductId", p.product_id);
            xml += xmlOptional("ManufacturerSKU", p.manufacturer_sku);
            xml += xmlOptional("SupplierSKU", p.supplier_sku);
            xml += xmlOptional("ShortDescription", p.short_description);
            xml += xmlOptional("Size", p.size);
            xml += xmlOptional("Colour", p.colour);
            xml += xmlOptional("Season", p.season);
            xml += xmlOptional("Custom1", p.custom1);
            xml += xmlOptional("Custom2", p.custom2);
            xml += xmlOptional("Custom3", p.custom3);
            xml += xmlMoney("SupplierBuy", p.supplier_buy);
            xml += xmlMoney("BuyPriceEx", p.buy_price_ex);
            xml += xmlMoney("DirectCosts", p.direct_costs);
            xml += xmlMoney("RRP", p.rrp);
            xml += xmlMoney("POSPrice", p.pos_price);
            xml += xmlMoney("WebPrice", p.web_price);
            xml += xmlMoney("DiscountPrice", p.discount_price);
            xml += xmlOptional("DiscountEnd", p.discount_end);
            xml += xmlOptional("ProductType", p.product_type);
            xml += xmlOptional("LongDescription", p.long_description);
            if (p.lead_time !== undefined) xml += xmlElement("LeadTime", p.lead_time);
            xml += xmlOptional("CartonQty", p.carton_qty);
            if (p.core_product !== undefined) xml += xmlElement("CoreProduct", p.core_product ? "TRUE" : "FALSE");
            xml += xmlOptional("Brand", p.brand);
            xml += xmlOptional("SupplierCode", p.supplier_code);
            if (p.length !== undefined) xml += xmlElement("Length", p.length);
            if (p.depth !== undefined) xml += xmlElement("Depth", p.depth);
            if (p.breadth !== undefined) xml += xmlElement("Breadth", p.breadth);
            if (p.shipping_cubic !== undefined) xml += xmlElement("ShippingCubic", p.shipping_cubic);
            if (p.weight !== undefined) xml += xmlElement("Weight", p.weight);
            xml += xmlMoney("Freight", p.freight);
            if (p.requires_assembly !== undefined) xml += xmlElement("RequiresAssembly", p.requires_assembly ? "TRUE" : "FALSE");
            if (p.disabled !== undefined) xml += xmlElement("Disabled", p.disabled ? "TRUE" : "FALSE");
            if (p.export_to_web_service !== undefined) xml += xmlElement("ExportToWebService", p.export_to_web_service ? "TRUE" : "FALSE");
            xml += "</Product>";
            return xml;
          })
          .join("");

        const result = await soapClient.call(
          "SaveProducts",
          `<ret:productsXml><![CDATA[<Products>${productsXml}</Products>]]></ret:productsXml>`
        );

        if (!result.success) {
          return formatError(400, JSON.stringify(result.data));
        }
        return formatSuccess({
          action: "SaveProducts",
          status: result.status,
          ...result.data,
        });
      } catch (err: unknown) {
        const e = err as { status?: number; message?: string };
        return formatError(e.status ?? 500, e.message ?? "Unknown error");
      }
    }
  );
}
