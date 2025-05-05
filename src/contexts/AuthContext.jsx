import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, resetAuthFailedState } from '../services/api';
import { saveUserTimezone } from '../utils/simpleTimezoneUtils';
import { saveUserTheme } from '../components/dashboard/SettingsSection';
import { themes } from '../contexts/ThemeContext';
import useToast from '../hooks/useToast';

export const AuthContext = createContext();

// Get the current theme from localStorage (synced with ThemeContext)
const getCurrentTheme = () => {
  return localStorage.getItem('preferred_theme');
};

// Apply theme CSS variables directly for immediate theme changes
const applyThemeDirectly = (themeName) => {
  const theme = themes[themeName];
  if (!theme) return false;
  
  const root = document.documentElement;
  
  // Apply all theme properties as CSS variables
  Object.entries(theme).forEach(([key, value]) => {
    if (key === 'name') return; // Skip the name property
    
    root.style.setProperty(`--${key}`, value);
    
    // Handle RGB conversion for certain properties
    if (typeof value === 'string' && value.startsWith('#') && !value.includes('gradient')) {
      const r = parseInt(value.slice(1, 3), 16);
      const g = parseInt(value.slice(3, 5), 16);
      const b = parseInt(value.slice(5, 7), 16);
      root.style.setProperty(`--${key}-rgb`, `${r}, ${g}, ${b}`);
    }
  });
  
  // Apply theme-specific class to body
  document.body.className = document.body.className
    .split(' ')
    .filter(cls => !cls.endsWith('-theme'))
    .join(' ');
  
  document.body.classList.add(`${themeName}-theme`);
  
  return true;
};

