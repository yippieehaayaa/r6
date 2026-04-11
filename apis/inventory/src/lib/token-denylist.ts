import { redis } from "@r6/redis";

export const connectDenylist = async (): Promise<void> => {
  await redis.connect();
};

export const isAccessTokenRevoked = async (jti: string): Promise<boolean> => {
  const result = await redis.exists(jti);
  return result > 0;
};
