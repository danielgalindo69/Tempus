import { Redis } from '@upstash/redis';
import { getEnv } from '../../config/env';

const { UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN } = getEnv();

export const upstashClient = new Redis({
  url: UPSTASH_REDIS_REST_URL,
  token: UPSTASH_REDIS_REST_TOKEN,
});

export class UpstashRedisAdapter {
  async get(key: string): Promise<string | null> {
    return await upstashClient.get(key);
  }

  async set(key: string, value: string, mode: string, ttl: number): Promise<string> {
    // mode is typically 'EX' for seconds
    if (mode === 'EX') {
      await upstashClient.set(key, value, { ex: ttl });
    } else {
      await upstashClient.set(key, value);
    }
    return 'OK';
  }

  async incr(key: string): Promise<number> {
    return await upstashClient.incr(key);
  }

  async expire(key: string, seconds: number): Promise<number> {
    return await upstashClient.expire(key, seconds);
  }

  async del(key: string): Promise<number> {
    return await upstashClient.del(key);
  }
}

export const upstashAdapter = new UpstashRedisAdapter();
