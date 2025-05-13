import axios from "axios";

// Use proxy URL in development, direct URL in production
const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment
  ? "/api"
  : import.meta.env.VITE_API_URL ||
    "https://otaku-backend.jumpingcrab.com/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY;

// Keep track of pending requests to cancel duplicates
const pendingRequests = new Map();

// Track authentication status to prevent repeated 401 calls
let authFailed = false;

// Let's modify how we handle /auth/me requests to prevent multiple calls at once
let currentAuthRequest = null;
let lastAuthRequestTime = 0;
const AUTH_REQUEST_THROTTLE_MS = 2000; // Minimum time between auth requests

// Storage utilities for JWT token
const getAuthToken = () => {
  return localStorage.getItem("auth_token");
};

const setAuthToken = (token) => {
  const currentToken = localStorage.getItem("auth_token");

  if (token) {
    // If token is different from the current one, it's a new login
    if (token !== currentToken) {
      authFailed = false;
    }

    localStorage.setItem("auth_token", token);
  } else {
    localStorage.removeItem("auth_token");
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "x-api-key": API_KEY, // Required for all requests per apiKeyMiddleware.js
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Function to create request identifier
const getRequestKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(
    config.params || {}
  )}`;
};

// Function to cancel duplicate requests
const cancelPendingRequests = (config) => {
  const requestKey = getRequestKey(config);
  if (pendingRequests.has(requestKey)) {
    const controller = pendingRequests.get(requestKey);
    controller.abort();
    pendingRequests.delete(requestKey);
  }
};

// Add request interceptor to handle auth
api.interceptors.request.use(
  (config) => {
    // Always ensure the API key is set for all requests per apiKeyMiddleware.js
    config.headers["x-api-key"] = API_KEY;

    // Add Authorization header if token exists
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }

    // If this is an auth request and we've already failed auth, block the request
    if (config.url.includes("/auth/me") && authFailed) {
      // Create a new controller to immediately abort the request
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort("Auth already failed, not retrying");
      return config;
    }

    // For GET requests, cancel duplicates and add cancelation controller
    if (config.method.toLowerCase() === "get") {
      cancelPendingRequests(config);

      const controller = new AbortController();
      config.signal = controller.signal;

      const requestKey = getRequestKey(config);
      pendingRequests.set(requestKey, controller);
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    // Remove the request from pendingRequests upon completion
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);

    // Reset auth failed flag on success
    if (response.config.url.includes("/auth/me")) {
      authFailed = false;
    }

    return response.data;
  },
  async (error) => {
    // Remove the request from pendingRequests on error
    if (error.config) {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
    }

    // Ignore canceled requests
    if (axios.isCancel(error)) {
      return Promise.reject({ canceled: true });
    }

    // Handle CORS errors
    if (error.message === "Network Error") {
      console.error(
        "CORS or network error detected. Please check if the API server allows requests from:",
        window.location.origin
      );
    }

    // Set flag for auth failures to prevent repeated calls
    if (
      error.config?.url.includes("/auth/me") &&
      error.response?.status === 401
    ) {
      authFailed = true;
      // Clear token if unauthorized
      setAuthToken(null);
    }

    // Handle unauthorized error or token expiration
    if (error.response?.status === 401 && !error.config._retry) {
      // For auth/me request, we don't need to redirect
      if (!error.config.url.includes("/auth/me")) {
        // Clear token
        setAuthToken(null);
        // Redirect to login for auth errors on non-auth requests
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    return Promise.reject(error.response?.data || error);
  }
);

// Reset auth failed state (call when logging in or out)
export const resetAuthFailedState = () => {
  authFailed = false;
};

// Auth APIs
export const authAPI = {
  // Get current user with throttle to prevent multiple simultaneous calls
  getCurrentUser: () => {
    const now = Date.now();

    // If there's already a request in progress, return that promise instead of making a new request
    if (currentAuthRequest) {
      return currentAuthRequest;
    }

    // If we've made a request very recently, throttle
    if (now - lastAuthRequestTime < AUTH_REQUEST_THROTTLE_MS) {
      return Promise.reject({
        throttled: true,
        message: "Auth request throttled to prevent excessive API calls",
      });
    }

    // Update last request time
    lastAuthRequestTime = now;

    // Create a new request and store the promise
    currentAuthRequest = api.get("/auth/me").finally(() => {
      // Set a timeout before clearing the stored promise to prevent immediate subsequent calls
      setTimeout(() => {
        currentAuthRequest = null;
      }, 500);
    });

    return currentAuthRequest;
  },

  // Logout - clear local storage token
  logout: async () => {
    try {
      // Call the server logout endpoint
      await api.post("/auth/logout");
    } catch (error) {
      console.error("Error during server logout:", error);
    }

    // Reset auth failed state
    resetAuthFailedState();

    // Clear token
    setAuthToken(null);

    // Clear all auth-related localStorage items
    localStorage.removeItem("auth_checked");
    localStorage.removeItem("auth_from_callback");
    localStorage.removeItem("has_valid_token");

    // Clear session storage items
    sessionStorage.removeItem("auth_callback_processed");

    // Set logout flag
    sessionStorage.setItem("from_logout", "true");

    // Clear cookies that might be related to auth
    document.cookie =
      "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
      window.location.hostname;
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
      window.location.hostname;
    document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

    return { success: true, message: "Logged out successfully" };
  },

  // Google OAuth is handled via redirect
  loginWithGoogle: () => {
    // Clear any previous state that might interfere with login
    resetAuthFailedState();

    // Direct to Google OAuth endpoint
    window.location.href = `${BASE_URL}/auth/google?platform=web`;
  },
};

// User APIs
export const userAPI = {
  /**
   * Fetch a user's public profile and stats by username
   * @param {string} username
   * @returns {Promise}
   */
  getProfile: (username) => api.get(`/users/profile/${username}`),

  /**
   * Update profile details and/or avatar in one atomic request (multipart/form-data)
   * @param {FormData} formData
   * @returns {Promise}
   */
  updateProfile: (formData) =>
    api.patch("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  /**
   * Follow a user by userId
   * @param {string} userId
   * @returns {Promise}
   */
  followUser: (userId) => api.post(`/users/follow/${userId}`),

  /**
   * Unfollow a user by userId
   * @param {string} userId
   * @returns {Promise}
   */
  unfollowUser: (userId) => api.post(`/users/unfollow/${userId}`),

  /**
   * Get followers of a user
   * @param {string} userId
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise}
   */
  getFollowers: (userId, page = 1, limit = 20) =>
    api.get(`/users/${userId}/followers`, { params: { page, limit } }),

  /**
   * Get following of a user
   * @param {string} userId
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise}
   */
  getFollowing: (userId, page = 1, limit = 20) =>
    api.get(`/users/${userId}/following`, { params: { page, limit } }),

  /**
   * Get notifications for the current user
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise}
   */
  getNotifications: (page = 1, limit = 20) =>
    api.get("/users/notifications", { params: { page, limit } }),

  /**
   * Mark a notification as read
   * @param {string} notificationId
   * @returns {Promise}
   */
  markNotificationRead: (notificationId) =>
    api.patch(`/users/notifications/${notificationId}/read`),

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAllNotificationsRead: () => api.patch("/users/notifications/read-all"),

  /**
   * Get user achievements by userId
   * @param {string} userId
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise}
   */
  getUserAchievements: (userId, page = 1, limit = 20) =>
    api.get(`/users/${userId}/achievements`, { params: { page, limit } }),

  /**
   * Get all available achievements
   * @returns {Promise}
   */
  getAllAchievements: () => api.get("/users/achievements"),

  /**
   * Get user settings (current user)
   * @returns {Promise}
   */
  getSettings: () => api.get("/users/settings"),

  /**
   * Update user settings (current user)
   * @param {string} category
   * @param {object} settings
   * @returns {Promise}
   */
  updateSettings: (category, settings) =>
    api.patch("/users/settings", { category, settings }),

  /**
   * Get available timezones
   * @returns {Promise}
   */
  getTimezones: () => api.get("/users/timezones"),

  /**
   * Delete a notification by ID
   * @param {string} notificationId
   * @returns {Promise}
   */
  deleteNotification: (notificationId) =>
    api.delete(`/users/notifications/${notificationId}`),
};

// Watchlist APIs
export const watchlistAPI = {
  // Get all watchlist entries with optional filters
  getWatchlist: (params = {}) => api.get("/watchlist", { params }),
  // Get watchlist entries by status
  getWatchlistByStatus: (status, params = {}) =>
    api.get(`/watchlist/status/${status}`, { params }),
  // Add or update anime in watchlist
  addOrUpdateAnime: (data) => api.post("/watchlist", data),
  // Remove anime from watchlist
  removeFromWatchlist: (animeId) => api.delete(`/watchlist/${animeId}`),
  // Get anime status in watchlist
  getAnimeStatus: (animeId) => api.get(`/watchlist/${animeId}`),
};

// Handle API errors consistently
const handleError = (error) => {
  console.error("API Error:", error);
};

// Playlist APIs
export const playlistAPI = {
  // Get user's playlists
  getMyPlaylists: async (page = 1, limit = 12) => {
    try {
      const response = await api.get(
        `/playlists/my-playlists?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message || "Failed to fetch playlists",
        },
      };
    }
  },

  // Get public playlists
  getPublicPlaylists: async (page = 1, limit = 12) => {
    try {
      const response = await api.get(
        `/playlists/public?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            "Failed to fetch public playlists",
        },
      };
    }
  },

  // Get user's playlists by username
  getUserPlaylists: async (username, page = 1, limit = 12) => {
    try {
      const response = await api.get(
        `/playlists/user/${username}?page=${page}&limit=${limit}`
      );
      return {
        success: true,
        data: response.data,
        pagination: response.pagination,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            "Failed to fetch user playlists",
        },
      };
    }
  },

  // Get playlist by ID
  getPlaylistById: async (id) => {
    try {
      const response = await api.get(`/playlists/id/${id}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message || "Failed to fetch playlist",
        },
      };
    }
  },

  // Get playlist by slug
  getPlaylistBySlug: async (slug) => {
    try {
      const response = await api.get(`/playlists/${slug}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message || "Failed to fetch playlist",
        },
      };
    }
  },

  // Create a new playlist
  createPlaylist: async (playlistData) => {
    try {
      const response = await api.post("/playlists", playlistData);

      // Return standardized response format
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            error.message ||
            "Failed to create playlist",
        },
      };
    }
  },

  // Update a playlist
  updatePlaylist: async (playlistId, updateData) => {
    try {
      const response = await api.patch(`/playlists/${playlistId}`, updateData);

      // Return standardized response format
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            error.message ||
            "Failed to update playlist",
        },
      };
    }
  },

  // Delete a playlist
  deletePlaylist: async (playlistId) => {
    try {
      const response = await api.delete(`/playlists/${playlistId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message || "Failed to delete playlist",
        },
      };
    }
  },

  // Add anime to playlist
  addAnimeToPlaylist: async (playlistId, animeId) => {
    try {
      const response = await api.post(`/playlists/${playlistId}/anime`, {
        animeId,
      });
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            "Failed to add anime to playlist",
        },
      };
    }
  },

  // Remove anime from playlist
  removeAnimeFromPlaylist: async (playlistId, animeId) => {
    try {
      const response = await api.delete(
        `/playlists/${playlistId}/anime/${animeId}`
      );
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            "Failed to remove anime from playlist",
        },
      };
    }
  },

  // Like/unlike a playlist
  likePlaylist: async (playlistId) => {
    try {
      const response = await api.post(`/playlists/${playlistId}/like`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            error.message ||
            "Failed to like/unlike playlist",
        },
      };
    }
  },

  // Create or add to playlist
  createOrAddToPlaylist: async (data) => {
    try {
      const response = await api.post("/playlists/add-anime", data);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message:
            error.response?.data?.error?.message ||
            "Failed to create or add to playlist",
        },
      };
    }
  },
};

