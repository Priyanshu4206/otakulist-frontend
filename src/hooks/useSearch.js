import { useState, useCallback, useRef, useEffect } from 'react';
import useDebounce from './useDebounce';

/**
 * Custom hook for search functionality with debounce and request throttling
 * 
 * @param {Function} searchFunction - Function to call for search
 * @param {number} debounceTime - Debounce time in milliseconds
 * @param {number} minQueryLength - Minimum query length to trigger search
 * @returns {Object} - Search state and control functions
 */
function useSearch(searchFunction, debounceTime = 300, minQueryLength = 2) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const lastRequestTimeRef = useRef(0);
  const activeRequestRef = useRef(null);
  
  // Min time between API calls in milliseconds
  const MIN_REQUEST_INTERVAL = 500;
  
  // Debounce the search query
  const debouncedQuery = useDebounce(query, debounceTime);
  
  // Handle search execution
  const executeSearch = useCallback(async (searchTerm) => {
    // Don't search if query is too short
    if (!searchTerm || searchTerm.length < minQueryLength) {
      setResults([]);
      return;
    }
    
    const now = Date.now();
    
    // Check if we need to throttle requests
    if (now - lastRequestTimeRef.current < MIN_REQUEST_INTERVAL) {
      // If a request is already scheduled, no need to schedule another one
      if (activeRequestRef.current) return;
      
      // Schedule a request for later
      const timeToWait = MIN_REQUEST_INTERVAL - (now - lastRequestTimeRef.current);
      activeRequestRef.current = setTimeout(() => {
        executeSearch(searchTerm);
        activeRequestRef.current = null;
      }, timeToWait);
      
      return;
    }
    
    // Update last request time
    lastRequestTimeRef.current = now;
    
    // Execute search
    setLoading(true);
    setError(null);
    
    try {
      const searchResults = await searchFunction(searchTerm);
      setResults(searchResults || []);
    } catch (err) {
      console.error('Search error:', err);
      setError(err.message || 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, [searchFunction, minQueryLength]);
  
  // React to changes in debounced query
  useEffect(() => {
    executeSearch(debouncedQuery);
  }, [debouncedQuery, executeSearch]);
  
  // Update query
  const handleQueryChange = useCallback((value) => {
    setQuery(value);
  }, []);
  
  // Reset search
  const resetSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
    
    // Clear any pending request
    if (activeRequestRef.current) {
      clearTimeout(activeRequestRef.current);
      activeRequestRef.current = null;
    }
  }, []);
  
  return {
    query,
    debouncedQuery,
    results,
    loading,
    error,
    setQuery: handleQueryChange,
    executeSearch,
    resetSearch
  };
}

export default useSearch; 