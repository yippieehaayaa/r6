import { z } from "@hono/zod-openapi";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
	PORT: z.string().optional().default("3000"),
	JWT_PRIVATE_KEY: z.string().transform((v) => v.replace(/\\n/g, "\n")),
	JWT_PUBLIC_KEY: z.string().transform((v) => v.replace(/\\n/g, "\n")),
	JWT_ISSUER: z.string(),
	JWT_AUDIENCE: z.string(),
	JWT_ACCESS_TTL_MS: z.string().optional().default("900000"),
	HASH_SECRET: z.string(),
});

const env = envSchema.parse({
	PORT: process.env.PORT,
	JWT_PRIVATE_KEY: process.env.JWT_PRIVATE_KEY,
	JWT_PUBLIC_KEY: process.env.JWT_PUBLIC_KEY,
	JWT_ISSUER: process.env.JWT_ISSUER,
	JWT_AUDIENCE: process.env.JWT_AUDIENCE,
	JWT_ACCESS_TTL_MS: process.env.JWT_ACCESS_TTL_MS,
	HASH_SECRET: process.env.HASH_SECRET,
});

export { env };
