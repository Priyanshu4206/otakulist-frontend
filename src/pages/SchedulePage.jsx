import { useState, useEffect, useMemo, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import ShimmerTimeSlot from '../components/schedule/ShimmerTimeSlot';
import UnknownTimeSlot from '../components/schedule/UnknownTimeSlot';
import { scheduleAPI } from '../services/api';
import useApiCache from '../hooks/useApiCache';
import { getUserTimezone, getIANATimezone } from '../utils/simpleTimezoneUtils';
import useAuth from '../hooks/useAuth';

// Import our new animated components
import AnimatedDayTabs from '../components/schedule/AnimatedDayTabs';
import AnimatedTimeSlot from '../components/schedule/AnimatedTimeSlot';
import AnimatedPageHeader from '../components/schedule/AnimatedPageHeader';
import ScheduleFilter from '../components/schedule/ScheduleFilter';

const PageContainer = styled(motion.div)`
  padding: 2rem;
  max-width: 1600px;
  margin: 0 auto;
  width: 100%;
  position: relative;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 1rem;
  }
`;

const ScheduleContent = styled(motion.div)`
  margin-top: 2rem;
  position: relative;
  z-index: 1;
`;

const LoadMore = styled(motion.button)`
  background: var(--gradientPrimary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.9rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin: 3rem auto;
  display: block;
  transition: all 0.3s ease;
  box-shadow: 0 8px 15px rgba(var(--primary-rgb), 0.3);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 20px rgba(var(--primary-rgb), 0.4);
  }
  
  &:disabled {
    background: var(--textSecondary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const EmptyState = styled(motion.div)`
  text-align: center;
  padding: 4rem 2rem;
  color: var(--textSecondary);
  background: rgba(var(--cardBackground-rgb), 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  margin: 2rem 0;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
    color: var(--textPrimary);
  }
  
  p {
    font-size: 1rem;
    max-width: 500px;
    margin: 0 auto;
    line-height: 1.6;
  }
`;

const FilterContainer = styled(motion.div)`
  margin: 1.5rem 0;
  background: rgba(var(--cardBackground-rgb), 0.7);
  border-radius: 12px;
  padding: 1.5rem;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10; /* Higher z-index to ensure filter works properly */
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { 
      when: "beforeChildren",
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5 }
  }
};

