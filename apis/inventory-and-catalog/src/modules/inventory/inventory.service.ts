import type { TransactionClient } from "../../utils/prisma";
import * as inventoryRepo from "./inventory.repository";
import * as warehouseRepo from "./warehouse.repository";

export type {
  ListMovementsInput,
  ReceiveGoodsInput,
} from "./inventory.repository";

export type {
  CreateWarehouseInput,
  ListWarehousesInput,
  UpdateWarehouseInput,
} from "./warehouse.repository";

// --- Warehouses ---

export const createWarehouse = (input: warehouseRepo.CreateWarehouseInput) =>
  warehouseRepo.createWarehouse(input);

export const listWarehouses = (input: warehouseRepo.ListWarehousesInput) =>
  warehouseRepo.listWarehouses(input);

export const getWarehouseById = (id: string) =>
  warehouseRepo.getWarehouseById(id);

export const updateWarehouse = (
  id: string,
  input: warehouseRepo.UpdateWarehouseInput,
) => warehouseRepo.updateWarehouse(id, input);

export const deleteWarehouse = (id: string) =>
  warehouseRepo.deleteWarehouse(id);

// --- Stock Queries ---

export const getStockForVariant = (variantId: string, warehouseId: string) =>
  inventoryRepo.getStockForVariant(variantId, warehouseId);

export const getStockForProduct = (productId: string) =>
  inventoryRepo.getStockForProduct(productId);

export const getLowStockItems = (warehouseId?: string) =>
  inventoryRepo.getLowStockItems(warehouseId);

// --- Stock Mutations ---

export const receiveGoods = (
  tx: TransactionClient,
  input: inventoryRepo.ReceiveGoodsInput,
) => inventoryRepo.receiveGoods(tx, input);

export const reserveStock = (
  variantId: string,
  warehouseId: string,
  qty: number,
  performedBy: string,
) => inventoryRepo.reserveStock(variantId, warehouseId, qty, performedBy);

export const releaseReservation = (
  variantId: string,
  warehouseId: string,
  qty: number,
  performedBy: string,
) => inventoryRepo.releaseReservation(variantId, warehouseId, qty, performedBy);

export const commitSale = (
  variantId: string,
  warehouseId: string,
  qty: number,
  referenceId: string,
  performedBy: string,
) =>
  inventoryRepo.commitSale(
    variantId,
    warehouseId,
    qty,
    referenceId,
    performedBy,
  );

export const adjustStock = (
  variantId: string,
  warehouseId: string,
  delta: number,
  notes: string,
  performedBy: string,
) =>
  inventoryRepo.adjustStock(variantId, warehouseId, delta, notes, performedBy);

export const transferStock = (
  variantId: string,
  fromWarehouseId: string,
  toWarehouseId: string,
  qty: number,
  performedBy: string,
) =>
  inventoryRepo.transferStock(
    variantId,
    fromWarehouseId,
    toWarehouseId,
    qty,
    performedBy,
  );

export const recordDamage = (
  variantId: string,
  warehouseId: string,
  qty: number,
  notes: string,
  performedBy: string,
) =>
  inventoryRepo.recordDamage(variantId, warehouseId, qty, notes, performedBy);

// --- Movement History ---

export const listMovements = (input: inventoryRepo.ListMovementsInput) =>
  inventoryRepo.listMovements(input);
