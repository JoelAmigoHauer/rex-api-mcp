import { z } from "zod";

export const paginationInputSchema = {
  page_number: z
    .number()
    .int()
    .min(1)
    .optional()
    .describe("Page number (default: 1)"),
  page_size: z
    .number()
    .int()
    .min(1)
    .max(250)
    .optional()
    .describe("Items per page (default: 50, max: 250)"),
};

export const paginationOutputSchema = {
  page_number: z.number().describe("Current page number"),
  page_size: z.number().describe("Items per page"),
  total_records: z.number().describe("Total matching records"),
  has_more: z.boolean().describe("Whether more pages exist"),
};

export const dateFilterSchema = {
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
};

export const idParamSchema = z.object({
  id: z.number().int().describe("The unique record ID in RetailExpress"),
}).strict();
