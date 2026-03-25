import { Hono } from "hono";
import auth, { wellknown } from "./auth/index.js";
import main from "./main/index.js";

const routes = new Hono();

routes.route("/", main);
routes.route("/auth", auth);
routes.route("/.well-known", wellknown);

export default routes;
