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

export const getBrandRevenue = (brandId: string, dateRange?: DateRange) =>
  _getBrandRevenue(brandId, dateRange);

export const getBrandSalesByMonth = (brandId: string, year: number) =>
  _getBrandSalesByMonth(brandId, year);

export const getBrandSeasonalSales = (brandId: string, seasons: Season[]) =>
  _getBrandSeasonalSales(brandId, seasons);

export const getBrandStockHealth = (brandId: string) =>
  _getBrandStockHealth(brandId);

export const getBrandTopProducts = (
  brandId: string,
  limit: number,
  dateRange?: DateRange,
) => _getBrandTopProducts(brandId, limit, dateRange);

export const getBrandTopWarehouseForSales = (
  brandId: string,
  season?: Season,
) => _getBrandTopWarehouseForSales(brandId, season);

export const getBrandWarehouseDistribution = (brandId: string) =>
  _getBrandWarehouseDistribution(brandId);

export const getTopSellingBrands = (
  limit: number,
  dateRange?: DateRange,
  season?: Season,
) => _getTopSellingBrands(limit, dateRange, season);

export const getTotalSoldByBrand = (brandId: string, dateRange?: DateRange) =>
  _getTotalSoldByBrand(brandId, dateRange);
