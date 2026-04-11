import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { catalogSetupHandler } from "./controller/catalog";
import { categoryBrandSetupHandler } from "./controller/categories-brands";
import { onboardTenantHandler } from "./controller/onboard";
import { productSetupHandler } from "./controller/product";
import { setupStatusHandler } from "./controller/status";
import { warehouseSetupHandler } from "./controller/warehouse";

const router: Router = Router({ mergeParams: true });

router.post(
	"/onboard",
	requirePermission(INVENTORY_PERMISSIONS.SETUP_CREATE),
	onboardTenantHandler,
);

router.get(
	"/status",
	requirePermission(INVENTORY_PERMISSIONS.SETUP_READ),
	setupStatusHandler,
);

router.post(
	"/catalog",
	requirePermission(INVENTORY_PERMISSIONS.SETUP_CREATE),
	catalogSetupHandler,
);

router.post(
	"/categories-brands",
	requirePermission(INVENTORY_PERMISSIONS.SETUP_CREATE),
	categoryBrandSetupHandler,
);

router.post(
	"/products",
	requirePermission(INVENTORY_PERMISSIONS.CATALOG_CREATE),
	productSetupHandler,
);

router.post(
	"/warehouses",
	requirePermission(INVENTORY_PERMISSIONS.WAREHOUSE_CREATE),
	warehouseSetupHandler,
);

export default router;
