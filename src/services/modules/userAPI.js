import api from '../axiosInstance';
import { processResponse } from '../responseHandler';
import {
  AUTH_REQUEST_THROTTLE_MS,
  isAuthRequestInProgress,
  getLastAuthRequestTime,
  setCurrentAuthRequest,
  setLastAuthRequestTime,
  clearCurrentAuthRequest
} from '../axiosInstance';
import { fetchWithETagAndCache } from '../conditionalFetch';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[USER API] ${area} | ${action}`;
  if (data) {
    console.log(logMessage, data);
  } else {
    console.log(logMessage);
  }
};

// Dashboard section cache keys
const DASHBOARD_CACHE_KEY = 'user_dashboard_sections';
const DASHBOARD_ETAG_KEY = 'dashboard_sections';

// Stats caching constants
const STATS_CACHE_KEY = 'user_stats';
const STATS_ETAG_KEY = 'user_stats';
const STATS_CACHE_TTL = 60 * 60 * 1000; // 1 hour in milliseconds

// Settings caching constants
const SETTINGS_CACHE_KEY = 'user_settings';
const SETTINGS_ETAG_KEY = 'user_settings';
const SETTINGS_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Timezones caching constants
const TIMEZONES_CACHE_KEY = 'available_timezones';
const TIMEZONES_ETAG_KEY = 'timezones';
const TIMEZONES_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Achievements caching constants
const ACHIEVEMENTS_CACHE_KEY = 'all_achievements';
const ACHIEVEMENTS_ETAG_KEY = 'achievements_list';
const ACHIEVEMENTS_CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds

// Preferences caching constants
const PREFERENCES_CACHE_KEY = 'user_preferences';
const PREFERENCES_ETAG_KEY = 'preferences';

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
 * User-related API calls
 */
const userAPI = {
  /**
   * Get current user with throttle to prevent multiple simultaneous calls
   * @returns {Promise<Object>} Current user data with sections (user, stats, notifications, recommendations, achievements)
   */
  getCurrentUser: () => {
    logger("User", "Getting current user data");
    const now = Date.now();

    // If there's already a request in progress, return that promise instead of making a new request
    if (isAuthRequestInProgress()) {
      logger("User", "User data request already in progress", "Returning existing promise");
      return isAuthRequestInProgress();
    }

    // If we've made a request very recently, throttle
    if (now - getLastAuthRequestTime() < AUTH_REQUEST_THROTTLE_MS) {
      logger("User", "User data request throttled", `Last request was ${now - getLastAuthRequestTime()}ms ago`);
      return Promise.reject({
        throttled: true,
        message: "User data request throttled to prevent excessive API calls",
      });
    }

    // Update last request time
    setLastAuthRequestTime(now);
    
    // Use the new dashboard/sections endpoint with ETag support
    logger("User", "Making dashboard sections request", `/users/dashboard/sections`);
    
    // Create a new request and store the promise
    const request = userAPI.getDashboardSections({
      sections: ["user", "notifications", "achievements", "settings"],
      notificationsLimit: 10,
      achievementsLimit: 10,
      useCache: true
    }).finally(() => {
      // Set a timeout before clearing the stored promise to prevent immediate subsequent calls
      setTimeout(() => {
        logger("User", "Clearing stored user data request");
        clearCurrentAuthRequest();
      }, 500);
    });

    setCurrentAuthRequest(request);
    return request;
  },

  /**
   * Get user stats with ETag support
   * @param {Object} [options] - Options
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} User stats data
   */
  getUserStats: async (options = {}) => {
    const { useCache = true, forceRefresh = false } = options;
    logger("Stats", "Getting user stats", { useCache, forceRefresh });
    
    // Create the endpoint
    const endpoint = "/users/dashboard/stats";
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(STATS_CACHE_KEY, STATS_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(STATS_CACHE_KEY);
        if (cachedData) {
          logger("Stats", "Using cached stats data");
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(STATS_CACHE_KEY);
      
      const setCachedData = (data) => updateCache(STATS_CACHE_KEY, data);
      
      return fetchWithETagAndCache(
        endpoint,
        STATS_ETAG_KEY,
        getCachedData,
        setCachedData
      );
    }
    
    // If forcing refresh, set Cache-Control header
    if (forceRefresh) {
      const response = await processResponse(api.get(endpoint, {
        headers: { 'Cache-Control': 'no-cache' }
      }));
      
      if (response.success && response.data) {
        updateCache(STATS_CACHE_KEY, response.data);
      }
      
      return response;
    }
    
    // Regular request without caching
    const response = await processResponse(api.get(endpoint));
    
    if (response.success && response.data) {
      updateCache(STATS_CACHE_KEY, response.data);
    }
    
    return response;
  },

  /**
   * Get dashboard sections data with ETag support
   * Supports both object-based options and direct array parameter for convenience
   * 
   * @param {Object|Array<string>} optionsOrSections - Options object or array of section names
   * @param {Array<string>|string} [optionsOrSections.sections] - Sections to include ('user', 'stats', 'notifications', 'achievements', 'recommendations', 'settings')
   * @param {number} [optionsOrSections.notificationsLimit] - Limit for notifications
   * @param {number} [optionsOrSections.achievementsLimit] - Limit for achievements
   * @param {number} [optionsOrSections.recommendationsLimit] - Limit for recommendations
   * @param {boolean} [optionsOrSections.useCache=true] - Whether to use ETag and cache support
   * @param {boolean} [optionsOrSections.forceRefresh=false] - Whether to bypass cache and fetch fresh data
   * @returns {Promise<Object>} Dashboard data with requested sections
   */
  getDashboardSections: async (optionsOrSections = {}) => {
    // Handle case where sections are passed directly as an array
    let options = optionsOrSections;
    if (Array.isArray(optionsOrSections)) {
      options = { sections: optionsOrSections };
    }
    
    const { 
      sections = ["user", "stats", "notifications", "achievements", "recommendations"], 
      notificationsLimit,
      achievementsLimit,
      recommendationsLimit,
      useCache = true,
      forceRefresh = false
    } = options;
    
    const sectionsStr = Array.isArray(sections) ? sections.join(',') : sections;
    
    logger("Dashboard", "Getting dashboard sections", { 
      sections: sectionsStr,
      useCache,
      forceRefresh
    });
    
    const params = { sections: sectionsStr };
    
    // Add optional limits if provided
    if (notificationsLimit) params.notificationsLimit = notificationsLimit;
    if (achievementsLimit) params.achievementsLimit = achievementsLimit;
    if (recommendationsLimit) params.recommendationsLimit = recommendationsLimit;
    
    // Create a cache key specific to this request
    const cacheKeySuffix = `_${sectionsStr.replace(/,/g, '_')}`;
    const cacheKey = `${DASHBOARD_CACHE_KEY}${cacheKeySuffix}`;
    const etagKey = `${DASHBOARD_ETAG_KEY}${cacheKeySuffix}`;
    
    // If using cache and not forcing refresh, use ETag and cache
    if (useCache && !forceRefresh) {
      logger("Dashboard", "Using ETag and cache for dashboard sections");
      
      // Create wrapper functions for the cache methods
      const getCachedData = () => {
        const cachedData = localStorage.getItem(cacheKey);
        return cachedData ? JSON.parse(cachedData) : null;
      };
      
      const setCachedData = (data) => {
        localStorage.setItem(cacheKey, JSON.stringify(data));
      };
      
      // Use fetchWithETagAndCache utility
      return fetchWithETagAndCache(
        "/users/dashboard/sections",
        etagKey,
        getCachedData,
        setCachedData,
        { params }
      );
    }
    
    // If forcing refresh, set Cache-Control header
    if (forceRefresh) {
      logger("Dashboard", "Forcing refresh for dashboard sections");
      return processResponse(api.get("/users/dashboard/sections", { 
        params,
        headers: { 'Cache-Control': 'no-cache' } 
      }));
    }
    
    // Regular request without caching
    return processResponse(api.get("/users/dashboard/sections", { params }));
  },

  /**
   * Fetch a user's public profile and stats by username
   * @param {string} username
   * @returns {Promise<Object>} User profile data
   */
  getProfile: (username) => {
    logger("Profile", "Getting user profile", { username });
    return processResponse(api.get(`/users/profile/${username}`));
  },

  /**
   * Update profile details and/or avatar in one atomic request (multipart/form-data)
   * @param {FormData} formData
   * @returns {Promise<Object>} Updated profile data
   */
  updateProfile: (formData) => {
    logger("Profile", "Updating user profile", { formDataSize: formData ? "FormData present" : "No FormData" });
    return processResponse(api.patch("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }));
  },

  /**
   * Follow a user by userId
   * @param {string} userId
   * @returns {Promise<Object>} Follow result
   */
  followUser: (userId) => {
    logger("Social", "Following user", { userId });
    return processResponse(api.post(`/users/follow/${userId}`));
  },

  /**
   * Unfollow a user by userId
   * @param {string} userId
   * @returns {Promise<Object>} Unfollow result
   */
  unfollowUser: (userId) => {
    logger("Social", "Unfollowing user", { userId });
    return processResponse(api.post(`/users/unfollow/${userId}`));
  },

  /**
   * Get followers of a user
   * @param {string} userId
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise<Object>} Followers list with pagination
   */
  getFollowers: (userId, page = 1, limit = 20) => {
    logger("Social", "Getting user followers", { userId, page, limit });
    return processResponse(api.get(`/users/${userId}/followers`, { params: { page, limit } }));
  },

  /**
   * Get following of a user
   * @param {string} userId
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise<Object>} Following list with pagination
   */
  getFollowing: (userId, page = 1, limit = 20) => {
    logger("Social", "Getting user following", { userId, page, limit });
    return processResponse(api.get(`/users/${userId}/following`, { params: { page, limit } }));
  },

  /**
   * Get all available achievements
   * @param {Object} [options] - Options
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} All achievements
   */
  getAllAchievements: async (options = {}) => {
    const { useCache = true, forceRefresh = false } = options;
    logger("Achievements", "Getting all achievements", { useCache, forceRefresh });
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(ACHIEVEMENTS_CACHE_KEY, ACHIEVEMENTS_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(ACHIEVEMENTS_CACHE_KEY);
        if (cachedData) {
          logger("Achievements", "Using cached achievements data");
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(ACHIEVEMENTS_CACHE_KEY);
      
      const setCachedData = (data) => updateCache(ACHIEVEMENTS_CACHE_KEY, data);
      
      return fetchWithETagAndCache(
        "/achievements",
        ACHIEVEMENTS_ETAG_KEY,
        getCachedData,
        setCachedData
      );
    }
    
    // If forcing refresh, set Cache-Control header
    if (forceRefresh) {
      const response = await processResponse(api.get("/users/achievements", {
        headers: { 'Cache-Control': 'no-cache' }
      }));
      
      if (response.success && response.data) {
        updateCache(ACHIEVEMENTS_CACHE_KEY, response.data);
      }
      
      return response;
    }
    
    // Regular request without caching
    const response = await processResponse(api.get("/users/achievements"));
    
    if (response.success && response.data) {
      updateCache(ACHIEVEMENTS_CACHE_KEY, response.data);
    }
    
    return response;
  },

  /**
   * Get user settings (current user)
   * @param {Object} [options] - Options
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @param {string} [options.category] - Specific settings category to retrieve
   * @returns {Promise<Object>} User settings
   */
  getSettings: async (options = {}) => {
    const { useCache = true, forceRefresh = false, category } = options;
    logger("Settings", "Getting user settings", { useCache, forceRefresh, category });
    
    // Create the endpoint with optional category param
    const endpoint = category 
      ? `/users/settings/${category}`
      : "/users/settings";
    
    // Create cache key with optional category
    const cacheKeySuffix = category ? `_${category}` : '';
    const currentCacheKey = `${SETTINGS_CACHE_KEY}${cacheKeySuffix}`;
    const currentEtagKey = `${SETTINGS_ETAG_KEY}${cacheKeySuffix}`;
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(currentCacheKey, SETTINGS_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(currentCacheKey);
        if (cachedData) {
          logger("Settings", "Using cached settings data", { category });
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
        setCachedData
      );
    }
    
    // If forcing refresh, set Cache-Control header
    if (forceRefresh) {
      const response = await processResponse(api.get(endpoint, {
        headers: { 'Cache-Control': 'no-cache' }
      }));
      
      if (response.success && response.data) {
        updateCache(currentCacheKey, response.data);
      }
      
      return response;
    }
    
    // Regular request without caching
    const response = await processResponse(api.get(endpoint));
    
    if (response.success && response.data) {
      updateCache(currentCacheKey, response.data);
    }
    
    return response;
  },

  /**
   * Update user settings (current user)
   * @param {string} category
   * @param {object} settings
   * @returns {Promise<Object>} Updated user settings
   */
  updateSettings: async (category, settings) => {
    logger("Settings", "Updating user settings", { category, settings });
    
    // Make API call
    const response = await processResponse(api.patch("/users/settings", { category, settings }));
    
    // If successful, update the cached settings
    if (response.success && response.data) {
      // Get current cached settings
      const cachedSettings = localStorage.getItem(SETTINGS_CACHE_KEY);
      if (cachedSettings) {
        const parsedSettings = JSON.parse(cachedSettings);
        
        // Update the specific category
        const updatedSettings = {
          ...parsedSettings,
          [category]: {
            ...parsedSettings[category],
            ...settings
          }
        };
        
        // Save updated settings back to cache
        localStorage.setItem(SETTINGS_CACHE_KEY, JSON.stringify(updatedSettings));
        updateCache(SETTINGS_CACHE_KEY, updatedSettings);
      }
      
      // Also update the category-specific cache if it exists
      const categoryCacheKey = `${SETTINGS_CACHE_KEY}_${category}`;
      const categoryCachedSettings = localStorage.getItem(categoryCacheKey);
      if (categoryCachedSettings) {
        const parsedCategorySettings = JSON.parse(categoryCachedSettings);
        
        // Update with new settings
        const updatedCategorySettings = {
          ...parsedCategorySettings,
          ...settings
        };
        
        // Save back to cache
        localStorage.setItem(categoryCacheKey, JSON.stringify(updatedCategorySettings));
        updateCache(categoryCacheKey, updatedCategorySettings);
      }
    }
    
    return response;
  },

  /**
   * Get user preferences for recommendations
   * @param {Object} [options] - Options
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} User preferences
   */
  getPreferences: async (options = {}) => {
    logger("Preferences", "Getting user preferences");
    // Use the settings API with recommendations category
    return userAPI.getSettings({
      ...options,
      category: 'recommendations'
    });
  },

  /**
   * Update user preferences for recommendations
   * @param {object} preferences - User preferences for recommendations
   * @returns {Promise<Object>} Updated user preferences
   */
  updatePreferences: async (preferences) => {
    logger("Preferences", "Updating user preferences", { preferences });
    // Use the settings API with recommendations category
    return userAPI.updateSettings('recommendations', preferences);
  },

  /**
   * Check if username is available
   * @param {string} username
   * @returns {Promise<Object>} Availability result
   */
  checkUsernameAvailability: (username) => {
    logger("Profile", "Checking username availability", { username });
    return processResponse(api.get(`/users/check-username/${username}`));
  },
  
  /**
   * Get available timezones with ETag support
   * @param {Object} [options] - Options
   * @param {boolean} [options.useCache=true] - Whether to use cache
   * @param {boolean} [options.forceRefresh=false] - Whether to force a refresh
   * @returns {Promise<Object>} List of available timezones
   */
  getAvailableTimezones: async (options = {}) => {
    const { useCache = true, forceRefresh = false } = options;
    logger("Settings", "Getting available timezones", { useCache, forceRefresh });
    
    // Check if cache should be used
    if (useCache && !forceRefresh) {
      // Check if cache is expired
      const isExpired = isCacheExpired(TIMEZONES_CACHE_KEY, TIMEZONES_CACHE_TTL);
      
      if (!isExpired) {
        // Get data from cache
        const cachedData = getFromCache(TIMEZONES_CACHE_KEY);
        if (cachedData) {
          logger("Settings", "Using cached timezones data");
          return {
            success: true,
            data: cachedData,
            fromCache: true
          };
        }
      }
      
      // Use ETag for conditional request
      const getCachedData = () => getFromCache(TIMEZONES_CACHE_KEY);
      
      const setCachedData = (data) => updateCache(TIMEZONES_CACHE_KEY, data);
      
      return fetchWithETagAndCache(
        "/users/timezones",
        TIMEZONES_ETAG_KEY,
        getCachedData,
        setCachedData
      );
    }
    
    // If forcing refresh, set Cache-Control header
    if (forceRefresh) {
      const response = await processResponse(api.get("/users/timezones", {
        headers: { 'Cache-Control': 'no-cache' }
      }));
      
      if (response.success && response.data) {
        updateCache(TIMEZONES_CACHE_KEY, response.data);
      }
      
      return response;
    }
    
    // Regular request without caching
    const response = await processResponse(api.get("/users/timezones"));
    
    if (response.success && response.data) {
      updateCache(TIMEZONES_CACHE_KEY, response.data);
    }
    
    return response;
  },
  
  /**
   * Get user dashboard recommendations
   * @param {number} [limit=5] - Number of recommendations to fetch
   * @returns {Promise<Object>} Dashboard recommendations
   */
  getDashboardRecommendations: (limit = 5) => {
    logger("Dashboard", "Getting dashboard recommendations", { limit });
    return processResponse(api.get("/users/dashboard/recommendations", { params: { limit } }));
  },

  /**
   * Get anime recommendations based on user preferences
   * @param {Object} [options] - Options
   * @param {number} [options.limit=10] - Number of recommendations to fetch
   * @param {string} [options.sort='score'] - Sort order (score, popularity, etc.)
   * @param {boolean} [options.includeWatched=false] - Include already watched anime
   * @param {Object} [options.previewPreferences=null] - Optional preferences to use for preview
   * @returns {Promise<Object>} Personalized anime recommendations
   */
  getPersonalizedRecommendations: (options = {}) => {
    const { 
      limit = 10, 
      sort = 'score', 
      includeWatched = false,
      previewPreferences = null
    } = options;
    
    logger("Recommendations", "Getting personalized recommendations", { 
      limit, 
      sort, 
      includeWatched,
      isPreview: !!previewPreferences
    });
    
    // If preview preferences are provided, send them in the request
    const requestOptions = { 
      params: { limit, sort, includeWatched }
    };
    
    // If preview preferences are provided, add them to the request body
    if (previewPreferences) {
      return processResponse(api.post("/users/recommendations/preview", { 
        preferences: previewPreferences,
        limit,
        sort,
        includeWatched
      }));
    }
    
    // Regular request using saved preferences
    return processResponse(api.get("/users/recommendations", requestOptions));
  },

  /**
   * Get user achievements
   * @param {string} userId
   * @param {number} [limit=20]
   * @returns {Promise<Object>} User achievements
   */
  getUserAchievements: (userId, limit = 20) => {
    logger("Achievements", "Getting user achievements", { userId, limit });
    return processResponse(api.get(`/users/${userId}/achievements`, { params: { limit } }));
  },

  /**
   * Clear dashboard cache
   * @param {Array<string>|string} [sections] - Specific sections to clear, or all if not specified
   */
  clearDashboardCache: (sections) => {
    if (!sections) {
      logger("Cache", "Clearing all dashboard cache");
      
      // Find all dashboard cache keys
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(DASHBOARD_CACHE_KEY) || key.startsWith(DASHBOARD_ETAG_KEY)) {
          localStorage.removeItem(key);
        }
      });
      return;
    }
    
    const sectionsArr = Array.isArray(sections) ? sections : sections.split(',');
    logger("Cache", "Clearing specific dashboard cache sections", { sections: sectionsArr });
    
    // Create section suffix
    const sectionSuffix = sectionsArr.join('_');
    const cacheKey = `${DASHBOARD_CACHE_KEY}_${sectionSuffix}`;
    const etagKey = `${DASHBOARD_ETAG_KEY}_${sectionSuffix}`;
    
    // Remove specific cache entries
    localStorage.removeItem(cacheKey);
    
    // Remove ETag for this section combination
    const etagStorageKey = `etag_${etagKey}`;
    localStorage.removeItem(etagStorageKey);
  },
  
  /**
   * Clear preferences cache
   */
  clearPreferencesCache: () => {
    logger("Cache", "Clearing preferences cache");
    localStorage.removeItem(`${SETTINGS_CACHE_KEY}_recommendations`);
    localStorage.removeItem(`${SETTINGS_CACHE_KEY}_recommendations_timestamp`);
    localStorage.removeItem(`etag_${SETTINGS_ETAG_KEY}_recommendations`);
  },

  /**
   * Clear stats cache
   */
  clearStatsCache: () => {
    logger("Cache", "Clearing stats cache");
    localStorage.removeItem(STATS_CACHE_KEY);
    localStorage.removeItem(`${STATS_CACHE_KEY}_timestamp`);
    localStorage.removeItem(`etag_${STATS_ETAG_KEY}`);
  },

  /**
   * Clear all user-related caches
   */
  clearAllCaches: () => {
    logger("Cache", "Clearing all user-related caches");
    
    // Clear dashboard cache
    userAPI.clearDashboardCache();
    
    // Clear stats cache
    userAPI.clearStatsCache();
    
    // Clear settings cache
    localStorage.removeItem(SETTINGS_CACHE_KEY);
    localStorage.removeItem(`${SETTINGS_CACHE_KEY}_timestamp`);
    localStorage.removeItem(`etag_${SETTINGS_ETAG_KEY}`);
    
    // Clear category-specific settings caches
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(SETTINGS_CACHE_KEY + '_') || 
          key.startsWith(`etag_${SETTINGS_ETAG_KEY}_`)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear timezones cache
    localStorage.removeItem(TIMEZONES_CACHE_KEY);
    localStorage.removeItem(`${TIMEZONES_CACHE_KEY}_timestamp`);
    localStorage.removeItem(`etag_${TIMEZONES_ETAG_KEY}`);
    
    // Clear achievements cache
    localStorage.removeItem(ACHIEVEMENTS_CACHE_KEY);
    localStorage.removeItem(`${ACHIEVEMENTS_CACHE_KEY}_timestamp`);
    localStorage.removeItem(`etag_${ACHIEVEMENTS_ETAG_KEY}`);
    
    // Clear preferences cache
    localStorage.removeItem(PREFERENCES_CACHE_KEY);
    localStorage.removeItem(`${PREFERENCES_CACHE_KEY}_timestamp`);
    localStorage.removeItem(`etag_${PREFERENCES_ETAG_KEY}`);
  }
};

export default userAPI; 