import cors, { type CorsOptions } from "cors";
import express, { type ErrorRequestHandler, type Express } from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";

import { env } from "./config";
import routes from "./routes";

const corsOptions: CorsOptions = {
  credentials: true,
  origin: env.CORS_ORIGIN,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: true,
  legacyHeaders: false,
});

const app: Express = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);

app.use(cors(corsOptions));
app.use(helmet());
app.use(globalLimiter);

app.use(routes);

const errorHandler: ErrorRequestHandler = (_err, _req, res, _next) => {
  res
    .status(500)
    .json({ error: "internal_server_error", message: "Internal server error" });
};

app.use(errorHandler);

export default app;
