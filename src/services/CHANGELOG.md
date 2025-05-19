# API Service Changelog

## 2023-05-15: User API Module Enhancements

### Added
- Integrated ETag caching with user dashboard sections API
- Added `getDashboardSections` endpoint to userAPI for fetching selective user data
- Added cache management utilities in userAPI
- Created example components demonstrating the new API usage
- Added documentation for the modular API structure
- Enhanced caching for Settings, Timezones, and Achievements with 7-day TTL
- Added `clearAllCaches()` utility to clean up all cached user data
- Implemented StatsPageWithETag example using combined API requests

### Changed
- Migrated `getCurrentUser` functionality from authAPI to userAPI
- Updated implementation to use the new server-side `/users/dashboard/sections` endpoint
- Updated AuthContext to use userAPI.getCurrentUser instead of authAPI.getCurrentUser
- Preserved throttling and duplicate request prevention mechanisms
- Added deprecation notice to authAPI.getCurrentUser
- Enhanced simpleTimezones hook to use the improved getAvailableTimezones API
- Updated profile example to demonstrate using refreshUser with preserveUI option

### Usage Examples
New examples have been added to demonstrate the different ways to use the updated API:

1. Using the useCachedApi hook (recommended):
```jsx
const { data, loading, error, refreshData } = useCachedApi({
  url: '/users/dashboard/sections',
  etagKey: 'dashboard_sections_key',
  cacheKey: 'dashboard_data_cache',
  requestOptions: {
    params: { sections: 'user,stats,notifications' }
  }
});
```

2. Using the userAPI module with cache:
```javascript
const response = await userAPI.getDashboardSections({
  sections: ['user', 'stats', 'notifications'],
  useCache: true
});
```

3. Forcing a refresh but still using ETag validation:
```javascript
const response = await userAPI.getDashboardSections({
  sections: ['user', 'stats'],
  useCache: true,
  forceRefresh: true
});
```

4. Clearing the cache for specific sections:
```javascript
userAPI.clearDashboardCache(['notifications', 'achievements']);
```

5. Using the enhanced Settings, Timezones, and Achievements caching:
```javascript
// Fetch settings with caching
const settings = await userAPI.getSettings({ useCache: true });

// Fetch timezones with caching
const timezones = await userAPI.getAvailableTimezones();

// Fetch all achievements with caching
const achievements = await userAPI.getAllAchievements();

// Force refresh but update cache
const freshSettings = await userAPI.getSettings({ forceRefresh: true });

// Clear all caches at once
userAPI.clearAllCaches();
```

### Benefits
- Reduced server load and bandwidth usage with ETag caching
- More modular API structure for better code organization
- Support for selective data fetching (only request the sections needed)
- Improved performance through conditional requests
- Better offline support through cache fallback
- Cached settings, timezones, and achievements with 7-day TTL for rarely changing data 