const SchedulePage = () => {
  // Get today's day name to use as default
  const getTodayDayName = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };
  
  // Get user from auth context
  const { user } = useAuth();
  
  // Get user's timezone preference (the code, e.g., IST)
  const userTimezoneCode = getUserTimezone();
  // Get the IANA timezone for API calls
  const userTimezone = getIANATimezone(userTimezoneCode);
  
  // State for the active day tab
  const [activeDay, setActiveDay] = useState(getTodayDayName());
  
  // State for current page and filters
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    searchTerm: '',
    sort: 'broadcast',
    rating: '',
    genres: []
  });
  
  // State for the loaded anime data
  const [animeList, setAnimeList] = useState([]);
  const [filteredAnimeList, setFilteredAnimeList] = useState([]);
  const [originalData, setOriginalData] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  
  // UseApiCache hook for caching API calls
  const { 
    loading: cacheLoading, 
    error, 
    fetchWithCache, 
    clearCacheItem,
    getFromCache
  } = useApiCache('localStorage', 30 * 60 * 1000); // 30 minutes (shorter cache for timezone-specific data)
  
  // Create cache key from activeDay, page and user timezone
  const cacheKey = useMemo(() => 
    `schedule_${activeDay}_${page}_${userTimezoneCode}`, 
    [activeDay, page, userTimezoneCode]
  );
  
  // Group anime by broadcast time
  const groupedByTime = useMemo(() => {
    if (!filteredAnimeList || filteredAnimeList.length === 0) return {};
    
    const timeGroups = {};
    
    // First, group all anime with broadcast times
    filteredAnimeList.forEach(anime => {
      const broadcastTime = anime.broadcast?.time || 'Unknown';
      
      if (!timeGroups[broadcastTime]) {
        timeGroups[broadcastTime] = [];
      }
      
      timeGroups[broadcastTime].push(anime);
    });
    
    // Sort the time slots (Unknown should be at the end)
    return Object.keys(timeGroups)
      .sort((a, b) => {
        if (a === 'Unknown') return 1;
        if (b === 'Unknown') return -1;
        
        // Parse time strings (e.g., "14:30") into numbers for comparison
        const timeA = a.split(':').map(Number);
        const timeB = b.split(':').map(Number);
        
        // Compare hours first, then minutes
        return timeA[0] !== timeB[0] ? timeA[0] - timeB[0] : timeA[1] - timeB[1];
      })
      .reduce((sorted, time) => {
        sorted[time] = timeGroups[time];
        return sorted;
      }, {});
  }, [filteredAnimeList]);

  // Extract unique genres from all anime
  const allGenres = useMemo(() => {
    const genres = [];
    originalData.forEach(anime => {
      if (anime.genres && Array.isArray(anime.genres)) {
        anime.genres.forEach(genre => {
          if (genre) {
            // Handle both string genres and object genres with name property
            if (typeof genre === 'string') {
              genres.push(genre);
            } else if (genre.name) {
              genres.push(genre);
            }
          }
        });
      }
    });
    return genres;
  }, [originalData]);

  // Apply filters locally
  const applyFilters = useCallback(() => {
    if (!originalData.length) return;

    let result = [...originalData];
    
    // Apply search filter
    if (filters.searchTerm) {
      const search = filters.searchTerm.toLowerCase();
      result = result.filter(anime => {
        // Search in all possible title fields
        const titles = [
          anime.title_english, 
          anime.titles?.english, 
          anime.titles?.default, 
          anime.title,
          anime.titles?.japanese,
          anime.title_japanese
        ];
        
        // Also search in synonym titles if available
        if (anime.titles?.synonyms && Array.isArray(anime.titles.synonyms)) {
          titles.push(...anime.titles.synonyms);
        }
        
        // Check if any title contains the search term
        return titles.some(title => 
          title && title.toLowerCase().includes(search)
        );
      });
    }
    
    // Apply rating filter
    if (filters.rating) {
      result = result.filter(anime => {
        return anime.rating === filters.rating;
      });
    }
    
    // Apply genres filter (multi-select)
    if (filters.genres && filters.genres.length > 0) {
      result = result.filter(anime => {
        if (!anime.genres || !Array.isArray(anime.genres)) return false;
        
        return anime.genres.some(genre => {
          const genreName = typeof genre === 'string' ? genre : (genre.name || '');
          return filters.genres.includes(genreName.toLowerCase());
        });
      });
    }
    
    // Apply sort
    if (filters.sort) {
      result.sort((a, b) => {
        switch (filters.sort) {
          case 'title':
            const titleA = a.titles?.english || a.titles?.default || a.title || '';
            const titleB = b.titles?.english || b.titles?.default || b.title || '';
            return titleA.localeCompare(titleB);
          
          case 'popularity':
            return (b.popularity || 0) - (a.popularity || 0);
          
          case 'score':
            return (b.score || 0) - (a.score || 0);
          
          case 'year':
            return (b.year || 0) - (a.year || 0);
          
          case 'broadcast':
          default:
            // Already sorted by broadcast time in the groupedByTime logic
            return 0;
        }
      });
    }
    
    setFilteredAnimeList(result);
  }, [originalData, filters]);

  // Update filtered list when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);
  
  // Fetch schedule data
  const fetchSchedule = useCallback(async (reset = false) => {
    try {      
      // If we're resetting, clear previous data
      if (reset) {
        setAnimeList([]);
        setFilteredAnimeList([]);
        setPage(1);
        setHasMore(true);
      }
      
      // Calculate the page number for this request
      const pageToFetch = reset ? 1 : page;
      
      // Create cache key for this specific request
      const requestCacheKey = `schedule_${activeDay}_${pageToFetch}_${userTimezoneCode}`;
      
      // First check if we have this data in cache
      const cachedData = getFromCache(requestCacheKey);
      if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {        
        // Process cached data
        if (reset) {
          setOriginalData(cachedData);
          setAnimeList(cachedData);
          setFilteredAnimeList(cachedData);
        } else {
          setOriginalData(prev => [...prev, ...cachedData]);
          setAnimeList(prev => [...prev, ...cachedData]);
          setFilteredAnimeList(prev => [...prev, ...cachedData]);
        }
        
        // Update pagination
        setHasMore(cachedData.length >= 50); // If we got a full page, assume there's more
        
        if (!reset) {
          setPage(prev => prev + 1);
        } else {
          // If resetting, set to page 2 for next load more
          setPage(2);
        }
        
        return;
      }
      
      // Set loading state
      setIsLoading(true);
      
      // Build API params with user's timezone
      const params = {
        day: activeDay,
        page: pageToFetch,
        limit: 50,
        timezone: userTimezone
      };
      
      // Fetch data with caching
      const response = await fetchWithCache(
        requestCacheKey,
        () => scheduleAPI.getScheduleByDay(activeDay, params)
      );
      
      // Process API response      
      let animeData = [];
      let paginationData = { total: 0, limit: 50, page: 1, pages: 1 };
      
      // Handle different API response structures
      if (response) {
        if (Array.isArray(response)) {
          // Direct array response
          animeData = response;
        } else if (response.data && Array.isArray(response.data)) {
          // {data: [...]} structure
          animeData = response.data;
          paginationData = response.pagination || paginationData;
        } else if (response.animes && Array.isArray(response.animes)) {
          // {animes: [...]} structure
          animeData = response.animes;
          paginationData = response.pagination || paginationData;
        } else {
          console.error('Unexpected API response structure:', response);
        }
      }
            
      // Update state only if we have data
      if (animeData.length > 0) {
        if (reset) {
          setOriginalData(animeData);
          setAnimeList(animeData);
          setFilteredAnimeList(animeData); 
        } else {
          setOriginalData(prev => [...prev, ...animeData]);
          setAnimeList(prev => [...prev, ...animeData]);
          setFilteredAnimeList(prev => [...prev, ...animeData]);
        }
        
        // Check if we have more pages
        setHasMore(pageToFetch < paginationData.pages);
        
        if (!reset) {
          setPage(prev => prev + 1);
        } else {
          // If resetting, set to page 2 for next load more
          setPage(2);
        }
      } else {
        setHasMore(false);
      }
      
      // Reset loading state
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setHasMore(false);
      setIsLoading(false);
    }
  }, [activeDay, fetchWithCache, getFromCache, page, userTimezone, userTimezoneCode]);
  
  // Handle day tab change
  const handleDayChange = (day) => {    
    // Clear previous data before switching days
    setAnimeList([]);
    setFilteredAnimeList([]);
    setOriginalData([]);
    setPage(1);
    setHasMore(true);
    
    // Then update the active day to trigger data loading
    setActiveDay(day);
  };
  
  // Initial fetch on component mount and when active day changes
  useEffect(() => {    
    // When day changes, check if we already have data in cache
    const firstPageCacheKey = `schedule_${activeDay}_1_${userTimezoneCode}`;
    const cachedData = getFromCache(firstPageCacheKey);
    
    if (cachedData && Array.isArray(cachedData) && cachedData.length > 0) {
      // If we have valid cached data, use it      setOriginalData(cachedData);
      setAnimeList(cachedData);
      setFilteredAnimeList(cachedData);
      setPage(2); // Set to page 2 for potential "load more"
      
      // Estimate if there's more data
      setHasMore(cachedData.length >= 50);
    } else {
      // If no cached data or invalid cache, fetch from API
      fetchSchedule(true);
    }
    // Deliberately not including fetchSchedule as a dependency to prevent loops
  }, [activeDay, userTimezoneCode, getFromCache]);
  
  // Handle timezone change
  useEffect(() => {
    // When timezone changes, we should refresh the current view
    // but we don't need to clear all cache entries
    fetchSchedule(true);
    // Deliberately not including fetchSchedule as a dependency to prevent loops
  }, [userTimezoneCode]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // For all filter changes, just update the filters
    // and let the applyFilters function handle it locally
    setFilters(newFilters);
  };
  
  // Load more button handler
  const handleLoadMore = () => {
    fetchSchedule(false);
  };
  
  // Render loading state with shimmer effect
  const renderLoading = () => (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {[1, 2, 3].map(i => (
        <motion.div key={`shimmer-${i}`} variants={itemVariants}>
          <ShimmerTimeSlot />
        </motion.div>
      ))}
    </motion.div>
  );
  
  // Render empty state message
  const renderEmptyState = () => (
    <EmptyState
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <h3>No anime found</h3>
      <p>
        There are no anime scheduled for this day with your current filters.
        Try selecting a different day or adjusting your filter settings.
      </p>
    </EmptyState>
  );
  
  // Format time display with timezone
  const formatTimeDisplay = (time) => {
    if (time === 'Unknown') return time;
    
    // Return the time with timezone code for clarity
    return `${time} (${userTimezoneCode})`;
  };
  
  return (
    <Layout>
      <PageContainer
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        <AnimatedPageHeader 
          title="Anime Schedule" 
          subtitle="Browse upcoming anime episodes by day of the week, with local time conversion."
          timezoneCode={userTimezoneCode}
        />
        
        <AnimatedDayTabs 
          activeDay={activeDay} 
          onDayChange={handleDayChange}
        />
        
        <FilterContainer>
          <ScheduleFilter 
            filters={filters}
            onChange={handleFilterChange}
            availableGenres={allGenres}
          />
        </FilterContainer>
        
        <ScheduleContent>
          {isLoading && Object.keys(groupedByTime).length === 0 ? (
            renderLoading()
          ) : filteredAnimeList.length === 0 ? (
            renderEmptyState()
          ) : (
            Object.entries(groupedByTime).map(([time, animeGroup]) => {
              if (time === 'Unknown') {
                return (
                  <UnknownTimeSlot 
                    key="unknown" 
                    animeList={animeGroup} 
                    formatTimeDisplay={formatTimeDisplay}
                  />
                );
              }
              
              return (
                <AnimatedTimeSlot
                  key={time}
                  time={time}
                  animeList={animeGroup}
                  formatTimeDisplay={formatTimeDisplay}
                />
              );
            })
          )}
          
          {!isLoading && hasMore && filteredAnimeList.length > 0 && (
            <LoadMore
              onClick={handleLoadMore}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Load More Shows
            </LoadMore>
          )}
        </ScheduleContent>
      </PageContainer>
    </Layout>
  );
};

export default SchedulePage; 