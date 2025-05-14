import axios from "axios";

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

// Use proxy URL in development, direct URL in production
const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment
  ? "/api"
  : import.meta.env.VITE_API_URL ||
    "https://otaku-backend.jumpingcrab.com/api/v1";
const API_KEY = import.meta.env.VITE_API_KEY;

logger("Config", "API Base URL", BASE_URL);
logger("Config", "Environment", isDevelopment ? "Development" : "Production");

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
  const token = localStorage.getItem("auth_token");
  logger("Auth", "Retrieved token", token ? "Token exists" : "No token found");
  return token;
};

const setAuthToken = (token) => {
  const currentToken = localStorage.getItem("auth_token");
  logger("Auth", "Setting token", token ? "New token provided" : "Clearing token");

  if (token) {
    // If token is different from the current one, it's a new login
    if (token !== currentToken) {
      logger("Auth", "Token changed", "Resetting auth failed state");
      authFailed = false;
    }

    localStorage.setItem("auth_token", token);
    logger("Auth", "Token saved to localStorage");
  } else {
    localStorage.removeItem("auth_token");
    logger("Auth", "Token removed from localStorage");
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

logger("API", "Axios instance created with default config");

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
    logger("Request", "Cancelling duplicate request", requestKey);
    const controller = pendingRequests.get(requestKey);
    controller.abort();
    pendingRequests.delete(requestKey);
  }
};

