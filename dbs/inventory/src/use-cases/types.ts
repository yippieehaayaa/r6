import type {
  BinLocation,
  Brand,
  Category,
  CostingMethod,
  DimensionUnit,
  Product,
  ProductVariant,
  TenantInventoryConfig,
  TrackingType,
  UnitOfMeasure,
  UomConversion,
  Warehouse,
  WarehouseZone,
  WeightUnit,
} from "../../generated/prisma/client.js";

export type {
  BinLocation,
  Brand,
  Category,
  Product,
  ProductVariant,
  TenantInventoryConfig,
  UnitOfMeasure,
  UomConversion,
  Warehouse,
  WarehouseZone,
};
export type { CostingMethod, DimensionUnit, TrackingType, WeightUnit };

export type TenantOnboardingInput = {
  tenantId: string;
  performedBy: string;

  config?: {
    costingMethod?: CostingMethod;
    defaultCurrency?: string;
    lotExpiryAlertDays?: number;
    cartReservationTtlMinutes?: number;
    countVarianceThresholdPct?: number;
  };

  baseUom?: {
    name?: string;
    abbreviation?: string;
  };

  warehouse: {
    name: string;
    code: string;
    description?: string;
    addressLine1: string;
    addressLine2?: string;
    addressBarangay?: string;
    addressCity: string;
    addressProvince?: string;
    addressState: string;
    addressCountry?: string;
    addressPostal: string;
    landmark?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  };
};

export type TenantOnboardingResult = {
  config: TenantInventoryConfig;
  baseUom: UnitOfMeasure;
  warehouse: Warehouse;
};

export type CatalogSetupInput = {
  tenantId: string;
  performedBy: string;

  uoms: Array<{
    name: string;
    abbreviation: string;
    uomType: "PURCHASE" | "SALE";
  }>;

  conversions?: Array<{
    fromAbbreviation: string;
    toAbbreviation: string;
    conversionFactor: string;
  }>;
};

export type CatalogSetupResult = {
  uoms: UnitOfMeasure[];
  conversions: UomConversion[];
};

export type CategoryBrandSetupInput = {
  tenantId: string;
  performedBy: string;

  categories?: Array<{
    name: string;
    slug: string;
    description?: string;
    parentSlug?: string;
    sortOrder?: number;
  }>;

  brands?: Array<{
    name: string;
    slug: string;
    description?: string;
    logoUrl?: string;
  }>;
};

export type CategoryBrandSetupResult = {
  categories: Category[];
  brands: Brand[];
};

export type TenantSetupStatus = {
  isOnboarded: boolean;
  hasBaseUom: boolean;
  hasWarehouse: boolean;
  hasAdditionalUoms: boolean;
  hasCategories: boolean;
  hasBrands: boolean;
};

export type ProductSetupInput = {
  tenantId: string;
  performedBy: string;

  product: {
    sku: string;
    name: string;
    slug: string;
    description?: string;
    tags?: string[];
    metadata?: Record<string, unknown>;
    categorySlug?: string;
    brandSlug?: string;
  };

  variants: Array<{
    sku: string;
    name: string;
    barcode?: string;
    options: Record<string, unknown>;
    trackingType?: TrackingType;
    baseUomAbbreviation: string;
    weight?: string;
    length?: string;
    width?: string;
    height?: string;
    dimensionUnit?: DimensionUnit;
    weightUnit?: WeightUnit;
    imageUrl?: string;
    metadata?: Record<string, unknown>;
  }>;
};

export type ProductSetupResult = {
  product: Product;
  variants: ProductVariant[];
};

export type WarehouseSetupInput = {
  tenantId: string;
  performedBy: string;

  warehouse: {
    name: string;
    code: string;
    description?: string;
    addressLine1: string;
    addressLine2?: string;
    addressBarangay?: string;
    addressCity: string;
    addressProvince?: string;
    addressState: string;
    addressCountry?: string;
    addressPostal: string;
    landmark?: string;
    contactName?: string;
    contactPhone?: string;
    contactEmail?: string;
  };

  zones?: Array<{
    name: string;
    code: string;
    description?: string;
    bins?: Array<{
      code: string;
      description?: string;
    }>;
  }>;
};

export type WarehouseSetupResult = {
  warehouse: Warehouse;
  zones: Array<WarehouseZone & { bins: BinLocation[] }>;
};
