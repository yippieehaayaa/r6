import { createHash, createHmac, timingSafeEqual } from "node:crypto";

const getSecret = (): string => {
  const secret = process.env.HASH_SECRET;
  if (!secret) {
    throw new Error("HASH_SECRET environment variable is not set");
  }
  return secret;
};

export const sha256 = (value: string): string =>
  createHash("sha256").update(value).digest("hex");

export const hmac = (value: string): string =>
  createHmac("sha256", getSecret())
    .update(Buffer.from(value, "utf8"))
    .digest("hex");

export const verifyHmac = (value: string, hash: string): boolean => {
  const computed = Buffer.from(hmac(value));
  const expected = Buffer.from(hash);
  if (computed.length !== expected.length) return false;
  return timingSafeEqual(computed, expected);
};
