import http from "node:http";
import app from "./app";
import { env } from "./config";
import { connectDenylist } from "./lib/token-denylist";

const server = http.createServer(app);

connectDenylist().then(() => {
  server.listen(env.PORT, () => {
    console.log(`Server is running on port ${env.PORT}`);
  });
});

const shutdown = () => {
  server.close(() => {
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
