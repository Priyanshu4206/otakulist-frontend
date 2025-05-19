import api from '../axiosInstance';
import { processResponse } from '../responseHandler';
import { fetchWithETagAndCache } from '../conditionalFetch';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[GENRE API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

// Cache constants
const GENRES_LIST_CACHE_KEY = 'genres_list';
const GENRES_LIST_ETAG_KEY = 'genres_list';
const GENRES_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

const GENRE_DETAIL_CACHE_KEY = 'genre_detail';
const GENRE_DETAIL_ETAG_KEY = 'genre_detail';
const GENRE_DETAIL_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days

const POPULAR_GENRES_CACHE_KEY = 'popular_genres';
const POPULAR_GENRES_ETAG_KEY = 'popular_genres';
const POPULAR_GENRES_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
 * Genre-related API calls
 */
const genreAPI = {
  /**
   * Get all genres
   * @param {Object} [options] - Options
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} All genres
   */
  getAllGenres: async (options = {}) => {
    const { useCache = true, forceRefresh = false } = options;
    logger("Genres", "Getting all genres", { useCache, forceRefresh });
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(GENRES_LIST_CACHE_KEY, GENRES_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(GENRES_LIST_CACHE_KEY);
        if (cachedData) {
          logger("Genres", "Using cached genres data");
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(GENRES_LIST_CACHE_KEY);
      
      const setCachedData = (data) => updateCache(GENRES_LIST_CACHE_KEY, data);
      
      return fetchWithETagAndCache(
        '/genres',
        GENRES_LIST_ETAG_KEY,
        getCachedData,
        setCachedData
      );
    }
    
    // If forcing refresh, set Cache-Control header
    if (forceRefresh) {
      const response = await processResponse(api.get('/genres', {
        headers: { 'Cache-Control': 'no-cache' }
      }));
      
      if (response.success && response.data) {
        updateCache(GENRES_LIST_CACHE_KEY, response.data);
      }
      
      return response;
    }
    
    // Regular request without caching
    const response = await processResponse(api.get('/genres'));
    
    if (response.success && response.data) {
      updateCache(GENRES_LIST_CACHE_KEY, response.data);
    }
    
    return response;
  },

  /**
   * Get genre by ID
   * @param {string} genreId
   * @param {Object} [options] - Options
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} Genre details
   */
  getGenreById: async (genreId, options = {}) => {
    const { useCache = true, forceRefresh = false } = options;
    logger("Genre", "Getting genre by ID", { genreId, useCache, forceRefresh });
    
    const specificCacheKey = `${GENRE_DETAIL_CACHE_KEY}_${genreId}`;
    const specificEtagKey = `${GENRE_DETAIL_ETAG_KEY}_${genreId}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, GENRE_DETAIL_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(specificCacheKey);
        if (cachedData) {
          logger("Genre", "Using cached genre data", { genreId });
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(specificCacheKey);
      
      const setCachedData = (data) => updateCache(specificCacheKey, data);
      
      return fetchWithETagAndCache(
        `/genres/${genreId}`,
        specificEtagKey,
        getCachedData,
        setCachedData
      );
    }
    
    // Regular request or forced refresh
    const response = await processResponse(api.get(`/genres/${genreId}`, {
      headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
    }));
    
    if (response.success && response.data) {
      updateCache(specificCacheKey, response.data);
    }
    
    return response;
  },

  /**
   * Get popular genres
   * @param {number} [limit=10]
   * @param {Object} [options] - Options
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} Popular genres
   */
  getPopularGenres: async (limit = 10, options = {}) => {
    const { useCache = true, forceRefresh = false } = options;
    logger("Genres", "Getting popular genres", { limit, useCache, forceRefresh });
    
    const specificCacheKey = `${POPULAR_GENRES_CACHE_KEY}_${limit}`;
    const specificEtagKey = `${POPULAR_GENRES_ETAG_KEY}_${limit}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, POPULAR_GENRES_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(specificCacheKey);
        if (cachedData) {
          logger("Genres", "Using cached popular genres data");
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(specificCacheKey);
      
      const setCachedData = (data) => updateCache(specificCacheKey, data);
      
      return fetchWithETagAndCache(
        '/genres/popular',
        specificEtagKey,
        getCachedData,
        setCachedData,
        { params: { limit } }
      );
    }
    
    // Regular request or forced refresh
    const response = await processResponse(api.get('/genres/popular', {
      params: { limit },
      headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
    }));
    
    if (response.success && response.data) {
      updateCache(specificCacheKey, response.data);
    }
    
    return response;
  },

  /**
   * Get anime by genre
   * @param {string} genreId
   * @param {number} [page=1]
   * @param {number} [limit=20]
   * @returns {Promise<Object>} Anime in genre with pagination
   */
  getAnimeByGenre: (genreId, page = 1, limit = 20) => {
    logger("Genre", "Getting anime by genre", { genreId, page, limit });
    return processResponse(api.get(`/genres/${genreId}/anime`, { params: { page, limit } }));
  },

  /**
   * Get popular anime by genre
   * @param {string} genreId
   * @param {number} [limit=10]
   * @returns {Promise<Object>} Popular anime in genre
   */
  getPopularAnimeByGenre: (genreId, limit = 10) => {
    logger("Genre", "Getting popular anime by genre", { genreId, limit });
    return processResponse(api.get(`/genres/${genreId}/popular`, { params: { limit } }));
  },

  /**
   * Get recommended anime based on user's genre preferences
   * @param {number} [limit=10]
   * @returns {Promise<Object>} Recommended anime
   */
  getRecommendedAnimeByGenres: (limit = 10) => {
    logger("Genre", "Getting recommended anime by genres", { limit });
    return processResponse(api.get('/genres/recommendations', { params: { limit } }));
  },

  /**
   * Update user's genre preferences
   * @param {Array} genreIds - Array of genre IDs
   * @returns {Promise<Object>} Updated preferences
   */
  updateGenrePreferences: (genreIds) => {
    logger("Genre", "Updating genre preferences", { genreCount: genreIds.length });
    return processResponse(api.patch('/users/genre-preferences', { genreIds }));
  },

  /**
   * Get user's genre preferences
   * @returns {Promise<Object>} User's genre preferences
   */
  getUserGenrePreferences: () => {
    logger("Genre", "Getting user genre preferences");
    return processResponse(api.get('/users/genre-preferences'));
  },
  
  /**
   * Clear genre cache
   * @param {string} [genreId] - Specific genre ID to clear, or all genres if not specified
   */
  clearGenreCache: (genreId) => {
    if (genreId) {
      // Clear specific genre
      logger("Cache", "Clearing genre cache", { genreId });
      const cacheKey = `${GENRE_DETAIL_CACHE_KEY}_${genreId}`;
      const etagKey = `${GENRE_DETAIL_ETAG_KEY}_${genreId}`;
      
      // Remove cache data
      localStorage.removeItem(cacheKey);
      localStorage.removeItem(`${cacheKey}_timestamp`);
      
      // Remove ETag
      localStorage.removeItem(`etag_${etagKey}`);
    } else {
      // Clear all genre caches
      logger("Cache", "Clearing all genre caches");
      
      // Clear genres list cache
      localStorage.removeItem(GENRES_LIST_CACHE_KEY);
      localStorage.removeItem(`${GENRES_LIST_CACHE_KEY}_timestamp`);
      localStorage.removeItem(`etag_${GENRES_LIST_ETAG_KEY}`);
      
      // Clear popular genres cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(POPULAR_GENRES_CACHE_KEY) || 
            key.startsWith(`${POPULAR_GENRES_CACHE_KEY}_timestamp`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Find and remove all genre detail caches
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(GENRE_DETAIL_CACHE_KEY) || 
            key.startsWith(`${GENRE_DETAIL_CACHE_KEY}_timestamp`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Find and remove all genre ETags
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`etag_${GENRE_DETAIL_ETAG_KEY}`) || 
            key.startsWith(`etag_${POPULAR_GENRES_ETAG_KEY}`)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
};

export default genreAPI; 