import api from '../axiosInstance';
import { processResponse } from '../responseHandler';
import {
  resetAuthFailedState,
  setAuthToken,
  AUTH_REQUEST_THROTTLE_MS,
  isAuthRequestInProgress,
  getLastAuthRequestTime,
  setCurrentAuthRequest,
  setLastAuthRequestTime,
  clearCurrentAuthRequest
} from '../axiosInstance';
import { clearAllCaches } from '../cacheManager';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[AUTH API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

/**
 * Authentication related API calls
 */
const authAPI = {
  /**
   * @deprecated Use userAPI.getCurrentUser() instead which uses the new dashboard/sections endpoint
   * Get current user with throttle to prevent multiple simultaneous calls
   * @returns {Promise<Object>} Current user data
  */
  getCurrentUser: async () => {
    logger("Auth", "getCurrentUser is deprecated", "Redirecting to userAPI.getCurrentUser()");
    
    // Dynamically import userAPI to avoid circular dependencies
    const { default: userAPI } = await import('./userAPI');
    return userAPI.getCurrentUser();
  },

  /**
   * Logout the current user
   * @returns {Promise<Object>} Logout result
   */
  logout: async () => {
    logger("Auth", "Logging out user");
    try {
      // Call the server logout endpoint
      logger("Auth", "Calling server logout endpoint");
      await api.post("/auth/logout");
      logger("Auth", "Server logout successful");
    } catch (error) {
      logger("Auth", "Error during server logout", error);
      console.error("Error during server logout:", error);
    }

    // Reset auth failed state
    logger("Auth", "Resetting auth failed state");
    resetAuthFailedState();

    // Clear token
    logger("Auth", "Clearing auth token");
    setAuthToken(null);

    // Clear all auth-related localStorage items
    logger("Auth", "Clearing auth-related localStorage items");
    localStorage.removeItem("auth_checked");
    localStorage.removeItem("auth_from_callback");
    localStorage.removeItem("has_valid_token");

    // Clear session storage items
    logger("Auth", "Clearing auth-related sessionStorage items");
    sessionStorage.removeItem("auth_callback_processed");

    // Set logout flag
    logger("Auth", "Setting logout flag in sessionStorage");
    sessionStorage.setItem("from_logout", "true");

    // Clear cookies that might be related to auth
    logger("Auth", "Clearing auth-related cookies");
    document.cookie =
      "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
      window.location.hostname;
    document.cookie =
      "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
      window.location.hostname;
    document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    document.cookie = "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
    
    // Clear all API caches on logout
    logger("Auth", "Clearing all API caches");
    clearAllCaches();

    logger("Auth", "Logout process completed");
    return { success: true, message: "Logged out successfully" };
  },

  /**
   * Initiate Google OAuth login
   */
  loginWithGoogle: () => {
    logger("Auth", "Initiating Google login");
    // Clear any previous state that might interfere with login
    resetAuthFailedState();

    // Get the base URL from the API config
    const baseURL = api.defaults.baseURL;

    // Direct to Google OAuth endpoint
    const redirectUrl = `${baseURL}/auth/google?platform=web`;
    logger("Auth", "Redirecting to Google OAuth", redirectUrl);
    window.location.href = redirectUrl;
  },

  /**
   * Soft delete account or Deactivate the account
   * @returns {Promise<Object>} Account deletion result
   */
  deleteAccount: async () => {
    logger("Auth", "Deleting account");
    try {
      // First call the server endpoint to delete the account
      logger("Auth", "Calling server delete account endpoint");
      const response = await processResponse(api.delete("/auth/delete-account"));
      logger("Auth", "Server delete account successful", response);

      // Reset auth failed state
      logger("Auth", "Resetting auth failed state");
      resetAuthFailedState();

      // Clear auth token
      logger("Auth", "Clearing auth token");
      setAuthToken(null);

      // Clear all auth-related localStorage items
      logger("Auth", "Clearing auth-related localStorage items");
      localStorage.removeItem("auth_checked");
      localStorage.removeItem("auth_from_callback");
      localStorage.removeItem("has_valid_token");

      // Clear session storage items
      logger("Auth", "Clearing auth-related sessionStorage items");
      sessionStorage.removeItem("auth_callback_processed");

      // Set logout flag
      logger("Auth", "Setting logout flag in sessionStorage");
      sessionStorage.setItem("from_logout", "true");

      // Clear the specific items mentioned
      const itemsToClear = [
        "all_achievements",
        "genres_list",
        "preferred_theme",
        "theme",
      ];
      
      logger("Auth", "Clearing additional localStorage items", itemsToClear);
      // Remove each item
      itemsToClear.forEach((item) => localStorage.removeItem(item));
      
      // Clear all API caches on account deletion
      logger("Auth", "Clearing all API caches");
      clearAllCaches();

      // Clear cookies that might be related to auth
      logger("Auth", "Clearing auth-related cookies");
      document.cookie =
        "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
        window.location.hostname;
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; domain=" +
        window.location.hostname;
      document.cookie = "jwt=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";
      document.cookie =
        "token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;";

      logger("Auth", "Account deletion process completed");
      return response;
    } catch (error) {
      logger("Auth", "Error during account deletion", error);
      console.error("Error during account deletion:", error);
      throw error;
    }
  },
};

export default authAPI; 