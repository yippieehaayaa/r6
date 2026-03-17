import { z } from "zod";

export const QrImageFormatSchema = z.enum(["PNG", "SVG", "PDF"]);
export const QrErrorCorrectionLevelSchema = z.enum(["L", "M", "Q", "H"]);

export const CardImageFormatSchema = z.enum(["PNG", "WEBP"]);
export const CardThemePresetSchema = z.enum([
  "AURORA_GLASS",
  "OBSIDIAN_GOLD",
  "HOLO_CHROME",
]);
export const CardOrientationSchema = z.enum(["LANDSCAPE", "PORTRAIT"]);

export type QrImageFormat = z.infer<typeof QrImageFormatSchema>;
export type QrErrorCorrectionLevel = z.infer<
  typeof QrErrorCorrectionLevelSchema
>;
export type CardImageFormat = z.infer<typeof CardImageFormatSchema>;
export type CardThemePreset = z.infer<typeof CardThemePresetSchema>;
export type CardOrientation = z.infer<typeof CardOrientationSchema>;
