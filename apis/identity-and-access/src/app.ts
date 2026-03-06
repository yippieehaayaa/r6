import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import type { HonoVariables } from "./middleware/auth.js";
import routes from "./routes/index.js";

const app = new Hono<{ Variables: HonoVariables }>();

app.use("*", cors());
app.use("*", secureHeaders());
app.use("*", logger());
app.route("/", routes);

export default app;
