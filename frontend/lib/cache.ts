// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
  version: string; // Added version control
}

// Cache version - increment this when data structure changes
const CACHE_VERSION = '1.0.0';

export function setCache<T>(key: string, data: T): void {
  try {
    const cacheItem: CacheItem<T> = {
      data,
      timestamp: Date.now(),
      version: CACHE_VERSION
    };
    localStorage.setItem(key, JSON.stringify(cacheItem));
  } catch (error) {
    console.error('Cache write error:', error);
    // Clear potentially corrupted cache
    localStorage.removeItem(key);
  }
}

export function getCache<T>(key: string): T | null {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const cacheItem: CacheItem<T> = JSON.parse(cached);
    const now = Date.now();

    // Check if cache is expired or version mismatch
    if (now - cacheItem.timestamp > CACHE_DURATION || cacheItem.version !== CACHE_VERSION) {
      localStorage.removeItem(key);
      return null;
    }

    return cacheItem.data;
  } catch (error) {
    console.error('Cache read error:', error);
    localStorage.removeItem(key);
    return null;
  }
}

export function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(key);
  } else {
    localStorage.clear();
  }
}

// Cache keys with types
export const CACHE_KEYS = {
  ESTUDANTES: 'estudantes',
  PROFESSORES: 'professores',
  AGENDAMENTOS: 'agendamentos',
  AUTH: 'auth',
} as const;

// Type for cache keys
export type CacheKey = typeof CACHE_KEYS[keyof typeof CACHE_KEYS];