import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional().default("3000"),
  IAM_INTERNAL_URL: z.string(),
  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
  REDIS_URL: z.string(),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  IAM_INTERNAL_URL: process.env.IAM_INTERNAL_URL,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
  REDIS_URL: process.env.REDIS_URL,
  NODE_ENV: process.env.NODE_ENV,
});

export { env };