// Anime APIs
export const animeAPI = {
  getAnimeById: (id) => api.get(`/anime/${id}`),
  getAnimeCharacters: (id, page = 1, limit = 20, mainOnly = true) =>
    api.get(`/characters/anime/${id}`, {
      params: {
        page,
        limit,
        mainOnly: mainOnly.toString(),
      },
    }),
  getAnimeStaff: (id) => api.get(`/anime/${id}/staff`),
  getAnimeEpisodes: (id, page = 1) =>
    api.get(`/anime/${id}/episodes`, { params: { page } }),
  getAnimeRecommendations: (id) => api.get(`/anime/${id}/recommendations`),
  getAnimeSimilar: (id) => api.get(`/anime/${id}/similar`),
  getAnimeReviews: (id, page = 1) =>
    api.get(`/anime/${id}/reviews`, { params: { page } }),
  getRandomAnime: () => api.get("/anime/random"),

  // Anime Ratings
  getAnimeRatings: (id, page = 1, limit = 20) =>
    api.get(`/anime/${id}/ratings`, { params: { page, limit } }),
  rateAnime: (animeId, score, comment = "") =>
    api.post(`/anime/${animeId}/rate`, { score, comment }),
  deleteRating: (animeId) =>
    api.delete(`/anime/${animeId}/rate`),
};

