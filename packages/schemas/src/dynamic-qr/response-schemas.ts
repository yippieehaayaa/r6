import { z } from "zod";
import {
  BusinessCardThemeSchema,
  CardPrintSpecSchema,
  QrOutputOptionsSchema,
} from "./base-schemas";
import { CardImageFormatSchema } from "./enums";

const HttpLinkSchema = z.string().url();

export const DynamicQrMetadataSchema = z.strictObject({
  id: z.string().uuid(),
  companyName: z.string(),
  qrTargetUrl: HttpLinkSchema,
  qrPayloadUrl: HttpLinkSchema,
  profileLabel: z.string().optional(),
  issuedDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  logoIncluded: z.boolean(),
  outputDefaults: QrOutputOptionsSchema,
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const DynamicQrLinksSchema = z.strictObject({
  self: HttpLinkSchema,
  resolve: HttpLinkSchema,
  asset: HttpLinkSchema,
});

export const DynamicQrResponseSchema = z.strictObject({
  data: DynamicQrMetadataSchema,
  links: DynamicQrLinksSchema,
});

export const BusinessCardMetadataSchema = z.strictObject({
  id: z.string().uuid(),
  companyName: z.string(),
  qrCodeId: z.string().uuid(),
  qrPayloadUrl: HttpLinkSchema,
  issuedDate: z.string().datetime(),
  createdAt: z.string().datetime(),
  editionLabel: z.string(),
  imageFormat: CardImageFormatSchema,
  printSpec: CardPrintSpecSchema,
  theme: BusinessCardThemeSchema,
  logoIncluded: z.boolean(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const BusinessCardLinksSchema = z.strictObject({
  self: HttpLinkSchema,
  image: HttpLinkSchema,
  pdf: HttpLinkSchema,
});

export const BusinessCardResponseSchema = z.strictObject({
  data: BusinessCardMetadataSchema,
  links: BusinessCardLinksSchema,
});

export type DynamicQrMetadata = z.infer<typeof DynamicQrMetadataSchema>;
export type DynamicQrResponse = z.infer<typeof DynamicQrResponseSchema>;
export type BusinessCardMetadata = z.infer<typeof BusinessCardMetadataSchema>;
export type BusinessCardResponse = z.infer<typeof BusinessCardResponseSchema>;
