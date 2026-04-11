import { z } from "zod";

export const ProductStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "DISCONTINUED",
  "ARCHIVED",
]);
export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const TrackingTypeSchema = z.enum(["NONE", "SERIAL", "BATCH"]);
export type TrackingType = z.infer<typeof TrackingTypeSchema>;

export const DimensionUnitSchema = z.enum(["CM", "MM", "IN", "FT", "M"]);
export type DimensionUnit = z.infer<typeof DimensionUnitSchema>;

export const WeightUnitSchema = z.enum(["G", "KG", "LB", "OZ"]);
export type WeightUnit = z.infer<typeof WeightUnitSchema>;

export const UomTypeSchema = z.enum(["BASE", "PURCHASE", "SALE"]);
export type UomType = z.infer<typeof UomTypeSchema>;

export const MovementTypeSchema = z.enum([
  "RECEIPT",
  "SALE",
  "RETURN",
  "ADJUSTMENT",
  "TRANSFER_IN",
  "TRANSFER_OUT",
  "DAMAGE",
  "RESERVATION",
  "RESERVATION_RELEASE",
]);
export type MovementType = z.infer<typeof MovementTypeSchema>;

export const TransferStatusSchema = z.enum([
  "DRAFT",
  "IN_TRANSIT",
  "PARTIALLY_RECEIVED",
  "COMPLETED",
  "CANCELLED",
]);
export type TransferStatus = z.infer<typeof TransferStatusSchema>;

export const StockCountStatusSchema = z.enum([
  "DRAFT",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);
export type StockCountStatus = z.infer<typeof StockCountStatusSchema>;

export const ReturnDispositionSchema = z.enum([
  "RESTOCK",
  "DAMAGE",
  "RETURN_TO_SUPPLIER",
]);
export type ReturnDisposition = z.infer<typeof ReturnDispositionSchema>;

export const ReturnRequestStatusSchema = z.enum([
  "REQUESTED",
  "APPROVED",
  "RECEIVED",
  "COMPLETED",
  "REJECTED",
  "CANCELLED",
]);
export type ReturnRequestStatus = z.infer<typeof ReturnRequestStatusSchema>;

export const AlertTypeSchema = z.enum([
  "LOW_STOCK",
  "OUT_OF_STOCK",
  "OVERSTOCK",
  "LOT_EXPIRING",
  "LOT_EXPIRED",
  "COUNT_VARIANCE",
]);
export type AlertType = z.infer<typeof AlertTypeSchema>;

export const AlertStatusSchema = z.enum(["OPEN", "ACKNOWLEDGED", "RESOLVED"]);
export type AlertStatus = z.infer<typeof AlertStatusSchema>;

export const SerializedUnitStatusSchema = z.enum([
  "AVAILABLE",
  "SOLD",
  "RETURNED",
  "DAMAGED",
  "QUARANTINED",
  "TRANSFERRED",
]);
export type SerializedUnitStatus = z.infer<typeof SerializedUnitStatusSchema>;

export const ReservationStatusSchema = z.enum([
  "ACTIVE",
  "FULFILLED",
  "RELEASED",
  "EXPIRED",
]);
export type ReservationStatus = z.infer<typeof ReservationStatusSchema>;

export const CostingMethodSchema = z.enum(["FIFO", "AVCO", "FEFO"]);
export type CostingMethod = z.infer<typeof CostingMethodSchema>;

export const AuditActionSchema = z.enum([
  "CREATE",
  "UPDATE",
  "DELETE",
  "RESTORE",
]);
export type AuditAction = z.infer<typeof AuditActionSchema>;
