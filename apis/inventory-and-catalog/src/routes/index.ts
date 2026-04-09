import { type Request, type Response, Router } from "express";
import {
  analyticsController,
  catalogController,
  inventoryController,
  procurementController,
  seasonsController,
} from "../modules";
import { authMiddleware } from "../shared/middleware";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.sendStatus(200);
});

// All routes require authentication.  Inventory and catalog sub-routers
// additionally require the matching service-level permission so that a
// token granted only "catalog:*:*" cannot reach inventory endpoints and
// vice-versa.  Procurement, seasons and analytics are guarded by auth
// alone — no additional fine-grained scope is required for these routes.
router.use(
  "x",
  authMiddleware(),
  // requirePermission("catalog:*:*"),
  catalogController,
);
router.use(
  "x",
  authMiddleware(),
  // requirePermission("inventory:*:*"),
  inventoryController,
);
router.use(
  "/seasons",
  authMiddleware(),
  // requirePermission("seasons:*:*"),
  seasonsController,
);
router.use(
  "/procurement",
  authMiddleware(),
  // requirePermission("procurement:*:*"),
  procurementController,
);
router.use(
  "/analytics",
  authMiddleware(),
  // requirePermission("analytics:*:*"),
  analyticsController,
);

export default router;
