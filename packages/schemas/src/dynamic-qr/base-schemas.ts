import { z } from "zod";
import {
  CardOrientationSchema,
  CardThemePresetSchema,
  QrErrorCorrectionLevelSchema,
  QrImageFormatSchema,
} from "./enums";

const hexColorPattern = /^#(?:[0-9a-fA-F]{6})$/;
const dataUrlImagePattern =
  /^data:image\/(?:png|jpeg|jpg|webp|svg\+xml);base64,[A-Za-z0-9+/=]+$/i;

export const HttpUrlSchema = z
  .string()
  .url()
  .refine((value) => {
    const protocol = new URL(value).protocol;
    return protocol === "http:" || protocol === "https:";
  }, "Only http and https URLs are supported");

export const LogoDataUrlSourceSchema = z.strictObject({
  kind: z.literal("DATA_URL"),
  dataUrl: z
    .string()
    .regex(dataUrlImagePattern, "Logo must be a supported image data URL"),
});

export const LogoRemoteUrlSourceSchema = z.strictObject({
  kind: z.literal("REMOTE_URL"),
  url: HttpUrlSchema,
});

export const LogoSourceSchema = z.union([
  LogoDataUrlSourceSchema,
  LogoRemoteUrlSourceSchema,
]);

export const QrOutputOptionsSchema = z.strictObject({
  format: QrImageFormatSchema.default("PNG"),
  sizePx: z.number().int().min(256).max(4096).default(1024),
  margin: z.number().int().min(0).max(12).default(2),
  errorCorrectionLevel: QrErrorCorrectionLevelSchema.default("H"),
});

export const CardPrintSpecSchema = z.strictObject({
  widthInches: z.number().min(2.0).max(6.0).default(3.5),
  heightInches: z.number().min(1.5).max(4.0).default(2.0),
  dpi: z.number().int().min(150).max(600).default(300),
  orientation: CardOrientationSchema.default("LANDSCAPE"),
  bleedInches: z.number().min(0).max(0.25).default(0.125),
  safeMarginInches: z.number().min(0.05).max(0.5).default(0.125),
});

export const BusinessCardThemeSchema = z.strictObject({
  preset: CardThemePresetSchema.default("HOLO_CHROME"),
  primaryHex: z.string().regex(hexColorPattern).optional(),
  secondaryHex: z.string().regex(hexColorPattern).optional(),
  accentHex: z.string().regex(hexColorPattern).optional(),
  metallicStrength: z.number().min(0).max(1).default(0.85),
  glossStrength: z.number().min(0).max(1).default(0.75),
  holographicShift: z.number().min(0).max(1).default(0.55),
});

export type HttpUrl = z.infer<typeof HttpUrlSchema>;
export type LogoDataUrlSource = z.infer<typeof LogoDataUrlSourceSchema>;
export type LogoRemoteUrlSource = z.infer<typeof LogoRemoteUrlSourceSchema>;
export type LogoSource = z.infer<typeof LogoSourceSchema>;
export type QrOutputOptions = z.infer<typeof QrOutputOptionsSchema>;
export type CardPrintSpec = z.infer<typeof CardPrintSpecSchema>;
export type BusinessCardTheme = z.infer<typeof BusinessCardThemeSchema>;
