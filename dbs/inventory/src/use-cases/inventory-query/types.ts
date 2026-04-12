import type {
  AlertStatus,
  AlertType,
  MovementType,
  ReservationStatus,
  ReturnRequestStatus,
  StockCountStatus,
  TransferStatus,
} from "../../../generated/prisma/client.js";
import type { PaginatedResult } from "../catalog-query/types.js";

export type { PaginatedResult };

export interface ListInventoryItemsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  warehouseId?: string;
  variantId?: string;
}

export interface ListStockMovementsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  type?: MovementType;
  variantId?: string;
  warehouseId?: string;
  fromCreatedAt?: string;
  toCreatedAt?: string;
  referenceId?: string;
  referenceType?: string;
}

export interface ListStockAlertsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: AlertStatus;
  alertType?: AlertType;
  variantId?: string;
  warehouseId?: string;
}

export interface ListWarehousesInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ListInventoryLotsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  variantId?: string;
  warehouseId?: string;
  isQuarantined?: boolean;
}

export interface ListStockTransfersInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: TransferStatus;
  fromWarehouseId?: string;
  toWarehouseId?: string;
}

export interface ListReturnRequestsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: ReturnRequestStatus;
  referenceId?: string;
}

export interface ListStockReservationsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  variantId?: string;
  warehouseId?: string;
  status?: ReservationStatus;
  referenceId?: string;
  referenceType?: string;
}

export interface ListStockCountsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: StockCountStatus;
  warehouseId?: string;
}
