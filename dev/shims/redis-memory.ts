/**
 * In-memory stand-in for `@devvit/redis`.
 *
 * Devvit's real redis client talks to Reddit's gRPC plugin host, which only
 * exists inside a `devvit playtest` session. For the local preview we keep the
 * same async API surface (the subset the game uses) backed by a process-wide
 * Map, so player/world state persists while the dev server runs.
 */

type Entry = { value: string; expiresAt?: number };

const globalStore = globalThis as typeof globalThis & {
  __stankvilleStore?: Map<string, Entry>;
};

const store = (globalStore.__stankvilleStore ??= new Map<string, Entry>());

function live(key: string): Entry | undefined {
  const entry = store.get(key);
  if (!entry) {
    return undefined;
  }
  if (entry.expiresAt !== undefined && entry.expiresAt <= Date.now()) {
    store.delete(key);
    return undefined;
  }
  return entry;
}

export const redis = {
  async get(key: string): Promise<string | undefined> {
    return live(key)?.value;
  },

  async set(
    key: string,
    value: string,
    options?: { expiration?: Date }
  ): Promise<void> {
    store.set(key, {
      value,
      ...(options?.expiration
        ? { expiresAt: options.expiration.getTime() }
        : {}),
    });
  },

  async del(...keys: string[]): Promise<void> {
    for (const key of keys) {
      store.delete(key);
    }
  },

  async exists(key: string): Promise<boolean> {
    return live(key) !== undefined;
  },

  async incrBy(key: string, amount: number): Promise<number> {
    const next = Number(live(key)?.value ?? 0) + amount;
    store.set(key, { value: String(next) });
    return next;
  },

  async mGet(keys: string[]): Promise<(string | undefined)[]> {
    return keys.map((key) => live(key)?.value);
  },
};
