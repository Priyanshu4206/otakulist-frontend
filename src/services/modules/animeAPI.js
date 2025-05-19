import api from '../axiosInstance';
import { processResponse } from '../responseHandler';
import { fetchWithETagAndCache } from '../conditionalFetch';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[ANIME API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

// Cache constants
const ANIME_DETAILS_CACHE_KEY = 'anime_details';
const ANIME_DETAILS_ETAG_KEY = 'anime_details';
const ANIME_DETAILS_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
 * Anime-related API calls
 */
const animeAPI = {
  /**
   * Get anime by ID
   * @param {string} animeId
   * @param {Object} [options] - Options
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} Anime details
   */
  getAnimeById: async (animeId, options = {}) => {
    const { useCache = true, forceRefresh = false } = options;
    logger("Anime", "Getting anime by ID", { animeId, useCache, forceRefresh });
    
    const specificCacheKey = `${ANIME_DETAILS_CACHE_KEY}_${animeId}`;
    const specificEtagKey = `${ANIME_DETAILS_ETAG_KEY}_${animeId}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, ANIME_DETAILS_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = localStorage.getItem(specificCacheKey);
        if (cachedData) {
          logger("Anime", "Using cached anime data", { animeId });
          return {
            success: true,
            data: JSON.parse(cachedData),
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => {
        const cachedData = localStorage.getItem(specificCacheKey);
        return cachedData ? JSON.parse(cachedData) : null;
      };
      
      const setCachedData = (data) => {
        localStorage.setItem(specificCacheKey, JSON.stringify(data));
        updateCacheTimestamp(specificCacheKey);
      };
      
      return fetchWithETagAndCache(
        `/anime/${animeId}`,
        specificEtagKey,
        getCachedData,
        setCachedData
      );
    }
    
    // If forcing refresh, set Cache-Control header
    if (forceRefresh) {
      const response = await processResponse(api.get(`/anime/${animeId}`, {
        headers: { 'Cache-Control': 'no-cache' }
      }));
      
      if (response.success && response.data) {
        localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
        updateCacheTimestamp(specificCacheKey);
      }
      
      return response;
    }
    
    // Regular request without caching
    const response = await processResponse(api.get(`/anime/${animeId}`));
    
    if (response.success && response.data) {
      localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
      updateCacheTimestamp(specificCacheKey);
    }
    
    return response;
  },

  /**
   * Get anime episodes
   * @param {string} animeId
   * @param {number} [page=1]
   * @returns {Promise<Object>} Anime episodes with pagination
   */
  getEpisodes: (animeId, page = 1) => {
    logger("Episodes", "Getting anime episodes", { animeId, page });
    return processResponse(api.get(`/anime/${animeId}/episodes`, { params: { page } }));
  },
  
  /**
   * Get similar anime
   * @param {string} animeId
   * @returns {Promise<Object>} Similar anime
   */
  getSimilar: (animeId) => {
    logger("Similar", "Getting similar anime", { animeId });
    return processResponse(api.get(`/anime/${animeId}/similar`));
  },

  /**
   * Get anime recommendations
   * @param {string} animeId
   * @returns {Promise<Object>} Anime recommendations
   */
  getRecommendations: (animeId) => {
    logger("Recommendations", "Getting anime recommendations", { animeId });
    return processResponse(api.get(`/anime/${animeId}/recommendations`));
  },

  /**
   * Get anime staff
   * @param {string} animeId
   * @returns {Promise<Object>} Anime staff
   */
  getStaff: (animeId) => {
    logger("Staff", "Getting anime staff", { animeId });
    return processResponse(api.get(`/anime/${animeId}/staff`));
  },

  /**
   * Rate an anime
   * @param {string} animeId
   * @param {Object} ratingData - Including score and comment
   * @returns {Promise<Object>} Rating result
   */
  rateAnime: (animeId, ratingData) => {
    logger("Rating", "Rating anime", { animeId, ratingData });
    return processResponse(api.post(`/anime/${animeId}/rate`, ratingData));
  },

  /**
   * Delete rating for an anime
   * @param {string} animeId
   * @returns {Promise<Object>} Deletion result
   */
  deleteRating: (animeId) => {
    logger("Rating", "Deleting rating for anime", { animeId });
    return processResponse(api.delete(`/anime/${animeId}/rate`));
  },

  /**
   * Get reviews for an anime
   * @param {string} animeId
   * @param {number} [page=1]
   * @returns {Promise<Object>} Anime reviews with pagination
   */
  getReviews: (animeId, page = 1) => {
    logger("Reviews", "Getting anime reviews", { animeId, page });
    return processResponse(api.get(`/anime/${animeId}/reviews`, { params: { page } }));
  },

  /**
   * Get random anime
   * @returns {Promise<Object>} Random anime
   */
  getRandomAnime: () => {
    logger("Random", "Getting random anime");
    return processResponse(api.get('/anime/random'));
  },
  
  /**
   * Clear anime cache for a specific anime
   * @param {string} animeId
   */
  clearAnimeCache: (animeId) => {
    if (!animeId) return;
    
    logger("Cache", "Clearing anime cache", { animeId });
    const cacheKey = `${ANIME_DETAILS_CACHE_KEY}_${animeId}`;
    const etagKey = `${ANIME_DETAILS_ETAG_KEY}_${animeId}`;
    
    // Remove cache data
    localStorage.removeItem(cacheKey);
    localStorage.removeItem(`${cacheKey}_timestamp`);
    
    // Remove ETag
    localStorage.removeItem(`etag_${etagKey}`);
  },
  
  /**
   * Clear all anime-related caches
   */
  clearAllCaches: () => {
    logger("Cache", "Clearing all anime-related caches");
    
    // Clear anime details cache
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(ANIME_DETAILS_CACHE_KEY) || 
          key.startsWith(`${ANIME_DETAILS_CACHE_KEY}_timestamp`)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear all anime-related ETags
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(`etag_${ANIME_DETAILS_ETAG_KEY}`)) {
        localStorage.removeItem(key);
      }
    });
  },

  /**
   * Get characters by anime ID
   * @param {string} animeId - ID of the anime to get characters for
   * @param {Object} [options] - Options for the request
   * @param {number} [options.page=1] - Page number for pagination
   * @param {number} [options.limit=20] - Number of items per page
   * @param {boolean} [options.mainOnly=true] - Whether to fetch only main characters
   * @returns {Promise<Object>} Anime characters with pagination
   */
  getCharactersByAnime: (animeId, options = {}) => {
    const { page = 1, limit = 20, mainOnly = true } = options;
    logger("Characters", "Getting anime characters", { animeId, page, limit, mainOnly });
    
    return processResponse(api.get(`/characters/anime/${animeId}`, { 
      params: { 
        page, 
        limit, 
        mainOnly: mainOnly.toString() 
      } 
    }));
  }
};

export default animeAPI;