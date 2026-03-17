import {
  CreateDynamicQrSchema,
  QrAssetQuerySchema,
  UpdateDynamicQrTargetSchema,
} from "@r6/schemas";
import { z } from "zod";

export const qrCodeIdParamsSchema = z.strictObject({
  id: z.string().uuid(),
});

export const createDynamicQrSchema = CreateDynamicQrSchema;
export const qrAssetQuerySchema = QrAssetQuerySchema;
export const updateDynamicQrTargetSchema = UpdateDynamicQrTargetSchema;
