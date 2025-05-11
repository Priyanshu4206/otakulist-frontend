/**
 * Utility for caching user settings in sessionStorage
 */
const SETTINGS_CACHE_KEY = 'user_settings_cache';

/**
 * Get cached settings from sessionStorage
 * @returns {object|null}
 */
export function getCachedSettings() {
  try {
    const raw = sessionStorage.getItem(SETTINGS_CACHE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

/**
 * Set cached settings in sessionStorage
 * @param {object} settings
 */
export function setCachedSettings(settings) {
  try {
    sessionStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(settings));
  } catch {}
}

/**
 * Invalidate a specific setting in the cache
 * @param {string[]} path - Array path to the setting (e.g., ['privacy', 'showActivity'])
 */
export function invalidateCachedSetting(path) {
  try {
    const cached = getCachedSettings();
    if (!cached) return;
    let obj = cached;
    for (let i = 0; i < path.length - 1; i++) {
      if (!obj[path[i]]) return;
      obj = obj[path[i]];
    }
    delete obj[path[path.length - 1]];
    setCachedSettings(cached);
  } catch {}
} 