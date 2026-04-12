import type {
  Brand,
  Category,
  DimensionUnit,
  Product,
  ProductStatus,
  ProductVariant,
  WeightUnit,
} from "../../../generated/prisma/client.js";

export type { Brand, Category, Product, ProductVariant };

export interface UpdateProductInput {
  tenantId: string;
  id: string;
  performedBy: string;
  name?: string;
  description?: string | null;
  tags?: string[];
  metadata?: Record<string, unknown> | null;
  status?: ProductStatus;
  categoryId?: string | null;
  brandId?: string | null;
}

export interface UpdateVariantInput {
  tenantId: string;
  id: string;
  performedBy: string;
  name?: string;
  barcode?: string | null;
  options?: Record<string, unknown>;
  weight?: string | null;
  length?: string | null;
  width?: string | null;
  height?: string | null;
  dimensionUnit?: DimensionUnit | null;
  weightUnit?: WeightUnit | null;
  imageUrl?: string | null;
  metadata?: Record<string, unknown> | null;
  isActive?: boolean;
}

export interface UpdateCategoryInput {
  tenantId: string;
  id: string;
  performedBy: string;
  name?: string;
  description?: string | null;
  parentId?: string | null;
  sortOrder?: number;
  isActive?: boolean;
}

export interface UpdateBrandInput {
  tenantId: string;
  id: string;
  performedBy: string;
  name?: string;
  description?: string | null;
  logoUrl?: string | null;
  isActive?: boolean;
}

export interface SoftDeleteInput {
  tenantId: string;
  id: string;
  performedBy: string;
}
