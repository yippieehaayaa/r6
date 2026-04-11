import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { prepareStockCountHandler } from "./controller/prepare";
import { recordCountHandler } from "./controller/record";
import { reconcileStockCountHandler } from "./controller/reconcile";

const router: Router = Router({ mergeParams: true });

router.post(
  "/prepare",
  requirePermission(INVENTORY_PERMISSIONS.COUNT_CREATE),
  prepareStockCountHandler,
);

router.post(
  "/:stockCountId/record",
  requirePermission(INVENTORY_PERMISSIONS.COUNT_UPDATE),
  recordCountHandler,
);

router.post(
  "/:stockCountId/reconcile",
  requirePermission(INVENTORY_PERMISSIONS.COUNT_UPDATE),
  reconcileStockCountHandler,
);

export default router;
