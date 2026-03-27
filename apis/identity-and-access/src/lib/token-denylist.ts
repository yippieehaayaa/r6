import { redis } from "@r6/redis";

export const connectDenylist = async (): Promise<void> => {
  // The redis singleton reads REDIS_URL from process.env at
  // creation time. connect() simply opens the socket.
  await redis.connect();
};

// Adds the JTI to the Redis denylist with a TTL that matches
// the remaining lifetime of the access token. The key auto-
// evicts once the token would have expired anyway, so the
// denylist never grows unbounded.
export const revokeAccessToken = async (
  jti: string,
  expiresAtMs: number,
): Promise<void> => {
  const remainingMs = expiresAtMs - Date.now();
  if (remainingMs <= 0) return; // already expired — nothing to do
  await redis.set(jti, "1", { PX: remainingMs });
};

export const isAccessTokenRevoked = async (jti: string): Promise<boolean> => {
  const result = await redis.exists(jti);
  return result > 0;
};
