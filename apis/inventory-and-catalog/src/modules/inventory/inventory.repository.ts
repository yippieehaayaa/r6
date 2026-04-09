export {
  getDamage,
  type ListDamagesInput,
  listDamages,
} from "../../models/inventory/damage";
export {
  type ListMovementsInput,
  listMovements,
} from "../../models/inventory/movement-history";
export {
  adjustStock,
  commitSale,
  getInStockItems,
  getLowStockItems,
  getOutOfStockItems,
  getStockCounts,
  getStockForProduct,
  getStockForVariant,
  type ListStockItemsInput,
  listStockItems,
  type ReceiveGoodsInput,
  receiveGoods,
  recordDamage,
  releaseReservation,
  reserveStock,
  type StockStatus,
  transferStock,
  updateReorderPoint,
} from "../../models/inventory/stock-operations";
