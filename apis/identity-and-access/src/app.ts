import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import { secureHeaders } from "hono/secure-headers";
import routes from "./routes/index.js";

const app = new Hono();

app.use("*", cors());
app.use("*", secureHeaders());
app.use("*", logger());
app.route("/", routes);

export default app;
