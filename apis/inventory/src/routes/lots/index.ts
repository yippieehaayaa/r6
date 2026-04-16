import { Router } from "express";
import { listInventoryLotsHandler } from "./controller/read";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  // requirePermission(INVENTORY_PERMISSIONS.STOCK_READ),
  listInventoryLotsHandler,
);

export default router;
