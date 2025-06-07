import api from "../axiosInstance";
import { processResponse } from "../responseHandler";
import { genreAPI, searchAPI } from "./index";
import { userAPI } from "./index";

/**
 * Logger utility for consistent logging format
 * @param {string} area - The area being logged
 * @param {string} action - The action being performed
 * @param {Object} data - Optional data to log
 */
const logger = (area, action, data = null) => {
  const logMessage = `[EXPLORE API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

/**
 * Explore API service for anime discovery features
 */
const exploreAPI = {
  /**
   * Get anime by genre
   * @param {string} genreId - The genre ID
   * @param {Object} options - Request options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 20)
   * @returns {Promise<Object>} - Genre anime results
   */
  getAnimeByGenre: async (genreId, options = {}) => {
    const { page = 1, limit = 20 } = options;
    logger("Genre", "Getting anime by genre", { genreId, page, limit });

    try {
      const response = await processResponse(
        api.get(`/genres/${genreId}/anime`, {
          params: { page, limit },
        })
      );
      return response;
    } catch (error) {
      console.error(`Error fetching anime for genre ${genreId}:`, error);
      throw error;
    }
  },

  /**
   * Get personalized anime recommendations
   * @param {Object} options - Request options
   * @param {string} options.contentType - Type of content (anime, users, all)
   * @param {number} options.limit - Number of results (default: 20)
   * @param {boolean} options.includeSimilarUsers - Whether to include similar users (for user recommendations)
   * @param {boolean} options.forceRefresh - Whether to force a refresh of recommendations
   * @returns {Promise<Object>} - Personalized recommendations
   */
  getPersonalizedRecommendations: async (options = {}) => {
    const {
      contentType = "anime",
      limit = 20,
      includeSimilarUsers = false,
      forceRefresh = true,
    } = options;

    logger("Recommendations", "Getting personalized recommendations", {
      contentType,
      limit,
      forceRefresh,
    });

    try {
      const params = {
        contentType,
        limit,
      };

      if (contentType === "users" && includeSimilarUsers) {
        params.includeSimilarUsers = true;
      }

      if (forceRefresh) {
        params.refresh = true;
      }

      const response = await processResponse(
        api.get("/recommendations", { params })
      );
      return response;
    } catch (error) {
      console.error("Error fetching personalized recommendations:", error);
      throw error;
    }
  },

  /**
   * Get trending anime
   * @param {Object} options - Request options
   * @param {number} options.limit - Number of results (default: 10)
   * @param {string} options.sort - Sort order (popularity, score)
   * @param {boolean} options.includeRecent - Whether to include recent anime in the results
   * @returns {Promise<Object>} - Trending anime
   */
  getTrendingAnime: async (options = {}) => {
    const { limit = 10, sort = "popularity", includeRecent = false } = options;

    logger("Trending", "Getting trending anime", {
      limit,
      sort,
      includeRecent,
    });

    try {
      const params = {
        limit,
        sort,
      };

      if (includeRecent) {
        params.includeRecent = true;
      }

      const response = await processResponse(
        api.get("/schedule/airing", { params })
      );
      return response;
    } catch (error) {
      console.error("Error fetching trending anime:", error);
      throw error;
    }
  },

  /**
   * Get seasonal anime
   * @param {Object} options - Request options
   * @param {string} options.season - Season (winter, spring, summer, fall)
   * @param {number} options.year - Year
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 20)
   * @param {string} options.sort - Sort order (popularity, score, title)
   * @param {Array|string} options.genres - Genres to filter by
   * @returns {Promise<Object>} - Seasonal anime
   */
  getSeasonalAnime: async (options = {}) => {
    const {
      season = "current",
      year = new Date().getFullYear(),
      page = 1,
      limit = 20,
      sort = "score",
      genres,
    } = options;

    logger("Seasonal", "Getting seasonal anime", { season, year, page, limit });

    try {
      const params = {
        season,
        year,
        page,
        limit,
        sort,
      };

      if (genres) {
        params.genres = Array.isArray(genres) ? genres.join(",") : genres;
      }

      const response = await processResponse(
        api.get("/schedule/season", { params })
      );
      return response;
    } catch (error) {
      console.error("Error fetching seasonal anime:", error);
      throw error;
    }
  },

  /**
   * Get currently airing anime
   * @param {Object} options - Request options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 20)
   * @param {string} options.sort - Sort order (popularity, score, title)
   * @param {Array|string} options.genres - Genres to filter by
   * @returns {Promise<Object>} - Currently airing anime
   */
  getAiringAnime: async (options = {}) => {
    const { page = 1, limit = 20, sort = "popularity", genres } = options;

    logger("Airing", "Getting currently airing anime", { page, limit, sort });

    try {
      const params = { page, limit, sort };

      if (genres) {
        params.genres = Array.isArray(genres) ? genres.join(",") : genres;
      }

      const response = await processResponse(
        api.get("/schedule/airing", { params })
      );
      return response;
    } catch (error) {
      console.error("Error fetching airing anime:", error);
      throw error;
    }
  },

  /**
   * Get upcoming anime
   * @param {Object} options - Request options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 20)
   * @param {string} options.sort - Sort order (popularity, score, title)
   * @param {Array|string} options.genres - Genres to filter by
   * @returns {Promise<Object>} - Upcoming anime
   */
  getUpcomingAnime: async (options = {}) => {
    const { page = 1, limit = 20, sort = "popularity", genres } = options;

    logger("Upcoming", "Getting upcoming anime", { page, limit, sort });

    try {
      const params = { page, limit, sort };

      if (genres) {
        params.genres = Array.isArray(genres) ? genres.join(",") : genres;
      }

      const response = await processResponse(
        api.get("/schedule/upcoming", { params })
      );
      return response;
    } catch (error) {
      console.error("Error fetching upcoming anime:", error);
      throw error;
    }
  },

  /**
   * Get anime schedule by day
   * @param {Object} options - Request options
   * @param {string} options.day - Day of the week (monday, tuesday, etc.)
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 20)
   * @param {string} options.sort - Sort order (broadcast, popularity, score, title)
   * @param {Array|string} options.genres - Genres to filter by
   * @param {string} options.timezone - Timezone code (e.g., IST, EST)
   * @returns {Promise<Object>} - Schedule by day
   */
  getScheduleByDay: async (options = {}) => {
    const {
      day,
      page = 1,
      limit = 20,
      sort = "broadcast",
      genres,
      timezone,
    } = options;

    logger("Schedule", "Getting schedule by day", {
      day,
      page,
      limit,
      sort,
      timezone,
    });

    try {
      const params = { page, limit, sort };

      if (day) {
        params.day = day;
      }

      if (timezone) {
        params.timezone = timezone;
      }

      if (genres) {
        params.genres = Array.isArray(genres) ? genres.join(",") : genres;
      }

      const response = await processResponse(api.get("/schedule", { params }));
      return response;
    } catch (error) {
      console.error("Error fetching schedule:", error);
      throw error;
    }
  },

  /**
   * Get beginner-friendly anime recommendations
   * @param {Object} options - Request options
   * @param {number} options.limit - Number of results (default: 10)
   * @returns {Promise<Object>} - Beginner recommendations
   */
  getBeginnerRecommendations: async (options = {}) => {
    const { limit = 10 } = options;
    logger("Beginner", "Getting beginner recommendations", { limit });

    try {
      const response = await processResponse(
        api.get("/schedule/upcoming/preview", { params: { limit } })
      );
      return response;
    } catch (error) {
      console.error("Error fetching beginner recommendations:", error);
      throw error;
    }
  },

  /**
   * Get public playlists
   * @param {Object} options - Request options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Results per page (default: 10)
   * @returns {Promise<Object>} - Public playlists
   */
  getPublicPlaylists: async (options = {}) => {
    const { page = 1, limit = 10 } = options;
    logger("Playlists", "Getting public playlists", { page, limit });

    try {
      const response = await processResponse(
        api.get("/playlists/public", { params: { page, limit } })
      );
      return response;
    } catch (error) {
      console.error("Error fetching public playlists:", error);
      throw error;
    }
  },

  /**
   * Get recommended users to follow
   * @param {Object} options - Request options
   * @param {number} options.limit - Number of results (default: 10)
   * @returns {Promise<Object>} - Recommended users
   */
  getRecommendedUsers: async (options = {}) => {
    const { limit = 10 } = options;
    logger("Users", "Getting recommended users", { limit });

    try {
      const response = await processResponse(
        api.get("/recommendations", {
          params: {
            contentType: "users",
            limit,
            includeSimilarUsers: true,
          },
        })
      );

      // Extract just the users from the response
      if (response.success && response.data) {
        return {
          success: true,
          data: response.data.users || [],
          pagination: response.data.pagination || {
            page: 1,
            limit,
            total: response.data.users?.length || 0,
            pages: 1,
          },
        };
      }

      return response;
    } catch (error) {
      console.error("Error fetching recommended users:", error);
      throw error;
    }
  },

  /**
   * Get top rated anime
   * @param {Object} options - Request options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Number of results per page (default: 12)
   * @param {string} options.sort - Sort order (default: 'score')
   * @returns {Promise<Object>} - Top rated anime
   */
  getTopRatedAnime: async (options = {}) => {
    const { page = 1, limit = 12, sort = 'score' } = options;
    logger("TopRated", "Getting top rated anime", { page, limit, sort });

    try {
      const response = await processResponse(
        api.get("/schedule/airing", {
          params: {
            page,
            limit,
            sort,
          },
        })
      );
      return response;
    } catch (error) {
      console.error("Error fetching top rated anime:", error);
      throw error;
    }
  },

  /**
   * Search anime, users, or playlists
   * @param {Object} options - Search options
   * @param {string} options.query - Search query
   * @param {string} options.type - Type (anime, users, playlists, all)
   * @param {number} options.page - Page number
   * @param {number} options.limit - Results per page
   * @param {string} options.sort - Sort order (for anime search)
   * @returns {Promise<Object>} - Search results
   */
  search: async (options = {}) => {
    const {
      query = "",
      type = "anime",
      page = 1,
      limit = 20,
      sort = "score",
    } = options;

    logger("Search", `Searching ${type}`, { query, page, limit, sort });

    if (!query || query.length < 2) {
      // Return appropriate empty result structure based on search type
      switch (type.toLowerCase()) {
        case "anime":
          return {
            success: true,
            data: {
              anime: [],
              pagination: { total: 0, page: 1, pages: 0, limit },
            },
          };
        case "users":
          return {
            success: true,
            data: {
              users: [],
              pagination: { total: 0, page: 1, pages: 0, limit },
            },
          };
        case "playlists":
          return {
            success: true,
            data: {
              playlists: [],
              pagination: { total: 0, page: 1, pages: 0, limit },
            },
          };
        case "all":
          return {
            success: true,
            data: {
              anime: [],
              users: [],
              playlists: [],
              counts: { anime: 0, users: 0, playlists: 0, total: 0 },
            },
          };
        default:
          return {
            success: true,
            data: {
              items: [],
              pagination: { total: 0, page: 1, pages: 0, limit },
            },
          };
      }
    }

    try {
      let response;
      const params = { q: query, page, limit };

      if (type === "anime") {
        params.sort = sort;
      }

      // Use appropriate endpoint based on search type
      switch (type.toLowerCase()) {
        case "anime":
          response = await processResponse(api.get("/search", { params }));
          break;
        case "users":
          response = await processResponse(
            api.get("/search/users", { params })
          );
          break;
        case "playlists":
          response = await processResponse(
            api.get("/search/playlists", { params })
          );
          break;
        case "all":
          response = await processResponse(api.get("/search/all", { params }));
          break;
        default:
          throw new Error(`Invalid search type: ${type}`);
      }

      return response;
    } catch (error) {
      console.error(`Error searching ${type}:`, error);
      throw error;
    }
  },

  /**
   * Follow a user
   * @param {string} userId - The user ID to follow
   * @returns {Promise<Object>} - Response with success status
   */
  followUser: async (userId) => {
    logger("Users", "Following user", { userId });

    try {
      return await userAPI.followUser(userId);
    } catch (error) {
      console.error(`Error following user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Unfollow a user
   * @param {string} userId - The user ID to unfollow
   * @returns {Promise<Object>} - Response with success status
   */
  unfollowUser: async (userId) => {
    logger("Users", "Unfollowing user", { userId });

    try {
      return await userAPI.unfollowUser(userId);
    } catch (error) {
      console.error(`Error unfollowing user ${userId}:`, error);
      throw error;
    }
  },

  /**
   * Record an anime view
   * @param {string} animeId - The anime ID
   * @param {Object} options - Request options
   * @param {boolean} options.sendAnalytics - Whether to send analytics data (default: true)
   * @returns {Promise<Object>} - Response
   */
  recordAnimeView: async (animeId, options = {}) => {
    const { sendAnalytics = true } = options;

    logger("Analytics", "Recording anime view", { animeId, sendAnalytics });

    try {
      // Record locally first
      const localViews = localStorage.getItem("anime_local_views") || "{}";
      const viewsObj = JSON.parse(localViews);

      // Record view count and timestamp
      viewsObj[animeId] = {
        count: (viewsObj[animeId]?.count || 0) + 1,
        lastViewed: new Date().toISOString(),
      };

      localStorage.setItem("anime_local_views", JSON.stringify(viewsObj));

      // Only send to API if sendAnalytics is true and user is logged in
      if (sendAnalytics) {
        // This would be an API call in a real implementation
        // For now, just return a simulated successful response
        /*
        const response = await processResponse(
          api.post('/analytics/view', { animeId })
        );
        return response;
        */

        return {
          success: true,
          message: "View recorded successfully",
        };
      }

      return {
        success: true,
        message: "View recorded locally",
      };
    } catch (error) {
      console.error(`Error recording view for anime ${animeId}:`, error);
      // Don't throw error, just log it - view tracking should be non-blocking
      return {
        success: false,
        error: error.message || "Failed to record view",
      };
    }
  },
};

export default exploreAPI;
