import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  PUBLIC_BASE_URL: z.string().url().optional(),
  LOGO_MAX_BYTES: z.coerce.number().int().min(1).default(2_500_000),
  REMOTE_LOGO_TIMEOUT_MS: z.coerce.number().int().min(250).default(5_000),
  STORE_MAX_RECORDS: z.coerce.number().int().min(100).default(5_000),
  ASSET_CACHE_SECONDS: z.coerce.number().int().min(0).default(3_600),
});

const parsedEnv = envSchema.parse({
  PORT: process.env.PORT,
  PUBLIC_BASE_URL: process.env.PUBLIC_BASE_URL,
  LOGO_MAX_BYTES: process.env.LOGO_MAX_BYTES,
  REMOTE_LOGO_TIMEOUT_MS: process.env.REMOTE_LOGO_TIMEOUT_MS,
  STORE_MAX_RECORDS: process.env.STORE_MAX_RECORDS,
  ASSET_CACHE_SECONDS: process.env.ASSET_CACHE_SECONDS,
});

const env = {
  ...parsedEnv,
  PUBLIC_BASE_URL:
    parsedEnv.PUBLIC_BASE_URL ?? `http://localhost:${parsedEnv.PORT}`,
} as const;

export { env };
