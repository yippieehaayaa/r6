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
  type ReceiveGoodsInput,
  receiveGoods,
  recordDamage,
  releaseReservation,
  reserveStock,
  transferStock,
} from "../../models/inventory/stock-operations";
