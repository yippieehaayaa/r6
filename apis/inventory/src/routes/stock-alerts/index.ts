import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requireAdmin, requirePermission } from "../../middleware/guard";
import { acknowledgeAlertHandler } from "./controller/acknowledge";
import { processExpiryHandler } from "./controller/process-expiry";
import {
  getStockAlertHandler,
  listStockAlertsHandler,
} from "./controller/read";
import { resolveAlertHandler } from "./controller/resolve";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  requirePermission(INVENTORY_PERMISSIONS.ALERT_READ),
  listStockAlertsHandler,
);

router.post("/process-expiry", requireAdmin(), processExpiryHandler);

router.post(
  "/:alertId/acknowledge",
  requirePermission(INVENTORY_PERMISSIONS.ALERT_UPDATE),
  acknowledgeAlertHandler,
);

router.post(
  "/:alertId/resolve",
  requirePermission(INVENTORY_PERMISSIONS.ALERT_UPDATE),
  resolveAlertHandler,
);

router.get(
  "/:id",
  requirePermission(INVENTORY_PERMISSIONS.ALERT_READ),
  getStockAlertHandler,
);

export default router;
