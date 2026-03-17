import { z } from "zod";
import {
  BusinessCardThemeSchema,
  CardPrintSpecSchema,
  HttpUrlSchema,
  LogoSourceSchema,
  QrOutputOptionsSchema,
} from "./base-schemas";
import { CardImageFormatSchema } from "./enums";

export const CreateDynamicQrSchema = z.strictObject({
  companyName: z.string().trim().min(1).max(120),
  qrTargetUrl: HttpUrlSchema,
  issuedDate: z.string().datetime().optional(),
  logo: LogoSourceSchema.optional(),
  output: QrOutputOptionsSchema.optional(),
  profileLabel: z.string().trim().min(1).max(64).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export const CreateBusinessCardSchema = z
  .strictObject({
    companyName: z.string().trim().min(1).max(120),
    issuedDate: z.string().datetime().optional(),
    companyLogo: LogoSourceSchema.optional(),
    qrCodeId: z.string().uuid().optional(),
    qrTargetUrl: HttpUrlSchema.optional(),
    qrLogo: LogoSourceSchema.optional(),
    qrOutput: QrOutputOptionsSchema.optional(),
    theme: BusinessCardThemeSchema.optional(),
    printSpec: CardPrintSpecSchema.optional(),
    imageFormat: CardImageFormatSchema.default("PNG"),
    editionLabel: z.string().trim().min(1).max(40).optional(),
    metadata: z.record(z.string(), z.unknown()).optional(),
  })
  .refine((value) => Boolean(value.qrCodeId || value.qrTargetUrl), {
    message: "Either qrCodeId or qrTargetUrl is required",
    path: ["qrCodeId"],
  });

export type CreateDynamicQr = z.infer<typeof CreateDynamicQrSchema>;
export type CreateBusinessCard = z.infer<typeof CreateBusinessCardSchema>;
