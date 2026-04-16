import { Router } from "express";
import { listStockMovementsHandler } from "./controller/read";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  // requirePermission(INVENTORY_PERMISSIONS.STOCK_READ),
  listStockMovementsHandler,
);

export default router;
