# API Modules

This directory contains modular API service implementations for different domains of the application.

## Module Structure

Each module follows a similar pattern:
- Named export for specific API operations
- Standardized response handling
- Consistent logging

## Available Modules

- `animeAPI`: Anime-related endpoints
- `authAPI`: Authentication-related endpoints
- `genreAPI`: Genre and tag endpoints
- `newsAPI`: News and announcements
- `notificationAPI`: User notifications
- `playlistAPI`: User playlists
- `scheduleAPI`: Anime release schedules
- `userAPI`: User profiles and dashboard data
- `watchlistAPI`: User watchlist

## Recent Changes

### User API Updates

The userAPI module now includes the `getCurrentUser` functionality which has been moved from authAPI. It uses the new `dashboard/sections` endpoint which supports ETag-based caching for efficient loading of user data.

Key new functions:
- `getCurrentUser()`: Fetches the current user data with sections (user, stats, notifications, achievements, recommendations)
- `getDashboardSections(options)`: Flexible API for fetching specific dashboard sections with ETag caching support
- `clearDashboardCache(sections)`: Helper to clear cached dashboard data

Example usage:
```javascript
// Get all dashboard sections with caching
const response = await userAPI.getDashboardSections({
  sections: ['user', 'stats', 'notifications', 'achievements', 'recommendations'],
  useCache: true
});

// Force refresh specific sections
const freshData = await userAPI.getDashboardSections({
  sections: ['notifications', 'recommendations'],
  useCache: true,
  forceRefresh: true
});

// Clear cached data
userAPI.clearDashboardCache(['notifications']);
```

### Enhanced Caching for Settings, Timezones, and Achievements

Settings, timezones, and achievements now have 7-day TTL caching with ETag support:

- `getSettings({ useCache: true, forceRefresh: false })`: Fetch user settings with caching
- `getAvailableTimezones({ useCache: true, forceRefresh: false })`: Fetch available timezones with caching
- `getAllAchievements({ useCache: true, forceRefresh: false })`: Fetch all achievements with caching
- `clearAllCaches()`: Helper to clear all user-related caches

This provides improved performance and reduced API calls for data that rarely changes.

```javascript
// Fetch settings with caching (default)
const response = await userAPI.getSettings();

// Force refresh settings but keep in cache
const freshData = await userAPI.getSettings({ forceRefresh: true });

// Bypass cache completely
const uncachedData = await userAPI.getSettings({ useCache: false });
```

### Auth API Changes

The `getCurrentUser()` method in authAPI has been deprecated in favor of `userAPI.getCurrentUser()`. The authAPI version now just redirects to the userAPI implementation to maintain backward compatibility.

## Using ETag Caching

The updated API modules integrate with the ETag caching system to reduce unnecessary data transfers and improve performance. For best results:

1. Use the built-in cache parameters in API methods that support them
2. For custom implementations, use the `fetchWithETagAndCache` utility from `conditionalFetch.js`
3. For React components, use the `useCachedApi` hook for automatic ETag caching

See examples in `src/services/examples/` directory for implementation patterns:
- `userDashboardExample.jsx`: Using the dashboard sections API with caching
- `profileExample.jsx`: Profile editing with preserveUI refresh pattern
- `StatsPageWithETag.jsx`: Optimized stats page using combined API requests 