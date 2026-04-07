import { z } from "zod";
import { paginationInputSchema } from "./common";

export const listCustomersSchema = z.object({
  ...paginationInputSchema,
  email: z
    .string()
    .optional()
    .describe("Filter customers by email address"),
  first_name: z
    .string()
    .optional()
    .describe("Filter customers by first name"),
  last_name: z
    .string()
    .optional()
    .describe("Filter customers by last name"),
  customer_type_id: z
    .number()
    .int()
    .optional()
    .describe("Filter customers by customer type ID"),
  updated_since: z
    .string()
    .optional()
    .describe(
      "Filter by last updated date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
    ),
}).strict();
