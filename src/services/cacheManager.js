/**
 * Centralized cache management utility
 * Provides a unified interface for clearing and managing caches across all API modules
 */

import { userAPI, animeAPI, genreAPI, scheduleAPI } from './modules';
import { clearAllETags } from './etagManager';

/**
 * Clear all application caches
 * This will clear all caches from all API modules and ETags
 */
export const clearAllCaches = () => {
  // Clear user API caches
  userAPI.clearAllCaches();
  
  // Clear anime API caches
  animeAPI.clearAllCaches();
  
  // Clear genre API caches
  genreAPI.clearGenreCache();
  
  // Clear schedule API caches
  scheduleAPI.clearScheduleCache();
  
  // Clear all ETags (redundant but for safety)
  clearAllETags();
  console.log('[Cache Manager] All caches cleared');
};

/**
 * Clear caches for a specific user
 * This is useful when a user logs out
 */
export const clearUserCaches = () => {
  userAPI.clearAllCaches();
  console.log('[Cache Manager] User caches cleared');
};

/**
 * Clear anime-related caches
 * @param {string} [animeId] - Optional specific anime ID to clear
 */
export const clearAnimeCaches = (animeId) => {
  if (animeId) {
    animeAPI.clearAnimeCache(animeId);
    console.log(`[Cache Manager] Cache cleared for anime ID: ${animeId}`);
  } else {
    animeAPI.clearAllCaches();
    console.log('[Cache Manager] All anime caches cleared');
  }
};

/**
 * Clear genre-related caches
 * @param {string} [genreId] - Optional specific genre ID to clear
 */
export const clearGenreCaches = (genreId) => {
  genreAPI.clearGenreCache(genreId);
  if (genreId) {
    console.log(`[Cache Manager] Cache cleared for genre ID: ${genreId}`);
  } else {
    console.log('[Cache Manager] All genre caches cleared');
  }
};

/**
 * Clear seasonal anime caches
 * @param {string} [season] - Optional specific season to clear (e.g., 'winter', 'spring')
 * @param {number} [year] - Optional year (required if season is provided)
 */
export const clearSeasonalCaches = (season, year) => {
  animeAPI.clearSeasonalCache(season, year);
  if (season && year) {
    console.log(`[Cache Manager] Cache cleared for ${season} ${year}`);
  } else {
    console.log('[Cache Manager] All seasonal caches cleared');
  }
};

/**
 * Clear schedule-related caches
 * @param {string} [type] - Optional type of schedule to clear ('weekly', 'day', 'season')
 */
export const clearScheduleCaches = (type) => {
  scheduleAPI.clearScheduleCache(type);
  if (type) {
    console.log(`[Cache Manager] ${type} schedule cache cleared`);
  } else {
    console.log('[Cache Manager] All schedule caches cleared');
  }
};

/**
 * Clear dashboard caches
 * @param {Array<string>|string} [sections] - Optional specific sections to clear
 */
export const clearDashboardCaches = (sections) => {
  userAPI.clearDashboardCache(sections);
  if (sections) {
    const sectionsStr = Array.isArray(sections) ? sections.join(', ') : sections;
    console.log(`[Cache Manager] Dashboard cache cleared for sections: ${sectionsStr}`);
  } else {
    console.log('[Cache Manager] All dashboard caches cleared');
  }
};

export default {
  clearAllCaches,
  clearUserCaches,
  clearAnimeCaches,
  clearGenreCaches,
  clearSeasonalCaches,
  clearScheduleCaches,
  clearDashboardCaches
}; 