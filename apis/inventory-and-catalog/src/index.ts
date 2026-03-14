import http from "node:http";
import app from "./app";
import { env } from "./config";
import { registerEventHandlers } from "./shared/events";

registerEventHandlers();

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
