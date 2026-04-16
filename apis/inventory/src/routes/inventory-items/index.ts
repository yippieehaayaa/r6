import { Router } from "express";
import { listInventoryItemsHandler } from "./controller/read";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  // requirePermission(INVENTORY_PERMISSIONS.STOCK_READ),
  listInventoryItemsHandler,
);

export default router;
