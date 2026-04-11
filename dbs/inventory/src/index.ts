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

export { receiveStock } from "./use-cases/stock-in/receive-stock.js";
export type {
  ReceiveStockInput,
  ReceiveStockLineInput,
  ReceiveStockLineResult,
  ReceiveStockResult,
} from "./use-cases/stock-in/types.js";
export { expireReservations } from "./use-cases/stock-out/expire-reservations.js";
export { reserveStock } from "./use-cases/stock-out/reserve-stock.js";
export type {
  ExpireReservationsResult,
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
