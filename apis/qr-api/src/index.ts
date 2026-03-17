import http from "node:http";
import app from "./app";
import { env } from "./config";
import { prisma } from "./shared/persistence";

const server = http.createServer(app);
let isShuttingDown = false;

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  if (isShuttingDown) {
    return;
  }

  isShuttingDown = true;
  console.log(`[dynamic-qr-api] received ${signal}, shutting down...`);

  server.close(async (error) => {
    if (error) {
      console.error("[dynamic-qr-api] failed to close server cleanly", error);
      process.exit(1);
      return;
    }

    try {
      await prisma.$disconnect();
      process.exit(0);
    } catch (disconnectError) {
      console.error(
        "[dynamic-qr-api] failed to disconnect Prisma client",
        disconnectError,
      );
      process.exit(1);
    }
  });
}

server.listen(env.PORT, () => {
  console.log(`QR API server is running on port ${env.PORT}`);
});

process.on("SIGTERM", () => {
  void shutdown("SIGTERM");
});

process.on("SIGINT", () => {
  void shutdown("SIGINT");
});
