import { Router } from "express";
import { listStockReservationsHandler } from "./controller/read";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  // requirePermission(INVENTORY_PERMISSIONS.STOCK_READ),
  listStockReservationsHandler,
);

export default router;
