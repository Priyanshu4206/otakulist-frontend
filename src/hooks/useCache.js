import { useState, useEffect, useRef } from 'react';

/**
 * Custom hook for cache management with TTL (Time-to-live)
 * 
 * @param {string} key - Cache key
 * @param {number} ttl - Time-to-live in milliseconds
 * @param {Function} fetchFunction - Function to fetch data if cache is invalid
 * @param {boolean} immediatelyFetch - Whether to fetch immediately on mount
 * @returns {Object} - Cache state and control functions
 */
function useCache(key, ttl = 5 * 60 * 1000, fetchFunction, immediatelyFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFromCache, setIsFromCache] = useState(false);
  const isDataFetchedRef = useRef(false);

  // Check if cache is valid
  const isCacheValid = () => {
    try {
      const cacheItem = localStorage.getItem(`${key}_data`);
      const cacheTimestamp = localStorage.getItem(`${key}_timestamp`);
      
      if (!cacheItem || !cacheTimestamp) return false;
      
      const now = Date.now();
      const timestamp = parseInt(cacheTimestamp, 10);
      
      return now - timestamp < ttl;
    } catch (error) {
      console.error(`[Cache] Error checking cache for key ${key}:`, error);
      return false;
    }
  };

  // Get data from cache
  const getFromCache = () => {
    try {
      const cacheItem = localStorage.getItem(`${key}_data`);
      return cacheItem ? JSON.parse(cacheItem) : null;
    } catch (error) {
      console.error(`[Cache] Error getting data from cache for key ${key}:`, error);
      return null;
    }
  };

  // Set data to cache
  const setToCache = (data) => {
    try {
      localStorage.setItem(`${key}_data`, JSON.stringify(data));
      localStorage.setItem(`${key}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error(`[Cache] Error setting data to cache for key ${key}:`, error);
    }
  };

  // Fetch data (from cache or source)
  const fetchData = async (forceRefresh = false) => {
    if (!fetchFunction) return;

    setLoading(true);
    setError(null);
    setIsFromCache(false);

    try {
      // Check cache first unless force refresh is requested
      if (!forceRefresh && isCacheValid()) {
        const cachedData = getFromCache();
        if (cachedData) {
          setData(cachedData);
          setIsFromCache(true);
          setLoading(false);
          return cachedData;
        }
      }

      // Fetch fresh data
      const result = await fetchFunction();
      setData(result);
      setToCache(result);
      isDataFetchedRef.current = true;
      return result;
    } catch (error) {
      setError(error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Clear cache for this key
  const clearCache = () => {
    localStorage.removeItem(`${key}_data`);
    localStorage.removeItem(`${key}_timestamp`);
  };

  // Fetch data on mount if needed
  useEffect(() => {
    if (immediatelyFetch && !isDataFetchedRef.current) {
      fetchData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    data,
    loading,
    error,
    isFromCache,
    fetchData,
    clearCache,
    setData
  };
}

export default useCache; 