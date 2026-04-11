export { prisma } from "./client.js";
export { setupCatalog } from "./use-cases/catalog-setup.js";
export { setupCategoryAndBrand } from "./use-cases/category-brand-setup.js";
export { setupProduct } from "./use-cases/product-setup.js";
export { onboardTenant } from "./use-cases/tenant-onboarding.js";
export { getTenantSetupStatus } from "./use-cases/tenant-setup-status.js";
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
} from "./use-cases/types.js";
export { setupWarehouse } from "./use-cases/warehouse-setup.js";
