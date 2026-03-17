import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  DATABASE_URL: z
    .string()
    .url()
    .refine(
      (value) =>
        value.startsWith("mongodb://") || value.startsWith("mongodb+srv://"),
      "DATABASE_URL must use mongodb:// or mongodb+srv://",
    ),
  PUBLIC_BASE_URL: z.string().url().optional(),
  LOGO_MAX_BYTES: z.coerce.number().int().min(1).default(2_500_000),
  REMOTE_LOGO_TIMEOUT_MS: z.coerce.number().int().min(250).default(5_000),
  REQUEST_BODY_LIMIT: z.string().default("2mb"),
  ASSET_CACHE_SECONDS: z.coerce.number().int().min(0).default(3_600),
});

const parsedEnv = envSchema.parse({
  NODE_ENV: process.env.NODE_ENV,
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
  LOGO_MAX_BYTES: process.env.LOGO_MAX_BYTES,
  REMOTE_LOGO_TIMEOUT_MS: process.env.REMOTE_LOGO_TIMEOUT_MS,
  REQUEST_BODY_LIMIT: process.env.REQUEST_BODY_LIMIT,
  ASSET_CACHE_SECONDS: process.env.ASSET_CACHE_SECONDS,
});

const env = {
  ...parsedEnv,
  PUBLIC_BASE_URL:
    parsedEnv.PUBLIC_BASE_URL ?? `http://localhost:${parsedEnv.PORT}`,
} as const;

export { env };
