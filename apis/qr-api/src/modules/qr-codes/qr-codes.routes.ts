import { Router } from "express";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middleware";
import {
  createQrCode,
  getQrCodeAsset,
  getQrCodeMetadata,
  resolveQrCode,
  updateQrCodeTarget,
} from "./qr-codes.controller";
import {
  createDynamicQrSchema,
  qrAssetQuerySchema,
  qrCodeIdParamsSchema,
  updateDynamicQrTargetSchema,
} from "./qr-codes.validator";

const router = Router();

router.post("/", validateBody(createDynamicQrSchema), createQrCode);
router.get("/:id", validateParams(qrCodeIdParamsSchema), getQrCodeMetadata);
router.patch(
  "/:id/target",
  validateParams(qrCodeIdParamsSchema),
  validateBody(updateDynamicQrTargetSchema),
  updateQrCodeTarget,
);
router.get(
  "/:id/asset",
  validateParams(qrCodeIdParamsSchema),
  validateQuery(qrAssetQuerySchema),
  getQrCodeAsset,
);
router.get("/:id/resolve", validateParams(qrCodeIdParamsSchema), resolveQrCode);

export default router;