// Debug flag - set to true to enable debug logging
const DEBUG_AUTH = false;

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const fetchInProgress = useRef(false);
  const authFailCount = useRef(0);
  const { showToast } = useToast();

  // Function to sync user preferences (theme, etc.) after setting user data
  const syncUserPreferences = useCallback((userData) => {
    if (!userData) return;
    
    // Sync theme preference if available
    if (userData.settings && userData.settings.interfaceTheme) {
      const newTheme = userData.settings.interfaceTheme;
      const currentTheme = getCurrentTheme();
      
      
      // Save theme to localStorage
      saveUserTheme(newTheme);
      
      // If the theme from the server is different from the current theme, apply it immediately
      if (newTheme !== currentTheme) {
        applyThemeDirectly(newTheme);
      }
    }
    
    // Sync timezone preference if available
    if (userData.settings && userData.settings.timezone) {
      saveUserTimezone(userData.settings.timezone);
    }
  }, []);

  // Function to fetch the current user from the API
  // preserveUIState = true will avoid triggering UI-changing state updates
  const fetchCurrentUser = useCallback(async (force = false, preserveUIState = false) => {
    // Check if token exists
    const token = localStorage.getItem('auth_token');
    if (!token && !force) {
      if (DEBUG_AUTH) console.log('[AUTH DEBUG] No token found, skipping fetch');
      setLoading(false);
      setUser(null);
      setInitialAuthCheckComplete(true);
      return null;
    }
    
    // Prevent concurrent calls
    if (fetchInProgress.current || authFailCount.current >= 3) {
      if (DEBUG_AUTH) console.log('[AUTH DEBUG] Fetch already in progress or too many failures, skipping');
      return null;
    }

    try {
      if (DEBUG_AUTH) console.log('[AUTH DEBUG] Starting fetch of current user');
      fetchInProgress.current = true;
      
      // Only set loading if we're not preserving UI state
      if (!preserveUIState) {
        setLoading(true);
      }
      
      setError(null);
      
      const response = await authAPI.getCurrentUser();
      
      if (response && response.success && response.data) { 
        if (DEBUG_AUTH) console.log('[AUTH DEBUG] Fetch successful');
        
        // Only update user object if we're not in UI preserving mode or if important data changed
        if (!preserveUIState) {
          setUser(response.data);
        } else {
          // When preserving UI state, we still need to update user data, but we do it
          // carefully to avoid UI resets
          setUser(prevUser => {
            // Merge the new settings with the existing user object
            return {
              ...prevUser,
              // Only update settings to preserve UI state
              settings: response.data.settings || prevUser.settings
            };
          });
        }
        
        // Sync user preferences - this won't change UI state
        syncUserPreferences(response.data);
        
        // Reset fail count on success
        authFailCount.current = 0;
        
        // Return the user data for promise chaining
        return response.data;
      } else {
        if (DEBUG_AUTH) console.log('[AUTH DEBUG] Fetch failed, no data or success flag');
        if (!preserveUIState) {
          setUser(null);
        }
        // Increment fail count
        authFailCount.current++;
        
        return null;
      }
    } catch (err) {
      // Special handling for throttled requests - don't count as failure
      if (err?.throttled) {
        if (DEBUG_AUTH) console.log('[AUTH DEBUG] Auth request was throttled to prevent API spam');
        return null;
      }
      
      console.error('[AUTH DEBUG] Error fetching current user:', err);
      if (!preserveUIState) {
        setUser(null);
      }
      setError(err.message || 'Failed to authenticate');
      // Increment fail count on error
      authFailCount.current++;
      
      throw err; // Propagate error for promise chaining
    } finally {
      if (!preserveUIState) {
        setLoading(false);
      }
      fetchInProgress.current = false;
      setInitialAuthCheckComplete(true);
      if (DEBUG_AUTH) console.log('[AUTH DEBUG] Fetch completed');
    }
  }, [syncUserPreferences]);

  // Check auth status on mount
  useEffect(() => {
    fetchCurrentUser();
    
    // Return early cleanup to prevent memory leaks
    return () => {
      fetchInProgress.current = false;
    };
  }, [fetchCurrentUser]);

  // Handle logout
  const logout = async () => {
    try {
      setLoading(true);
      
      // Important: Clear user state before API call to prevent UI flicker
      setUser(null);
      
      // Reset counts and flags
      authFailCount.current = 0;
      resetAuthFailedState();
      
      // Clear all auth-related localStorage and sessionStorage items
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_from_callback');
      localStorage.removeItem('auth_checked');
      localStorage.removeItem('has_valid_token');
      sessionStorage.removeItem('auth_callback_processed');
      
      // Set a flag in sessionStorage to indicate we just logged out
      // This will be used to ensure proper re-login flow
      sessionStorage.setItem('from_logout', 'true');
      
      // Call API to logout server-side
      await authAPI.logout();
      
      // Show success toast
      showToast({
        type: 'success',
        message: 'Successfully logged out'
      });
      
      // Redirect to login page after logout
      window.location.href = '/login';
    } catch (err) {
      console.error('[AUTH DEBUG] Error during logout:', err);
      
      // Still clear user on frontend even if API call fails
      setUser(null);
      
      // Clear auth data even if API call fails
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_from_callback');
      localStorage.removeItem('auth_checked');
      localStorage.removeItem('has_valid_token');
      sessionStorage.removeItem('auth_callback_processed');
      sessionStorage.setItem('from_logout', 'true');
      
      // Show error toast
      showToast({
        type: 'error',
        message: 'Error during logout, but session cleared'
      });
      
      // Force redirect to login page even if logout fails
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function that forces a new fetch and returns a promise
  // preserveUIState = true will avoid triggering UI-changing state updates 
  const refreshUser = useCallback((preserveUIState = false) => {    // Reset the fail count to force a new fetch
    authFailCount.current = 0;
    // Return the promise from fetchCurrentUser for proper async handling
    return fetchCurrentUser(true, preserveUIState);
  }, [fetchCurrentUser]);

  // Function to handle login success from token in URL hash
  const handleLoginSuccess = (userData, token) => {   
    if (userData) {
      setUser(userData);
      // Sync user preferences from login data
      syncUserPreferences(userData);
    }
    
    // Store token
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    
    authFailCount.current = 0;
    resetAuthFailedState();
    
    // Check if we're coming from auth callback
    const fromCallback = localStorage.getItem('auth_from_callback') === 'true';
    
    if (fromCallback) {      
      // Clear the flag
      localStorage.removeItem('auth_from_callback');
      
      // Set initialAuthCheckComplete to true
      setInitialAuthCheckComplete(true);
    } else {
      // Not from auth callback - refresh user data as usual
      setTimeout(() => fetchCurrentUser(true), 100);
    }
  };

  // Function to initiate Google OAuth login
  const loginWithGoogle = () => {
    // Reset fail count
    authFailCount.current = 0;
    // Reset auth failed state
    resetAuthFailedState();
    // Clear any existing token to prevent confusion
    localStorage.removeItem('auth_token');
    
    // Use the authAPI method for Google login
    authAPI.loginWithGoogle();
  };

  // Create value object with all context data and functions
  const value = {
    user,
    loading,
    error,
    isAuthenticated: !!user,
    initialAuthCheckComplete,
    loginWithGoogle,
    handleLoginSuccess,
    logout,
    refreshUser,
    fetchCurrentUser,
    refreshUserData: async () => {
      // This function is used to refresh user data after operations like
      // creating a playlist or updating user settings
      // We use preserveUIState=true to avoid UI flickers
      try {
        const userData = await fetchCurrentUser(true, true);
        return userData;
      } catch (error) {
        console.error('Error refreshing user data:', error);
        return null;
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 