import { INVENTORY_PERMISSIONS } from "@r6/schemas/inventory";
import { Router } from "express";
import { requirePermission } from "../../middleware/guard";
import { approveReturnHandler } from "./controller/approve";
import { dispositionHandler } from "./controller/disposition";
import {
  getReturnRequestHandler,
  listReturnRequestsHandler,
} from "./controller/read";
import { receiveReturnHandler } from "./controller/receive";
import { requestReturnHandler } from "./controller/request";

const router: Router = Router({ mergeParams: true });

router.get(
  "/",
  requirePermission(INVENTORY_PERMISSIONS.RETURN_READ),
  listReturnRequestsHandler,
);

router.post(
  "/request",
  requirePermission(INVENTORY_PERMISSIONS.RETURN_CREATE),
  requestReturnHandler,
);

router.post(
  "/:returnRequestId/approve",
  requirePermission(INVENTORY_PERMISSIONS.RETURN_UPDATE),
  approveReturnHandler,
);

router.post(
  "/:returnRequestId/receive",
  requirePermission(INVENTORY_PERMISSIONS.RETURN_UPDATE),
  receiveReturnHandler,
);

router.post(
  "/:returnRequestId/disposition",
  requirePermission(INVENTORY_PERMISSIONS.RETURN_UPDATE),
  dispositionHandler,
);

router.get(
  "/:id",
  requirePermission(INVENTORY_PERMISSIONS.RETURN_READ),
  getReturnRequestHandler,
);

export default router;
