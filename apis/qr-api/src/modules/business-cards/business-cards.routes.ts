import { Router } from "express";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/middleware";
import {
  createBusinessCard,
  exportBusinessCardImage,
  exportBusinessCardPdf,
  getBusinessCardMetadata,
} from "./business-cards.controller";
import {
  businessCardIdParamsSchema,
  businessCardImageQuerySchema,
  businessCardPdfQuerySchema,
  createBusinessCardSchema,
} from "./business-cards.validator";

const router = Router();

router.post("/", validateBody(createBusinessCardSchema), createBusinessCard);
router.get(
  "/:id",
  validateParams(businessCardIdParamsSchema),
  getBusinessCardMetadata,
);
router.get(
  "/:id/image",
  validateParams(businessCardIdParamsSchema),
  validateQuery(businessCardImageQuerySchema),
  exportBusinessCardImage,
);
router.get(
  "/:id/pdf",
  validateParams(businessCardIdParamsSchema),
  validateQuery(businessCardPdfQuerySchema),
  exportBusinessCardPdf,
);

export default router;
