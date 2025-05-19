import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './index';
import { exploreAPI } from '../services/modules';

/**
 * Custom hook for search functionality in the explore page
 * @returns {Object} Search state and functions
 */
export const useExploreSearch = () => {
  // Search input state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState('all');
  
  // Debounced search query to prevent excessive API calls
  const debouncedSearchQuery = useDebounce(searchQuery, 500);
  
  // Search results state
  const [searchResults, setSearchResults] = useState({
    anime: [],
    users: [],
    playlists: []
  });
  
  // Counts for each type of result
  const [searchCounts, setSearchCounts] = useState({
    anime: 0,
    users: 0,
    playlists: 0,
    total: 0
  });
  
  // Pagination state
  const [searchPagination, setSearchPagination] = useState({
    page: 1,
    pages: 0,
    total: 0,
    limit: 20
  });
  
  // Loading and error states
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchError, setSearchError] = useState(null);
  
  // Handle search type change
  const handleSearchTypeChange = useCallback((newType) => {
    if (newType === searchType) return;
    
    // Clear existing results when changing type
    setSearchResults({
      anime: [],
      users: [],
      playlists: []
    });
    
    setSearchCounts({
      anime: 0,
      users: 0,
      playlists: 0,
      total: 0
    });
    
    setSearchPagination({
      page: 1,
      pages: 0,
      total: 0,
      limit: 20
    });
    
    setSearchType(newType);
  }, [searchType]);
  
  // Function to fetch search results
  const fetchSearchResults = useCallback(async (isLoadMore = false) => {
    if (!debouncedSearchQuery || debouncedSearchQuery.length < 2) {
      setSearchResults({ anime: [], users: [], playlists: [] });
      setSearchCounts({ anime: 0, users: 0, playlists: 0, total: 0 });
      setSearchPagination({ page: 1, pages: 0, total: 0, limit: 20 });
      return;
    }
    
    setSearchLoading(true);
    setSearchError(null);
    
    try {
      const page = isLoadMore ? searchPagination.page + 1 : 1;
      
      const response = await exploreAPI.search({
        query: debouncedSearchQuery,
        type: searchType,
        page,
        limit: searchPagination.limit,
        sort: 'score'
      });
      
      if (response && response.success) {
        const { data } = response;
        
        if (searchType === 'all') {
          // Handle combined search response format
          const newResults = {
            anime: data.anime || [],
            users: data.users || [],
            playlists: data.playlists || []
          };
          
          setSearchResults(prev => 
            isLoadMore 
              ? {
                  anime: [...prev.anime, ...newResults.anime],
                  users: [...prev.users, ...newResults.users],
                  playlists: [...prev.playlists, ...newResults.playlists]
                }
              : newResults
          );
          
          setSearchCounts(data.counts || {
            anime: data.anime?.length || 0,
            users: data.users?.length || 0,
            playlists: data.playlists?.length || 0,
            total: (data.anime?.length || 0) + (data.users?.length || 0) + (data.playlists?.length || 0)
          });
          
          // Set pagination for "all" search type
          if (data.pagination) {
            setSearchPagination({
              page: data.pagination.page || page,
              pages: data.pagination.pages || 1,
              total: data.pagination.total || 0,
              limit: data.pagination.limit || searchPagination.limit
            });
          }
        } else if (searchType === 'anime') {
          // Handle anime search response format
          const animeResults = data.anime || [];
          
          setSearchResults(prev => ({
            ...prev,
            anime: isLoadMore ? [...prev.anime, ...animeResults] : animeResults
          }));
          
          setSearchCounts(prev => ({
            ...prev,
            anime: data.pagination?.total || animeResults.length,
            total: data.pagination?.total || animeResults.length
          }));
          
          setSearchPagination({
            page: data.pagination?.page || page,
            pages: data.pagination?.pages || 1,
            total: data.pagination?.total || animeResults.length,
            limit: data.pagination?.limit || searchPagination.limit
          });
        } else if (searchType === 'users') {
          // Handle users search response format
          const userResults = data.users || [];
          
          setSearchResults(prev => ({
            ...prev,
            users: isLoadMore ? [...prev.users, ...userResults] : userResults
          }));
          
          setSearchCounts(prev => ({
            ...prev,
            users: data.pagination?.total || userResults.length,
            total: data.pagination?.total || userResults.length
          }));
          
          setSearchPagination({
            page: data.pagination?.page || page,
            pages: data.pagination?.pages || 1,
            total: data.pagination?.total || userResults.length,
            limit: data.pagination?.limit || searchPagination.limit
          });
        } else if (searchType === 'playlists') {
          // Handle playlists search response format
          const playlistResults = data.playlists || [];
          
          setSearchResults(prev => ({
            ...prev,
            playlists: isLoadMore ? [...prev.playlists, ...playlistResults] : playlistResults
          }));
          
          setSearchCounts(prev => ({
            ...prev,
            playlists: data.pagination?.total || playlistResults.length,
            total: data.pagination?.total || playlistResults.length
          }));
          
          setSearchPagination({
            page: data.pagination?.page || page,
            pages: data.pagination?.pages || 1,
            total: data.pagination?.total || playlistResults.length,
            limit: data.pagination?.limit || searchPagination.limit
          });
        }
      } else {
        throw new Error(response?.error?.message || 'Failed to fetch search results');
      }
    } catch (error) {
      console.error('Error fetching search results:', error);
      setSearchError('Failed to load search results. Please try again.');
    } finally {
      setSearchLoading(false);
    }
  }, [debouncedSearchQuery, searchType, searchPagination.page, searchPagination.limit]);
  
  // Function to load more search results
  const loadMoreSearchResults = useCallback(async () => {
    if (searchLoading || searchPagination.page >= searchPagination.pages) {
      return;
    }
    
    await fetchSearchResults(true);
  }, [fetchSearchResults, searchLoading, searchPagination.page, searchPagination.pages]);
  
  // Fetch search results when debouncedSearchQuery or searchType changes
  useEffect(() => {
    if (debouncedSearchQuery && debouncedSearchQuery.length >= 2) {
      // Only fetch if we have a valid search query
      fetchSearchResults(false);
    } else {
      // Clear results when query is empty
      setSearchResults({ anime: [], users: [], playlists: [] });
      setSearchCounts({ anime: 0, users: 0, playlists: 0, total: 0 });
      setSearchPagination({ page: 1, pages: 0, total: 0, limit: 20 });
    }
  }, [debouncedSearchQuery, searchType, fetchSearchResults]);
  
  // When search query changes, reset pagination
  useEffect(() => {
    setSearchPagination(prev => ({
      ...prev,
      page: 1
    }));
  }, [searchQuery]);
  
  return {
    searchQuery,
    setSearchQuery,
    searchType,
    searchResults,
    searchCounts,
    searchPagination,
    searchLoading,
    searchError,
    debouncedSearchQuery,
    handleSearchTypeChange,
    loadMoreSearchResults
  };
}; 