import { useState, useEffect, useCallback } from 'react';
import { userAPI } from '../services/api';
import useApiCache from './useApiCache';
import { getUserTimezone, saveUserTimezone } from '../utils/simpleTimezoneUtils';

/**
 * Simple hook to fetch and cache timezone data
 * @returns {Object} Timezone data and functions
 */
const useSimpleTimezones = () => {
  const [timezones, setTimezones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Get the cache functions with 30-day expiry time
  const { getFromCache, saveToCache } = useApiCache('localStorage', 30 * 24 * 60 * 60 * 1000); // 30 days
  
  // Get the current timezone
  const [currentTimezone, setCurrentTimezone] = useState(getUserTimezone());
  
  // Load timezones from cache or API
  const loadTimezones = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    
    try {
      // First try to get from cache
      if (!forceRefresh) {
        const cached = getFromCache('all_timezones');
        if (cached && Array.isArray(cached) && cached.length > 0) {
          setTimezones(cached);
          setLoading(false);
          return cached;
        }
      }
      
      // If not in cache or forced refresh, fetch from API
      const response = await userAPI.getTimezones();
      
      if (response && response.success && Array.isArray(response.data)) {
        // Save to cache
        saveToCache('all_timezones', response.data);
        setTimezones(response.data);
        setLoading(false);
        return response.data;
      } else {
        setTimezones([]);
        setLoading(false);
        setError('Invalid response from server');
        return [];
      }
    } catch (err) {
      console.error('Error loading timezones:', err);
      setError(err.message || 'Failed to load timezones');
      setLoading(false);
      return [];
    }
  }, [getFromCache, saveToCache]);
  
  // Update the current timezone and save to localStorage
  const updateTimezone = useCallback((timezone) => {
    if (!timezone) return;
    
    try {
      setCurrentTimezone(timezone);
      saveUserTimezone(timezone);
    } catch (error) {
      console.error('Error updating timezone:', error);
    }
  }, []);
  
  // Load timezones on mount
  useEffect(() => {
    loadTimezones();
  }, [loadTimezones]);
  
  return {
    timezones,
    currentTimezone,
    updateTimezone,
    loading,
    error,
    refresh: () => loadTimezones(true)
  };
};

export default useSimpleTimezones; 