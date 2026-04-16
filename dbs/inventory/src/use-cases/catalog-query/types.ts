import type {
  ProductStatus,
  UomType,
} from "../../../generated/prisma/client.js";

export interface PaginatedResult<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ListProductsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: ProductStatus;
  categoryId?: string;
  brandId?: string;
}

export interface ListVariantsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  productId?: string;
  isActive?: boolean;
}

export interface ListCategoriesInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  parentId?: string | null;
  isActive?: boolean;
}

export interface ListBrandsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  isActive?: boolean;
}

export interface ListUomsInput {
  tenantId: string;
  page?: number;
  limit?: number;
  search?: string;
  uomType?: UomType;
  isActive?: boolean;
}

export interface GetByIdInput {
  tenantId: string;
  id: string;
}
