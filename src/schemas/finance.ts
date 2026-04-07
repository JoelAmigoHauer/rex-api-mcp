import { z } from "zod";

export const voucherSchema = z.object({
  id: z.number().describe("Voucher ID"),
  code: z.string().optional().describe("Voucher code"),
  type: z.string().optional().describe("Voucher type"),
  amount: z.number().optional().describe("Voucher amount"),
  balance: z.number().optional().describe("Remaining balance"),
  is_active: z.boolean().optional().describe("Whether the voucher is active"),
  expiry_date: z.string().optional().describe("Expiry date (ISO 8601)"),
  created_date: z.string().optional().describe("Creation date (ISO 8601)"),
});

export const voucherTypeSchema = z.object({
  id: z.number().describe("Voucher type ID"),
  name: z.string().describe("Voucher type name"),
  description: z.string().optional().describe("Voucher type description"),
});

export const creditNoteSchema = z.object({
  id: z.number().describe("Credit note ID"),
  code: z.string().optional().describe("Credit note code"),
  amount: z.number().optional().describe("Credit note amount"),
  balance: z.number().optional().describe("Remaining balance"),
  customer_id: z.number().optional().describe("Associated customer ID"),
  is_active: z.boolean().optional().describe("Whether the credit note is active"),
  created_date: z.string().optional().describe("Creation date (ISO 8601)"),
});

export const priceGroupFixedSchema = z.object({
  id: z.number().describe("Fixed price group ID"),
  name: z.string().describe("Price group name"),
  description: z.string().optional().describe("Price group description"),
});

export const priceGroupStandardSchema = z.object({
  id: z.number().describe("Standard price group ID"),
  name: z.string().describe("Price group name"),
  description: z.string().optional().describe("Price group description"),
});

export const maxDiscountRuleSchema = z.object({
  id: z.number().describe("Max discount rule ID"),
  name: z.string().describe("Rule name"),
  max_discount_percentage: z.number().optional().describe("Maximum discount percentage allowed"),
});

export const loyaltyAdjustmentReasonSchema = z.object({
  id: z.number().describe("Loyalty adjustment reason ID"),
  name: z.string().describe("Reason name"),
  description: z.string().optional().describe("Reason description"),
});

export const voucherFilterSchema = {
  voucher_type_id: z
    .number()
    .int()
    .optional()
    .describe("Filter by voucher type ID"),
  is_active: z
    .boolean()
    .optional()
    .describe("Filter by active status"),
};

export const creditNoteFilterSchema = {
  customer_id: z
    .number()
    .int()
    .optional()
    .describe("Filter by customer ID"),
  is_active: z
    .boolean()
    .optional()
    .describe("Filter by active status"),
};
