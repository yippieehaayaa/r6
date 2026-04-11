import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { dispatchTransferHandler } from "./controller/dispatch";
import { receiveTransferHandler } from "./controller/receive";

const router: Router = Router({ mergeParams: true });

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

export default router;
