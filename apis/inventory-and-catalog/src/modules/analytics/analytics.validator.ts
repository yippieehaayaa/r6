import { z } from "zod";

const dateTimeString = z.string().datetime();

const dateRangeQuerySchema = z.object({
  from: dateTimeString.optional(),
  to: dateTimeString.optional(),
});

const limitQuery = z.string().regex(/^\d+$/).optional();

const yearQuery = z
  .string()
  .regex(/^\d{4}$/)
  .optional();

const booleanStringQuery = z.enum(["true", "false"]).optional();

export const overviewGmvQuerySchema = dateRangeQuerySchema;

export const overviewDeadStockQuerySchema = z.object({
  threshold: z
    .string()
    .regex(/^\d+(\.\d+)?$/)
    .optional(),
});

export const overviewSeasonalDemandQuerySchema = z.object({
  limit: limitQuery,
  year: yearQuery,
});

export const overviewSupplierFillRateQuerySchema = dateRangeQuerySchema;

export const overviewDailySalesQuerySchema = z.object({
  date: dateTimeString.optional(),
});

export const brandTopSellingQuerySchema = dateRangeQuerySchema.extend({
  limit: limitQuery,
  seasonId: z.string().optional(),
});

export const brandSalesByMonthQuerySchema = z.object({
  year: yearQuery,
});

export const brandSeasonalSalesQuerySchema = z.object({
  year: yearQuery,
  isActive: booleanStringQuery,
});

export const productTopSellingQuerySchema = dateRangeQuerySchema.extend({
  limit: limitQuery,
  warehouseId: z.string().optional(),
});

export const productSeasonalSalesQuerySchema = brandSeasonalSalesQuerySchema;

export const warehouseCompareSeasonalDemandQuerySchema = z.object({
  seasonId: z.string(),
});

export const warehouseTopProductsQuerySchema = z.object({
  limit: limitQuery,
  seasonId: z.string().optional(),
});

export const warehouseThroughputQuerySchema = dateRangeQuerySchema;

export const warehouseLowStockByBrandQuerySchema = z.object({
  brandId: z.string(),
});

export const warehouseSalesByBrandQuerySchema = dateRangeQuerySchema;

export const warehouseSalesBySeasonQuerySchema = brandSeasonalSalesQuerySchema;
