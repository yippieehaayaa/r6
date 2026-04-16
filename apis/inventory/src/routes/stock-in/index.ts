import { Router } from "express";
import { receiveStockHandler } from "./controller/receive";

const router: Router = Router({ mergeParams: true });

router.post(
  "/receive",
  // requirePermission(INVENTORY_PERMISSIONS.STOCK_CREATE),
  receiveStockHandler,
);

export default router;
