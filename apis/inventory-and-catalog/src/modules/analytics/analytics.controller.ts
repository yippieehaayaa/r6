import { type Request, type Response, Router } from "express";
import * as seasonsService from "../seasons/seasons.service";
import type { DateRange } from "./analytics.types";
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

router.get("/overview/gmv", async (req: Request, res: Response) => {
  const result = await overviewAnalytics.getGmv(parseDateRange(req));
  res.json(result);
});

router.get("/overview/dead-stock", async (req: Request, res: Response) => {
  const threshold = req.query.threshold
    ? Number(req.query.threshold)
    : undefined;
  const result = await overviewAnalytics.getDeadStockReport(threshold);
  res.json(result);
});

router.get(
  "/overview/seasonal-demand/:seasonId",
  async (req: Request, res: Response) => {
    const season = await seasonsService.getSeasonById(
      req.params.seasonId as string,
    );
    const limit = Number(req.query.limit ?? 10);
    const year = req.query.year ? Number(req.query.year) : undefined;
    const result = await overviewAnalytics.getSeasonalDemandReport(
      season,
      limit,
      year,
    );
    res.json(result);
  },
);

router.get(
  "/overview/pre-season-health/:seasonId",
  async (req: Request, res: Response) => {
    const season = await seasonsService.getSeasonById(
      req.params.seasonId as string,
    );
    const result = await overviewAnalytics.getPreSeasonInventoryHealth(season);
    res.json(result);
  },
);

router.get(
  "/overview/supplier-fill-rate/:supplierId",
  async (req: Request, res: Response) => {
    const result = await overviewAnalytics.getSupplierFillRate(
      req.params.supplierId as string,
      parseDateRange(req),
    );
    res.json(result);
  },
);

// ─── Brand Analytics ─────────────────────────────────────────────────────────

router.get("/brands/top-selling", async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 10);
  const seasonId = req.query.seasonId as string | undefined;
  const season = seasonId
    ? await seasonsService.getSeasonById(seasonId)
    : undefined;
  const result = await brandAnalytics.getTopSellingBrands(
    limit,
    parseDateRange(req),
    season,
  );
  res.json(result);
});

router.get("/brands/:id/revenue", async (req: Request, res: Response) => {
  const result = await brandAnalytics.getBrandRevenue(
    req.params.id as string,
    parseDateRange(req),
  );
  res.json(result);
});

router.get(
  "/brands/:id/sales-by-month",
  async (req: Request, res: Response) => {
    const year = Number(req.query.year ?? new Date().getFullYear());
    const result = await brandAnalytics.getBrandSalesByMonth(
      req.params.id as string,
      year,
    );
    res.json(result);
  },
);

router.get(
  "/brands/:id/seasonal-sales",
  async (req: Request, res: Response) => {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;
    const seasonsList = await seasonsService.listSeasons({
      page: 1,
      limit: 100,
      year,
      isActive,
    });
    const result = await brandAnalytics.getBrandSeasonalSales(
      req.params.id as string,
      seasonsList.data,
    );
    res.json(result);
  },
);

router.get("/brands/:id/stock-health", async (req: Request, res: Response) => {
  const result = await brandAnalytics.getBrandStockHealth(
    req.params.id as string,
  );
  res.json(result);
});

router.get("/brands/:id/top-products", async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 10);
  const result = await brandAnalytics.getBrandTopProducts(
    req.params.id as string,
    limit,
    parseDateRange(req),
  );
  res.json(result);
});

router.get(
  "/brands/:id/warehouse-distribution",
  async (req: Request, res: Response) => {
    const result = await brandAnalytics.getBrandWarehouseDistribution(
      req.params.id as string,
    );
    res.json(result);
  },
);

// ─── Product Analytics ───────────────────────────────────────────────────────

router.get("/products/top-selling", async (req: Request, res: Response) => {
  const limit = Number(req.query.limit ?? 10);
  const warehouseId = req.query.warehouseId as string | undefined;
  const result = await productAnalytics.getTopSellingProducts(
    limit,
    parseDateRange(req),
    warehouseId,
  );
  res.json(result);
});

