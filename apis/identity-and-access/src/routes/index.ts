import { Hono } from "hono";
import main from "./main/index.js";

const routes = new Hono();

routes.route("/", main);

export default routes;
