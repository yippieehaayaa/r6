import * as catalogRepo from "./catalog.repository";

export type {
  CategoryTree,
  CreateBrandInput,
  CreateCategoryInput,
  CreateProductInput,
  CreateVariantInput,
  ListBrandsInput,
  ListCategoriesInput,
  ListProductsInput,
  ListVariantsByProductInput,
  UpdateBrandInput,
  UpdateCategoryInput,
  UpdateProductInput,
  UpdateVariantInput,
} from "./catalog.repository";

// --- Categories ---

export const createCategory = (
  tenantSlug: string,
  input: catalogRepo.CreateCategoryInput,
) => catalogRepo.createCategory(tenantSlug, input);

export const listCategories = (
  tenantSlug: string,
  input: catalogRepo.ListCategoriesInput,
) => catalogRepo.listCategories(tenantSlug, input);

export const getCategoryById = (tenantSlug: string, id: string) =>
  catalogRepo.getCategoryById(tenantSlug, id);

export const getCategoryTree = (tenantSlug: string, id?: string) =>
  catalogRepo.getCategoryTree(tenantSlug, id);

export const updateCategory = (
  tenantSlug: string,
  id: string,
  input: catalogRepo.UpdateCategoryInput,
) => catalogRepo.updateCategory(tenantSlug, id, input);

export const deleteCategory = (tenantSlug: string, id: string) =>
  catalogRepo.deleteCategory(tenantSlug, id);

// --- Brands ---

export const createBrand = (
  tenantSlug: string,
  input: catalogRepo.CreateBrandInput,
) => catalogRepo.createBrand(tenantSlug, input);

export const listBrands = (
  tenantSlug: string,
  input: catalogRepo.ListBrandsInput,
) => catalogRepo.listBrands(tenantSlug, input);

export const getBrandById = (tenantSlug: string, id: string) =>
  catalogRepo.getBrandById(tenantSlug, id);

export const updateBrand = (
  tenantSlug: string,
  id: string,
  input: catalogRepo.UpdateBrandInput,
) => catalogRepo.updateBrand(tenantSlug, id, input);

export const deleteBrand = (tenantSlug: string, id: string) =>
  catalogRepo.deleteBrand(tenantSlug, id);

// --- Products ---

export const createProduct = (
  tenantSlug: string,
  input: catalogRepo.CreateProductInput,
) => catalogRepo.createProduct(tenantSlug, input);

export const listProducts = (
  tenantSlug: string,
  input: catalogRepo.ListProductsInput,
) => catalogRepo.listProducts(tenantSlug, input);

export const getProductById = (tenantSlug: string, id: string) =>
  catalogRepo.getProductById(tenantSlug, id);

export const getProductBySlug = (tenantSlug: string, slug: string) =>
  catalogRepo.getProductBySlug(tenantSlug, slug);

export const updateProduct = (
  tenantSlug: string,
  id: string,
  input: catalogRepo.UpdateProductInput,
) => catalogRepo.updateProduct(tenantSlug, id, input);

export const deleteProduct = (tenantSlug: string, id: string) =>
  catalogRepo.deleteProduct(tenantSlug, id);

export const publishProduct = (tenantSlug: string, id: string) =>
  catalogRepo.publishProduct(tenantSlug, id);

export const discontinueProduct = (tenantSlug: string, id: string) =>
  catalogRepo.discontinueProduct(tenantSlug, id);

export const archiveProduct = (tenantSlug: string, id: string) =>
  catalogRepo.archiveProduct(tenantSlug, id);

// --- Product Variants ---

export const createVariant = (
  tenantSlug: string,
  input: catalogRepo.CreateVariantInput,
) => catalogRepo.createVariant(tenantSlug, input);

export const listVariantsByProduct = (
  tenantSlug: string,
  input: catalogRepo.ListVariantsByProductInput,
) => catalogRepo.listVariantsByProduct(tenantSlug, input);

export const getVariantById = (tenantSlug: string, id: string) =>
  catalogRepo.getVariantById(tenantSlug, id);

export const updateVariant = (
  tenantSlug: string,
  id: string,
  input: catalogRepo.UpdateVariantInput,
) => catalogRepo.updateVariant(tenantSlug, id, input);

export const deleteVariant = (tenantSlug: string, id: string) =>
  catalogRepo.deleteVariant(tenantSlug, id);
