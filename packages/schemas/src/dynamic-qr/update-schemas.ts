import { z } from "zod";
import { BusinessCardThemeSchema, HttpUrlSchema } from "./base-schemas";

export const UpdateDynamicQrTargetSchema = z.strictObject({
  qrTargetUrl: HttpUrlSchema,
});

export const UpdateBusinessCardThemeSchema = z.strictObject({
  theme: BusinessCardThemeSchema,
});

export type UpdateDynamicQrTarget = z.infer<typeof UpdateDynamicQrTargetSchema>;
export type UpdateBusinessCardTheme = z.infer<
  typeof UpdateBusinessCardThemeSchema
>;
