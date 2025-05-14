import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, resetAuthFailedState } from '../services/api';
import { saveUserTimezone } from '../utils/simpleTimezoneUtils';
import { saveUserTheme } from '../components/dashboard/SettingsPage';
import { themes } from '../contexts/ThemeContext';
import useToast from '../hooks/useToast';
import { disconnectSocket } from '../hooks/useNotifications';

export const AuthContext = createContext();

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[AuthContext] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

// Get the current theme from localStorage (synced with ThemeContext)
const getCurrentTheme = () => {
  return localStorage.getItem('preferred_theme');
};

// Apply theme CSS variables directly for immediate theme changes
const applyThemeDirectly = (themeName) => {
  const theme = themes[themeName];
  if (!theme) {
    logger('Theme', 'Theme not found in available themes', { themeName });
    return false;
  }

  logger('Theme', 'Applying theme directly', { themeName });
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
  logger('Theme', 'Theme applied successfully', { themeName });

  return true;
};

// Utility to flatten user object if wrapped in { user: { ... } }
function flattenUserObject(obj) {
  if (obj && typeof obj === 'object' && 'user' in obj && Object.keys(obj).length === 1) {
    logger('Utils', 'Flattening wrapped user object');
    return obj.user;
  }
  return obj;
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState(null);
  const [notifications, setNotifications] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const fetchInProgress = useRef(false);
  const authFailCount = useRef(0);
  const { showToast } = useToast();

  // Function to sync user preferences (theme, etc.) after setting user data
  const syncUserPreferences = useCallback((userData) => {
    if (!userData) {
      logger('Preferences', 'No user data provided for preference sync');
      return;
    }
    
    logger('Preferences', 'Syncing user preferences');
    
    // Check for theme in settings.display.theme (new API structure)
    if (userData.settings && userData.settings.display && userData.settings.display.theme) {
      const newTheme = userData.settings.display.theme;
      const currentTheme = getCurrentTheme();
      logger('Preferences', 'Processing theme preference', { 
        newTheme, 
        currentTheme 
      });
      
      saveUserTheme(newTheme);
      if (newTheme !== currentTheme) {
        logger('Preferences', 'Theme changed, applying directly');
        applyThemeDirectly(newTheme);
      }
    }
    // Fallback to settings.interfaceTheme for backward compatibility
    else if (userData.settings && userData.settings.interfaceTheme) {
      const newTheme = userData.settings.interfaceTheme;
      const currentTheme = getCurrentTheme();
      logger('Preferences', 'Processing theme preference (legacy format)', { 
        newTheme, 
        currentTheme 
      });
      
      saveUserTheme(newTheme);
      if (newTheme !== currentTheme) {
        logger('Preferences', 'Theme changed, applying directly');
        applyThemeDirectly(newTheme);
      }
    }
    
    if (userData.settings && userData.settings.timezone) {
      logger('Preferences', 'Saving user timezone', { 
        timezone: userData.settings.timezone 
      });
      saveUserTimezone(userData.settings.timezone);
    }
    // Check for timezone in settings.display.timezone (new API structure)
    else if (userData.settings && userData.settings.display && userData.settings.display.timezone) {
      logger('Preferences', 'Saving user timezone from display settings', { 
        timezone: userData.settings.display.timezone 
      });
      saveUserTimezone(userData.settings.display.timezone);
    }
  }, []);

  // Function to fetch the current user from the API
  const fetchCurrentUser = useCallback(async (force = false, preserveUIState = false) => {
    const token = localStorage.getItem('auth_token');
    logger('API', 'Fetch current user initiated', { 
      force, 
      preserveUIState, 
      hasToken: !!token,
      authFailCount: authFailCount.current 
    });
    
    if (!token && !force) {
      logger('Auth', 'No auth token and not forced, skipping fetch');
      setLoading(false);
      setUser(null);
      setStats(null);
      setNotifications(null);
      setInitialAuthCheckComplete(true);
      return null;
    }
    
    if (fetchInProgress.current || authFailCount.current >= 3) {
      logger('State', 'Fetch aborted', { 
        fetchInProgress: fetchInProgress.current,
        authFailCount: authFailCount.current 
      });
      return null;
    }
    
    try {
      fetchInProgress.current = true;
      if (!preserveUIState) {
        setLoading(true);
      }
      setError(null);
      
      logger('API', 'Making getCurrentUser API call');
      const response = await authAPI.getCurrentUser();
      
      if (response && response.success && response.data) {
        logger('API', 'User fetch successful', { 
          hasUserData: !!response.data.user,
          hasStats: !!response.data.stats,
          hasNotifications: !!response.data.notifications 
        });

        if (!preserveUIState) {
          logger('State', 'Setting full user state (UI reset)');
          setUser(response.data.user || null);
          setStats(response.data.stats || null);
          setNotifications(response.data.notifications || null);
        } else {
          logger('State', 'Merging user state (preserving UI state)');
          // When preserving UI state, we still need to update user data, but we do it
          // carefully to avoid UI resets
          setUser(prevUser => {
            // Merge the new data with the existing user object, preserving UI state
            return {
              ...prevUser,
              ...response.data.user
            };
          });
          setStats(prevStats => {
            return {
              ...prevStats,
              ...response.data.stats
            };
          });
          setNotifications(prevNotifications => {
            return {
              ...prevNotifications,
              ...response.data.notifications
            };
          });
        }

        logger('Preferences', 'Syncing user preferences after successful fetch');
        syncUserPreferences(response.data.user);
        authFailCount.current = 0;
        
        return {
          user: response.data.user || null,
          stats: response.data.stats || null,
          notifications: response.data.notifications || null
        };
      } else {
        logger('API', 'User fetch unsuccessful or empty response');
        if (!preserveUIState) {
          logger('State', 'Clearing user state after failed fetch');
          setUser(null);
          setStats(null);
          setNotifications(null);
        }
        authFailCount.current++;
        logger('Auth', 'Authentication failure count increased', { count: authFailCount.current });
        return null;
      }
    } catch (err) {
      if (err?.throttled) {
        logger('API', 'Request throttled');
        return null;
      }
      
      logger('Error', 'Error fetching current user', { 
        message: err.message,
        status: err.status 
      });
      
      if (!preserveUIState) {
        logger('State', 'Clearing user state after fetch error');
        setUser(null);
        setStats(null);
        setNotifications(null);
      }
      
      setError(err.message || 'Failed to authenticate');
      authFailCount.current++;
      logger('Auth', 'Authentication failure count increased after error', { 
        count: authFailCount.current 
      });
      throw err;
    } finally {
      if (!preserveUIState) {
        setLoading(false);
      }
      fetchInProgress.current = false;
      setInitialAuthCheckComplete(true);
      logger('State', 'Fetch completed, state updated', { 
        initialAuthCheckComplete: true,
        fetchInProgress: false 
      });
    }
  }, [syncUserPreferences]);

  // Check auth status on mount
  useEffect(() => {
    logger('Lifecycle', 'Component mounted, checking authentication');
    fetchCurrentUser();

    // Return early cleanup to prevent memory leaks
    return () => {
      logger('Lifecycle', 'Component unmounting, cleaning up');
      fetchInProgress.current = false;
    };
  }, [fetchCurrentUser]);
  
  const logout = async () => {
    logger('Auth', 'Logout initiated');
    try {
      setLoading(true);
      setUser(null);
      setStats(null);
      setNotifications(null);
      authFailCount.current = 0;
      resetAuthFailedState();
      
      // Disconnect WebSocket before logout
      logger('Socket', 'Disconnecting socket during logout');
      disconnectSocket();
      
      logger('API', 'Making logout API call');
      await authAPI.logout();
      
      showToast({ type: 'success', message: 'Successfully logged out' });
      logger('Navigation', 'Redirecting to login page after logout');
      window.location.href = '/login';
    } catch (err) {
      logger('Error', 'Error during logout process', { 
        message: err.message 
      });
      
      setUser(null);
      setStats(null);
      setNotifications(null);
      
      // Disconnect WebSocket even on error
      logger('Socket', 'Disconnecting socket after logout error');
      disconnectSocket();
      
      logger('Storage', 'Clearing all auth-related storage items');
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_from_callback');
      localStorage.removeItem('auth_checked');
      localStorage.removeItem('has_valid_token');
      sessionStorage.removeItem('auth_callback_processed');
      sessionStorage.setItem('from_logout', 'true');
      
      showToast({ type: 'error', message: 'Error during logout, but session cleared' });
      logger('Navigation', 'Redirecting to login page after logout error');
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback((preserveUIState = false) => {
    logger('Auth', 'Manual user refresh requested', { preserveUIState });
    authFailCount.current = 0;
    return fetchCurrentUser(true, preserveUIState);
  }, [fetchCurrentUser]);

  const handleLoginSuccess = (userData, token) => {
    // Check if we already have a session to avoid duplicate work
    const hasSession = localStorage.getItem('has_valid_token') === 'true' && user;
    
    logger('Auth', 'Login success handler', { 
      hasUserData: !!userData, 
      hasToken: !!token,
      hasExistingSession: hasSession
    });
    
    if (userData) {
      // Only set user data if not already set
      if (!hasSession) {
        logger('State', 'Setting user data from login response');
        
        // Flatten user object if needed (for backward compatibility)
        const userObj = userData.user || userData;
        
        setUser(userObj || null);
        setStats(userData.stats || null);
        setNotifications(userData.notifications || null);
        
        // Make sure to sync user preferences immediately after login
        logger('Preferences', 'Syncing user preferences after login');
        syncUserPreferences(userObj);
      }
    }
  
    if (token) {
      logger('Storage', 'Storing auth token');
      localStorage.setItem('auth_token', token);
    }
    
    // Set session validity flag
    localStorage.setItem('has_valid_token', 'true');
  
    authFailCount.current = 0;
    resetAuthFailedState();
  
    // Mark auth check as completed immediately to avoid UI flicker
    setInitialAuthCheckComplete(true);
    
    // Clear loading state
    setLoading(false);
  
    // Clear status flags
    localStorage.removeItem('auth_from_callback');
    
    // Update hard redirect status if in progress
    if (localStorage.getItem('hard_redirect_attempted') === 'pending') {
      localStorage.setItem('hard_redirect_attempted', 'processed');
      logger('Navigation', 'Processed hard redirect during login success');
    }
    
    // Only fetch fresh data if we didn't already set user data above
    if (!userData && !hasSession) {
      logger('API', 'No user data provided, fetching from API');
      fetchCurrentUser(true, true);
    } else {
      logger('State', 'Using provided user data or existing session');
    }
  };

  const loginWithGoogle = () => {
    logger('Auth', 'Google login initiated');
    authFailCount.current = 0;
    resetAuthFailedState();
    localStorage.removeItem('auth_token');
    authAPI.loginWithGoogle();
  };

  const value = {
    user,
    stats,
    notifications,
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
      logger('API', 'Full user data refresh requested');
      try {
        const data = await fetchCurrentUser(true, false);
        return data;
      } catch (error) {
        logger('Error', 'Error refreshing user data', { 
          message: error.message 
        });
        return null;
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;