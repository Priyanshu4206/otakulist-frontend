import { useState, useCallback } from 'react';

// Default expiry times in milliseconds
const DEFAULT_EXPIRY = {
  localStorage: 6 * 60 * 60 * 1000, // 6 hours
  sessionStorage: null, // Expires with session
};

/**
 * Hook for managing API request caching
 * 
 * @param {string} storageType - 'localStorage' or 'sessionStorage'
 * @param {number} expiryTime - Custom expiry time in milliseconds
 */
const useApiCache = (storageType = 'localStorage', expiryTime = null) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set storage object based on type
  const storage = storageType === 'localStorage' ? localStorage : sessionStorage;
  
  // Set expiry time based on defaults or custom
  const expiry = expiryTime || DEFAULT_EXPIRY[storageType];

  /**
   * Get item from cache
   * 
   * @param {string} key - Cache key
   * @returns {any|null} - Cached data or null if not found/expired
   */
  const getFromCache = useCallback((key) => {
    try {
      const cachedItem = storage.getItem(key);
      
      if (!cachedItem) return null;
      
      const { data, timestamp } = JSON.parse(cachedItem);
      
      // Check if data is expired (for localStorage)
      if (expiry && Date.now() - timestamp > expiry) {
        storage.removeItem(key);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error('Error getting from cache:', error);
      return null;
    }
  }, [storage, expiry]);

  /**
   * Save item to cache
   * 
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  const saveToCache = useCallback((key, data) => {
    try {
      // Don't cache empty arrays
      if (Array.isArray(data) && data.length === 0) {
        console.log('Not caching empty array data for key:', key);
        return;
      }
      
      // Don't cache null or undefined
      if (data === null || data === undefined) {
        console.log('Not caching null or undefined data for key:', key);
        return;
      }
      
      // For objects that may contain an empty data array
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        if (data.data && Array.isArray(data.data) && data.data.length === 0) {
          console.log('Not caching object with empty data array for key:', key);
          return;
        }
      }
      
      const cacheData = {
        data,
        timestamp: Date.now(),
      };
      
      storage.setItem(key, JSON.stringify(cacheData));
    } catch (error) {
      console.error('Error saving to cache:', error);
    }
  }, [storage]);

  /**
   * Fetch data with caching
   * 
   * @param {string} key - Cache key
   * @param {Function} fetchFunction - API fetch function
   * @param {boolean} forceRefresh - Whether to force a refresh from API
   * @returns {Promise<any>} - Data from cache or API
   */
  const fetchWithCache = useCallback(async (key, fetchFunction, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    
    try {
      // Try to get from cache first
      if (!forceRefresh) {
        const cachedData = getFromCache(key);
        
        if (cachedData) {
          setLoading(false);
          return cachedData;
        }
      }
      
      // Fetch from API if not in cache or force refresh
      const response = await fetchFunction();
      
      // Cache the response
      // Handle different API response structures
      // Some endpoints return {success: true, data: [...]} while others return the data directly
      if (response && typeof response === 'object') {
        if (response.data) {
          // Only cache if data is not an empty array
          if (!Array.isArray(response.data) || response.data.length > 0) {
            saveToCache(key, response.data);
          }
          setLoading(false);
          return response.data;
        } else if (Array.isArray(response)) {
          // Only cache if the array is not empty
          if (response.length > 0) {
            saveToCache(key, response);
          }
          setLoading(false);
          return response;
        } else if (!response.success && !response.data) {
          // If it's an object without success/data properties, assume it's the data
          saveToCache(key, response);
          setLoading(false);
          return response;
        }
      }
      
      // Fallback for other response structures
      setLoading(false);
      return response;
    } catch (err) {
      console.error(`Cache error for key: ${key}`, err);
      setError(err.message || 'An error occurred');
      setLoading(false);
      throw err;
    }
  }, [getFromCache, saveToCache]);

  /**
   * Clear a specific cached item
   * 
   * @param {string} key - Cache key to clear
   */
  const clearCacheItem = useCallback((key) => {
    try {
      storage.removeItem(key);
    } catch (error) {
      console.error('Error clearing cache item:', error);
    }
  }, [storage]);

  /**
   * Clear all cached items for this storage type
   */
  const clearAllCache = useCallback(() => {
    try {
      storage.clear();
    } catch (error) {
      console.error('Error clearing all cache:', error);
    }
  }, [storage]);

  return {
    loading,
    error,
    fetchWithCache,
    getFromCache,
    saveToCache,
    clearCacheItem,
    clearAllCache,
  };
};

export default useApiCache; 