// Add request interceptor to handle auth
api.interceptors.request.use(
  (config) => {
    logger("Request", "Preparing request", `${config.method.toUpperCase()} ${config.url}`);
    
    // Always ensure the API key is set for all requests per apiKeyMiddleware.js
    config.headers["x-api-key"] = API_KEY;
    logger("Request", "Added API key to headers");

    // Add Authorization header if token exists
    const token = getAuthToken();
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
      logger("Request", "Added auth token to headers");
    } else {
      logger("Request", "No auth token available");
    }

    // If this is an auth request and we've already failed auth, block the request
    if (config.url.includes("/auth/me") && authFailed) {
      logger("Request", "Blocking auth request", "Auth already failed, not retrying");
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
      logger("Request", "Registered GET request", requestKey);
    }

    logger("Request", "Request configured successfully", `${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    logger("Request", "Request configuration error", error.message);
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    logger("Response", "Received successful response", `${response.config.method.toUpperCase()} ${response.config.url}`);
    
    // Remove the request from pendingRequests upon completion
    const requestKey = getRequestKey(response.config);
    pendingRequests.delete(requestKey);
    logger("Response", "Removed from pending requests", requestKey);

    // Reset auth failed flag on success
    if (response.config.url.includes("/auth/me")) {
      logger("Auth", "Auth request succeeded", "Resetting auth failed flag");
      authFailed = false;
    }

    return response.data;
  },
  async (error) => {
    // Remove the request from pendingRequests on error
    if (error.config) {
      const requestKey = getRequestKey(error.config);
      pendingRequests.delete(requestKey);
      logger("Response", "Error response, removed from pending", requestKey);
    }

    // Ignore canceled requests
    if (axios.isCancel(error)) {
      logger("Response", "Request was canceled", error.message);
      return Promise.reject({ canceled: true });
    }

    // Handle CORS errors
    if (error.message === "Network Error") {
      logger("Response", "CORS or network error", {
        origin: window.location.origin,
        message: error.message
      });
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
      logger("Auth", "Authentication failed", "Setting auth failed flag");
      authFailed = true;
      // Clear token if unauthorized
      setAuthToken(null);
    }

    // Handle unauthorized error or token expiration
    if (error.response?.status === 401 && !error.config._retry) {
      logger("Auth", "Unauthorized access (401)", `URL: ${error.config.url}`);
      
      // For auth/me request, we don't need to redirect
      if (!error.config.url.includes("/auth/me")) {
        // Clear token
        setAuthToken(null);
        // Redirect to login for auth errors on non-auth requests
        logger("Auth", "Redirecting to login page", "Token cleared");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }

    logger("Response", "Error response details", {
      status: error.response?.status,
      url: error.config?.url,
      message: error.message
    });
    
    return Promise.reject(error.response?.data || error);
  }
);

// Reset auth failed state (call when logging in or out)
export const resetAuthFailedState = () => {
  logger("Auth", "Resetting auth failed state");
  authFailed = false;
};

// Auth APIs
export const authAPI = {
  // Get current user with throttle to prevent multiple simultaneous calls
  getCurrentUser: () => {
    logger("Auth API", "Getting current user");
    const now = Date.now();

    // If there's already a request in progress, return that promise instead of making a new request
    if (currentAuthRequest) {
      logger("Auth API", "Auth request already in progress", "Returning existing promise");
      return currentAuthRequest;
    }

    // If we've made a request very recently, throttle
    if (now - lastAuthRequestTime < AUTH_REQUEST_THROTTLE_MS) {
      logger("Auth API", "Auth request throttled", `Last request was ${now - lastAuthRequestTime}ms ago`);
      return Promise.reject({
        throttled: true,
        message: "Auth request throttled to prevent excessive API calls",
      });
    }

    // Update last request time
    lastAuthRequestTime = now;
    logger("Auth API", "Making auth request", `/auth/me`);

    // Create a new request and store the promise
    currentAuthRequest = api.get("/auth/me").finally(() => {
      // Set a timeout before clearing the stored promise to prevent immediate subsequent calls
      setTimeout(() => {
        logger("Auth API", "Clearing stored auth request");
        currentAuthRequest = null;
      }, 500);
    });

    return currentAuthRequest;
  },

  // Logout - clear local storage token
  logout: async () => {
    logger("Auth API", "Logging out user");
    try {
      // Call the server logout endpoint
      logger("Auth API", "Calling server logout endpoint");
      await api.post("/auth/logout");
      logger("Auth API", "Server logout successful");
    } catch (error) {
      logger("Auth API", "Error during server logout", error);
      console.error("Error during server logout:", error);
    }

    // Reset auth failed state
    logger("Auth API", "Resetting auth failed state");
    resetAuthFailedState();

    // Clear token
    logger("Auth API", "Clearing auth token");
    setAuthToken(null);

    // Clear all auth-related localStorage items
    logger("Auth API", "Clearing auth-related localStorage items");
    localStorage.removeItem("auth_checked");
    localStorage.removeItem("auth_from_callback");
    localStorage.removeItem("has_valid_token");

    // Clear session storage items
    logger("Auth API", "Clearing auth-related sessionStorage items");
    sessionStorage.removeItem("auth_callback_processed");

    // Set logout flag
    logger("Auth API", "Setting logout flag in sessionStorage");
    sessionStorage.setItem("from_logout", "true");

    // Clear cookies that might be related to auth
    logger("Auth API", "Clearing auth-related cookies");
    document.cookie =
      "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
      window.location.hostname;
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
      window.location.hostname;
    document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

    logger("Auth API", "Logout process completed");
    return { success: true, message: "Logged out successfully" };
  },

  // Google OAuth is handled via redirect
  loginWithGoogle: () => {
    logger("Auth API", "Initiating Google login");
    // Clear any previous state that might interfere with login
    resetAuthFailedState();

    // Direct to Google OAuth endpoint
    const redirectUrl = `${BASE_URL}/auth/google?platform=web`;
    logger("Auth API", "Redirecting to Google OAuth", redirectUrl);
    window.location.href = redirectUrl;
  },

  // Soft delete account or Deactivate the account
  deleteAccount: async () => {
    logger("Auth API", "Deleting account");
    try {
      // First call the server endpoint to delete the account
      logger("Auth API", "Calling server delete account endpoint");
      const response = await api.delete("/auth/delete-account");
      logger("Auth API", "Server delete account successful", response);

      // Reset auth failed state
      logger("Auth API", "Resetting auth failed state");
      resetAuthFailedState();

      // Clear auth token
      logger("Auth API", "Clearing auth token");
      setAuthToken(null);

      // Clear all auth-related localStorage items
      logger("Auth API", "Clearing auth-related localStorage items");
      localStorage.removeItem("auth_checked");
      localStorage.removeItem("auth_from_callback");
      localStorage.removeItem("has_valid_token");

      // Clear session storage items
      logger("Auth API", "Clearing auth-related sessionStorage items");
      sessionStorage.removeItem("auth_callback_processed");

      // Set logout flag
      logger("Auth API", "Setting logout flag in sessionStorage");
      sessionStorage.setItem("from_logout", "true");

      // Clear the specific items mentioned
      const itemsToClear = [
        "all_achievements",
        "genres_list",
        "preferred_theme",
        "theme",
      ];
      
      logger("Auth API", "Clearing additional localStorage items", itemsToClear);
      // Remove each item
      itemsToClear.forEach((item) => localStorage.removeItem(item));

      // Clear cookies that might be related to auth
      logger("Auth API", "Clearing auth-related cookies");
      document.cookie =
        "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
        window.location.hostname;
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
        window.location.hostname;
      document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

      logger("Auth API", "Account deletion process completed");
      return response;
    } catch (error) {
      logger("Auth API", "Error during account deletion", error);
      console.error("Error during account deletion:", error);
      throw error;
    }
  },
};

// User APIs
export const userAPI = {
  /**
   * Fetch a user's public profile and stats by username
   * @param {string} username
   * @returns {Promise}
   */
  getProfile: (username) => {
    logger("User API", "Getting user profile", { username });
    return api.get(`/users/profile/${username}`);
  },

  /**
   * Update profile details and/or avatar in one atomic request (multipart/form-data)
   * @param {FormData} formData
   * @returns {Promise}
   */
  updateProfile: (formData) => {
    logger("User API", "Updating user profile", { formDataSize: formData ? "FormData present" : "No FormData" });
    return api.patch("/users/profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  /**
   * Follow a user by userId
   * @param {string} userId
   * @returns {Promise}
   */
  followUser: (userId) => {
    logger("User API", "Following user", { userId });
    return api.post(`/users/follow/${userId}`);
  },

  /**
   * Unfollow a user by userId
   * @param {string} userId
   * @returns {Promise}
   */
  unfollowUser: (userId) => {
    logger("User API", "Unfollowing user", { userId });
    return api.post(`/users/unfollow/${userId}`);
  },

  /**
   * Get followers of a user
   * @param {string} userId
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise}
   */
  getFollowers: (userId, page = 1, limit = 20) => {
    logger("User API", "Getting user followers", { userId, page, limit });
    return api.get(`/users/${userId}/followers`, { params: { page, limit } });
  },

  /**
   * Get following of a user
   * @param {string} userId
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise}
   */
  getFollowing: (userId, page = 1, limit = 20) => {
    logger("User API", "Getting user following", { userId, page, limit });
    return api.get(`/users/${userId}/following`, { params: { page, limit } });
  },

  /**
   * Get user achievements by userId
   * @param {string} userId
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise}
   */
  getUserAchievements: (userId, page = 1, limit = 20) => {
    logger("User API", "Getting user achievements", { userId, page, limit });
    return api.get(`/users/${userId}/achievements`, { params: { page, limit } });
  },

  /**
   * Get all available achievements
   * @returns {Promise}
   */
  getAllAchievements: () => {
    logger("User API", "Getting all achievements");
    return api.get("/users/achievements");
  },

  /**
   * Get user settings (current user)
   * @returns {Promise}
   */
  getSettings: () => {
    logger("User API", "Getting user settings");
    return api.get("/users/settings");
  },

  /**
   * Update user settings (current user)
   * @param {string} category
   * @param {object} settings
   * @returns {Promise}
   */
  updateSettings: (category, settings) => {
    logger("User API", "Updating user settings", { category, settings });
    return api.patch("/users/settings", { category, settings });
  },

  /**
   * Get available timezones
   * @returns {Promise}
   */
  getTimezones: () => {
    logger("User API", "Getting available timezones");
    return api.get("/users/timezones");
  },
};

// Notification APIs
export const notificationAPI = {
  /**
   * Get notifications for the current user
   * @param {number} [page]
   * @param {number} [limit]
   * @returns {Promise}
   */
  getNotifications: async (page = 1, limit = 20) => {
    logger("Notification API", "Getting notifications", { page, limit });
    try {
      // Add cache busting parameter to prevent stale responses
      const cacheBuster = Date.now();
      logger("Notification API", "Adding cache buster", cacheBuster);
      
      const response = await api.get("/notifications", { 
        params: { 
          page, 
          limit,
          _cb: cacheBuster // Cache busting
        } 
      });
      
      logger("Notification API", "Raw notification response received", response);
      
      // Robustly extract notifications and pagination
      let notifications = [];
      let pagination = { page, limit, total: 0, hasMore: false };
      if (Array.isArray(response.data)) {
        notifications = response.data;
        pagination = response.pagination || response.data.pagination || pagination;
      } else if (Array.isArray(response.data?.data)) {
        notifications = response.data.data;
        pagination = response.data.pagination || pagination;
      }
      logger("Notification API", "Returning notifications", { count: notifications.length, pagination });
      return { notifications, pagination };
    } catch (error) {
      logger("Notification API", "Error fetching notifications", error);
      console.error('[API] Error fetching notifications:', error);
      return { notifications: [], pagination: { page, limit, total: 0, hasMore: false } };
    }
  },

  /**
   * Mark a notification as read
   * @param {string} notificationId
   * @returns {Promise}
   */
  markNotificationRead: (notificationId) => {
    logger("Notification API", "Marking notification as read", { notificationId });
    return api.patch(`/notifications/${notificationId}/read`);
  },

  /**
   * Mark all notifications as read
   * @returns {Promise}
   */
  markAllNotificationsRead: () => {
    logger("Notification API", "Marking all notifications as read");
    return api.patch("/notifications/read-all");
  },

  /**
   * Delete a notification by ID
   * @param {string} notificationId
   * @returns {Promise}
   */
  deleteNotification: (notificationId) => {
    logger("Notification API", "Deleting notification", { notificationId });
    return api.delete(`/notifications/${notificationId}`);
  },
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
  // Get news with pagination and filters
  getNews: (params = {}) => api.get('/news', { 
    params: { 
      page: params.page || 1, 
      limit: params.limit || 20,
      source: params.source,
      category: params.category,
      search: params.search 
    } 
  }),
  
  // Get latest news (useful for homepage)
  getLatestNews: (limit = 10) => api.get('/news', { 
    params: { 
      page: 1, 
      limit, 
    } 
  }),
  
  // Get trending news for homepage (limited to 6)
  getTrendingNews: () => api.get('/news', { 
    params: { 
      page: 1, 
      limit: 6, 
    } 
  }),
  
  // Get news by category
  getNewsByCategory: (category, page = 1, limit = 20) => api.get('/news', { 
    params: { 
      page, 
      limit, 
      category 
    } 
  }),

  // Get news sources
  getNewsSources: () => api.get('/news/sources'),
  
  // Get news categories
  getNewsCategories: () => api.get('/news/categories'),
};

export default api;
