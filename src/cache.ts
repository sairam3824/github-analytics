interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

export class Cache {
  private store = new Map<string, CacheEntry<any>>();

  set<T>(key: string, data: T, ttl: number): void {
    this.store.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.store.delete(key);
      return null;
    }

    return entry.data as T;
  }

  clear(): void {
    this.store.clear();
  }
}
