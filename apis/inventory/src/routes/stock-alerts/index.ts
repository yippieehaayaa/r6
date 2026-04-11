import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requireAdmin, requirePermission } from "../../middleware/guard";
import { acknowledgeAlertHandler } from "./controller/acknowledge";
import { processExpiryHandler } from "./controller/process-expiry";
import { resolveAlertHandler } from "./controller/resolve";

const router: Router = Router({ mergeParams: true });

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

export default router;
