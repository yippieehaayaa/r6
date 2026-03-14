import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
});

export { env };
