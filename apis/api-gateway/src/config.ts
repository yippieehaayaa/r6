import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional().default("3000"),
  IAC_URL: z.url(),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  IAC_URL: process.env.IAC_URL,
});

export { env };