import { type Request, type Response, Router } from "express";
import { validateQuery } from "../../shared/middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import * as seasonsService from "../seasons/seasons.service";
import type { DateRange } from "./analytics.types";
import {
  brandSalesByMonthQuerySchema,
  brandSeasonalSalesQuerySchema,
  brandTopSellingQuerySchema,
  overviewDailySalesQuerySchema,
  overviewDeadStockQuerySchema,
  overviewGmvQuerySchema,
  overviewSeasonalDemandQuerySchema,
  overviewSupplierFillRateQuerySchema,
  productSeasonalSalesQuerySchema,
  productTopSellingQuerySchema,
  warehouseCompareSeasonalDemandQuerySchema,
  warehouseLowStockByBrandQuerySchema,
  warehouseSalesByBrandQuerySchema,
  warehouseSalesBySeasonQuerySchema,
  warehouseThroughputQuerySchema,
  warehouseTopProductsQuerySchema,
} from "./analytics.validator";
import * as brandAnalytics from "./brand-analytics.service";
import * as overviewAnalytics from "./overview-analytics.service";
import * as productAnalytics from "./product-analytics.service";
import * as warehouseAnalytics from "./warehouse-analytics.service";

const router = Router();

function parseDateRange(req: Request): DateRange | undefined {
  const from = req.query.from as string | undefined;
  const to = req.query.to as string | undefined;
  if (!from || !to) return undefined;
  return { from: new Date(from), to: new Date(to) };
}

// ─── Overview ────────────────────────────────────────────────────────────────

router.get(
  "/overview/gmv",
  validateQuery(overviewGmvQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await overviewAnalytics.getGmv(
      tenantSlug,
      parseDateRange(req),
    );
    res.json(result);
  }),
);

router.get(
  "/overview/dead-stock",
  validateQuery(overviewDeadStockQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const threshold = req.query.threshold
      ? Number(req.query.threshold)
      : undefined;
    const result = await overviewAnalytics.getDeadStockReport(
      tenantSlug,
      threshold,
    );
    res.json(result);
  }),
);

router.get(
  "/overview/seasonal-demand/:seasonId",
  validateQuery(overviewSeasonalDemandQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const season = await seasonsService.getSeasonById(
      tenantSlug,
      req.params.seasonId as string,
    );
    const limit = Number(req.query.limit ?? 10);
    const year = req.query.year ? Number(req.query.year) : undefined;
    const result = await overviewAnalytics.getSeasonalDemandReport(
      tenantSlug,
      season,
      limit,
      year,
    );
    res.json(result);
  }),
);

router.get(
  "/overview/pre-season-health/:seasonId",
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const season = await seasonsService.getSeasonById(
      tenantSlug,
      req.params.seasonId as string,
    );
    const result = await overviewAnalytics.getPreSeasonInventoryHealth(
      tenantSlug,
      season,
    );
    res.json(result);
  }),
);

router.get(
  "/overview/supplier-fill-rate/:supplierId",
  validateQuery(overviewSupplierFillRateQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await overviewAnalytics.getSupplierFillRate(
      tenantSlug,
      req.params.supplierId as string,
      parseDateRange(req),
    );
    res.json(result);
  }),
);

router.get(
  "/overview/daily-sales",
  validateQuery(overviewDailySalesQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const dateParam = req.query.date as string | undefined;
    const date = dateParam ? new Date(dateParam) : new Date();
    const result = await overviewAnalytics.getDailySalesReport(
      tenantSlug,
      date,
    );
    res.json(result);
  }),
);

// ─── Brand Analytics ─────────────────────────────────────────────────────────

router.get(
  "/brands/top-selling",
  validateQuery(brandTopSellingQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const limit = Number(req.query.limit ?? 10);
    const seasonId = req.query.seasonId as string | undefined;
    const season = seasonId
      ? await seasonsService.getSeasonById(tenantSlug, seasonId)
      : undefined;
    const result = await brandAnalytics.getTopSellingBrands(
      tenantSlug,
      limit,
      parseDateRange(req),
      season,
    );
    res.json(result);
  }),
);

router.get(
  "/brands/:id/revenue",
  validateQuery(overviewGmvQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await brandAnalytics.getBrandRevenue(
      tenantSlug,
      req.params.id as string,
      parseDateRange(req),
    );
    res.json(result);
  }),
);

router.get(
  "/brands/:id/sales-by-month",
  validateQuery(brandSalesByMonthQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const year = Number(req.query.year ?? new Date().getFullYear());
    const result = await brandAnalytics.getBrandSalesByMonth(
      tenantSlug,
      req.params.id as string,
      year,
    );
    res.json(result);
  }),
);

router.get(
  "/brands/:id/seasonal-sales",
  validateQuery(brandSeasonalSalesQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;
    const seasonsList = await seasonsService.listSeasons(tenantSlug, {
      page: 1,
      limit: 100,
      year,
      isActive,
    });
    const result = await brandAnalytics.getBrandSeasonalSales(
      tenantSlug,
      req.params.id as string,
      seasonsList.data,
    );
    res.json(result);
  }),
);

router.get(
  "/brands/:id/stock-health",
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await brandAnalytics.getBrandStockHealth(
      tenantSlug,
      req.params.id as string,
    );
    res.json(result);
  }),
);

