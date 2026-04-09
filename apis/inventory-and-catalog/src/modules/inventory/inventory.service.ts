import type { TransactionClient } from "../../utils/prisma";
import * as inventoryRepo from "./inventory.repository";
import * as warehouseRepo from "./warehouse.repository";

export type {
  ListDamagesInput,
  ListMovementsInput,
  ReceiveGoodsInput,
} from "./inventory.repository";

export type {
  CreateWarehouseInput,
  ListWarehousesInput,
  UpdateWarehouseInput,
} from "./warehouse.repository";

// --- Warehouses ---

export const createWarehouse = (
  tenantSlug: string,
  input: warehouseRepo.CreateWarehouseInput,
) => warehouseRepo.createWarehouse(tenantSlug, input);

export const listWarehouses = (
  tenantSlug: string,
  input: warehouseRepo.ListWarehousesInput,
) => warehouseRepo.listWarehouses(tenantSlug, input);

export const getWarehouseById = (tenantSlug: string, id: string) =>
  warehouseRepo.getWarehouseById(tenantSlug, id);

export const updateWarehouse = (
  tenantSlug: string,
  id: string,
  input: warehouseRepo.UpdateWarehouseInput,
) => warehouseRepo.updateWarehouse(tenantSlug, id, input);

export const deleteWarehouse = (tenantSlug: string, id: string) =>
  warehouseRepo.deleteWarehouse(tenantSlug, id);

// --- Stock Queries ---

export const getStockForVariant = (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
) => inventoryRepo.getStockForVariant(tenantSlug, variantId, warehouseId);

export const getStockForProduct = (tenantSlug: string, productId: string) =>
  inventoryRepo.getStockForProduct(tenantSlug, productId);

export const getLowStockItems = (tenantSlug: string, warehouseId?: string) =>
  inventoryRepo.getLowStockItems(tenantSlug, warehouseId);

export const getInStockItems = (tenantSlug: string, warehouseId?: string) =>
  inventoryRepo.getInStockItems(tenantSlug, warehouseId);

export const getOutOfStockItems = (tenantSlug: string, warehouseId?: string) =>
  inventoryRepo.getOutOfStockItems(tenantSlug, warehouseId);

export const getStockCounts = (tenantSlug: string, warehouseId?: string) =>
  inventoryRepo.getStockCounts(tenantSlug, warehouseId);

// --- Stock Mutations ---

export const receiveGoods = (
  tenantSlug: string,
  tx: TransactionClient,
  input: inventoryRepo.ReceiveGoodsInput,
) => inventoryRepo.receiveGoods(tenantSlug, tx, input);

export const reserveStock = (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  qty: number,
  performedBy: string,
) =>
  inventoryRepo.reserveStock(
    tenantSlug,
    variantId,
    warehouseId,
    qty,
    performedBy,
  );

export const releaseReservation = (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  qty: number,
  performedBy: string,
) =>
  inventoryRepo.releaseReservation(
    tenantSlug,
    variantId,
    warehouseId,
    qty,
    performedBy,
  );

export const commitSale = (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  qty: number,
  referenceId: string,
  performedBy: string,
) =>
  inventoryRepo.commitSale(
    tenantSlug,
    variantId,
    warehouseId,
    qty,
    referenceId,
    performedBy,
  );

export const adjustStock = (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  delta: number,
  notes: string,
  performedBy: string,
) =>
  inventoryRepo.adjustStock(
    tenantSlug,
    variantId,
    warehouseId,
    delta,
    notes,
    performedBy,
  );

export const transferStock = (
  tenantSlug: string,
  variantId: string,
  fromWarehouseId: string,
  toWarehouseId: string,
  qty: number,
  performedBy: string,
) =>
  inventoryRepo.transferStock(
    tenantSlug,
    variantId,
    fromWarehouseId,
    toWarehouseId,
    qty,
    performedBy,
  );

export const recordDamage = (
  tenantSlug: string,
  variantId: string,
  warehouseId: string,
  qty: number,
  notes: string,
  performedBy: string,
) =>
  inventoryRepo.recordDamage(
    tenantSlug,
    variantId,
    warehouseId,
    qty,
    notes,
    performedBy,
  );

export const listDamages = (
  tenantSlug: string,
  input: inventoryRepo.ListDamagesInput,
) => inventoryRepo.listDamages(tenantSlug, input);

export const getDamage = (tenantSlug: string, id: string) =>
  inventoryRepo.getDamage(tenantSlug, id);

// --- Movement History ---

export const listMovements = (
  tenantSlug: string,
  input: inventoryRepo.ListMovementsInput,
) => inventoryRepo.listMovements(tenantSlug, input);
