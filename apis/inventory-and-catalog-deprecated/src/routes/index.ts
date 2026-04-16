import { type Request, type Response, Router } from "express";
import {
  analyticsController,
  catalogController,
  inventoryController,
  procurementController,
  seasonsController,
} from "../modules";
import { authMiddleware, requireTenantAccess } from "../shared/middleware";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

// All routes require authentication and a valid tenant scope. The
// requireTenantAccess guard ensures non-ADMIN tokens carry a tenantSlug so
// no identity can reach or mutate another tenant's data. Inventory and catalog
// sub-routers additionally accept a fine-grained service-level permission guard
// (currently commented out pending rollout).

router.use(
  "/catalog",
  authMiddleware(),
  requireTenantAccess(),
  // requirePermission("catalog:*:*"),
  catalogController,
);
router.use(
  "/inventory",
  authMiddleware(),
  requireTenantAccess(),
  // requirePermission("inventory:*:*"),
  inventoryController,
);
router.use(
  "/seasons",
  authMiddleware(),
  requireTenantAccess(),
  // requirePermission("seasons:*:*"),
  seasonsController,
);
router.use(
  "/procurement",
  authMiddleware(),
  requireTenantAccess(),
  // requirePermission("procurement:*:*"),
  procurementController,
);
router.use(
  "/analytics",
  authMiddleware(),
  requireTenantAccess(),
  // requirePermission("analytics:*:*"),
  analyticsController,
);

export default router;
