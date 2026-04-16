import { z } from "zod";

export const PurchaseOrderStatusSchema = z.enum([
  "DRAFT",
  "SENT",
  "CONFIRMED",
  "PARTIALLY_RECEIVED",
  "RECEIVED",
  "CANCELLED",
]);

export type PurchaseOrderStatus = z.infer<typeof PurchaseOrderStatusSchema>;
