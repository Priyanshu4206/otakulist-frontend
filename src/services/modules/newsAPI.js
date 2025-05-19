import api from '../axiosInstance';
import { processResponse } from '../responseHandler';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[NEWS API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

/**
 * News-related API calls
 */
const newsAPI = {
  /**
   * Get latest news
   * @param {Object} options - Query options
   * @param {number} [options.page=1] - Page number
   * @param {number} [options.limit=20] - Items per page
   * @param {string} [options.source] - News source filter
   * @param {string} [options.category] - News category filter
   * @param {string} [options.search] - Search term
   * @returns {Promise<Object>} News articles with pagination
   */
  getNews: (options = {}) => {
    const { page = 1, limit = 20, source, category, search } = options;
    logger("News", "Getting news", { page, limit, source, category, search });
    
    const params = { page, limit };
    if (source) params.source = source;
    if (category) params.category = category;
    if (search) params.search = search;
    
    return processResponse(api.get('/news', { params }));
  },

  /**
   * Get news sources
   * @returns {Promise<Object>} Available news sources
   */
  getNewsSources: () => {
    logger("News", "Getting news sources");
    return processResponse(api.get('/news/sources'));
  },

  /**
   * Get news categories
   * @returns {Promise<Object>} Available news categories
   */
  getNewsCategories: () => {
    logger("News", "Getting news categories");
    return processResponse(api.get('/news/categories'));
  },

  /**
   * Get trending news (convenience method that uses getNews with default params)
   * @param {number} [limit=10] - Number of news items
   * @returns {Promise<Object>} News articles
   */
  getTrendingNews: (limit = 10) => {
    logger("News", "Getting trending news", { limit });
    return processResponse(api.get('/news', { params: { limit } }));
  },


};

export default newsAPI; 