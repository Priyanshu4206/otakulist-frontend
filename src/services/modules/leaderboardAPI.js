import api from '../axiosInstance';
import { processResponse } from '../responseHandler';
import { fetchWithETagAndCache } from '../conditionalFetch';

// Constants for caching
const LEADERBOARD_CACHE_KEY = 'leaderboard';
const LEADERBOARD_ETAG_KEY = 'leaderboard';
const LEADERBOARD_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const RANK_TIERS_CACHE_KEY = 'rank_tiers';
const RANK_TIERS_ETAG_KEY = 'rank_tiers';
const RANK_TIERS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if cache is expired
 * @param {string} key - Cache key to check
 * @param {number} ttl - Time to live in milliseconds
 * @returns {boolean} True if cache is expired
 */
const isCacheExpired = (key, ttl) => {
  // Get the cached data object that contains both data and timestamp
  const cachedItem = localStorage.getItem(key);
  if (!cachedItem) return true;
  
  try {
    const { timestamp } = JSON.parse(cachedItem);
    if (!timestamp) return true;
    
    const now = Date.now();
    return now - timestamp > ttl;
  } catch (e) {
    // If there's an error parsing the JSON, consider the cache expired
    return true;
  }
};

/**
 * Update cache with data and timestamp
 * @param {string} key - Cache key to update
 * @param {any} data - Data to store
 */
const updateCache = (key, data) => {
  const cacheObject = {
    data,
    timestamp: Date.now()
  };
  localStorage.setItem(key, JSON.stringify(cacheObject));
};

/**
 * Get data from cache
 * @param {string} key - Cache key
 * @returns {any} Cached data or null
 */
const getFromCache = (key) => {
  const cachedItem = localStorage.getItem(key);
  if (!cachedItem) return null;
  
  try {
    const { data } = JSON.parse(cachedItem);
    return data;
  } catch (e) {
    return null;
  }
};

/**
 * Leaderboard-related API calls
 */
