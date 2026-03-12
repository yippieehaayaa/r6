import {
  compareWarehousesBySeasonalDemand as _compareWarehousesBySeasonalDemand,
  getWarehouseInventoryValue as _getWarehouseInventoryValue,
  getWarehouseLowStockByBrand as _getWarehouseLowStockByBrand,
  getWarehouseSalesByBrand as _getWarehouseSalesByBrand,
  getWarehouseSalesBySeason as _getWarehouseSalesBySeason,
  getWarehouseStockUtilization as _getWarehouseStockUtilization,
  getWarehouseThroughput as _getWarehouseThroughput,
  getWarehouseTopProducts as _getWarehouseTopProducts,
} from "../../models/analytics/warehouse";
import type { Season } from "../../utils/prisma";
import type { DateRange } from "./analytics.types";

export const getWarehouseTopProducts = (
  warehouseId: string,
  limit: number,
  season?: Season,
) => _getWarehouseTopProducts(warehouseId, limit, season);

export const getWarehouseInventoryValue = (warehouseId: string) =>
  _getWarehouseInventoryValue(warehouseId);

export const getWarehouseLowStockByBrand = (
  warehouseId: string,
  brandId: string,
) => _getWarehouseLowStockByBrand(warehouseId, brandId);

export const getWarehouseSalesByBrand = (
  warehouseId: string,
  dateRange?: DateRange,
) => _getWarehouseSalesByBrand(warehouseId, dateRange);

export const getWarehouseSalesBySeason = (
  warehouseId: string,
  seasons: Season[],
) => _getWarehouseSalesBySeason(warehouseId, seasons);

export const getWarehouseStockUtilization = (warehouseId: string) =>
  _getWarehouseStockUtilization(warehouseId);

export const getWarehouseThroughput = (
  warehouseId: string,
  dateRange?: DateRange,
) => _getWarehouseThroughput(warehouseId, dateRange);

export const compareWarehousesBySeasonalDemand = (season: Season) =>
  _compareWarehousesBySeasonalDemand(season);
