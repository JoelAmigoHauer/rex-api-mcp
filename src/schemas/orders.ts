import { z } from "zod";
import { paginationInputSchema } from "./common";

export const listOrdersSchema = z.object({
  ...paginationInputSchema,
  status: z
    .string()
    .optional()
    .describe("Order status filter (e.g. 'complete', 'pending', 'cancelled')"),
  customer_id: z
    .number()
    .int()
    .optional()
    .describe("Filter orders by customer ID"),
  outlet_id: z
    .number()
    .int()
    .optional()
    .describe("Filter orders by outlet ID"),
  updated_since: z
    .string()
    .optional()
    .describe(
      "Filter by last updated date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
    ),
  created_since: z
    .string()
    .optional()
    .describe(
      "Filter by creation date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
    ),
}).strict();

export const listOrderItemsSchema = z.object({
  ...paginationInputSchema,
  order_id: z
    .number()
    .int()
    .optional()
    .describe("Filter line items by order ID"),
}).strict();

export const listOrderFulfilmentsSchema = z.object({
  ...paginationInputSchema,
  order_id: z
    .number()
    .int()
    .optional()
    .describe("Filter fulfilments by order ID"),
}).strict();

export const listOrderPaymentsSchema = z.object({
  ...paginationInputSchema,
  order_id: z
    .number()
    .int()
    .optional()
    .describe("Filter payments by order ID"),
}).strict();
