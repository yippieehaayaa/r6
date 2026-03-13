import { z } from "zod";

export const PriceSchema = z.number().nonnegative().finite();

export const AddressEmbedSchema = z.strictObject({
  line2: z.string().optional(),
  street: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string(),
  postal: z.string().optional(),
});

export type AddressEmbed = z.infer<typeof AddressEmbedSchema>;

export const TimestampsSchema = z.strictObject({
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SoftDeleteSchema = z.strictObject({
  deletedAt: z.string().optional(),
});
