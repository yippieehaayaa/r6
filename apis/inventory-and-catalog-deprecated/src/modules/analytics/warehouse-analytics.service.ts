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
  tenantSlug: string,
  warehouseId: string,
  limit: number,
  season?: Season,
) => _getWarehouseTopProducts(tenantSlug, warehouseId, limit, season);

export const getWarehouseInventoryValue = (
  tenantSlug: string,
  warehouseId: string,
) => _getWarehouseInventoryValue(tenantSlug, warehouseId);

export const getWarehouseLowStockByBrand = (
  tenantSlug: string,
  warehouseId: string,
  brandId: string,
) => _getWarehouseLowStockByBrand(tenantSlug, warehouseId, brandId);

export const getWarehouseSalesByBrand = (
  tenantSlug: string,
  warehouseId: string,
  dateRange?: DateRange,
) => _getWarehouseSalesByBrand(tenantSlug, warehouseId, dateRange);

export const getWarehouseSalesBySeason = (
  tenantSlug: string,
  warehouseId: string,
  seasons: Season[],
) => _getWarehouseSalesBySeason(tenantSlug, warehouseId, seasons);

export const getWarehouseStockUtilization = (
  tenantSlug: string,
  warehouseId: string,
) => _getWarehouseStockUtilization(tenantSlug, warehouseId);

export const getWarehouseThroughput = (
  tenantSlug: string,
  warehouseId: string,
  dateRange?: DateRange,
) => _getWarehouseThroughput(tenantSlug, warehouseId, dateRange);

export const compareWarehousesBySeasonalDemand = (
  tenantSlug: string,
  season: Season,
) => _compareWarehousesBySeasonalDemand(tenantSlug, season);
