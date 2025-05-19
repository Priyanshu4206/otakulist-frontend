import api from '../axiosInstance';
import { processResponse } from '../responseHandler';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[SEARCH API] ${area} | ${action}`;
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

// Cache constants
const ANIME_SEARCH_CACHE_KEY = 'anime_search';
const ANIME_SEARCH_CACHE_TTL = 15 * 60 * 1000; // 15 minutes

const USER_SEARCH_CACHE_KEY = 'user_search';
const USER_SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const PLAYLIST_SEARCH_CACHE_KEY = 'playlist_search';
const PLAYLIST_SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

const COMBINED_SEARCH_CACHE_KEY = 'combined_search';
const COMBINED_SEARCH_CACHE_TTL = 10 * 60 * 1000; // 10 minutes

/**
 * Check if a cached item has expired
 * @param {string} key - Cache key to check
 * @param {number} ttl - Time to live in milliseconds
 * @returns {boolean} True if expired, false otherwise
 */
const isCacheExpired = (key, ttl) => {
  const timestampKey = `${key}_timestamp`;
  const timestamp = localStorage.getItem(timestampKey);
  if (!timestamp) return true;
  
  const now = Date.now();
  return now - parseInt(timestamp, 10) > ttl;
};

/**
 * Update cache timestamp
 * @param {string} key - Cache key to update
 */
const updateCacheTimestamp = (key) => {
  const timestampKey = `${key}_timestamp`;
  localStorage.setItem(timestampKey, Date.now().toString());
};

/**
 * Search API service for anime, users, and playlists
 */
const searchAPI = {
  /**
   * Search for anime based on query and filters
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {Object} options.filters - Additional filters
   * @param {number} options.page - Page number
   * @param {number} options.limit - Results per page
   * @param {string} options.sort - Sort order
   * @param {boolean} options.useCache - Whether to use cache
   * @returns {Promise<Object>} Search results
   */
  searchAnime: async (options = {}) => {
    const {
      query = '',
      filters = {},
      page = 1,
      limit = 20,
      sort = 'score',
      useCache = true
    } = options;
    
    logger("Anime", "Searching anime", { query, filters, page, limit, sort });
    
    const params = {
      q: query,
      page,
      limit,
      sort,
      ...filters
    };
    
    // Create cache key specific to this request
    const cacheKeySuffix = `_${query}_${JSON.stringify(filters)}_${page}_${limit}_${sort}`;
    const specificCacheKey = `${ANIME_SEARCH_CACHE_KEY}${cacheKeySuffix}`;
    
    // Check if cache should be used
    if (useCache) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, ANIME_SEARCH_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = localStorage.getItem(specificCacheKey);
        if (cachedData) {
          logger("Anime", "Using cached search results", { query });
          return {
            success: true,
            data: JSON.parse(cachedData),
            fromCache: true
          };
        }
      }
    }
    
    // Direct request without ETag (due to backend issue)
    try {
      const response = await processResponse(api.get('/search', { params }));
      
      if (response.success && response.data) {
        // Store the response in cache
        localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
        updateCacheTimestamp(specificCacheKey);
        
        // Standardize the pagination format in response for easier use by consumer
        const data = response.data;
        if (data.items && data.pagination) {
          // New API format with items and pagination
          return {
            success: true,
            data: data,
            pagination: {
              page: data.pagination.current_page || 1,
              pages: data.pagination.last_visible_page || 1,
              limit: data.pagination.items.per_page || limit,
              total: data.pagination.items.total || 0
            }
          };
        }
      }
      
      return response;
    } catch (error) {
      console.error('Error searching anime:', error);
      throw error;
    }
  },
  
  /**
   * Search for users
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {number} options.page - Page number
   * @param {number} options.limit - Results per page
   * @param {boolean} options.useCache - Whether to use cache
   * @returns {Promise<Object>} User search results
   */
  searchUsers: async (options = {}) => {
    const {
      query = '',
      page = 1,
      limit = 20,
      useCache = true
    } = options;
    
    logger("Users", "Searching users", { query, page, limit });
    
    if (!query || query.length < 2) {
      return { success: true, data: { users: [], pagination: { total: 0 } } };
    }
    
    const params = {
      q: query,
      page,
      limit
    };
    
    // Create cache key specific to this request
    const cacheKeySuffix = `_${query}_${page}_${limit}`;
    const specificCacheKey = `${USER_SEARCH_CACHE_KEY}${cacheKeySuffix}`;
    
    // Check if cache should be used
    if (useCache) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, USER_SEARCH_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = localStorage.getItem(specificCacheKey);
        if (cachedData) {
          logger("Users", "Using cached search results", { query });
          return {
            success: true,
            data: JSON.parse(cachedData),
            fromCache: true
          };
        }
      }
    }
    
    // Direct request without ETag (due to backend issue)
    try {
      const response = await processResponse(api.get('/search/users', { params }));
      
      if (response.success && response.data) {
        // Store the response in cache
        localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
        updateCacheTimestamp(specificCacheKey);
      }
      
      return response;
    } catch (error) {
      console.error('Error searching users:', error);
      throw error;
    }
  },
  
  /**
   * Search for playlists
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.tags - Comma-separated tags
   * @param {number} options.page - Page number
   * @param {number} options.limit - Results per page
   * @param {boolean} options.useCache - Whether to use cache
   * @returns {Promise<Object>} Playlist search results
   */
  searchPlaylists: async (options = {}) => {
    const {
      query = '',
      tags = '',
      page = 1,
      limit = 20,
      useCache = true
    } = options;
    
    logger("Playlists", "Searching playlists", { query, tags, page, limit });
    
    // Either query or tags must be provided
    if ((!query || query.length < 2) && !tags) {
      return { success: true, data: { playlists: [], pagination: { total: 0 } } };
    }
    
    const params = {
      page,
      limit
    };
    
    if (query && query.length >= 2) {
      params.q = query;
    }
    
    if (tags) {
      params.tags = tags;
    }
    
    // Create cache key specific to this request
    const cacheKeySuffix = `_${query}_${tags}_${page}_${limit}`;
    const specificCacheKey = `${PLAYLIST_SEARCH_CACHE_KEY}${cacheKeySuffix}`;
    
    // Check if cache should be used
    if (useCache) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, PLAYLIST_SEARCH_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = localStorage.getItem(specificCacheKey);
        if (cachedData) {
          logger("Playlists", "Using cached search results", { query, tags });
          return {
            success: true,
            data: JSON.parse(cachedData),
            fromCache: true
          };
        }
      }
    }
    
    // Direct request without ETag (due to backend issue)
    try {
      const response = await processResponse(api.get('/search/playlists', { params }));
      
      if (response.success && response.data) {
        localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
        updateCacheTimestamp(specificCacheKey);
      }
      
      return response;
    } catch (error) {
      console.error('Error searching playlists:', error);
      throw error;
    }
  },
  
  /**
   * Combined search for anime, users, and playlists
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.type - Search type (all, users, playlists)
   * @param {number} options.page - Page number
   * @param {number} options.limit - Results per page
   * @param {boolean} options.useCache - Whether to use cache
   * @returns {Promise<Object>} Combined search results
   */
  combinedSearch: async (options = {}) => {
    const {
      query = '',
      type = 'all',
      page = 1,
      limit = 10,
      useCache = true
    } = options;
    
    logger("Combined", "Performing combined search", { query, type, page, limit });
    
    if (!query || query.length < 2) {
      return { 
        success: true, 
        data: { 
          anime: [],
          users: [], 
          playlists: [], 
          counts: { anime: 0, users: 0, playlists: 0, total: 0 } 
        } 
      };
    }
    
    const params = {
      q: query,
      type,
      page,
      limit
    };
    
    // Create cache key specific to this request
    const cacheKeySuffix = `_${query}_${type}_${page}_${limit}`;
    const specificCacheKey = `${COMBINED_SEARCH_CACHE_KEY}${cacheKeySuffix}`;
    
    // Check if cache should be used
    if (useCache) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, COMBINED_SEARCH_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = localStorage.getItem(specificCacheKey);
        if (cachedData) {
          logger("Combined", "Using cached combined search results", { query });
          return {
            success: true,
            data: JSON.parse(cachedData),
            fromCache: true
          };
        }
      }
    }
    
    // Direct request without ETag (due to backend issue)
    try {
      const response = await processResponse(api.get('/search/all', { params }));
      
      if (response.success && response.data) {
        localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
        updateCacheTimestamp(specificCacheKey);
      }
      
      return response;
    } catch (error) {
      console.error('Error performing combined search:', error);
      throw error;
    }
  },
  
  /**
   * Get anime details by ID
   * @param {string|number} id - Anime ID
   * @param {Object} options - Options
   * @param {string} options.timezone - Timezone for broadcast times
   * @param {boolean} options.useCache - Whether to use cache
   * @returns {Promise<Object>} Anime details
   */
  getAnimeById: async (id, options = {}) => {
    const {
      timezone = '',
      useCache = true
    } = options;
    
    logger("Anime", "Getting anime details by ID", { id, timezone });
    
    const params = {};
    if (timezone) {
      params.timezone = timezone;
    }
    
    // Create cache key specific to this request
    const cacheKeySuffix = `_${id}_${timezone}`;
    const specificCacheKey = `anime_details${cacheKeySuffix}`;
    
    // Check if cache should be used
    if (useCache) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, 30 * 60 * 1000); // 30 minutes
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = localStorage.getItem(specificCacheKey);
        if (cachedData) {
          logger("Anime", "Using cached anime details", { id });
          return {
            success: true,
            data: JSON.parse(cachedData),
            fromCache: true
          };
        }
      }
    }
    
    // Direct request without ETag (due to backend issue)
    try {
      const response = await processResponse(api.get(`/search/anime/${id}`, { params }));
      
      if (response.success && response.data) {
        localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
        updateCacheTimestamp(specificCacheKey);
      }
      
      return response;
    } catch (error) {
      console.error(`Error fetching anime details for ID ${id}:`, error);
      throw error;
    }
  },
  
  /**
   * Get random anime
   * @param {Object} options - Options
   * @param {boolean} options.useCache - Whether to use cache
   * @returns {Promise<Object>} Random anime
   */
  getRandomAnime: async (options = {}) => {
    const { useCache = false } = options;
    
    logger("Random", "Getting random anime");
    
    // No point in caching random anime, just make a direct request
    try {
      return await processResponse(api.get('/search/random'));
    } catch (error) {
      console.error('Error fetching random anime:', error);
      throw error;
    }
  },
  
  /**
   * Alias for combinedSearch for easier API interface
   * @param {Object} options - Search options
   * @returns {Promise<Object>} Combined search results
   */
  searchAll: function(options = {}) {
    return this.combinedSearch(options);
  },
  
  /**
   * Clear all search-related caches
   */
  clearAllCaches: () => {
    logger("Cache", "Clearing all search-related caches");
    
    // Clear anime search cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(ANIME_SEARCH_CACHE_KEY) || 
          key.startsWith(`${ANIME_SEARCH_CACHE_KEY}_timestamp`)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear user search cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(USER_SEARCH_CACHE_KEY) || 
          key.startsWith(`${USER_SEARCH_CACHE_KEY}_timestamp`)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear playlist search cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(PLAYLIST_SEARCH_CACHE_KEY) || 
          key.startsWith(`${PLAYLIST_SEARCH_CACHE_KEY}_timestamp`)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear combined search cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(COMBINED_SEARCH_CACHE_KEY) || 
          key.startsWith(`${COMBINED_SEARCH_CACHE_KEY}_timestamp`)) {
        localStorage.removeItem(key);
      }
    });
  }
};

export default searchAPI; 