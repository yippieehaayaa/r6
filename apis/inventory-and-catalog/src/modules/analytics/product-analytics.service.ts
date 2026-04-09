import {
  getProductReturnRate as _getProductReturnRate,
  getProductRevenueByBrand as _getProductRevenueByBrand,
  getProductSalesByWarehouse as _getProductSalesByWarehouse,
  getProductSeasonalForecast as _getProductSeasonalForecast,
  getProductSeasonalSales as _getProductSeasonalSales,
  getProductStockTurnover as _getProductStockTurnover,
  getProductVariantSalesSplit as _getProductVariantSalesSplit,
  getTopSellingProducts as _getTopSellingProducts,
  getTotalSoldByProduct as _getTotalSoldByProduct,
} from "../../models/analytics/product";
import type { Season } from "../../utils/prisma";
import type { DateRange } from "./analytics.types";

export const getProductReturnRate = (
  tenantSlug: string,
  productId: string,
  dateRange?: DateRange,
) => _getProductReturnRate(tenantSlug, productId, dateRange);

export const getProductRevenueByBrand = (
  tenantSlug: string,
  brandId: string,
  dateRange?: DateRange,
) => _getProductRevenueByBrand(tenantSlug, brandId, dateRange);

export const getProductSalesByWarehouse = (
  tenantSlug: string,
  productId: string,
) => _getProductSalesByWarehouse(tenantSlug, productId);

export const getProductSeasonalForecast = (
  tenantSlug: string,
  productId: string,
  upcomingSeason: Season,
  yearsBack?: number,
) =>
  _getProductSeasonalForecast(tenantSlug, productId, upcomingSeason, yearsBack);

export const getProductSeasonalSales = (
  tenantSlug: string,
  productId: string,
  seasons: Season[],
) => _getProductSeasonalSales(tenantSlug, productId, seasons);

export const getProductStockTurnover = (
  tenantSlug: string,
  productId: string,
  period: DateRange,
) => _getProductStockTurnover(tenantSlug, productId, period);

export const getProductVariantSalesSplit = (
  tenantSlug: string,
  productId: string,
) => _getProductVariantSalesSplit(tenantSlug, productId);

export const getTopSellingProducts = (
  tenantSlug: string,
  limit: number,
  dateRange?: DateRange,
  warehouseId?: string,
) => _getTopSellingProducts(tenantSlug, limit, dateRange, warehouseId);

export const getTotalSoldByProduct = (
  tenantSlug: string,
  productId: string,
  dateRange?: DateRange,
) => _getTotalSoldByProduct(tenantSlug, productId, dateRange);
