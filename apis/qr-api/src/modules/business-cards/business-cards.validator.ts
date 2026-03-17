import {
  BusinessCardImageQuerySchema,
  BusinessCardPdfQuerySchema,
  CreateBusinessCardSchema,
} from "@r6/schemas";
import { z } from "zod";

export const businessCardIdParamsSchema = z.strictObject({
  id: z.string().uuid(),
});

export const createBusinessCardSchema = CreateBusinessCardSchema;
export const businessCardImageQuerySchema = BusinessCardImageQuerySchema;
export const businessCardPdfQuerySchema = BusinessCardPdfQuerySchema;
