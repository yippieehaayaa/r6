import { z } from "zod";

export const ProductStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "DISCONTINUED",
  "ARCHIVED",
]);

export type ProductStatus = z.infer<typeof ProductStatusSchema>;
