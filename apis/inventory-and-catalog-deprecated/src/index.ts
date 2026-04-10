import http from "node:http";
import app from "./app";
import { env } from "./config";
import { registerEventHandlers } from "./shared/events";
import { prisma } from "./utils/prisma";

registerEventHandlers();

const server = http.createServer(app);

server.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
});

const shutdown = () => {
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);
