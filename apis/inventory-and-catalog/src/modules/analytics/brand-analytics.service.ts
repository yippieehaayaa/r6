import {
  getBrandRevenue as _getBrandRevenue,
  getBrandSalesByMonth as _getBrandSalesByMonth,
  getBrandSeasonalSales as _getBrandSeasonalSales,
  getBrandStockHealth as _getBrandStockHealth,
  getBrandTopProducts as _getBrandTopProducts,
  getBrandTopWarehouseForSales as _getBrandTopWarehouseForSales,
  getBrandWarehouseDistribution as _getBrandWarehouseDistribution,
  getTopSellingBrands as _getTopSellingBrands,
  getTotalSoldByBrand as _getTotalSoldByBrand,
} from "../../models/analytics/brand";
import type { Season } from "../../utils/prisma";
import type { DateRange } from "./analytics.types";

export const getBrandRevenue = (
  tenantSlug: string,
  brandId: string,
  dateRange?: DateRange,
) => _getBrandRevenue(tenantSlug, brandId, dateRange);

export const getBrandSalesByMonth = (
  tenantSlug: string,
  brandId: string,
  year: number,
) => _getBrandSalesByMonth(tenantSlug, brandId, year);

export const getBrandSeasonalSales = (
  tenantSlug: string,
  brandId: string,
  seasons: Season[],
) => _getBrandSeasonalSales(tenantSlug, brandId, seasons);

export const getBrandStockHealth = (tenantSlug: string, brandId: string) =>
  _getBrandStockHealth(tenantSlug, brandId);

export const getBrandTopProducts = (
  tenantSlug: string,
  brandId: string,
  limit: number,
  dateRange?: DateRange,
) => _getBrandTopProducts(tenantSlug, brandId, limit, dateRange);

export const getBrandTopWarehouseForSales = (
  tenantSlug: string,
  brandId: string,
  season?: Season,
) => _getBrandTopWarehouseForSales(tenantSlug, brandId, season);

export const getBrandWarehouseDistribution = (
  tenantSlug: string,
  brandId: string,
) => _getBrandWarehouseDistribution(tenantSlug, brandId);

export const getTopSellingBrands = (
  tenantSlug: string,
  limit: number,
  dateRange?: DateRange,
  season?: Season,
) => _getTopSellingBrands(tenantSlug, limit, dateRange, season);

export const getTotalSoldByBrand = (
  tenantSlug: string,
  brandId: string,
  dateRange?: DateRange,
) => _getTotalSoldByBrand(tenantSlug, brandId, dateRange);
