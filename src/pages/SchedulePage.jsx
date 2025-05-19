import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import Layout from '../components/layout/Layout';
import ShimmerTimeSlot from '../components/schedule/ShimmerTimeSlot';
import UnknownTimeSlot from '../components/schedule/UnknownTimeSlot';
import { getUserTimezone, getIANATimezone } from '../utils/simpleTimezoneUtils';

// Import our new animated components
import AnimatedDayTabs from '../components/schedule/AnimatedDayTabs';
import AnimatedTimeSlot from '../components/schedule/AnimatedTimeSlot';
import AnimatedPageHeader from '../components/schedule/AnimatedPageHeader';
import ScheduleFilter from '../components/schedule/ScheduleFilter';
import { scheduleAPI } from '../services/modules';

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
  
  @media (max-width: 480px) {
    padding: 0.75rem;
    margin-top: 5rem;
  }
`;

const ScheduleContent = styled(motion.div)`
  margin-top: 2rem;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 1rem;
  }
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
  
  @media (max-width: 768px) {
    padding: 0.8rem 1.8rem;
    margin: 2.5rem auto;
  }
  
  @media (max-width: 480px) {
    padding: 0.7rem 1.5rem;
    font-size: 0.9rem;
    margin: 2rem auto;
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
  
  @media (max-width: 768px) {
    padding: 3rem 1.5rem;
    
    h3 {
      font-size: 1.3rem;
    }
    
    p {
      font-size: 0.9rem;
    }
  }
  
  @media (max-width: 480px) {
    padding: 2rem 1rem;
    margin: 1.5rem 0;
    
    h3 {
      font-size: 1.2rem;
      margin-bottom: 0.75rem;
    }
    
    p {
      font-size: 0.85rem;
      line-height: 1.5;
    }
  }
`;

const FilterContainer = styled(motion.div)`
  margin: 1.5rem 0;
  border-radius: 12px;
  padding: 1.5rem 0;
  backdrop-filter: blur(10px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  z-index: 10; /* Higher z-index to ensure filter works properly */
  
  @media (max-width: 768px) {
    padding: 1.25rem 0;
    margin: 1.25rem 0;
  }
  
  @media (max-width: 480px) {
    position: fixed;
    backdrop-filter: blur(0px);
    background-color: rgba(var(--cardBackground-rgb), 1);
    top: 2.5rem;
    left: 0;
    right: 0;
    padding: 1rem;
    margin: 1rem 0;
    padding-bottom: 0;
    border-radius: 10px;
  }
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

// Rate limiting mechanism to prevent excessive API calls
const API_CALL_THROTTLE = 3000; // 3 seconds between API calls
const lastApiCallTime = {};

const SchedulePage = () => {
  // Get today's day name to use as default
  const getTodayDayName = () => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    return days[new Date().getDay()];
  };
  
  // Get user's timezone preference (the code, e.g., IST)
  const userTimezoneCode = getUserTimezone();
  // Get the IANA timezone for API calls
  const userTimezone = getIANATimezone(userTimezoneCode);
  
  // State for the active day tab
  const [activeDay, setActiveDay] = useState(getTodayDayName());
  
  // State for current page and filters
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
  const [hasMore, setHasMore] = useState(false); // Default to false until we know there's more
  const [isLoading, setIsLoading] = useState(false);
  const [showShimmer, setShowShimmer] = useState(false);
  
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
        const titles = [];
        
        // Add primary titles
        if (anime.titles) {
          if (anime.titles.default) titles.push(anime.titles.default);
          if (anime.titles.english) titles.push(anime.titles.english);
          if (anime.titles.japanese) titles.push(anime.titles.japanese);
          
          // Add synonym titles if available
          if (anime.titles.synonyms && Array.isArray(anime.titles.synonyms)) {
            titles.push(...anime.titles.synonyms);
          }
        }
        
        // Add legacy title fields for backward compatibility
        if (anime.title_english) titles.push(anime.title_english);
        if (anime.title) titles.push(anime.title);
        if (anime.title_japanese) titles.push(anime.title_japanese);
        
        // Check if any title contains the search term
        return titles.some(title => 
          title && title.toLowerCase().includes(search)
        );
      });
    }
    
    // Apply rating filter
    if (filters.rating) {
      result = result.filter(anime => {
        // Extract anime rating and handle different formats
        const animeRating = anime.rating || '';
        
        // If rating matches exactly or begins with our filter string
        return (
          animeRating === filters.rating || 
          animeRating.startsWith(filters.rating) ||
          // Also check if rating contains our filter value for partial matches
          animeRating.toLowerCase().includes(filters.rating.toLowerCase())
        );
      });
    }
    
    // Apply genres filter (multi-select)
    if (filters.genres && filters.genres.length > 0) {
      result = result.filter(anime => {
        if (!anime.genres || !Array.isArray(anime.genres)) return false;
        
        // Check if any selected genre matches any of the anime's genres
        return anime.genres.some(genre => {
          // Handle both string genres and object genres with name property
          const genreName = typeof genre === 'string' 
            ? genre.toLowerCase() 
            : ((genre.name || '').toLowerCase());
          
          // Check if this genre is in our selected genres
          return filters.genres.includes(genreName);
        });
      });
    }
    
    // Apply sort
    if (filters.sort) {
      result.sort((a, b) => {
        switch (filters.sort) {
          case 'title':
            // Get titles for comparison
            const titleA = a.titles?.default || a.titles?.english || a.title_english || a.title || '';
            const titleB = b.titles?.default || b.titles?.english || b.title_english || b.title || '';
            return titleA.localeCompare(titleB);
          
          case 'popularity':
            // Higher popularity number is better
            const popA = typeof a.popularity === 'number' ? a.popularity : 0;
            const popB = typeof b.popularity === 'number' ? b.popularity : 0;
            return popB - popA; // Descending order
          
          case 'score':
            // Higher score is better
            const scoreA = typeof a.score === 'number' ? a.score : 0;
            const scoreB = typeof b.score === 'number' ? b.score : 0;
            return scoreB - scoreA; // Descending order
          
          case 'year':
            // More recent year is better
            const yearA = typeof a.year === 'number' ? a.year : 0;
            const yearB = typeof b.year === 'number' ? b.year : 0;
            return yearB - yearA; // Descending order
          
          case 'broadcast':
          default:
            // Sort by broadcast time
            if (!a.broadcast?.time) return 1;
            if (!b.broadcast?.time) return -1;
            
            try {
              const [aHours, aMinutes] = a.broadcast.time.split(':').map(Number);
              const [bHours, bMinutes] = b.broadcast.time.split(':').map(Number);
              
              // Compare hours first, then minutes
              return aHours !== bHours ? aHours - bHours : aMinutes - bMinutes;
            } catch (e) {
              // Fallback if broadcast time parsing fails
              return 0;
            }
        }
      });
    }
    
    setFilteredAnimeList(result);
  }, [originalData, filters]);

  // Update filtered list when filters change
  useEffect(() => {
    applyFilters();
  }, [filters, applyFilters]);
  
  // Check if API call is allowed based on throttling
  const canMakeApiCall = useCallback((day) => {
    const now = Date.now();
    
    if (!lastApiCallTime[day] || (now - lastApiCallTime[day]) > API_CALL_THROTTLE) {
      lastApiCallTime[day] = now;
      return true;
    }
    
    return false;
  }, []);
  
  // Fetch schedule data using scheduleAPI
  const fetchSchedule = useCallback(async (reset = false) => {
    // Prevent duplicate calls if already loading
    if (isLoading && !reset) return;
    
    // Check if we can make an API call for this day (throttling)
    if (!canMakeApiCall(activeDay) && !reset) {
      console.warn(`API call for ${activeDay} was throttled. Try again later.`);
      return;
    }
    
    try {
      // If we're resetting, clear previous data
      if (reset) {
        setAnimeList([]);
        setFilteredAnimeList([]);
        setHasMore(false);
      }
      
      // Set loading state
      setIsLoading(true);
      setShowShimmer(true);
      
      // Use the scheduleAPI.getDaySchedule method with caching built-in
      const response = await scheduleAPI.getDaySchedule(
        activeDay,
        userTimezone,
        {
          useCache: true,
          forceRefresh: false
        }
      );
      
      // Process API response
      let animeData = [];
      
      // Handle new API response structure
      if (response) {
        if (response.success && response.data?.items) {
          // New API structure: {success: true, data: {items: [...], pagination: {...}}}
          animeData = response.data.items || [];
        } else if (response.data?.items && Array.isArray(response.data.items)) {
          // Data with items array
          animeData = response.data.items;
        } else if (Array.isArray(response.data)) {
          // Direct array response (legacy)
          animeData = response.data;
        } else if (response.data) {
          // For any other structure, try to use the data directly
          animeData = response.data;
        }
      }
      
      // Update state only if we have data
      if (animeData.length > 0) {
        setOriginalData(animeData);
        setAnimeList(animeData);
        setFilteredAnimeList(animeData);
      } else {
        // If we got no data, clear any existing data
        setOriginalData([]);
        setAnimeList([]);
        setFilteredAnimeList([]);
      }
      
      // We're not supporting pagination anymore as the api doesn't seem to support it
      setHasMore(false);
      
      // Reset loading state with a small delay for better UX
      setIsLoading(false);
      setTimeout(() => setShowShimmer(false), 500);
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setHasMore(false);
      setIsLoading(false);
      setShowShimmer(false);
      
      // On error, clear data
      setOriginalData([]);
      setAnimeList([]);
      setFilteredAnimeList([]);
    }
  }, [activeDay, canMakeApiCall, isLoading, userTimezone]);
  
  // Initial fetch on component mount and when active day changes - use refs to prevent excessive calls
  const initialLoadRef = useRef({});
  
  useEffect(() => {
    // First check if we already have data for this day in our state
    if (filteredAnimeList.length > 0 && originalData.length > 0) {
      // We already have data loaded, no need to fetch
      setIsLoading(false);
      setShowShimmer(false);
      return;
    }

    // Check if we've already loaded this day in this session
    // This will prevent duplicate API calls
    if (!initialLoadRef.current[activeDay]) {
      initialLoadRef.current[activeDay] = true;
      fetchSchedule(true);
    } else {
      // If we've loaded this day before but don't have data now,
      // we should fetch anyway because the data might have been cleared
      // This fixes the issue of returning to a day and seeing no data
      if (filteredAnimeList.length === 0) {
        fetchSchedule(true);
      }
    }
  }, [activeDay, fetchSchedule, filteredAnimeList.length, originalData.length]);
  
  // Handle day tab change with debouncing to prevent multiple calls
  const handleDayChange = useCallback((day) => {
    // If we're already on this day, don't do anything
    if (day === activeDay) return;
    
    // Clear previous data before switching days
    setAnimeList([]);
    setFilteredAnimeList([]);
    setOriginalData([]);
    setHasMore(false);
    
    // Then update the active day to trigger data loading
    setActiveDay(day);
  }, [activeDay]);
  
  // Handle timezone change
  useEffect(() => {
    // When timezone changes, we should reset the initialLoadRef so we fetch fresh data
    initialLoadRef.current = {};
    
    if (activeDay) {
      // Clear existing data
      setAnimeList([]);
      setFilteredAnimeList([]);
      setOriginalData([]);
      
      // Fetch fresh data with new timezone
      fetchSchedule(true);
    }
  }, [userTimezoneCode, activeDay, fetchSchedule]);
  
  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    // For all filter changes, just update the filters
    // and let the applyFilters function handle it locally
    setFilters(newFilters);
  };
  
  // Refresh data handler
  const handleRefresh = () => {
    // Clear cache for this day and refetch
    scheduleAPI.clearScheduleCache('day');
    fetchSchedule(true);
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
          <ShimmerTimeSlot cardsCount={2} />
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
          {(showShimmer || (isLoading && Object.keys(groupedByTime).length === 0)) ? (
            renderLoading()
          ) : (!showShimmer && !isLoading && filteredAnimeList.length === 0) ? (
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
          
          {!showShimmer && !isLoading && filteredAnimeList.length > 0 && (
            <LoadMore
              onClick={handleRefresh}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
            >
              Refresh Schedule
            </LoadMore>
          )}
        </ScheduleContent>
      </PageContainer>
    </Layout>
  );
};

export default SchedulePage; 