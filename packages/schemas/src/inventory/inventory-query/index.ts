import { z } from "zod";
import { ListQuerySchema, TimestampSchema, UuidSchema } from "../base.schema";
import {
  AlertStatusSchema,
  AlertTypeSchema,
  MovementTypeSchema,
  ReservationStatusSchema,
  ReturnRequestStatusSchema,
  StockCountStatusSchema,
  TransferStatusSchema,
} from "../enums.schema";

export const ListInventoryItemsQuerySchema = ListQuerySchema.extend({
  warehouseId: UuidSchema.optional(),
  variantId: UuidSchema.optional(),
});

export type ListInventoryItemsQuery = z.input<
  typeof ListInventoryItemsQuerySchema
>;

export const ListStockMovementsQuerySchema = ListQuerySchema.extend({
  type: MovementTypeSchema.optional(),
  variantId: UuidSchema.optional(),
  warehouseId: UuidSchema.optional(),
  fromCreatedAt: TimestampSchema.optional(),
  toCreatedAt: TimestampSchema.optional(),
  referenceId: z.string().trim().max(128).optional(),
  referenceType: z.string().trim().max(64).optional(),
});

export type ListStockMovementsQuery = z.input<
  typeof ListStockMovementsQuerySchema
>;

export const ListStockAlertsQuerySchema = ListQuerySchema.extend({
  status: AlertStatusSchema.optional(),
  alertType: AlertTypeSchema.optional(),
  variantId: UuidSchema.optional(),
  warehouseId: UuidSchema.optional(),
});

export type ListStockAlertsQuery = z.input<typeof ListStockAlertsQuerySchema>;

export const ListWarehousesQuerySchema = ListQuerySchema.extend({
  isActive: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type ListWarehousesQuery = z.input<typeof ListWarehousesQuerySchema>;

export const ListInventoryLotsQuerySchema = ListQuerySchema.extend({
  variantId: UuidSchema.optional(),
  warehouseId: UuidSchema.optional(),
  isQuarantined: z
    .enum(["true", "false"])
    .transform((v) => v === "true")
    .optional(),
});

export type ListInventoryLotsQuery = z.input<
  typeof ListInventoryLotsQuerySchema
>;

export const ListStockTransfersQuerySchema = ListQuerySchema.extend({
  status: TransferStatusSchema.optional(),
  fromWarehouseId: UuidSchema.optional(),
  toWarehouseId: UuidSchema.optional(),
});

export type ListStockTransfersQuery = z.input<
  typeof ListStockTransfersQuerySchema
>;

export const ListReturnRequestsQuerySchema = ListQuerySchema.extend({
  status: ReturnRequestStatusSchema.optional(),
  referenceId: z.string().trim().max(128).optional(),
});

export type ListReturnRequestsQuery = z.input<
  typeof ListReturnRequestsQuerySchema
>;

export const ListStockReservationsQuerySchema = ListQuerySchema.extend({
  variantId: UuidSchema.optional(),
  warehouseId: UuidSchema.optional(),
  status: ReservationStatusSchema.optional(),
  referenceId: z.string().trim().max(128).optional(),
  referenceType: z.string().trim().max(64).optional(),
});

export type ListStockReservationsQuery = z.input<
  typeof ListStockReservationsQuerySchema
>;

export const ListStockCountsQuerySchema = ListQuerySchema.extend({
  status: StockCountStatusSchema.optional(),
  warehouseId: UuidSchema.optional(),
});

export type ListStockCountsQuery = z.input<typeof ListStockCountsQuerySchema>;

export const GetByUuidParamsSchema = z.object({
  id: UuidSchema,
});

export type GetByUuidParams = z.infer<typeof GetByUuidParamsSchema>;