const leaderboardAPI = {
  /**
   * Get current leaderboard with pagination
   * @param {Object} options - Request options
   * @param {number} [options.limit=20] - Number of results per page
   * @param {number} [options.page=1] - Page number
   * @param {string} [options.rankTier] - Filter by rank tier
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force refresh
   * @returns {Promise<Object>} Leaderboard data
   */
  getLeaderboard: async (options = {}) => {
    const { 
      limit = 20, 
      page = 1, 
      rankTier = null,
      useCache = true,
      forceRefresh = false
    } = options;

    // Create the endpoint
    const endpoint = '/leaderboard';
    const params = { limit, page };
    if (rankTier) params.rankTier = rankTier;
    
    // Create cache key with params
    const paramString = `_limit${limit}_page${page}${rankTier ? `_tier${rankTier}` : ''}`;
    const currentCacheKey = `${LEADERBOARD_CACHE_KEY}${paramString}`;
    const currentEtagKey = `${LEADERBOARD_ETAG_KEY}${paramString}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(currentCacheKey, LEADERBOARD_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(currentCacheKey);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(currentCacheKey);
      
      const setCachedData = (data) => updateCache(currentCacheKey, data);
      
      return fetchWithETagAndCache(
        endpoint,
        currentEtagKey,
        getCachedData,
        setCachedData,
        { params }
      );
    }
    
    // If forcing refresh, set Cache-Control header
    if (forceRefresh) {
      const response = await processResponse(api.get(endpoint, {
        params,
        headers: { 'Cache-Control': 'no-cache' }
      }));
      
      if (response.success && response.data) {
        updateCache(currentCacheKey, response.data);
      }
      
      return response;
    }
    
    // Regular request without caching
    const response = await processResponse(api.get(endpoint, { params }));
    
    if (response.success && response.data) {
      updateCache(currentCacheKey, response.data);
    }
    
    return response;
  },

  /**
   * Get historical leaderboard for a specific period
   * @param {Object} options - Request options
   * @param {string} options.period - Time period ('daily', 'weekly', 'monthly', 'all_time')
   * @param {number} [options.limit=20] - Number of results per page
   * @param {number} [options.page=1] - Page number
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force refresh
   * @returns {Promise<Object>} Historical leaderboard data
   */
  getHistoricalLeaderboard: async (options = {}) => {
    const { 
      period, 
      limit = 20, 
      page = 1,
      useCache = true,
      forceRefresh = false
    } = options;
    
    if (!period || !['daily', 'weekly', 'monthly', 'all_time'].includes(period)) {
      return {
        success: false,
        error: 'Invalid period. Must be one of: daily, weekly, monthly, all_time'
      };
    }
    
    // Create the endpoint
    const endpoint = `/leaderboard/history/${period}`;
    const params = { limit, page };
    
    // Create cache key with params
    const paramString = `_${period}_limit${limit}_page${page}`;
    const currentCacheKey = `${LEADERBOARD_CACHE_KEY}_history${paramString}`;
    const currentEtagKey = `${LEADERBOARD_ETAG_KEY}_history${paramString}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(currentCacheKey);
      
      const setCachedData = (data) => updateCache(currentCacheKey, data);
      
      return fetchWithETagAndCache(
        endpoint,
        currentEtagKey,
        getCachedData,
        setCachedData,
        { params }
      );
    }
    
    // Regular request without caching or forced refresh
    const requestConfig = forceRefresh 
      ? { params, headers: { 'Cache-Control': 'no-cache' } }
      : { params };
      
    const response = await processResponse(api.get(endpoint, requestConfig));
    
    if (response.success && response.data) {
      updateCache(currentCacheKey, response.data);
    }
    
    return response;
  },

  /**
   * Get user rank by ID
   * @param {string} userId - User ID
   * @param {boolean} [useCache=true] - Whether to use cache
   * @param {boolean} [forceRefresh=false] - Whether to force refresh
   * @returns {Promise<Object>} User rank data
   */
  getUserRank: async (userId, useCache = true, forceRefresh = false) => {
    // Create cache key with user ID
    const currentCacheKey = `${LEADERBOARD_CACHE_KEY}_user_${userId}`;
    const currentEtagKey = `${LEADERBOARD_ETAG_KEY}_user_${userId}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(currentCacheKey, LEADERBOARD_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(currentCacheKey);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(currentCacheKey);
      
      const setCachedData = (data) => updateCache(currentCacheKey, data);
      
      return fetchWithETagAndCache(
        `/leaderboard/user/${userId}`,
        currentEtagKey,
        getCachedData,
        setCachedData
      );
    }
    
    // Regular request without caching or forced refresh
    const requestConfig = forceRefresh 
      ? { headers: { 'Cache-Control': 'no-cache' } }
      : {};
      
    const response = await processResponse(api.get(`/leaderboard/user/${userId}`, requestConfig));
    
    if (response.success && response.data) {
      updateCache(currentCacheKey, response.data);
    }
    
    return response;
  },

  /**
   * Get current user's rank
   * @param {boolean} [useCache=true] - Whether to use cache
   * @param {boolean} [forceRefresh=false] - Whether to force refresh
   * @returns {Promise<Object>} Current user's rank data
   */
  getMyRank: async (useCache = true, forceRefresh = false) => {
    // Create cache key
    const currentCacheKey = `${LEADERBOARD_CACHE_KEY}_my_rank`;
    const currentEtagKey = `${LEADERBOARD_ETAG_KEY}_my_rank`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(currentCacheKey, LEADERBOARD_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(currentCacheKey);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(currentCacheKey);
      
      const setCachedData = (data) => updateCache(currentCacheKey, data);
      
      return fetchWithETagAndCache(
        '/leaderboard/me',
        currentEtagKey,
        getCachedData,
        setCachedData
      );
    }
    
    // Regular request without caching or forced refresh
    const requestConfig = forceRefresh 
      ? { headers: { 'Cache-Control': 'no-cache' } }
      : {};
      
    const response = await processResponse(api.get('/leaderboard/me', requestConfig));
    
    if (response.success && response.data) {
      updateCache(currentCacheKey, response.data);
    }
    
    return response;
  },

  /**
   * Get available rank tiers
   * @param {boolean} [useCache=true] - Whether to use cache
   * @param {boolean} [forceRefresh=false] - Whether to force refresh
   * @returns {Promise<Object>} Rank tiers data
   */
  getRankTiers: async (useCache = true, forceRefresh = false) => {
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(RANK_TIERS_CACHE_KEY, RANK_TIERS_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(RANK_TIERS_CACHE_KEY);
        if (cachedData) {
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(RANK_TIERS_CACHE_KEY);
      
      const setCachedData = (data) => updateCache(RANK_TIERS_CACHE_KEY, data);
      
      return fetchWithETagAndCache(
        '/leaderboard/tiers',
        RANK_TIERS_ETAG_KEY,
        getCachedData,
        setCachedData
      );
    }
    
    // Regular request without caching or forced refresh
    const requestConfig = forceRefresh 
      ? { headers: { 'Cache-Control': 'no-cache' } }
      : {};
      
    const response = await processResponse(api.get('/leaderboard/tiers', requestConfig));
    
    if (response.success && response.data) {
      updateCache(RANK_TIERS_CACHE_KEY, response.data);
    }
    
    return response;
  },

  /**
   * Clear all leaderboard related caches
   */
  clearLeaderboardCaches: () => {
    // Find and clear all leaderboard cache entries
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(LEADERBOARD_CACHE_KEY) || 
          key.startsWith(`${LEADERBOARD_CACHE_KEY}_`) ||
          key.startsWith(`etag_${LEADERBOARD_ETAG_KEY}`) ||
          key.startsWith(`etag_${LEADERBOARD_ETAG_KEY}_`)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear rank tiers cache
    localStorage.removeItem(RANK_TIERS_CACHE_KEY);
    localStorage.removeItem(`${RANK_TIERS_CACHE_KEY}_timestamp`);
    localStorage.removeItem(`etag_${RANK_TIERS_ETAG_KEY}`);
  }
};

export default leaderboardAPI; 