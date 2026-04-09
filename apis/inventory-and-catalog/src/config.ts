import dotenv from "dotenv";
import { z } from "zod";

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().min(1, "DATABASE_URL is required"),
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),
  // API Gateway URL used for internal service-to-service calls (e.g. token validation)
  API_GATEWAY_URL: z.url("API_GATEWAY_URL must be a valid URL"),
});

const env = envSchema.parse({
  PORT: process.env.PORT,
  DATABASE_URL: process.env.DATABASE_URL,
  NODE_ENV: process.env.NODE_ENV,
  API_GATEWAY_URL: process.env.API_GATEWAY_URL,
});

export { env };
