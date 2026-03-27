import { createClient, type RedisClientType } from "redis";

type RedisOptions = {
  url?: string;
  disableOfflineQueue?: boolean;
};

const DEFAULT_URL = "redis://localhost:6379";

const createRedis = (options: RedisOptions = {}): RedisClientType => {
  const url = options.url || process.env.REDIS_URL || DEFAULT_URL;

  const client = createClient({
    url,
    disableOfflineQueue: options.disableOfflineQueue ?? false,
    socket: {
      reconnectStrategy(retries) {
        const delay = Math.min(retries * 200, 5000);
        return delay;
      },
    },
  });

  return client as RedisClientType;
};

const redis = createRedis();

export { redis, createRedis, type RedisOptions };