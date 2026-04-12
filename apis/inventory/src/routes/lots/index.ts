import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { listInventoryLotsHandler } from "./controller/read";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  requirePermission(INVENTORY_PERMISSIONS.STOCK_READ),
  listInventoryLotsHandler,
);

export default router;
