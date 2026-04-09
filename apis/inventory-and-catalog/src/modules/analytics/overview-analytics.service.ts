import {
  getDailySalesReport as _getDailySalesReport,
  getDeadStockReport as _getDeadStockReport,
  getGmv as _getGmv,
  getPreSeasonInventoryHealth as _getPreSeasonInventoryHealth,
  getSeasonalDemandReport as _getSeasonalDemandReport,
  getSupplierFillRate as _getSupplierFillRate,
} from "../../models/analytics/overview";
import type { Season } from "../../utils/prisma";
import type { DateRange } from "./analytics.types";

export const getDailySalesReport = (tenantSlug: string, date: Date) =>
  _getDailySalesReport(tenantSlug, date);

export const getGmv = (tenantSlug: string, dateRange?: DateRange) =>
  _getGmv(tenantSlug, dateRange);

export const getDeadStockReport = (tenantSlug: string, threshold?: number) =>
  _getDeadStockReport(tenantSlug, threshold);

export const getSeasonalDemandReport = (
  tenantSlug: string,
  season: Season,
  limit: number,
  year?: number,
) => _getSeasonalDemandReport(tenantSlug, season, limit, year);

export const getPreSeasonInventoryHealth = (
  tenantSlug: string,
  season: Season,
) => _getPreSeasonInventoryHealth(tenantSlug, season);

export const getSupplierFillRate = (
  tenantSlug: string,
  supplierId: string,
  dateRange?: DateRange,
) => _getSupplierFillRate(tenantSlug, supplierId, dateRange);
