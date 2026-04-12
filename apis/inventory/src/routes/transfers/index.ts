import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { dispatchTransferHandler } from "./controller/dispatch";
import {
  getStockTransferHandler,
  listStockTransfersHandler,
} from "./controller/read";
import { receiveTransferHandler } from "./controller/receive";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  requirePermission(INVENTORY_PERMISSIONS.TRANSFER_READ),
  listStockTransfersHandler,
);

router.post(
  "/dispatch",
  requirePermission(INVENTORY_PERMISSIONS.TRANSFER_CREATE),
  dispatchTransferHandler,
);

router.post(
  "/:transferId/receive",
  requirePermission(INVENTORY_PERMISSIONS.TRANSFER_UPDATE),
  receiveTransferHandler,
);

router.get(
  "/:id",
  requirePermission(INVENTORY_PERMISSIONS.TRANSFER_READ),
  getStockTransferHandler,
);

export default router;
