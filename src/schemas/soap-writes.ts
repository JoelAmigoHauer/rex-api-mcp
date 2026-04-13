import { z } from "zod";

// --- CreateStockAdjustments ---

const stockAdjustmentItem = z.object({
  plu: z
    .string()
    .describe("Product identifier: Product ID, Supplier SKU, or Manufacturer SKU (if unique)"),
  whid: z
    .number()
    .int()
    .optional()
    .describe("REX Outlet ID for the outlet to adjust. Provide either whid or outlet_ext_ref"),
  outlet_ext_ref: z
    .string()
    .optional()
    .describe("External outlet reference. Provide either whid or outlet_ext_ref"),
  qty: z
    .number()
    .int()
    .describe("Adjustment quantity (positive to add, negative to subtract)"),
  status: z
    .string()
    .default("qtyAvailable")
    .describe("Stock status bucket, e.g. 'qtyAvailable'"),
  comment: z
    .string()
    .optional()
    .describe("Comment to include on the adjustment"),
  user_code: z
    .string()
    .optional()
    .describe("REX user code for audit trail"),
});

export const createStockAdjustmentsSchema = z
  .object({
    adjustments: z
      .array(stockAdjustmentItem)
      .min(1)
      .describe("Array of stock adjustments to create"),
  })
  .strict();

// --- CreateUpdateITOs ---

const transferItem = z.object({
  sku: z
    .string()
    .describe("Product ID or Supplier SKU"),
  quantity: z
    .number()
    .int()
    .positive()
    .describe("Transfer quantity (must be > 0)"),
});

export const createUpdateITOsSchema = z
  .object({
    ito_id: z
      .number()
      .int()
      .optional()
      .describe("REX Transfer ID. Omit to create new, provide to update existing"),
    from_whid: z
      .number()
      .int()
      .optional()
      .describe("Source outlet ID (required for create, cannot be changed on update)"),
    to_whid: z
      .number()
      .int()
      .optional()
      .describe("Destination outlet ID (required for create, must differ from from_whid)"),
    notes: z
      .string()
      .optional()
      .describe("Notes for the transfer"),
    external_reference: z
      .string()
      .optional()
      .describe("External reference identifier"),
    transfer_items: z
      .array(transferItem)
      .min(1)
      .describe("Items to transfer with SKU and quantity"),
  })
  .strict();

// --- CreateUpdatePurchaseOrders ---

const purchaseOrderItem = z.object({
  sku: z
    .string()
    .describe("REX Product ID or Supplier SKU"),
  quantity_ordered: z
    .number()
    .int()
    .positive()
    .describe("Quantity ordered"),
  supplier_buy_price: z
    .number()
    .optional()
    .describe("Buy price in supplier's currency"),
});

export const createUpdatePurchaseOrdersSchema = z
  .object({
    po_id: z
      .number()
      .int()
      .optional()
      .describe("REX PO ID. Omit to create new, provide to update existing"),
    supplier_id: z
      .number()
      .int()
      .optional()
      .describe("REX Supplier ID (required for create)"),
    whid: z
      .number()
      .int()
      .optional()
      .describe("REX Outlet ID for delivery (required for create)"),
    supplier_invoice_no: z
      .string()
      .optional()
      .describe("Supplier invoice number"),
    eta: z
      .string()
      .optional()
      .describe("Estimated arrival date (ISO 8601)"),
    container_number: z
      .string()
      .optional()
      .describe("Shipping container number"),
    date_sailed: z
      .string()
      .optional()
      .describe("Date sailed (ISO 8601)"),
    date_deposit_due: z
      .string()
      .optional()
      .describe("Deposit due date (ISO 8601)"),
    date_balance_due: z
      .string()
      .optional()
      .describe("Balance due date (ISO 8601)"),
    payment_terms: z
      .string()
      .optional()
      .describe("Payment terms"),
    shipping_terms: z
      .string()
      .optional()
      .describe("Shipping terms"),
    external_order_id: z
      .string()
      .optional()
      .describe("External order identifier"),
    status: z
      .string()
      .optional()
      .describe("PO status (e.g. 'Incomplete')"),
    items: z
      .array(purchaseOrderItem)
      .min(1)
      .describe("PO line items with SKU, quantity, and optional buy price"),
  })
  .strict();

// --- CreateUpdateSuppliers ---

export const createUpdateSuppliersSchema = z
  .object({
    supplier_id: z
      .number()
      .int()
      .optional()
      .describe("REX Supplier ID. Omit to create new, provide to update existing"),
    supplier_code: z
      .string()
      .max(20)
      .optional()
      .describe("Supplier code (required for create, max 20 chars). IMMUTABLE - cannot be changed on update"),
    supplier_name: z
      .string()
      .max(50)
      .optional()
      .describe("Supplier name (required for create, max 50 chars)"),
    contact_name: z.string().max(50).optional().describe("Contact name"),
    street_address: z.string().max(255).optional().describe("Street address"),
    state: z.string().max(50).optional().describe("State"),
    suburb: z.string().max(50).optional().describe("Suburb"),
    post_code: z.string().max(10).optional().describe("Post code"),
    phone: z.string().max(20).optional().describe("Phone number"),
    contact_email: z.string().max(120).optional().describe("Contact email"),
    fax: z.string().max(20).optional().describe("Fax number"),
    order_email: z.string().max(120).optional().describe("Order email"),
    comments: z.string().max(255).optional().describe("Comments"),
    admin_orders_only: z.boolean().optional().describe("Restrict ordering to admins"),
    deposit_required: z.boolean().optional().describe("Supplier requires deposit"),
    payment_terms: z.string().max(50).optional().describe("Payment terms"),
    shipping_terms: z.string().max(50).optional().describe("Shipping terms"),
    external_reference: z.string().max(50).optional().describe("External reference"),
  })
  .strict();

