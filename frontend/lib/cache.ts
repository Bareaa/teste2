// Cache duration in milliseconds (24 hours)
const CACHE_DURATION = 24 * 60 * 60 * 1000;

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

export function setCache<T>(key: string, data: T): void {
  const cacheItem: CacheItem<T> = {
    data,
    timestamp: Date.now(),
  };
  localStorage.setItem(key, JSON.stringify(cacheItem));
}

export function getCache<T>(key: string): T | null {
  const cached = localStorage.getItem(key);
  if (!cached) return null;

  const cacheItem: CacheItem<T> = JSON.parse(cached);
  const now = Date.now();

  // Check if cache is expired
  if (now - cacheItem.timestamp > CACHE_DURATION) {
    localStorage.removeItem(key);
    return null;
  }

  return cacheItem.data;
}

export function clearCache(key?: string): void {
  if (key) {
    localStorage.removeItem(key);
  } else {
    localStorage.clear();
  }
}

// Cache keys
export const CACHE_KEYS = {
  ESTUDANTES: 'estudantes',
  PROFESSORES: 'professores',
  AGENDAMENTOS: 'agendamentos',
} as const;