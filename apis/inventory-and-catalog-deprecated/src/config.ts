import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // Internal URL of the identity-and-access service.
  // In Azure Container Apps this is the internal DNS name, e.g. http://identity-and-access
  // Locally: http://localhost:<IAM_PORT>
  // Only used at JWKS fetch time (startup / key rotation) — not per request.
  IAM_INTERNAL_URL: z.string().url("IAM_INTERNAL_URL must be a valid URL"),
  // Must match JWT_ISSUER and JWT_AUDIENCE in identity-and-access exactly.
  JWT_ISSUER: z.string().min(1, "JWT_ISSUER is required"),
  JWT_AUDIENCE: z.string().min(1, "JWT_AUDIENCE is required"),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  IAM_INTERNAL_URL: process.env.IAM_INTERNAL_URL,
  JWT_ISSUER: process.env.JWT_ISSUER,
  JWT_AUDIENCE: process.env.JWT_AUDIENCE,
});

export { env };
