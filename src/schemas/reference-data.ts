import { z } from "zod";

export const outletSchema = z.object({
  id: z.number().describe("Unique outlet ID"),
  name: z.string().describe("Outlet name"),
  code: z.string().optional().describe("Outlet code"),
  address: z.string().optional().describe("Street address"),
  city: z.string().optional().describe("City"),
  state: z.string().optional().describe("State or territory"),
  postcode: z.string().optional().describe("Postcode"),
  country: z.string().optional().describe("Country"),
  phone: z.string().optional().describe("Phone number"),
  email: z.string().optional().describe("Email address"),
  is_active: z.boolean().optional().describe("Whether the outlet is active"),
});

export const countrySchema = z.object({
  id: z.number().describe("Country ID"),
  name: z.string().describe("Country name"),
  code: z.string().optional().describe("Country code (e.g. AU, US)"),
});

export const currencySchema = z.object({
  id: z.number().describe("Currency ID"),
  name: z.string().describe("Currency name"),
  code: z.string().optional().describe("Currency code (e.g. AUD, USD)"),
  symbol: z.string().optional().describe("Currency symbol"),
});

export const freightTypeSchema = z.object({
  id: z.number().describe("Freight type ID"),
  name: z.string().describe("Freight type name"),
  description: z.string().optional().describe("Freight type description"),
});

export const shipmentTypeSchema = z.object({
  id: z.number().describe("Shipment type ID"),
  name: z.string().describe("Shipment type name"),
});

export const shippingPortSchema = z.object({
  id: z.number().describe("Shipping port ID"),
  name: z.string().describe("Shipping port name"),
  code: z.string().optional().describe("Shipping port code"),
});

export const shippingStatusSchema = z.object({
  id: z.number().describe("Shipping status ID"),
  name: z.string().describe("Shipping status name"),
});

export const returnReasonSchema = z.object({
  id: z.number().describe("Return reason ID"),
  name: z.string().describe("Return reason name"),
  description: z.string().optional().describe("Return reason description"),
});

export const userSchema = z.object({
  id: z.number().describe("User ID"),
  name: z.string().describe("User display name"),
  email: z.string().optional().describe("User email address"),
  is_active: z.boolean().optional().describe("Whether the user is active"),
});
