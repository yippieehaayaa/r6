import { Hono } from "hono";

const main = new Hono();

main.get("/", (c) => {
	return c.body(null, 200);
});

export default main;
