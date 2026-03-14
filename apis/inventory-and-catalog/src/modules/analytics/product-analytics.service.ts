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
  productId: string,
  dateRange?: DateRange,
) => _getProductReturnRate(productId, dateRange);

export const getProductRevenueByBrand = (
  brandId: string,
  dateRange?: DateRange,
) => _getProductRevenueByBrand(brandId, dateRange);

export const getProductSalesByWarehouse = (productId: string) =>
  _getProductSalesByWarehouse(productId);

export const getProductSeasonalForecast = (
  productId: string,
  upcomingSeason: Season,
  yearsBack?: number,
) => _getProductSeasonalForecast(productId, upcomingSeason, yearsBack);

export const getProductSeasonalSales = (productId: string, seasons: Season[]) =>
  _getProductSeasonalSales(productId, seasons);

export const getProductStockTurnover = (productId: string, period: DateRange) =>
  _getProductStockTurnover(productId, period);

export const getProductVariantSalesSplit = (productId: string) =>
  _getProductVariantSalesSplit(productId);

export const getTopSellingProducts = (
  limit: number,
  dateRange?: DateRange,
  warehouseId?: string,
) => _getTopSellingProducts(limit, dateRange, warehouseId);

export const getTotalSoldByProduct = (
  productId: string,
  dateRange?: DateRange,
) => _getTotalSoldByProduct(productId, dateRange);
