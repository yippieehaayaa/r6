import { z } from "zod";

export const ProductStatusSchema = z.enum([
  "DRAFT",
  "ACTIVE",
  "DISCONTINUED",
  "ARCHIVED",
]);

export type ProductStatus = z.infer<typeof ProductStatusSchema>;

export const DimensionUnitSchema = z.enum(["CM", "MM", "IN", "FT", "M"]);
export type DimensionUnit = z.infer<typeof DimensionUnitSchema>;

export const WeightUnitSchema = z.enum(["G", "KG", "LB", "OZ"]);
export type WeightUnit = z.infer<typeof WeightUnitSchema>;
