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

export const createCategory = (input: catalogRepo.CreateCategoryInput) =>
  catalogRepo.createCategory(input);

export const listCategories = (input: catalogRepo.ListCategoriesInput) =>
  catalogRepo.listCategories(input);

export const getCategoryById = (id: string) => catalogRepo.getCategoryById(id);

export const getCategoryTree = (id?: string) => catalogRepo.getCategoryTree(id);

export const updateCategory = (
  id: string,
  input: catalogRepo.UpdateCategoryInput,
) => catalogRepo.updateCategory(id, input);

export const deleteCategory = (id: string) => catalogRepo.deleteCategory(id);

// --- Brands ---

export const createBrand = (input: catalogRepo.CreateBrandInput) =>
  catalogRepo.createBrand(input);

export const listBrands = (input: catalogRepo.ListBrandsInput) =>
  catalogRepo.listBrands(input);

export const getBrandById = (id: string) => catalogRepo.getBrandById(id);

export const updateBrand = (id: string, input: catalogRepo.UpdateBrandInput) =>
  catalogRepo.updateBrand(id, input);

export const deleteBrand = (id: string) => catalogRepo.deleteBrand(id);

// --- Products ---

export const createProduct = (input: catalogRepo.CreateProductInput) =>
  catalogRepo.createProduct(input);

export const listProducts = (input: catalogRepo.ListProductsInput) =>
  catalogRepo.listProducts(input);

export const getProductById = (id: string) => catalogRepo.getProductById(id);

export const getProductBySlug = (slug: string) =>
  catalogRepo.getProductBySlug(slug);

export const updateProduct = (
  id: string,
  input: catalogRepo.UpdateProductInput,
) => catalogRepo.updateProduct(id, input);

export const deleteProduct = (id: string) => catalogRepo.deleteProduct(id);

export const publishProduct = (id: string) => catalogRepo.publishProduct(id);

export const discontinueProduct = (id: string) =>
  catalogRepo.discontinueProduct(id);

export const archiveProduct = (id: string) => catalogRepo.archiveProduct(id);

// --- Product Variants ---

export const createVariant = (input: catalogRepo.CreateVariantInput) =>
  catalogRepo.createVariant(input);

export const listVariantsByProduct = (
  input: catalogRepo.ListVariantsByProductInput,
) => catalogRepo.listVariantsByProduct(input);

export const getVariantById = (id: string) => catalogRepo.getVariantById(id);

export const updateVariant = (
  id: string,
  input: catalogRepo.UpdateVariantInput,
) => catalogRepo.updateVariant(id, input);

export const deleteVariant = (id: string) => catalogRepo.deleteVariant(id);
