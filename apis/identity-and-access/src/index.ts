import http from "node:http";
import app from "./app";
import { env } from "./config";

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});
