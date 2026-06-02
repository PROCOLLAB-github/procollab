/** @format */

const CACHE_PREFIX = "procollab:cache";

function cacheKey(key: string, version: number) {
  return `${CACHE_PREFIX}:${key}:v${version}`;
}

type Persisted<T> = { t: number; d: T };

// безопасно читаем (guard на отсутствие localStorage / парсинг / TTL)
export function readCache<T>(
  key: string,
  version: number,
  ttlMs: number,
  revive?: (raw: any) => T,
): T | null {
  try {
    if (typeof localStorage === "undefined") return null;
    const raw = localStorage.getItem(cacheKey(key, version));

    if (!raw) return null;

    const parsed: Persisted<any> = JSON.parse(raw);

    if (!parsed || typeof parsed.t !== "number") {
      localStorage.removeItem(cacheKey(key, version));
      return null;
    }

    if (Date.now() - parsed.t > ttlMs) {
      localStorage.removeItem(cacheKey(key, version));
      return null;
    }

    return revive ? revive(parsed.d) : (parsed.d as T);
  } catch {
    try {
      localStorage.removeItem(cacheKey(key, version));
    } catch {}
    return null;
  }
}

export function writeCache<T>(key: string, version: number, data: T) {
  try {
    if (typeof localStorage === "undefined") return;
    localStorage.setItem(cacheKey(key, version), JSON.stringify({ t: Date.now(), d: data }));
  } catch {}
}

export function clearCacheKey(key: string, version: number) {
  try {
    if (typeof localStorage !== "undefined") localStorage.removeItem(cacheKey(key, version));
  } catch {}
}
