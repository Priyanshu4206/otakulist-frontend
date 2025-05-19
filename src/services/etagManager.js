/**
 * ETag management utility
 * Handles storing and retrieving ETag values for conditional requests
 */

const ETAG_PREFIX = 'etag_';

/**
 * Get stored ETag for a specific resource
 * @param {string} key - Resource identifier (e.g., 'watchlist', 'auth_me')
 * @returns {string|null} - ETag value or null if not found
 */
export const getETag = (key) => {
  if (!key) return null;
  const etagKey = `${ETAG_PREFIX}${key}`;
  return localStorage.getItem(etagKey);
};

/**
 * Store ETag for a specific resource
 * @param {string} key - Resource identifier (e.g., 'watchlist', 'auth_me')
 * @param {string} value - ETag value from response header
 */
export const setETag = (key, value) => {
  if (!key || !value) return;
  const etagKey = `${ETAG_PREFIX}${key}`;
  localStorage.setItem(etagKey, value);
};

/**
 * Remove ETag for a specific resource
 * @param {string} key - Resource identifier
 */
export const removeETag = (key) => {
  if (!key) return;
  const etagKey = `${ETAG_PREFIX}${key}`;
  localStorage.removeItem(etagKey);
};

/**
 * Clear all stored ETags
 */
export const clearAllETags = () => {
  Object.keys(localStorage).forEach(key => {
    if (key.startsWith(ETAG_PREFIX)) {
      localStorage.removeItem(key);
    }
  });
};

export default {
  getETag,
  setETag,
  removeETag,
  clearAllETags
}; 