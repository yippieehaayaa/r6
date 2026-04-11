export { manualAdjustment } from "./use-cases/corrections/manual-adjustment.js";
export type {
  LotAdjustment,
  ManualAdjustmentInput,
  ManualAdjustmentResult,
  WriteOffStockInput,
  WriteOffStockResult,
} from "./use-cases/corrections/types.js";
export { writeOffStock } from "./use-cases/corrections/write-off-stock.js";
export { approveReturn } from "./use-cases/return/approve-return.js";
export { processReturnDisposition } from "./use-cases/return/process-return-disposition.js";
export { receiveReturn } from "./use-cases/return/receive-return.js";
export { requestReturn } from "./use-cases/return/request-return.js";
export type {
  ApproveReturnInput,
  ApproveReturnResult,
  DispositionLineResult,
  ProcessReturnDispositionInput,
  ProcessReturnDispositionResult,
  ReceiveReturnInput,
  ReceiveReturnLineInput,
  ReceiveReturnResult,
  RequestReturnInput,
  RequestReturnLineInput,
  RequestReturnResult,
} from "./use-cases/return/types.js";
export { setupCatalog } from "./use-cases/setup/catalog-setup.js";
export { setupCategoryAndBrand } from "./use-cases/setup/category-brand-setup.js";
export { setupProduct } from "./use-cases/setup/product-setup.js";
export { onboardTenant } from "./use-cases/setup/tenant-onboarding.js";
export { getTenantSetupStatus } from "./use-cases/setup/tenant-setup-status.js";
export type {
  CatalogSetupInput,
  CatalogSetupResult,
  CategoryBrandSetupInput,
  CategoryBrandSetupResult,
  ProductSetupInput,
  ProductSetupResult,
  TenantOnboardingInput,
  TenantOnboardingResult,
  TenantSetupStatus,
  WarehouseSetupInput,
  WarehouseSetupResult,
} from "./use-cases/setup/types.js";
export { setupWarehouse } from "./use-cases/setup/warehouse-setup.js";
export { prepareStockCount } from "./use-cases/stock-count/prepare-stock-count.js";
export { reconcileStockCount } from "./use-cases/stock-count/reconcile-stock-count.js";
export { recordCount } from "./use-cases/stock-count/record-count.js";
export type {
  PrepareStockCountInput,
  PrepareStockCountResult,
  ReconcileLineResult,
  ReconcileStockCountInput,
  ReconcileStockCountResult,
  RecordCountInput,
  RecordCountLineInput,
  RecordCountResult,
  StockCountItemScope,
} from "./use-cases/stock-count/types.js";
export { receiveStock } from "./use-cases/stock-in/receive-stock.js";
export type {
  ReceiveStockInput,
  ReceiveStockLineInput,
  ReceiveStockLineResult,
  ReceiveStockResult,
} from "./use-cases/stock-in/types.js";
export { expireReservations } from "./use-cases/stock-out/expire-reservations.js";
export { fulfillSale } from "./use-cases/stock-out/fulfill-sale.js";
export { reserveStock } from "./use-cases/stock-out/reserve-stock.js";
export type {
  ExpireReservationsResult,
  FulfillSaleInput,
  FulfillSaleLineInput,
  FulfillSaleLineResult,
  FulfillSaleResult,
  LotConsumption,
  ReserveStockInput,
  ReserveStockLineInput,
  ReserveStockLineResult,
  ReserveStockResult,
} from "./use-cases/stock-out/types.js";
export {
  checkAvailability,
  checkAvailabilityBatch,
} from "./use-cases/stock-query/check-availability.js";
export type {
  CheckAvailabilityBatchInput,
  CheckAvailabilityBatchResult,
  CheckAvailabilityInput,
  CheckAvailabilityResult,
} from "./use-cases/stock-query/types.js";
export { dispatchTransfer } from "./use-cases/transfer/dispatch-transfer.js";
export { receiveTransfer } from "./use-cases/transfer/receive-transfer.js";
export type {
  DispatchTransferInput,
  DispatchTransferLineInput,
  DispatchTransferLineResult,
  DispatchTransferResult,
  LotShipment,
  ReceiveTransferInput,
  ReceiveTransferLineInput,
  ReceiveTransferLineResult,
  ReceiveTransferResult,
} from "./use-cases/transfer/types.js";
