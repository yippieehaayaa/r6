import type { Express } from "express";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";
import { errorHandler } from "./shared/middleware";

const app: Express = express();

app.disable("x-powered-by");
app.set("trust proxy", true);

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));

app.use(routes);
app.use(errorHandler);

export default app;
