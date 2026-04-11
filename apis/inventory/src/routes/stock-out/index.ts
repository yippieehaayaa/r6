import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { fulfillSaleHandler } from "./controller/fulfill";
import { reserveStockHandler } from "./controller/reserve";

const router: Router = Router({ mergeParams: true });

router.post(
  "/reserve",
  requirePermission(INVENTORY_PERMISSIONS.STOCK_CREATE),
  reserveStockHandler,
);

router.post(
  "/fulfill",
  requirePermission(INVENTORY_PERMISSIONS.STOCK_CREATE),
  fulfillSaleHandler,
);

export default router;
