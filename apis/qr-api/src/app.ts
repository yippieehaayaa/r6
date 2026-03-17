import type { Express } from "express";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { env } from "./config";
import routes from "./routes";
import { errorHandler } from "./shared/middleware";

const app: Express = express();

app.disable("x-powered-by");
app.set("trust proxy", true);

app.use(helmet());
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: env.REQUEST_BODY_LIMIT }));
app.use(express.urlencoded({ extended: true }));

app.use(routes);
app.use(errorHandler);

export default app;
