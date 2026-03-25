import express, { type Express } from "express";
import helmet from "helmet";
import morgan from "morgan";
import routes from "./routes";

const app: Express = express();

app.disable("x-powered-by");
app.set("trust proxy", true);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(routes);

export default app;
