import { z } from "zod";
import { paginationInputSchema } from "./common";

export const listInventorySchema = z
  .object({
    ...paginationInputSchema,
    product_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by product ID"),
    outlet_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by outlet/store ID"),
  })
  .strict();

export const listMovementLogsSchema = z
  .object({
    ...paginationInputSchema,
    product_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by product ID"),
    outlet_id: z
      .number()
      .int()
      .optional()
      .describe("Filter by outlet/store ID"),
    updated_since: z
      .string()
      .optional()
      .describe(
        "Filter movements since this date (ISO 8601 format, e.g. 2024-01-01T00:00:00+10:00)"
      ),
  })
  .strict();
