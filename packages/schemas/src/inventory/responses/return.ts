import { z } from "zod";

const ReturnRequestItemResponseSchema = z.object({
  id: z.string(),
  returnRequestId: z.string(),
  variantId: z.string(),
  lotId: z.string().nullable(),
  quantityReturned: z.number(),
  disposition: z.string(),
  dispositionNotes: z.string().nullable(),
  serialNumber: z.string().nullable(),
});

export const ReturnRequestSummarySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  referenceId: z.string(),
  referenceType: z.string(),
  returnReason: z.string().nullable(),
  status: z.string(),
  approvedAt: z.string().nullable(),
  receivedAt: z.string().nullable(),
  completedAt: z.string().nullable(),
  performedBy: z.string(),
  approvedBy: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ReturnRequestSummary = z.infer<typeof ReturnRequestSummarySchema>;

export const ReturnRequestDetailSchema = ReturnRequestSummarySchema.extend({
  items: z.array(ReturnRequestItemResponseSchema),
});

export type ReturnRequestDetail = z.infer<typeof ReturnRequestDetailSchema>;
