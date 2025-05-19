import api from '../axiosInstance';
import { processResponse } from '../responseHandler';
import { fetchWithETagAndCache } from '../conditionalFetch';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[SCHEDULE API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

// Cache constants
const WEEKLY_SCHEDULE_CACHE_KEY = 'weekly_schedule';
const WEEKLY_SCHEDULE_ETAG_KEY = 'weekly_schedule';
const WEEKLY_SCHEDULE_CACHE_TTL = 12 * 60 * 60 * 1000; // 12 hours

const DAY_SCHEDULE_CACHE_KEY = 'day_schedule';
const DAY_SCHEDULE_ETAG_KEY = 'day_schedule';
const DAY_SCHEDULE_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

const SEASON_PREVIEW_CACHE_KEY = 'season_preview';
const SEASON_PREVIEW_ETAG_KEY = 'season_preview';
const SEASON_PREVIEW_CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

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
 * Schedule-related API calls
 */
const scheduleAPI = {
  /**
   * Get the weekly schedule
   * @param {Object} [options] - Options for filtering
   * @param {Object} [cacheOptions] - Caching options
   * @param {boolean} [cacheOptions.useCache=true] - Whether to use cache
   * @param {boolean} [cacheOptions.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} Weekly schedule
   */
  getWeeklySchedule: async (options = {}, cacheOptions = {}) => {
    const { useCache = true, forceRefresh = false } = cacheOptions;
    logger("Schedule", "Getting weekly schedule", { ...options, useCache, forceRefresh });
    
    // Generate cache key based on options
    const optionsKey = Object.keys(options).length > 0 
      ? `_${Object.entries(options).sort().map(([k, v]) => `${k}_${v}`).join('_')}` 
      : '';
    const specificCacheKey = `${WEEKLY_SCHEDULE_CACHE_KEY}${optionsKey}`;
    const specificEtagKey = `${WEEKLY_SCHEDULE_ETAG_KEY}${optionsKey}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, WEEKLY_SCHEDULE_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = localStorage.getItem(specificCacheKey);
        if (cachedData) {
          logger("Schedule", "Using cached weekly schedule data");
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
        '/schedule/weekly',
        specificEtagKey,
        getCachedData,
        setCachedData,
        { params: options }
      );
    }
    
    // Regular request or forced refresh
    const response = await processResponse(api.get('/schedule/weekly', { 
      params: options,
      headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
    }));
    
    // Cache the response if successful
    if (response.success && response.data) {
      localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
      updateCacheTimestamp(specificCacheKey);
    }
    
    return response;
  },

  /**
   * Get today's schedule
   * @param {string} [timezone] - User's timezone
   * @returns {Promise<Object>} Today's schedule
   */
  getTodaySchedule: (timezone) => {
    logger("Schedule", "Getting today's schedule", { timezone });
    return processResponse(api.get('/schedule/today', { 
      params: timezone ? { timezone } : undefined 
    }));
  },

  /**
   * Get schedule for a specific day
   * @param {string} day - Day of the week (monday, tuesday, etc.)
   * @param {string} [timezone] - User's timezone
   * @param {Object} [cacheOptions] - Caching options
   * @param {boolean} [cacheOptions.useCache=true] - Whether to use cache
   * @param {boolean} [cacheOptions.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} Day's schedule
   */
  getDaySchedule: async (day, timezone, cacheOptions = {}) => {
    const { useCache = true, forceRefresh = false } = cacheOptions;
    logger("Schedule", "Getting schedule for day", { day, timezone, useCache, forceRefresh });
    
    // Generate cache key based on day and timezone
    const timezoneKey = timezone ? `_${timezone}` : '';
    const specificCacheKey = `${DAY_SCHEDULE_CACHE_KEY}_${day.toLowerCase()}${timezoneKey}`;
    const specificEtagKey = `${DAY_SCHEDULE_ETAG_KEY}_${day.toLowerCase()}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, DAY_SCHEDULE_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = localStorage.getItem(specificCacheKey);
        if (cachedData) {
          logger("Schedule", "Using cached day schedule data");
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
        `/schedule`,
        specificEtagKey,
        getCachedData,
        setCachedData,
        { 
          params: { 
            day: day.toLowerCase(), 
            status: 'Currently Airing',
            ...(timezone ? { timezone } : {}) 
          } 
        }
      );      
    }
    
    // Regular request or forced refresh
    const response = await processResponse(api.get(`/schedule`, { 
      params: { 
        day: day.toLowerCase(),
        status: 'Currently Airing',
        ...(timezone ? { timezone } : {})
      },
      headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
    }));
    
    
    // Cache the response if successful
    if (response.success && response.data) {
      localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
      updateCacheTimestamp(specificCacheKey);
    }
    
    return response;
  },

  /**
   * Get schedule for a specific date
   * @param {string} date - Date in YYYY-MM-DD format
   * @param {string} [timezone] - User's timezone
   * @returns {Promise<Object>} Date's schedule
   */
  getDateSchedule: (date, timezone) => {
    logger("Schedule", "Getting schedule for date", { date, timezone });
    return processResponse(api.get(`/schedule/date/${date}`, { 
      params: timezone ? { timezone } : undefined 
    }));
  },

  /**
   * Get upcoming episodes for anime in user's watchlist
   * @param {number} [days=7] - Number of days to look ahead
   * @param {string} [timezone] - User's timezone
   * @returns {Promise<Object>} Upcoming episodes
   */
  getUpcomingEpisodes: (days = 7, timezone) => {
    logger("Schedule", "Getting upcoming episodes", { days, timezone });
    return processResponse(api.get('/schedule/upcoming-episodes', { 
      params: { 
        days,
        ...(timezone ? { timezone } : {})
      } 
    }));
  },

  /**
   * Get season preview for upcoming or current season
   * @param {string} [season] - Season name (winter, spring, summer, fall)
   * @param {number} [year] - Year
   * @param {Object} [cacheOptions] - Caching options
   * @param {boolean} [cacheOptions.useCache=true] - Whether to use cache
   * @param {boolean} [cacheOptions.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} Season preview
   */
  getSeasonPreview: async (season, year, cacheOptions = {}) => {
    const { useCache = true, forceRefresh = false } = cacheOptions;
    logger("Schedule", "Getting season preview", { season, year, useCache, forceRefresh });
    
    const params = {};
    if (season) params.season = season;
    if (year) params.year = year;
    
    // Generate cache key based on season and year
    const paramKey = Object.keys(params).length > 0 
      ? `_${Object.entries(params).sort().map(([k, v]) => `${k}_${v}`).join('_')}` 
      : '_current';
    const specificCacheKey = `${SEASON_PREVIEW_CACHE_KEY}${paramKey}`;
    const specificEtagKey = `${SEASON_PREVIEW_ETAG_KEY}${paramKey}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(specificCacheKey, SEASON_PREVIEW_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = localStorage.getItem(specificCacheKey);
        if (cachedData) {
          logger("Schedule", "Using cached season preview data");
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
        '/schedule/season-preview',
        specificEtagKey,
        getCachedData,
        setCachedData,
        { params: Object.keys(params).length > 0 ? params : undefined }
      );
    }
    
    // Regular request or forced refresh
    const response = await processResponse(api.get('/schedule/season-preview', { 
      params: Object.keys(params).length > 0 ? params : undefined,
      headers: forceRefresh ? { 'Cache-Control': 'no-cache' } : {}
    }));
    
    // Cache the response if successful
    if (response.success && response.data) {
      localStorage.setItem(specificCacheKey, JSON.stringify(response.data));
      updateCacheTimestamp(specificCacheKey);
    }
    
    return response;
  },
  
  /**
   * Clear schedule caches
   * @param {string} [type] - Type of schedule cache to clear ('weekly', 'day', 'season')
   */
  clearScheduleCache: (type) => {
    if (type === 'weekly') {
      logger("Cache", "Clearing weekly schedule cache");
      
      // Find and remove all weekly schedule caches
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(WEEKLY_SCHEDULE_CACHE_KEY) || 
            key.startsWith(`${WEEKLY_SCHEDULE_CACHE_KEY}_timestamp`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Find and remove all weekly ETags
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`etag_${WEEKLY_SCHEDULE_ETAG_KEY}`)) {
          localStorage.removeItem(key);
        }
      });
    } 
    else if (type === 'day') {
      logger("Cache", "Clearing day schedule cache");
      
      // Find and remove all day schedule caches
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(DAY_SCHEDULE_CACHE_KEY) || 
            key.startsWith(`${DAY_SCHEDULE_CACHE_KEY}_timestamp`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Find and remove all day ETags
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`etag_${DAY_SCHEDULE_ETAG_KEY}`)) {
          localStorage.removeItem(key);
        }
      });
    }
    else if (type === 'season') {
      logger("Cache", "Clearing season preview cache");
      
      // Find and remove all season preview caches
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(SEASON_PREVIEW_CACHE_KEY) || 
            key.startsWith(`${SEASON_PREVIEW_CACHE_KEY}_timestamp`)) {
          localStorage.removeItem(key);
        }
      });
      
      // Find and remove all season ETags
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(`etag_${SEASON_PREVIEW_ETAG_KEY}`)) {
          localStorage.removeItem(key);
        }
      });
    }
    else {
      logger("Cache", "Clearing all schedule caches");
      
      // Clear all schedule-related caches
      const prefixes = [
        WEEKLY_SCHEDULE_CACHE_KEY,
        DAY_SCHEDULE_CACHE_KEY,
        SEASON_PREVIEW_CACHE_KEY
      ];
      
      // Remove cache data and timestamps
      prefixes.forEach(prefix => {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(prefix) || key.startsWith(`${prefix}_timestamp`)) {
            localStorage.removeItem(key);
          }
        });
      });
      
      // Remove ETags
      const etagPrefixes = [
        WEEKLY_SCHEDULE_ETAG_KEY,
        DAY_SCHEDULE_ETAG_KEY,
        SEASON_PREVIEW_ETAG_KEY
      ];
      
      etagPrefixes.forEach(prefix => {
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith(`etag_${prefix}`)) {
            localStorage.removeItem(key);
          }
        });
      });
    }
  }
};

export default scheduleAPI; 