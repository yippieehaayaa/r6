import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.string().optional().default("3000"),
  JWT_PRIVATE_KEY: z.string().transform((v) => v.replace(/\\n/g, "\n")),
  JWT_PUBLIC_KEY: z.string().transform((v) => v.replace(/\\n/g, "\n")),
  JWT_ISSUER: z.string(),
  JWT_AUDIENCE: z.string(),
  JWT_REFRESH_TTL_MS: z
    .string()
    .optional()
    .default("86400000")
    .transform(Number),
  JWT_TOTP_CHALLENGE_TTL_MS: z
    .string()
    .optional()
    .default("180000")
    .transform(Number),
  TOTP_ENCRYPTION_KEY: z
    .string()
    .length(
      64,
      "TOTP_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)",
    ),
  HASH_SECRET: z.string(),
  REDIS_URL: z.string(),
  AZURE_COMMUNICATION_CONNECTION_STRING: z.string(),
  AZURE_COMMUNICATION_SENDER_ADDRESS: z.string(),
  CORS_ORIGIN: z.string().transform((v) => v.split(",").map((s) => s.trim())),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  COOKIE_PATH: z.string().optional().default("/auth"),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
  JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
  JWT_REFRESH_TTL_MS: process.env.JWT_REFRESH_TTL_MS,
  JWT_TOTP_CHALLENGE_TTL_MS: process.env.JWT_TOTP_CHALLENGE_TTL_MS,
  TOTP_ENCRYPTION_KEY: process.env.TOTP_ENCRYPTION_KEY,
  HASH_SECRET: process.env.HASH_SECRET,
  REDIS_URL: process.env.REDIS_URL,
  AZURE_COMMUNICATION_CONNECTION_STRING:
    process.env.AZURE_COMMUNICATION_CONNECTION_STRING,
  AZURE_COMMUNICATION_SENDER_ADDRESS:
    process.env.AZURE_COMMUNICATION_SENDER_ADDRESS,
  CORS_ORIGIN: process.env.CORS_ORIGIN,
  NODE_ENV: process.env.NODE_ENV,
  COOKIE_PATH: process.env.COOKIE_PATH,
});

export { env };
