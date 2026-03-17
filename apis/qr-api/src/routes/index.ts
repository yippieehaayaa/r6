import { type Request, type Response, Router } from "express";
import { businessCardsRoutes, qrCodesRoutes } from "../modules";
import { resolveQrCode } from "../modules/qr-codes";
import { qrCodeIdParamsSchema } from "../modules/qr-codes/qr-codes.validator";
import { validateParams } from "../shared/middleware";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  res.status(200).json({
    service: "dynamic-qr-api",
    status: "ok",
  });
});

router.use("/v1/qr-codes", qrCodesRoutes);
router.use("/v1/business-cards", businessCardsRoutes);
router.get("/r/:id", validateParams(qrCodeIdParamsSchema), resolveQrCode);

export default router;
