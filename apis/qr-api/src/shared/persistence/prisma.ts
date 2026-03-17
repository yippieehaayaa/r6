import { PrismaClient } from "@prisma/client";
import { env } from "../../config";

interface GlobalWithPrisma {
  __r6QrApiPrisma?: PrismaClient;
}

const globalWithPrisma = globalThis as typeof globalThis & GlobalWithPrisma;

const prismaClient =
  globalWithPrisma.__r6QrApiPrisma ??
  new PrismaClient({
    log: env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

if (env.NODE_ENV !== "production") {
  globalWithPrisma.__r6QrApiPrisma = prismaClient;
}

export const prisma = prismaClient;

export async function isDatabaseReady(): Promise<boolean> {
  try {
    await prisma.$runCommandRaw({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
