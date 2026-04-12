import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { getWarehouseHandler, listWarehousesHandler } from "./controller/read";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  requirePermission(INVENTORY_PERMISSIONS.WAREHOUSE_READ),
  listWarehousesHandler,
);

router.get(
  "/:id",
  requirePermission(INVENTORY_PERMISSIONS.WAREHOUSE_READ),
  getWarehouseHandler,
);

export default router;
