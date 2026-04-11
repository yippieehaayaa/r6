import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { checkAvailabilityBatchHandler } from "./controller/batch";
import { checkAvailabilityHandler } from "./controller/check";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  requirePermission(INVENTORY_PERMISSIONS.STOCK_READ),
  checkAvailabilityHandler,
);

router.post(
  "/batch",
  requirePermission(INVENTORY_PERMISSIONS.STOCK_READ),
  checkAvailabilityBatchHandler,
);

export default router;
