import { z } from "zod";

export const PriceSchema = z.number().nonnegative().finite();

export const AddressEmbedSchema = z.strictObject({
  line2: z.string().nullish(),
  street: z.string().nullish(),
  city: z.string().nullish(),
  state: z.string().nullish(),
  country: z.string(),
  postal: z.string().nullish(),
});

export type AddressEmbed = z.infer<typeof AddressEmbedSchema>;

export const TimestampsSchema = z.strictObject({
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const SoftDeleteSchema = z.strictObject({
  deletedAt: z.string().nullish(),
});
