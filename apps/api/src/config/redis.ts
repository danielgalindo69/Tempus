import { getEnv } from './env.js';

// ─── In-memory fallback (solo para desarrollo) ──────────────────
const memStore = new Map<string, { value: string; expiresAt: number | null }>();

function memGet(key: string): string | null {
  const entry = memStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memStore.delete(key);
    return null;
  }
  return entry.value;
}
function memSet(key: string, value: string, exSeconds?: number): void {
  memStore.set(key, {
    value,
    expiresAt: exSeconds ? Date.now() + exSeconds * 1000 : null,
  });
}
function memDel(key: string): void { memStore.delete(key); }
function memIncr(key: string): number {
  const cur = parseInt(memGet(key) ?? '0', 10);
  const next = cur + 1;
  const entry = memStore.get(key);
  memStore.set(key, { value: String(next), expiresAt: entry?.expiresAt ?? null });
  return next;
}
function memTtl(key: string): number {
  const entry = memStore.get(key);
  if (!entry || !entry.expiresAt) return -1;
  return Math.max(0, Math.ceil((entry.expiresAt - Date.now()) / 1000));
}
function memExpire(key: string, seconds: number): void {
  const entry = memStore.get(key);
  if (entry) memStore.set(key, { ...entry, expiresAt: Date.now() + seconds * 1000 });
}

// ─── Interface unificada ─────────────────────────────────────────
export interface CacheStore {
  get(key: string): Promise<string | null>;
  set(key: string, value: string, mode?: 'EX', ttl?: number): Promise<unknown>;
  del(key: string): Promise<unknown>;
  incr(key: string): Promise<number>;
  ttl(key: string): Promise<number>;
  expire(key: string, seconds: number): Promise<unknown>;
}

class MemoryCacheStore implements CacheStore {
  async get(key: string) { return memGet(key); }
  async set(key: string, value: string, _mode?: 'EX', ttl?: number) {
    memSet(key, value, ttl);
    return 'OK';
  }
  async del(key: string) { memDel(key); return 1; }
  async incr(key: string) { return memIncr(key); }
  async ttl(key: string) { return memTtl(key); }
  async expire(key: string, seconds: number) { memExpire(key, seconds); return 1; }
}

let _redis: CacheStore | null = null;
let _usingMemory = false;

async function createRedisClient(): Promise<CacheStore> {
  const { REDIS_URL } = getEnv();
  if (!REDIS_URL || REDIS_URL === 'redis://localhost:6379') {
    // Intenta conectar; si falla en 2s usa memoria
  }
  try {
    const ioredis = await import('ioredis');
    const Redis = (ioredis.default || ioredis) as any;
    const client = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 1,
      lazyConnect: true,
      connectTimeout: 2000,
      retryStrategy: () => null, // no reintentar
    });
    // Prevenir "Unhandled error event" si Redis no está disponible
    client.on('error', () => { /* silencioso en dev */ });
    await client.connect();
    console.log('[Redis] Conectado correctamente');

    // Wrapper para que tenga la misma interfaz
    const store: CacheStore = {
      get: (k) => client.get(k),
      set: (k, v, _m?, ttl?) =>
        ttl ? client.set(k, v, 'EX', ttl) : client.set(k, v),
      del: (k) => client.del(k),
      incr: (k) => client.incr(k),
      ttl: (k) => client.ttl(k),
      expire: (k, s) => client.expire(k, s),
    };
    return store;
  } catch (err) {
    _usingMemory = true;
    console.warn('[Redis] No disponible — usando almacenamiento en memoria (solo para desarrollo)');
    return new MemoryCacheStore();
  }
}

export async function connectRedis(): Promise<void> {
  if (!_redis) {
    _redis = await createRedisClient();
  }
}

export async function disconnectRedis(): Promise<void> {
  // noop para memory store; real Redis se cierra en onClose
}

export function getRedis(): CacheStore {
  if (!_redis) {
    // Fallback síncrono si se llama antes de connectRedis
    _redis = new MemoryCacheStore();
    _usingMemory = true;
  }
  return _redis;
}

export { _usingMemory as isUsingMemoryCache };

// Exportar compatibilidad con código existente que importa `redis` directamente
export const redis: CacheStore = new Proxy({} as CacheStore, {
  get(_target, prop) {
    return (...args: unknown[]) =>
      (getRedis() as unknown as Record<string, (...a: unknown[]) => unknown>)[prop as string]?.(...args);
  },
});
