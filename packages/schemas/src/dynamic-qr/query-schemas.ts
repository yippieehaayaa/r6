import { z } from "zod";
import { CardImageFormatSchema, QrImageFormatSchema } from "./enums";

const QueryBooleanSchema = z.preprocess((value) => {
  if (typeof value !== "string") {
    return value;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === "true" || normalized === "1") {
    return true;
  }

  if (normalized === "false" || normalized === "0") {
    return false;
  }

  return value;
}, z.boolean());

export const QrAssetQuerySchema = z.strictObject({
  format: QrImageFormatSchema.optional(),
  sizePx: z.coerce.number().int().min(256).max(4096).optional(),
  margin: z.coerce.number().int().min(0).max(12).optional(),
});

export const BusinessCardImageQuerySchema = z.strictObject({
  format: CardImageFormatSchema.optional(),
});

export const BusinessCardPdfQuerySchema = z.strictObject({
  includeBleed: QueryBooleanSchema.default(true),
});

export type QrAssetQuery = z.infer<typeof QrAssetQuerySchema>;
export type BusinessCardImageQuery = z.infer<
  typeof BusinessCardImageQuerySchema
>;
export type BusinessCardPdfQuery = z.infer<typeof BusinessCardPdfQuerySchema>;
