import { Router } from "express";
import { authMiddleware } from "../../middleware/auth";
import { requireTenantScope } from "../../middleware/guard";
import availability from "../availability";
import catalog from "../catalog";
import corrections from "../corrections";
import inventoryItems from "../inventory-items";
import lots from "../lots";
import movements from "../movements";
import reservations from "../reservations";
import returns from "../returns";
import setup from "../setup";
import stockAlerts from "../stock-alerts";
import stockCounts from "../stock-counts";
import stockIn from "../stock-in";
import stockOut from "../stock-out";
import transfers from "../transfers";
import warehouses from "../warehouses";

const router: Router = Router();

router.use(authMiddleware());

router.use("/:tenantSlug/catalog", requireTenantScope(), catalog);
router.use("/:tenantSlug/setup", requireTenantScope(), setup);
router.use("/:tenantSlug/stock-in", requireTenantScope(), stockIn);
router.use("/:tenantSlug/stock-out", requireTenantScope(), stockOut);
router.use("/:tenantSlug/corrections", requireTenantScope(), corrections);
router.use("/:tenantSlug/transfers", requireTenantScope(), transfers);
router.use("/:tenantSlug/returns", requireTenantScope(), returns);
router.use("/:tenantSlug/stock-counts", requireTenantScope(), stockCounts);
router.use("/:tenantSlug/stock-alerts", requireTenantScope(), stockAlerts);
router.use("/:tenantSlug/availability", requireTenantScope(), availability);
router.use("/:tenantSlug/warehouses", requireTenantScope(), warehouses);
router.use(
  "/:tenantSlug/inventory-items",
  requireTenantScope(),
  inventoryItems,
);
router.use("/:tenantSlug/movements", requireTenantScope(), movements);
router.use("/:tenantSlug/lots", requireTenantScope(), lots);
router.use("/:tenantSlug/reservations", requireTenantScope(), reservations);

export default router;
