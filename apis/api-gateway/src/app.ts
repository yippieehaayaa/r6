import cors, { type CorsOptions } from "cors";
import express, { type Express } from "express";
import helmet from "helmet";

import routes from "./routes";

const corsOptions: CorsOptions = {
  credentials: true,
  origin: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
};

const app: Express = express();

app.disable("x-powered-by");
app.set("trust proxy", true);

app.use(cors(corsOptions));
app.use(helmet());

app.use(routes);

export default app;