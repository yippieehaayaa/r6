import { z } from "@hono/zod-openapi";
import dotenv from "dotenv";

dotenv.config();

const envSchema = z.object({
	PORT: z.string().optional().default("3000"),
});

const env = envSchema.parse({
	PORT: process.env.PORT,
});

export { env };
