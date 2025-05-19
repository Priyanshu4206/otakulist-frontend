# OtakuList API Caching System

This document outlines the caching system implementation for the OtakuList frontend application, which improves performance by reducing unnecessary network requests and providing better offline capabilities.

## Overview

The OtakuList frontend uses a sophisticated caching system with ETag validation to optimize API interactions, providing several benefits:

1. **Reduced Network Usage**: Prevents redundant data transfers when data hasn't changed
2. **Faster UI Rendering**: Uses cached data while fresh data is being fetched
3. **Offline Support**: Falls back to cached data when network is unavailable
4. **Bandwidth Conservation**: Uses conditional requests with ETags
5. **Improved User Experience**: Eliminates UI flickering by using cached data initially

## Architecture

The caching system consists of several key components:

### 1. ETag Manager (`etagManager.js`)

Handles storing and validating ETags for HTTP conditional requests:
- `getETag`: Retrieves stored ETags for specific resources
- `setETag`: Stores ETags received from API responses
- `removeETag`: Removes specific ETags
- `clearAllETags`: Clears all stored ETags

### 2. Conditional Fetch Utility (`conditionalFetch.js`)

Provides functions for making ETag-aware API requests:
- `fetchWithETag`: Makes a conditional GET request using If-None-Match header
- `fetchWithETagAndCache`: Combines ETag validation with local caching

### 3. Cache Manager (`cacheManager.js`)

Provides a centralized interface for managing caches across all API modules:
- `clearAllCaches`: Clears all caches across all API modules
- `clearUserCaches`: Clears user-specific caches
- `clearAnimeCaches`: Clears anime-related caches
- `clearGenreCaches`: Clears genre-related caches
- `clearSeasonalCaches`: Clears seasonal anime caches
- `clearScheduleCaches`: Clears schedule-related caches
- `clearDashboardCaches`: Clears dashboard section caches

### 4. Enhanced API Modules

Each API module implements caching with consistent patterns:
- TTL (Time-To-Live) configuration for different resource types
- Cache expiration checks
- ETag-based conditional requests
- Fallback to cached data on network errors
- Cache clearing methods

Modules enhanced with caching:
- `userAPI.js`: User settings, timezones, achievements, dashboard sections
- `animeAPI.js`: Anime details, seasonal lists, trending anime
- `genreAPI.js`: Genre lists, genre details, popular genres
- `scheduleAPI.js`: Weekly schedule, day schedules, season previews

## Implementation Pattern

All enhanced API methods follow this pattern:

1. Function accepts `options` with `useCache` and `forceRefresh` parameters
2. If `useCache` is true and not forcing refresh:
   - Check if the cache has expired using `isCacheExpired`
   - If not expired, return cached data with `fromCache: true` flag
   - Otherwise make a conditional request with ETag
3. If server returns 304 Not Modified:
   - Return cached data with appropriate metadata
4. If server returns new data:
   - Update the cache and ETag
   - Return fresh data
5. On network error:
   - Fall back to cached data with `offlineMode: true` flag

## Cache TTLs

Different resource types have different expiration times:

| Resource Type | TTL | Rationale |
|---------------|-----|-----------|
| User Settings | 7 days | Rarely changes, long TTL appropriate |
| Timezones | 7 days | Static data, very long TTL |
| Achievements | 7 days | Changes infrequently |
| Genre Lists | 7 days | Relatively static data |
| Anime Details | 24 hours | May be updated with new info |
| Seasonal Anime | 24 hours | Updated daily with new entries |
| Weekly Schedule | 12 hours | Updated multiple times daily |
| Day Schedule | 6 hours | More frequently updated |

## Metadata in Responses

Enhanced API responses include additional metadata:

- `fromCache`: Indicates data came from local cache
- `notModified`: Indicates server returned 304 Not Modified
- `offlineMode`: Indicates offline fallback was used

## Usage in Components

Components can use the enhanced APIs as follows:

```jsx
// Example using SeasonalAnimeList component
const [anime, setAnime] = useState([]);
const [cacheStatus, setCacheStatus] = useState({
  fromCache: false,
  notModified: false,
  offlineMode: false
});

const fetchSeasonalAnime = async (forceRefresh = false) => {
  // Call enhanced API with caching options
  const response = await animeAPI.getSeasonal(
    currentSeason,
    currentYear,
    1, // page
    20, // limit
    { 
      useCache: true, 
      forceRefresh 
    }
  );
  
  if (response.success) {
    setAnime(response.data.results);
    setCacheStatus({
      fromCache: !!response.fromCache,
      notModified: !!response.notModified,
      offlineMode: !!response.offlineMode
    });
  }
};
```

## Integration with Auth System

The caching system is integrated with the authentication flow:

- On logout, all user-specific caches are cleared
- On account deletion, all caches are cleared
- Authentication failures clear auth-related caches

## Future Improvements

Potential enhancements for the caching system:

1. Add support for IndexedDB for larger dataset caching
2. Implement cache compression for more efficient storage
3. Add background synchronization for offline data updates
4. Implement cache priorities for critical resources
5. Add analytics for cache hit/miss rates

## Conclusion

The caching system significantly improves the OtakuList application's performance and user experience by reducing network requests, speeding up rendering, and providing better offline support. All API modules use a consistent caching pattern, making the system maintainable and extensible. 