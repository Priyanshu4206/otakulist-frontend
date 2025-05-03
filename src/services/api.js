import axios from 'axios';

// Use proxy URL in development, direct URL in production
const isDevelopment = import.meta.env.DEV;
const BASE_URL = isDevelopment 
  ? '/api'
  : (import.meta.env.VITE_API_URL || 'https://otaku-backend.jumpingcrab.com/api/v1');
const API_KEY = import.meta.env.VITE_API_KEY;

// Keep track of pending requests to cancel duplicates
const pendingRequests = new Map();

// Track authentication status to prevent repeated 401 calls
let authFailed = false;

// Storage utilities for JWT token
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

const setAuthToken = (token) => {
  if (token) {
    console.log('[AUTH DEBUG] Setting auth token in storage');
    localStorage.setItem('auth_token', token);
  } else {
    console.log('[AUTH DEBUG] Clearing auth token from storage');
    localStorage.removeItem('auth_token');
  }
};

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    'x-api-key': API_KEY, // Required for all requests per apiKeyMiddleware.js
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Function to create request identifier
const getRequestKey = (config) => {
  return `${config.method}:${config.url}:${JSON.stringify(config.params || {})}`;
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
    config.headers['x-api-key'] = API_KEY;
    
    // Add Authorization header if token exists
    const token = getAuthToken();
    if (token) {
      console.log(`[AUTH DEBUG] Adding Authorization header to ${config.url}`);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    // If this is an auth request and we've already failed auth, block the request
    if (config.url.includes('/auth/me') && authFailed) {
      console.log('[AUTH DEBUG] Blocking /auth/me request - previous auth failed');
      // Create a new controller to immediately abort the request
      const controller = new AbortController();
      config.signal = controller.signal;
      controller.abort('Auth already failed, not retrying');
      return config;
    }
    
    // For GET requests, cancel duplicates and add cancelation controller
    if (config.method.toLowerCase() === 'get') {
      cancelPendingRequests(config);
      
      const controller = new AbortController();
      config.signal = controller.signal;
      
      const requestKey = getRequestKey(config);
      pendingRequests.set(requestKey, controller);
    }
    
    return config;
  },
  (error) => {
    console.log('[AUTH DEBUG] Request interceptor error:', error);
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
    if (response.config.url.includes('/auth/me')) {
      console.log('[AUTH DEBUG] /auth/me request successful, resetting authFailed flag');
      console.log('[AUTH DEBUG] Response data:', JSON.stringify(response.data));
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
      console.log('Request canceled:', error.message);
      return Promise.reject({ canceled: true });
    }
    
    // Log more detailed information about the error
    console.log('API Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Handle CORS errors
    if (error.message === 'Network Error') {
      console.error('CORS or network error detected. Please check if the API server allows requests from:', window.location.origin);
    }
    
    // Set flag for auth failures to prevent repeated calls
    if (error.config?.url.includes('/auth/me') && error.response?.status === 401) {
      console.log('[AUTH DEBUG] Auth check unauthorized (401), setting authFailed flag');
      authFailed = true;
      // Clear token if unauthorized
      setAuthToken(null);
    }
    
    // Handle unauthorized error or token expiration
    if (error.response?.status === 401 && !error.config._retry) {
      // For auth/me request, we don't need to redirect
      if (!error.config.url.includes('/auth/me')) {
        console.log('[AUTH DEBUG] Unauthorized for non-auth request, redirecting to login');
        // Clear token
        setAuthToken(null);
        // Redirect to login for auth errors on non-auth requests
        window.location.href = '/login';
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
  // Get current user
  getCurrentUser: () => api.get('/auth/me'),
  
  // Logout - clear local storage token
  logout: async () => {
    console.log('[AUTH DEBUG] Logging out user - clearing auth data');
    
    try {
      // Call the server logout endpoint
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Error during server logout:', error);
    }
    
    // Reset auth failed state
    resetAuthFailedState();
    
    // Clear token
    setAuthToken(null);
    
    return { success: true, message: 'Logged out successfully' };
  },
  
  // Google OAuth is handled via redirect
  loginWithGoogle: () => {
    // Clear any previous state that might interfere with login
    resetAuthFailedState();
    
    // Direct to Google OAuth endpoint
    window.location.href = `${BASE_URL}/auth/google?platform=web`;
  }
};

// User APIs
export const userAPI = {
  // We don't need userId - according to userRoutes.js, it uses the current user from auth middleware
  updateProfile: (data) => api.patch('/users/update', data),
  updatePassword: (data) => api.put('/auth/password', data),
  getFollowers: (page = 1, limit = 20) => api.get('/users/followers', { params: { page, limit } }),
  getFollowing: (page = 1, limit = 20) => api.get('/users/following', { params: { page, limit } }),
  uploadAvatar: (formData) => api.post('/users/upload-avatar', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getProfile: (username) => api.get(`/users/${username}`),
  followUser: (userId) => api.post(`/users/follow/${userId}`),
  unfollowUser: (userId) => api.post(`/users/unfollow/${userId}`),
  getActivityFeed: (page = 1, limit = 20) => api.get('/users/feed', { params: { page, limit } }),
  getRecommendedUsers: (limit = 5) => api.get('/users/recommended', { params: { limit } }),
  deleteAccount: async () => {
    try {
      // First call the server endpoint to delete the account
      const response = await api.delete('/auth/delete-account');
      
      // After successful deletion, clean up all LocalStorage items
      console.log('[AUTH DEBUG] Deleting account - clearing all LocalStorage data');
      
      // Clear auth tokens
      setAuthToken(null);
      
      // Clear all the specific items mentioned
      const itemsToClear = [
        'all_achievements',
        'genres_list', 
        'preferred_theme',
        'theme',
      ];
      
      // Remove each item
      itemsToClear.forEach(item => localStorage.removeItem(item));
      
      return response;
    } catch (error) {
      console.error('Error during account deletion:', error);
      throw error;
    }
  },
  updateAchievements: (data) => api.post('/users/achievements', data),
  getAllAchievements: () => api.get('/users/achievements/all'),
  getUserAchievements: (username) => {
    if (username) {
      return api.get(`/users/${username}/achievements`);
    }
    return api.get('/users/achievements');
  },
  /**
   * Get all available timezones
   * @returns {Promise} API response with timezones list
   */
  getTimezones: async () => {
    try {
      const response = await api.get('/users/timezones');
      return response;
    } catch (error) {
      handleApiError(error);
      return { success: false, message: error.message };
    }
  },
};

// Watchlist APIs
export const watchlistAPI = {
  // Get all watchlist entries with optional filters
  getWatchlist: (params = {}) => api.get('/watchlist', { params }),
  // Get watchlist entries by status
  getWatchlistByStatus: (status, params = {}) => api.get(`/watchlist/status/${status}`, { params }),
  // Add or update anime in watchlist
  addOrUpdateAnime: (data) => api.post('/watchlist', data),
  // Remove anime from watchlist
  removeFromWatchlist: (animeId) => api.delete(`/watchlist/${animeId}`),
  // Get anime status in watchlist
  getAnimeStatus: (animeId) => api.get(`/watchlist/${animeId}`),
};

// Playlist APIs
export const playlistAPI = {
  // Get user's playlists
  getMyPlaylists: (page = 1, limit = 20, params = {}) => api.get('/playlists/my-playlists', { 
    params: { 
      page, 
      limit,
      ...params 
    } 
  }),
  // Get a specific playlist by slug (not ID)
  getPlaylistBySlug: (slug) => api.get(`/playlists/${slug}`),
  // Create a new playlist
  createPlaylist: (data) => api.post('/playlists', data),
  // Update an existing playlist
  updatePlaylist: (id, data) => api.patch(`/playlists/${id}`, data),
  // Delete a playlist
  deletePlaylist: (id) => api.delete(`/playlists/${id}`),
  // Add anime to playlist
  addAnimeToPlaylist: (playlistId, animeId) => api.post(`/playlists/${playlistId}/anime`, { animeId }),
  // Remove anime from playlist
  removeAnimeFromPlaylist: (playlistId, animeId) => api.delete(`/playlists/${playlistId}/anime/${animeId}`),
  // Like/unlike a playlist
  toggleLike: (playlistId) => api.post(`/playlists/${playlistId}/like`),
};

// Anime APIs
export const animeAPI = {
  getAnimeById: (id) => api.get(`/anime/${id}`),
  getAnimeCharacters: (id, page = 1, limit = 20, mainOnly = true) => 
    api.get(`/characters/anime/${id}`, { 
      params: { 
        page, 
        limit, 
        mainOnly: mainOnly.toString() 
      } 
    }),
  getAnimeStaff: (id) => api.get(`/anime/${id}/staff`),
  getAnimeEpisodes: (id, page = 1) => api.get(`/anime/${id}/episodes`, { params: { page } }),
  getAnimeRecommendations: (id) => api.get(`/anime/${id}/recommendations`),
  getAnimeSimilar: (id) => api.get(`/anime/${id}/similar`),
  getAnimeReviews: (id, page = 1) => api.get(`/anime/${id}/reviews`, { params: { page } }),
  getRandomAnime: () => api.get('/anime/random'),
};

// Character APIs
export const characterAPI = {
  getCharacterById: (id) => api.get(`/characters/${id}`),
  searchCharacters: (query, page = 1, limit = 20) => 
    api.get('/characters/search', { 
      params: { 
        q: query, 
        page, 
        limit 
      } 
    }),
  getPopularCharacters: (page = 1, limit = 20) => 
    api.get('/characters/popular', { 
      params: { 
        page, 
        limit 
      } 
    }),
  getCharactersByAnime: (animeId, page = 1, limit = 20, mainOnly = true) => 
    api.get(`/characters/anime/${animeId}`, { 
      params: { 
        page, 
        limit, 
        mainOnly: mainOnly.toString() 
      } 
    }),
};

// Schedule APIs
export const scheduleAPI = {
  getScheduleByDay: (day, params = {}) => api.get(`/schedule`, { params: { day, status: 'Currently Airing', ...params } }),
  getSeasonalAnime: (season, year, params = {}) => 
    api.get(`/schedule/seasonal`, { params: { season, year, ...params } }),
  getAiringAnime: (params = {}) => api.get('/schedule/airing', { params }),
  getUpcomingAnime: (params = {}) => api.get('/schedule/upcoming', { params }),
};

// Search APIs
export const searchAPI = {
  searchAnime: (params = {}) => api.get('/search', { params }),
};

// Genre APIs
export const genreAPI = {
  getAllGenres: () => api.get('/genres'),
  getPopularGenres: (limit = 10) => api.get('/genres/popular', { params: { limit } }),
  getAnimeByGenre: (genreId, params = {}) => api.get(`/genres/${genreId}/anime`, { params }),
};

export default api;