import cookieParser from "cookie-parser";
// import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
// import { env } from "./config";
import { errorHandler } from "./middleware/error-handler";
import routes from "./routes";

const app: Express = express();

app.disable("x-powered-by");
app.set("trust proxy", 1);
// app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cookieParser());
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true }));
app.use(routes);
app.use(errorHandler);

export default app;
