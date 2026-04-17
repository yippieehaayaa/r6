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

router.use("/:tenantId/catalog", requireTenantScope(), catalog);
router.use("/:tenantId/setup", requireTenantScope(), setup);
router.use("/:tenantId/stock-in", requireTenantScope(), stockIn);
router.use("/:tenantId/stock-out", requireTenantScope(), stockOut);
router.use("/:tenantId/corrections", requireTenantScope(), corrections);
router.use("/:tenantId/transfers", requireTenantScope(), transfers);
router.use("/:tenantId/returns", requireTenantScope(), returns);
router.use("/:tenantId/stock-counts", requireTenantScope(), stockCounts);
router.use("/:tenantId/stock-alerts", requireTenantScope(), stockAlerts);
router.use("/:tenantId/availability", requireTenantScope(), availability);
router.use("/:tenantId/warehouses", requireTenantScope(), warehouses);
router.use("/:tenantId/inventory-items", requireTenantScope(), inventoryItems);
router.use("/:tenantId/movements", requireTenantScope(), movements);
router.use("/:tenantId/lots", requireTenantScope(), lots);
router.use("/:tenantId/reservations", requireTenantScope(), reservations);

export default router;
