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

export const getDailySalesReport = (date: Date) => _getDailySalesReport(date);

export const getGmv = (dateRange?: DateRange) => _getGmv(dateRange);

export const getDeadStockReport = (threshold?: number) =>
  _getDeadStockReport(threshold);

export const getSeasonalDemandReport = (
  season: Season,
  limit: number,
  year?: number,
) => _getSeasonalDemandReport(season, limit, year);

export const getPreSeasonInventoryHealth = (season: Season) =>
  _getPreSeasonInventoryHealth(season);

export const getSupplierFillRate = (
  supplierId: string,
  dateRange?: DateRange,
) => _getSupplierFillRate(supplierId, dateRange);