// Character APIs
export const characterAPI = {
  getCharacterById: (id) => api.get(`/characters/${id}`),
  searchCharacters: (query, page = 1, limit = 20) =>
    api.get("/characters/search", {
      params: {
        q: query,
        page,
        limit,
      },
    }),
  getPopularCharacters: (page = 1, limit = 20) =>
    api.get("/characters/popular", {
      params: {
        page,
        limit,
      },
    }),
  getCharactersByAnime: (animeId, page = 1, limit = 20, mainOnly = true) =>
    api.get(`/characters/anime/${animeId}`, {
      params: {
        page,
        limit,
        mainOnly: mainOnly.toString(),
      },
    }),
};

// Schedule APIs
export const scheduleAPI = {
  getScheduleByDay: (day, params = {}) =>
    api.get(`/schedule`, {
      params: { day, status: "Currently Airing", ...params },
    }),
  getSeasonalAnime: (season, year, params = {}) =>
    api.get(`/schedule/seasonal`, { params: { season, year, ...params } }),
  getAiringAnime: (params = {}) => api.get("/schedule/airing", { params }),
  getUpcomingAnime: (params = {}) => api.get("/schedule/upcoming", { params }),
};

// Search APIs
export const searchAPI = {
  searchAnime: (params = {}) => api.get("/search", { params }),
};

