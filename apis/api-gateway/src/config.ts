import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional().default("3000"),
  IAA_URL: z.url(),
  IAC_URL: z.url(),
  CORS_ORIGIN: z.string().transform((v) => v.split(",").map((s) => s.trim())),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  IAA_URL: process.env.IAA_URL,
  IAC_URL: process.env.IAC_URL,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
});

export { env };
