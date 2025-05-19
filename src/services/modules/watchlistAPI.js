import api from '../axiosInstance';
import { processResponse } from '../responseHandler';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[WATCHLIST API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

/**
 * Watchlist-related API calls
 */
const watchlistAPI = {
  /**
   * Get user's watchlist
   * @param {Object} [filters] - Optional filters like status, sort, etc.
   * @param {number} [page=1]
   * @param {number} [limit=20]
   * @returns {Promise<Object>} Watchlist items with pagination
   */
  getWatchlist: (filters = {}, page = 1, limit = 20) => {
    logger("Watchlist", "Getting user watchlist", { filters, page, limit });
    return processResponse(api.get('/watchlist', { 
      params: { 
        page, 
        limit,
        ...filters
      } 
    }));
  },

  /**
   * Get watchlist status for an anime
   * @param {string} animeId
   * @returns {Promise<Object>} Watchlist status
   */
  getAnimeStatus: (animeId) => {
    logger("Watchlist", "Getting anime status", { animeId });
    return processResponse(api.get(`/watchlist/${animeId}`));
  },

  /**
   * Add or update anime in watchlist
   * @param {string} animeId
   * @param {Object} watchlistData - Status, episode progress, etc.
   * @returns {Promise<Object>} Updated watchlist entry
   */
  addOrUpdateAnime: (uploadData) => {
    logger("Watchlist", "Adding or updating anime in watchlist", { uploadData });
    const payload = {
      animeId: uploadData.animeId,
      status: uploadData.status,
      progress: uploadData.progress,
      rating: uploadData.rating,
      notes: uploadData.notes
    };
    return processResponse(api.post('/watchlist', payload));
  },

  /**
   * Remove anime from watchlist
   * @param {string} animeId
   * @returns {Promise<Object>} Removal result
   */
  removeFromWatchlist: (animeId) => {
    logger("Watchlist", "Removing anime from watchlist", { animeId });
    return processResponse(api.delete(`/watchlist/${animeId}`));
  },

  /**
   * Batch update watchlist entries
   * @param {Array} animeArray - Array of watchlist entries to update
   * @returns {Promise<Object>} Batch update result
   */
  batchUpdateWatchlist: (animeArray) => {
    logger("Watchlist", "Batch updating watchlist", { updateCount: animeArray.length });
    return processResponse(api.post('/watchlist/bulk', { animeArray }));
  },

  /**
   * Get bulk anime status (optimized endpoint)
   * @param {Array} animeIds - Array of anime IDs to check status
   * @returns {Promise<Object>} Status for multiple anime
   */
  getBulkAnimeStatus: (animeIds) => {
    logger("Watchlist", "Getting bulk anime status", { count: animeIds.length });
    return processResponse(api.post('/watchlist/bulk-status', { animeIds }));
  },

  /**
   * Get user watchlist analytics
   * @returns {Promise<Object>} Watchlist statistics and analytics
   */
  getWatchlistAnalytics: () => {
    logger("Watchlist", "Getting watchlist analytics");
    return processResponse(api.get('/watchlist/analytics'));
  },
};

export default watchlistAPI;