/**
 * Conditional fetch utility for ETag-aware API requests
 * Integrates with the ETag management system for conditional requests
 */

import api from './axiosInstance';
import { getETag, setETag } from './etagManager';
import { handleSuccess, handleError } from './responseHandler';

/**
 * Fetch with ETag validation
 * Makes a conditional GET request using If-None-Match header when an ETag is available
 * 
 * @param {string} url - API endpoint to fetch
 * @param {string} etagKey - Resource key for ETag storage
 * @param {Object} [options] - Additional options
 * @param {Object} [options.params] - URL parameters
 * @param {Object} [options.headers] - Additional headers
 * @returns {Promise<Object>} - API response with standard format
 */
export const fetchWithETag = async (url, etagKey, options = {}) => {
  try {
    const etag = getETag(etagKey);
    const headers = options.headers || {};
    
    // Add If-None-Match header if ETag exists
    if (etag) {
      headers['If-None-Match'] = etag;
    }
    
    // Make the API request with ETag header
    const response = await api.get(url, {
      ...options,
      headers,
      validateStatus: (status) => {
        // Accept 200 (OK) and 304 (Not Modified) as success
        return (status >= 200 && status < 300) || status === 304;
      }
    });
    
    // For 304 Not Modified, return a standardized success response
    if (response.status === 304) {
      return {
        success: true,
        data: null,
        notModified: true
      };
    }
    
    // Store new ETag if present in response headers
    const newEtag = response.headers?.etag;
    if (newEtag) {
      setETag(etagKey, newEtag);
    }
    
    // Return successful response
    return handleSuccess(response);
  } catch (error) {
    return handleError(error);
  }
};

/**
 * Fetch with ETag validation and caching
 * Uses ETag for conditional requests and falls back to cache when appropriate
 * 
 * @param {string} url - API endpoint to fetch
 * @param {string} etagKey - Resource key for ETag storage
 * @param {Function} getCachedData - Function to retrieve cached data
 * @param {Function} setCachedData - Function to store cache data
 * @param {Object} [options] - Additional options
 * @returns {Promise<Object>} - API response with standard format
 */
export const fetchWithETagAndCache = async (url, etagKey, getCachedData, setCachedData, options = {}) => {
  try {
    // Fetch with ETag validation
    const response = await fetchWithETag(url, etagKey, options);
    
    // If response indicates not modified (304), use cached data
    if (response.notModified) {
      const cachedData = getCachedData();
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          fromCache: true
        };
      }
      
      // If cache is missing but server returned 304, we need to make a fresh request
      // This should be rare but can happen if localStorage was cleared
      const freshResponse = await api.get(url, options);
      const newEtag = freshResponse.headers?.etag;
      if (newEtag) {
        setETag(etagKey, newEtag);
      }
      
      const parsedResponse = handleSuccess(freshResponse);
      if (parsedResponse.success && parsedResponse.data) {
        setCachedData(parsedResponse.data);
      }
      return parsedResponse;
    }
    
    // For successful responses with data, update the cache
    if (response.success && response.data) {
      setCachedData(response.data);
    }
    
    return response;
  } catch (error) {
    // On network error, try to use cached data as fallback
    if (error.message === 'Network Error') {
      const cachedData = getCachedData();
      if (cachedData) {
        return {
          success: true,
          data: cachedData,
          fromCache: true,
          offlineMode: true
        };
      }
    }
    
    return handleError(error);
  }
};

export default {
  fetchWithETag,
  fetchWithETagAndCache
}; 