// --- SaveProductAttributes ---

export const saveProductAttributesSchema = z
  .object({
    attributes: z
      .array(
        z.object({
          type: z
            .enum(["Size", "Colour", "Season", "Brand", "ProductType", "Supplier"])
            .describe("Attribute type"),
          id: z
            .number()
            .int()
            .optional()
            .describe("REX attribute ID. Omit to create new"),
          code: z
            .string()
            .optional()
            .describe("Required when type is 'Supplier'"),
          text: z
            .string()
            .describe("The attribute value text"),
          ext_ref: z
            .string()
            .optional()
            .describe("External reference identifier"),
        })
      )
      .min(1)
      .describe("Array of product attributes to create or update"),
  })
  .strict();

// --- SaveProductOutletDetails ---

export const saveProductOutletDetailsSchema = z
  .object({
    outlet_ref: z
      .string()
      .describe("Outlet ID or external reference of the outlet being updated"),
    products: z
      .array(
        z.object({
          supplier_sku: z
            .string()
            .describe("Supplier SKU to identify the product"),
          min_qty: z.number().int().optional().describe("Minimum stock level"),
          qty: z
            .number()
            .int()
            .optional()
            .describe("Set available stock at this outlet to this figure"),
          buy_price_ex: z
            .number()
            .optional()
            .describe("Average weighted cost (update with caution)"),
          direct_costs: z
            .number()
            .optional()
            .describe("Average weighted additional charges (freight etc.)"),
          pos_price: z.number().optional().describe("Regular POS price at outlet"),
          discount_price: z.number().optional().describe("Discount price at outlet"),
          discount_start: z
            .string()
            .optional()
            .describe("Discount start date (dd/mm/yyyy)"),
          discount_end: z
            .string()
            .optional()
            .describe("Discount end date (dd/mm/yyyy)"),
          bin: z.string().optional().describe("Warehouse bin location"),
          includes_tax: z
            .boolean()
            .optional()
            .describe("Whether tax is chargeable at this outlet for this product"),
        })
      )
      .min(1)
      .describe("Products to update at this outlet"),
  })
  .strict();

// --- SaveProducts ---

export const saveProductsSchema = z
  .object({
    products: z
      .array(
        z.object({
          product_id: z
            .string()
            .optional()
            .describe("REX Product ID. Use when updating, especially if changing Supplier SKU"),
          manufacturer_sku: z.string().optional().describe("Manufacturer SKU"),
          supplier_sku: z
            .string()
            .optional()
            .describe("Supplier SKU (required for create, or used as identifier for update)"),
          short_description: z
            .string()
            .optional()
            .describe("Short description (required for create)"),
          size: z.string().optional().describe("Size name (must match existing attribute)"),
          colour: z.string().optional().describe("Colour name (must match existing attribute)"),
          season: z.string().optional().describe("Season name (must match existing attribute)"),
          custom1: z.string().optional().describe("Custom field 1"),
          custom2: z.string().optional().describe("Custom field 2"),
          custom3: z.string().optional().describe("Custom field 3"),
          supplier_buy: z
            .number()
            .optional()
            .describe("Buy price in supplier's currency"),
          buy_price_ex: z
            .number()
            .optional()
            .describe("Avg weighted cost in retailer's currency (update with caution)"),
          direct_costs: z
            .number()
            .optional()
            .describe("Avg weighted additional charges"),
          rrp: z.number().optional().describe("Recommended retail price"),
          pos_price: z.number().optional().describe("POS price (required for create)"),
          web_price: z.number().optional().describe("Web price"),
          discount_price: z.number().optional().describe("Discount price"),
          discount_end: z.string().optional().describe("Discount end date"),
          product_type: z
            .string()
            .optional()
            .describe("Product type name (required for create, must match existing attribute)"),
          long_description: z.string().optional().describe("Long description / HTML"),
          lead_time: z.number().int().optional().describe("Lead time in days"),
          carton_qty: z.string().optional().describe("Carton quantity"),
          core_product: z.boolean().optional().describe("Is core product"),
          brand: z.string().optional().describe("Brand name (must match existing attribute)"),
          supplier_code: z
            .string()
            .optional()
            .describe("Supplier code (required for create, not supplier name)"),
          length: z.number().optional().describe("Product length"),
          depth: z.number().optional().describe("Product depth"),
          breadth: z.number().optional().describe("Product breadth"),
          shipping_cubic: z.number().optional().describe("Shipping cubic measurement"),
          weight: z.number().optional().describe("Product weight"),
          freight: z.number().optional().describe("Freight cost"),
          requires_assembly: z.boolean().optional().describe("Requires assembly"),
          disabled: z.boolean().optional().describe("Disabled/inactive"),
          export_to_web_service: z.boolean().optional().describe("Export to web service"),
        })
      )
      .min(1)
      .describe("Products to create or update"),
  })
  .strict();