router.get("/products/:id/turnover", async (req: Request, res: Response) => {
  const dateRange = parseDateRange(req);
  if (!dateRange) {
    res.status(400).json({ message: "from and to query params are required" });
    return;
  }
  const result = await productAnalytics.getProductStockTurnover(
    req.params.id as string,
    dateRange,
  );
  res.json(result);
});

router.get("/products/:id/return-rate", async (req: Request, res: Response) => {
  const result = await productAnalytics.getProductReturnRate(
    req.params.id as string,
    parseDateRange(req),
  );
  res.json(result);
});

router.get(
  "/products/:id/seasonal-sales",
  async (req: Request, res: Response) => {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;
    const seasonsList = await seasonsService.listSeasons({
      page: 1,
      limit: 100,
      year,
      isActive,
    });
    const result = await productAnalytics.getProductSeasonalSales(
      req.params.id as string,
      seasonsList.data,
    );
    res.json(result);
  },
);

router.get(
  "/products/:id/variant-split",
  async (req: Request, res: Response) => {
    const result = await productAnalytics.getProductVariantSalesSplit(
      req.params.id as string,
    );
    res.json(result);
  },
);

router.get(
  "/products/:id/sales-by-warehouse",
  async (req: Request, res: Response) => {
    const result = await productAnalytics.getProductSalesByWarehouse(
      req.params.id as string,
    );
    res.json(result);
  },
);

// ─── Warehouse Analytics ─────────────────────────────────────────────────────

router.get(
  "/warehouses/compare-seasonal-demand",
  async (req: Request, res: Response) => {
    const seasonId = req.query.seasonId as string;
    const season = await seasonsService.getSeasonById(seasonId);
    const result =
      await warehouseAnalytics.compareWarehousesBySeasonalDemand(season);
    res.json(result);
  },
);

router.get(
  "/warehouses/:id/top-products",
  async (req: Request, res: Response) => {
    const limit = Number(req.query.limit ?? 10);
    const seasonId = req.query.seasonId as string | undefined;
    const season = seasonId
      ? await seasonsService.getSeasonById(seasonId)
      : undefined;
    const result = await warehouseAnalytics.getWarehouseTopProducts(
      req.params.id as string,
      limit,
      season,
    );
    res.json(result);
  },
);

router.get(
  "/warehouses/:id/inventory-value",
  async (req: Request, res: Response) => {
    const result = await warehouseAnalytics.getWarehouseInventoryValue(
      req.params.id as string,
    );
    res.json(result);
  },
);

router.get(
  "/warehouses/:id/throughput",
  async (req: Request, res: Response) => {
    const result = await warehouseAnalytics.getWarehouseThroughput(
      req.params.id as string,
      parseDateRange(req),
    );
    res.json(result);
  },
);

router.get(
  "/warehouses/:id/utilization",
  async (req: Request, res: Response) => {
    const result = await warehouseAnalytics.getWarehouseStockUtilization(
      req.params.id as string,
    );
    res.json(result);
  },
);

router.get(
  "/warehouses/:id/low-stock-by-brand",
  async (req: Request, res: Response) => {
    const brandId = req.query.brandId as string;
    const result = await warehouseAnalytics.getWarehouseLowStockByBrand(
      req.params.id as string,
      brandId,
    );
    res.json(result);
  },
);

router.get(
  "/warehouses/:id/sales-by-brand",
  async (req: Request, res: Response) => {
    const result = await warehouseAnalytics.getWarehouseSalesByBrand(
      req.params.id as string,
      parseDateRange(req),
    );
    res.json(result);
  },
);

router.get(
  "/warehouses/:id/sales-by-season",
  async (req: Request, res: Response) => {
    const year = req.query.year ? Number(req.query.year) : undefined;
    const isActive =
      req.query.isActive !== undefined
        ? req.query.isActive === "true"
        : undefined;
    const seasonsList = await seasonsService.listSeasons({
      page: 1,
      limit: 100,
      year,
      isActive,
    });
    const result = await warehouseAnalytics.getWarehouseSalesBySeason(
      req.params.id as string,
      seasonsList.data,
    );
    res.json(result);
  },
);

export default router;
