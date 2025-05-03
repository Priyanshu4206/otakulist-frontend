import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, resetAuthFailedState } from '../services/api';
import { saveUserTimezone } from '../utils/simpleTimezoneUtils';
import { saveUserTheme } from '../components/dashboard/SettingsSection';
import { themes } from '../contexts/ThemeContext';

export const AuthContext = createContext();

// Get the current theme from localStorage (synced with ThemeContext)
const getCurrentTheme = () => {
  return localStorage.getItem('preferred_theme');
};

// Apply theme CSS variables directly for immediate theme changes
const applyThemeDirectly = (themeName) => {
  const theme = themes[themeName];
  if (!theme) return false;
  
  console.log('[AUTH DEBUG] Directly applying theme:', themeName);
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

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const fetchInProgress = useRef(false);
  const authFailCount = useRef(0);

  // Function to sync user preferences (theme, etc.) after setting user data
  const syncUserPreferences = useCallback((userData) => {
    if (!userData) return;
    
    // Sync theme preference if available
    if (userData.settings && userData.settings.interfaceTheme) {
      const newTheme = userData.settings.interfaceTheme;
      const currentTheme = getCurrentTheme();
      
      console.log('[AUTH DEBUG] Syncing user theme preference:', newTheme, 'Current theme:', currentTheme);
      
      // Save theme to localStorage
      saveUserTheme(newTheme);
      
      // If the theme from the server is different from the current theme, apply it immediately
      if (newTheme !== currentTheme) {
        console.log('[AUTH DEBUG] Theme changed from server, applying immediately:', newTheme);
        applyThemeDirectly(newTheme);
      }
    }
    
    // Sync timezone preference if available
    if (userData.settings && userData.settings.timezone) {
      console.log('[AUTH DEBUG] Syncing user timezone preference:', userData.settings.timezone);
      saveUserTimezone(userData.settings.timezone);
    }
  }, []);

  // Function to fetch the current user from the API
  // preserveUIState = true will avoid triggering UI-changing state updates
  const fetchCurrentUser = useCallback(async (force = false, preserveUIState = false) => {
    // Check if token exists
    const token = localStorage.getItem('auth_token');
    if (!token && !force) {
      console.log('[AUTH DEBUG] No token found, skipping auth check');
      setLoading(false);
      setUser(null);
      setInitialAuthCheckComplete(true);
      return null;
    }
    
    // Prevent concurrent calls
    if (fetchInProgress.current || authFailCount.current >= 3) {
      console.log('[AUTH DEBUG] Skipping auth check:', {
        fetchInProgress: fetchInProgress.current,
        authFailCount: authFailCount.current
      });
      return null;
    }

    try {
      console.log('[AUTH DEBUG] Fetching current user (force:', force, ', preserveUIState:', preserveUIState, ')');
      fetchInProgress.current = true;
      
      // Only set loading if we're not preserving UI state
      if (!preserveUIState) {
        setLoading(true);
      }
      
      setError(null);
      
      const response = await authAPI.getCurrentUser();
      
      if (response && response.success && response.data) {
        console.log('[AUTH DEBUG] User authenticated successfully:', response.data.username || response.data.email);
        
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
        console.log('[AUTH DEBUG] User not authenticated or invalid response format:', response);
        if (!preserveUIState) {
          setUser(null);
        }
        // Increment fail count
        authFailCount.current++;
        
        return null;
      }
    } catch (err) {
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
    }
  }, [syncUserPreferences]);

  // Check auth status on mount
  useEffect(() => {
    console.log('[AUTH DEBUG] Auth context mounted, checking auth status');
    fetchCurrentUser();
    
    // Return early cleanup to prevent memory leaks
    return () => {
      fetchInProgress.current = false;
    };
  }, [fetchCurrentUser]);

  // Handle logout
  const logout = async () => {
    try {
      console.log('[AUTH DEBUG] Logging out user');
      setLoading(true);
      
      // Important: Clear user state before API call to prevent UI flicker
      setUser(null);
      
      // Reset counts and flags
      authFailCount.current = 0;
      resetAuthFailedState();
      
      // Call API to logout server-side
      await authAPI.logout();
      
      // Redirect to login page after logout
      console.log('[AUTH DEBUG] Logout complete, redirecting to login page');
      window.location.href = '/login';
    } catch (err) {
      console.error('[AUTH DEBUG] Error during logout:', err);
      // Still clear user on frontend even if API call fails
      setUser(null);
      
      // Force redirect to login page even if logout fails
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  // Manual refresh function that forces a new fetch and returns a promise
  // preserveUIState = true will avoid triggering UI-changing state updates 
  const refreshUser = useCallback((preserveUIState = false) => {
    console.log('[AUTH DEBUG] Manually refreshing user data (preserveUIState:', preserveUIState, ')');
    // Reset the fail count to force a new fetch
    authFailCount.current = 0;
    // Return the promise from fetchCurrentUser for proper async handling
    return fetchCurrentUser(true, preserveUIState);
  }, [fetchCurrentUser]);

  // Function to handle login success from token in URL hash
  const handleLoginSuccess = (userData, token) => {
    console.log('[AUTH DEBUG] Handling login success', {
      hasUserData: !!userData,
      hasToken: !!token
    });
    
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
    
    // Force refresh user data
    console.log('[AUTH DEBUG] Forcing refresh of user data after login');
    setTimeout(() => fetchCurrentUser(true), 100);
  };

  // Function to initiate Google OAuth login
  const loginWithGoogle = () => {
    console.log('[AUTH DEBUG] Initiating Google OAuth login');
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
    refreshUser
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 