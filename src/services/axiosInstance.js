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

// Storage utilities for JWT token
export const getAuthToken = () => {
  const token = localStorage.getItem("auth_token");
  logger("Auth", "Retrieved token", token ? "Token exists" : "No token found");
  return token;
};

export const setAuthToken = (token) => {
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

// Reset auth failed state (call when logging in or out)
export const resetAuthFailedState = () => {
  logger("Auth", "Resetting auth failed state");
  authFailed = false;
};

// Create axios instance with default config
const api = axios.create({
  baseURL: BASE_URL,
  timeout: 30000,
  headers: {
    "x-api-key": API_KEY,
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

// Let's modify how we handle /auth/me requests to prevent multiple calls at once
let currentAuthRequest = null;
let lastAuthRequestTime = 0;
export const AUTH_REQUEST_THROTTLE_MS = 2000; // Minimum time between auth requests
export const getLastAuthRequestTime = () => lastAuthRequestTime;
export const isAuthRequestInProgress = () => !!currentAuthRequest;

export const setCurrentAuthRequest = (request) => {
  currentAuthRequest = request;
};
export const setLastAuthRequestTime = (time) => {
  lastAuthRequestTime = time;
};
export const clearCurrentAuthRequest = () => {
  currentAuthRequest = null;
};
export const getAuthFailedStatus = () => authFailed;
export const setAuthFailedStatus = (status) => {
  authFailed = status;
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
      
      // Reset authFailed flag if we have a valid token and has_valid_token is true
      // This handles cases where the flag might be incorrectly set
      if (authFailed && localStorage.getItem('has_valid_token') === 'true') {
        logger("Auth", "Resetting incorrect auth failed state due to valid token");
        authFailed = false;
      }
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

export default api; 