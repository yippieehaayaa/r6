import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { manualAdjustmentHandler } from "./controller/adjust";
import { writeOffHandler } from "./controller/write-off";

const router: Router = Router({ mergeParams: true });

router.post(
  "/adjust",
  requirePermission(INVENTORY_PERMISSIONS.STOCK_UPDATE),
  manualAdjustmentHandler,
);

router.post(
  "/write-off",
  requirePermission(INVENTORY_PERMISSIONS.STOCK_UPDATE),
  writeOffHandler,
);

export default router;