router.get(
  "/brands/:id/top-products",
  validateQuery(overviewSeasonalDemandQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const limit = Number(req.query.limit ?? 10);
    const result = await brandAnalytics.getBrandTopProducts(
      tenantSlug,
      req.params.id as string,
      limit,
      parseDateRange(req),
    );
    res.json(result);
  }),
);

router.get(
  "/brands/:id/warehouse-distribution",
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await brandAnalytics.getBrandWarehouseDistribution(
      tenantSlug,
      req.params.id as string,
    );
    res.json(result);
  }),
);

// ─── Product Analytics ───────────────────────────────────────────────────────

router.get(
  "/products/top-selling",
  validateQuery(productTopSellingQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const limit = Number(req.query.limit ?? 10);
    const warehouseId = req.query.warehouseId as string | undefined;
    const result = await productAnalytics.getTopSellingProducts(
      tenantSlug,
      limit,
      parseDateRange(req),
      warehouseId,
    );
    res.json(result);
  }),
);

router.get(
  "/products/:id/turnover",
  validateQuery(overviewGmvQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const dateRange = parseDateRange(req);
    if (!dateRange) {
      res
        .status(400)
        .json({ error: { message: "from and to query params are required" } });
      return;
    }
    const result = await productAnalytics.getProductStockTurnover(
      tenantSlug,
      req.params.id as string,
      dateRange,
    );
    res.json(result);
  }),
);

router.get(
  "/products/:id/return-rate",
  validateQuery(overviewGmvQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await productAnalytics.getProductReturnRate(
      tenantSlug,
      req.params.id as string,
      parseDateRange(req),
    );
    res.json(result);
  }),
);

router.get(
  "/products/:id/seasonal-sales",
  validateQuery(productSeasonalSalesQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;
    const seasonsList = await seasonsService.listSeasons(tenantSlug, {
      page: 1,
      limit: 100,
      year,
      isActive,
    });
    const result = await productAnalytics.getProductSeasonalSales(
      tenantSlug,
      req.params.id as string,
      seasonsList.data,
    );
    res.json(result);
  }),
);

router.get(
  "/products/:id/variant-split",
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await productAnalytics.getProductVariantSalesSplit(
      tenantSlug,
      req.params.id as string,
    );
    res.json(result);
  }),
);

router.get(
  "/products/:id/sales-by-warehouse",
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await productAnalytics.getProductSalesByWarehouse(
      tenantSlug,
      req.params.id as string,
    );
    res.json(result);
  }),
);

// ─── Warehouse Analytics ─────────────────────────────────────────────────────

router.get(
  "/warehouses/compare-seasonal-demand",
  validateQuery(warehouseCompareSeasonalDemandQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const seasonId = req.query.seasonId as string;
    const season = await seasonsService.getSeasonById(tenantSlug, seasonId);
    const result = await warehouseAnalytics.compareWarehousesBySeasonalDemand(
      tenantSlug,
      season,
    );
    res.json(result);
  }),
);

router.get(
  "/warehouses/:id/top-products",
  validateQuery(warehouseTopProductsQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const limit = Number(req.query.limit ?? 10);
    const seasonId = req.query.seasonId as string | undefined;
    const season = seasonId
      ? await seasonsService.getSeasonById(tenantSlug, seasonId)
      : undefined;
    const result = await warehouseAnalytics.getWarehouseTopProducts(
      tenantSlug,
      req.params.id as string,
      limit,
      season,
    );
    res.json(result);
  }),
);

router.get(
  "/warehouses/:id/inventory-value",
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await warehouseAnalytics.getWarehouseInventoryValue(
      tenantSlug,
      req.params.id as string,
    );
    res.json(result);
  }),
);

router.get(
  "/warehouses/:id/throughput",
  validateQuery(warehouseThroughputQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await warehouseAnalytics.getWarehouseThroughput(
      tenantSlug,
      req.params.id as string,
      parseDateRange(req),
    );
    res.json(result);
  }),
);

router.get(
  "/warehouses/:id/utilization",
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await warehouseAnalytics.getWarehouseStockUtilization(
      tenantSlug,
      req.params.id as string,
    );
    res.json(result);
  }),
);

router.get(
  "/warehouses/:id/low-stock-by-brand",
  validateQuery(warehouseLowStockByBrandQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const brandId = req.query.brandId as string;
    const result = await warehouseAnalytics.getWarehouseLowStockByBrand(
      tenantSlug,
      req.params.id as string,
      brandId,
    );
    res.json(result);
  }),
);

router.get(
  "/warehouses/:id/sales-by-brand",
  validateQuery(warehouseSalesByBrandQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const result = await warehouseAnalytics.getWarehouseSalesByBrand(
      tenantSlug,
      req.params.id as string,
      parseDateRange(req),
    );
    res.json(result);
  }),
);

router.get(
  "/warehouses/:id/sales-by-season",
  validateQuery(warehouseSalesBySeasonQuerySchema),
  asyncHandler(async (req: Request, res: Response) => {
    const tenantSlug = req.jwtPayload!.tenantSlug as string;
    const year = req.query.year ? Number(req.query.year) : undefined;
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;
    const seasonsList = await seasonsService.listSeasons(tenantSlug, {
      page: 1,
      limit: 100,
      year,
      isActive,
    });
    const result = await warehouseAnalytics.getWarehouseSalesBySeason(
      tenantSlug,
      req.params.id as string,
      seasonsList.data,
    );
    res.json(result);
  }),
);

export default router;
