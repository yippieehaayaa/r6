import { serve } from "@hono/node-server";
import app from "./app.js";
import { env } from "./config.js";

const port = Number(env.PORT) || 3000;

serve(
	{
		fetch: app.fetch,
		port: port,
	},
	() => {
		console.log(`Server is running on http://localhost:${port}`);
	},
);
