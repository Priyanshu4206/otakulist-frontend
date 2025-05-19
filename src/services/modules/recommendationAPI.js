import api from '../axiosInstance';
import { processResponse } from '../responseHandler';
import { fetchWithETagAndCache } from '../conditionalFetch';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[RECOMMENDATION API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

// Cache constants
const RECOMMENDATIONS_CACHE_KEY = 'personalized_recommendations';
const RECOMMENDATIONS_ETAG_KEY = 'recommendations_etag';
const RECOMMENDATIONS_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

// Trending cache constants
const TRENDING_CACHE_KEY = 'trending_anime';
const TRENDING_ETAG_KEY = 'trending_etag';
const TRENDING_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

// Seasonal cache constants
const SEASONAL_CACHE_KEY = 'seasonal_anime';
const SEASONAL_ETAG_KEY = 'seasonal_etag';
const SEASONAL_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Check if cache is expired
 * @param {string} key - Cache key to check
 * @param {number} ttl - Time to live in milliseconds
 * @returns {boolean} True if cache is expired
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
 * Recommendation API-related calls
 */
const recommendationAPI = {
  /**
   * Get personalized anime recommendations for the current user
   * @param {Object} [options] - Options
   * @param {number} [options.limit=20] - Number of recommendations
   * @param {boolean} [options.includeDetails=true] - Include anime details
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} Personalized recommendations
   */
  getPersonalizedRecommendations: async (options = {}) => {
    const {
      limit = 20,
      includeDetails = true,
      useCache = true,
      forceRefresh = false
    } = options;
    
    logger("Personal", "Getting personalized recommendations", { limit, includeDetails });
    
    const specificCacheKey = `${RECOMMENDATIONS_CACHE_KEY}_${limit}_${includeDetails}`;
    const specificEtagKey = `${RECOMMENDATIONS_ETAG_KEY}_${limit}_${includeDetails}`;
    
    // For demo purposes, simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock data
        const mockResults = Array.from({ length: limit }, (_, i) => ({
          id: `anime-${i + 1}`,
          title: `Recommended Anime ${i + 1}`,
          image: `https://via.placeholder.com/200x300?text=RecAnime${i + 1}`,
          score: (Math.random() * 5 + 5).toFixed(2),
          year: 2020 + Math.floor(Math.random() * 4),
          genres: ['Action', 'Adventure', 'Fantasy'],
          matchScore: Math.floor(Math.random() * 30 + 70) // Match percentage 70-100%
        }));
        
        resolve({
          success: true,
          data: mockResults
        });
      }, 600); // Simulate network delay
    });
  },
  
  /**
   * Get trending anime
   * @param {Object} [options] - Options
   * @param {number} [options.limit=20] - Number of results
   * @param {string} [options.timeframe='weekly'] - Timeframe (daily, weekly, monthly)
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} Trending anime
   */
  getTrendingAnime: async (options = {}) => {
    const {
      limit = 20,
      timeframe = 'weekly',
      useCache = true,
      forceRefresh = false
    } = options;
    
    logger("Trending", "Getting trending anime", { limit, timeframe });
    
    const specificCacheKey = `${TRENDING_CACHE_KEY}_${timeframe}_${limit}`;
    const specificEtagKey = `${TRENDING_ETAG_KEY}_${timeframe}_${limit}`;
    
    // For demo purposes, simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock data
        const mockResults = Array.from({ length: limit }, (_, i) => ({
          id: `anime-${i + 1}`,
          title: `Trending Anime ${i + 1}`,
          image: `https://via.placeholder.com/200x300?text=TrendAnime${i + 1}`,
          score: (Math.random() * 5 + 5).toFixed(2),
          rankChange: Math.floor(Math.random() * 10) - 5, // -5 to +5 rank change
          rank: i + 1,
          genres: ['Action', 'Adventure', 'Fantasy'],
          year: 2020 + Math.floor(Math.random() * 4)
        }));
        
        resolve({
          success: true,
          data: mockResults,
          timeframe
        });
      }, 400); // Simulate network delay
    });
  },
  
  /**
   * Get seasonal anime
   * @param {Object} [options] - Options
   * @param {number} [options.limit=20] - Number of results
   * @param {string} [options.season='current'] - Season (winter, spring, summer, fall, current, next)
   * @param {number} [options.year] - Year (defaults to current year)
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} Seasonal anime
   */
  getSeasonalAnime: async (options = {}) => {
    const {
      limit = 20,
      season = 'current',
      year = new Date().getFullYear(),
      useCache = true,
      forceRefresh = false
    } = options;
    
    logger("Seasonal", "Getting seasonal anime", { limit, season, year });
    
    const specificCacheKey = `${SEASONAL_CACHE_KEY}_${season}_${year}_${limit}`;
    const specificEtagKey = `${SEASONAL_ETAG_KEY}_${season}_${year}_${limit}`;
    
    // For demo purposes, simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock data
        const mockResults = Array.from({ length: limit }, (_, i) => ({
          id: `anime-${i + 1}`,
          title: `${season.charAt(0).toUpperCase() + season.slice(1)} ${year} Anime ${i + 1}`,
          image: `https://via.placeholder.com/200x300?text=Season${i + 1}`,
          score: (Math.random() * 5 + 5).toFixed(2),
          genres: ['Action', 'Adventure', 'Fantasy'],
          year,
          airing: {
            day: Math.floor(Math.random() * 7),
            time: `${String(Math.floor(Math.random() * 24)).padStart(2, '0')}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`
          }
        }));
        
        resolve({
          success: true,
          data: mockResults,
          season,
          year
        });
      }, 500); // Simulate network delay
    });
  },
  
  /**
   * Get new to anime recommendations
   * @param {Object} [options] - Options
   * @param {number} [options.limit=10] - Number of results
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @returns {Promise<Object>} New to anime recommendations
   */
  getNewToAnimeRecommendations: async (options = {}) => {
    const { limit = 10, useCache = true } = options;
    
    logger("New", "Getting new to anime recommendations", { limit });
    
    // For demo purposes, simulate API delay
    return new Promise((resolve) => {
      setTimeout(() => {
        // Generate mock data for beginner-friendly anime
        const mockResults = Array.from({ length: limit }, (_, i) => ({
          id: `anime-${i + 1}`,
          title: `Beginner Anime ${i + 1}`,
          image: `https://via.placeholder.com/200x300?text=BeginnerAnime${i + 1}`,
          score: (Math.random() * 5 + 5).toFixed(2),
          year: 2015 + Math.floor(Math.random() * 8),
          genres: ['Action', 'Adventure', 'Fantasy'],
          beginnerFriendly: true,
          description: 'A perfect anime for beginners to the medium.'
        }));
        
        resolve({
          success: true,
          data: mockResults
        });
      }, 300); // Simulate network delay
    });
  },
  
  /**
   * Clear recommendation cache
   * @param {string} [type] - Specific type to clear, or all if not specified
   */
  clearRecommendationCache: (type) => {
    if (type) {
      // Clear cache for a specific recommendation type
      let cacheKey;
      let etagKey;
      
      switch (type.toLowerCase()) {
        case 'personalized':
          cacheKey = RECOMMENDATIONS_CACHE_KEY;
          etagKey = RECOMMENDATIONS_ETAG_KEY;
          break;
        case 'trending':
          cacheKey = TRENDING_CACHE_KEY;
          etagKey = TRENDING_ETAG_KEY;
          break;
        case 'seasonal':
          cacheKey = SEASONAL_CACHE_KEY;
          etagKey = SEASONAL_ETAG_KEY;
          break;
        default:
          return; // Unknown type
      }
      
      logger("Cache", `Clearing ${type} recommendation cache`);
      
      // Find and remove all matching cache entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(cacheKey) || key.startsWith(`${cacheKey}_timestamp`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Find and remove all matching ETag entries
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`etag_${etagKey}`)) {
          localStorage.removeItem(key);
        }
      });
    } else {
      // Clear all recommendation caches
      logger("Cache", "Clearing all recommendation caches");
      
      // Clear personalized recommendations cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(RECOMMENDATIONS_CACHE_KEY) || 
            key.startsWith(`${RECOMMENDATIONS_CACHE_KEY}_timestamp`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear trending cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(TRENDING_CACHE_KEY) || 
            key.startsWith(`${TRENDING_CACHE_KEY}_timestamp`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear seasonal cache
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(SEASONAL_CACHE_KEY) || 
            key.startsWith(`${SEASONAL_CACHE_KEY}_timestamp`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Clear all recommendation ETags
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`etag_${RECOMMENDATIONS_ETAG_KEY}`) || 
            key.startsWith(`etag_${TRENDING_ETAG_KEY}`) ||
            key.startsWith(`etag_${SEASONAL_ETAG_KEY}`)) {
          localStorage.removeItem(key);
        }
      });
    }
  }
};

export default recommendationAPI; 