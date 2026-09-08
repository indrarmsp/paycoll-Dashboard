export interface CacheEntry<T> {
  payload: T;
  expiresAt: number;
}

const CACHE_TTL_MS = 5 * 60 * 1000;

export class CacheService {
  static read<T>(key: string): T | null {
    if (typeof window === 'undefined') {
      return null;
    }

    try {
      const raw = sessionStorage.getItem(key);
      if (!raw) return null;

      const entry = JSON.parse(raw) as CacheEntry<T>;

      if (Date.now() > entry.expiresAt) {
        sessionStorage.removeItem(key);
        return null;
      }

      return entry.payload;
    } catch {
      sessionStorage.removeItem(key);
      return null;
    }
  }

  static write<T>(key: string, payload: T, ttlMs: number = CACHE_TTL_MS): void {
    if (typeof window === 'undefined') return;

    try {
      const entry: CacheEntry<T> = {
        payload,
        expiresAt: Date.now() + ttlMs
      };
      sessionStorage.setItem(key, JSON.stringify(entry));
    } catch {
      sessionStorage.removeItem(key);
    }
  }

  static clear(key: string): void {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem(key);
    }
  }

  static clearAll(): void {
    if (typeof window !== 'undefined') {
      sessionStorage.clear();
    }
  }
}