// Genre APIs
export const genreAPI = {
  getAllGenres: () => api.get("/genres"),
  getPopularGenres: (limit = 10) =>
    api.get("/genres/popular", { params: { limit } }),
  getAnimeByGenre: (genreId, params = {}) =>
    api.get(`/genres/${genreId}/anime`, { params }),
};

// Anime Rating API
export const animeRatingAPI = {
  /**
   * Rate an anime with score and optional comment
   * @param {string} animeId - The ID of the anime to rate
   * @param {number} score - Rating score (1-10)
   * @param {string} comment - Optional comment about the rating
   * @returns {Promise} - Standardized response
   */
  rateAnime: async (animeId, score, comment = "") => {
    try {
      const response = await api.post("/ratings", {
        animeId,
        score,
        comment
      });
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || "Failed to rate anime"
        }
      };
    }
  },

  /**
   * Delete a rating for an anime
   * @param {string} animeId - The ID of the anime to remove rating for
   * @returns {Promise} - Standardized response
   */
  deleteRating: async (animeId) => {
    try {
      const response = await api.delete(`/anime/${animeId}`);
      
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      handleError(error);
      return {
        success: false,
        error: {
          message: error.response?.data?.error?.message || "Failed to delete anime rating"
        }
      };
    }
  },
};

// News APIs
export const newsAPI = {
  // Get news with pagination
  getNews: (page = 1, limit = 20) => api.get('/news', { 
    params: { page, limit } 
  }),
  
  // Get latest news (useful for homepage)
  getLatestNews: (limit = 10) => api.get('/news', { 
    params: { page: 1, limit, sort: 'publishedAt' } 
  }),
  
  // Get news by category
  getNewsByCategory: (category, page = 1, limit = 20) => api.get('/news', { 
    params: { page, limit, category } 
  }),
};

export default api;
