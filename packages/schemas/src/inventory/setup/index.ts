import { z } from "zod";
import {
  AddressSchema,
  ContactSchema,
  DecimalStringSchema,
  SlugSchema,
} from "../common";
import {
  CostingMethodSchema,
  DimensionUnitSchema,
  TrackingTypeSchema,
  WeightUnitSchema,
} from "../enums.schema";

// ── Tenant Onboarding ───────────────────────────────────────

export const OnboardTenantSchema = z.object({
  config: z
    .object({
      costingMethod: CostingMethodSchema.optional(),
      defaultCurrency: z.string().length(3).optional(),
      lotExpiryAlertDays: z.number().int().min(1).optional(),
      cartReservationTtlMinutes: z.number().int().min(1).optional(),
      countVarianceThresholdPct: z.number().min(0).max(100).optional(),
    })
    .optional(),

  baseUom: z
    .object({
      name: z.string().min(1).max(50).optional(),
      abbreviation: z.string().min(1).max(10).optional(),
    })
    .optional(),

  warehouse: AddressSchema.merge(ContactSchema).extend({
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(20).trim(),
    description: z.string().max(500).optional(),
  }),
});

export type OnboardTenantInput = z.infer<typeof OnboardTenantSchema>;

// ── Catalog Setup (UOMs + Conversions) ──────────────────────

export const CatalogSetupSchema = z.object({
  uoms: z
    .array(
      z.object({
        name: z.string().min(1).max(50),
        abbreviation: z.string().min(1).max(10),
        uomType: z.enum(["PURCHASE", "SALE"]),
      }),
    )
    .min(1),

  conversions: z
    .array(
      z.object({
        fromAbbreviation: z.string().min(1).max(10),
        toAbbreviation: z.string().min(1).max(10),
        conversionFactor: DecimalStringSchema,
      }),
    )
    .optional(),
});

export type CatalogSetupInput = z.infer<typeof CatalogSetupSchema>;

// ── Category & Brand Setup ──────────────────────────────────

export const CategoryBrandSetupSchema = z.object({
  categories: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        slug: SlugSchema,
        description: z.string().max(500).optional(),
        parentSlug: SlugSchema.optional(),
        sortOrder: z.number().int().min(0).optional(),
      }),
    )
    .optional(),

  brands: z
    .array(
      z.object({
        name: z.string().min(1).max(100),
        slug: SlugSchema,
        description: z.string().max(500).optional(),
        logoUrl: z.string().url().optional(),
      }),
    )
    .optional(),
});

export type CategoryBrandSetupInput = z.infer<typeof CategoryBrandSetupSchema>;

// ── Product Setup ───────────────────────────────────────────

const ProductVariantInputSchema = z.object({
  sku: z.string().min(1).max(100).trim(),
  name: z.string().min(1).max(255),
  barcode: z.string().max(50).optional(),
  options: z.record(z.string(), z.unknown()),
  trackingType: TrackingTypeSchema.optional(),
  baseUomAbbreviation: z.string().min(1).max(10),
  weight: DecimalStringSchema.optional(),
  length: DecimalStringSchema.optional(),
  width: DecimalStringSchema.optional(),
  height: DecimalStringSchema.optional(),
  dimensionUnit: DimensionUnitSchema.optional(),
  weightUnit: WeightUnitSchema.optional(),
  imageUrl: z.string().url().optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const ProductSetupSchema = z.object({
  product: z.object({
    sku: z.string().min(1).max(100).trim(),
    name: z.string().min(1).max(255),
    slug: SlugSchema,
    description: z.string().max(1000).optional(),
    tags: z.array(z.string().max(50)).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
    categorySlug: SlugSchema.optional(),
    brandSlug: SlugSchema.optional(),
  }),

  variants: z.array(ProductVariantInputSchema).min(1),
});

export type ProductSetupInput = z.infer<typeof ProductSetupSchema>;

// ── Warehouse Setup ─────────────────────────────────────────

const BinLocationInputSchema = z.object({
  code: z.string().min(1).max(30).trim(),
  description: z.string().max(255).optional(),
});

const WarehouseZoneInputSchema = z.object({
  name: z.string().min(1).max(100),
  code: z.string().min(1).max(20).trim(),
  description: z.string().max(500).optional(),
  bins: z.array(BinLocationInputSchema).optional(),
});

export const WarehouseSetupSchema = z.object({
  warehouse: AddressSchema.merge(ContactSchema).extend({
    name: z.string().min(1).max(100),
    code: z.string().min(1).max(20).trim(),
    description: z.string().max(500).optional(),
  }),

  zones: z.array(WarehouseZoneInputSchema).optional(),
});

export type WarehouseSetupInput = z.infer<typeof WarehouseSetupSchema>;

// ── Setup Status ─────────────────────────────────────────────

export const SetupStatusSchema = z.object({
  isOnboarded: z.boolean(),
  hasBaseUom: z.boolean(),
  hasWarehouse: z.boolean(),
  hasAdditionalUoms: z.boolean(),
  hasCategories: z.boolean(),
  hasBrands: z.boolean(),
});

export type SetupStatus = z.infer<typeof SetupStatusSchema>;
