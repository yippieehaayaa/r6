import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { prepareStockCountHandler } from "./controller/prepare";
import {
  getStockCountHandler,
  listStockCountsHandler,
} from "./controller/read";
import { reconcileStockCountHandler } from "./controller/reconcile";
import { recordCountHandler } from "./controller/record";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  requirePermission(INVENTORY_PERMISSIONS.COUNT_READ),
  listStockCountsHandler,
);

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

router.get(
  "/:id",
  requirePermission(INVENTORY_PERMISSIONS.COUNT_READ),
  getStockCountHandler,
);

export default router;
