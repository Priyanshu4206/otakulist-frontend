import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, userAPI, resetAuthFailedState } from '../services/api';
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
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [initialAuthCheckComplete, setInitialAuthCheckComplete] = useState(false);
  const fetchInProgress = useRef(false);
  const authFailCount = useRef(0);
  const { showToast } = useToast();

  // Function to sync user preferences (theme, etc.) after setting user data
  const syncUserPreferences = useCallback((userData, settingsData) => {
    logger('Preferences', 'Syncing user preferences initiated');
    
    if (!userData) {
      logger('Preferences', 'No user data provided for preference sync');
      return;
    }
    
    // First try to use dedicated settings object if available (new API structure)
    if (settingsData) {
      logger('Preferences', 'Using dedicated settings data for preference sync');
      
      // Theme handling
      if (settingsData.display && settingsData.display.theme) {
        const newTheme = settingsData.display.theme;
        const currentTheme = getCurrentTheme();
        logger('Preferences', 'Processing theme from settings.display.theme', { 
          newTheme, 
          currentTheme 
        });
        
        if (newTheme !== currentTheme) {
          logger('Preferences', 'Theme changed, applying');
          saveUserTheme(newTheme);
          applyThemeDirectly(newTheme);
        } else {
          logger('Preferences', 'Theme unchanged, skipping apply');
        }
      } else {
        logger('Preferences', 'No theme found in settings.display.theme');
      }
      
      // Timezone handling
      if (settingsData.display && settingsData.display.timezone) {
        logger('Preferences', 'Saving timezone from settings.display.timezone', { 
          timezone: settingsData.display.timezone 
        });
        saveUserTimezone(settingsData.display.timezone);
      } else {
        logger('Preferences', 'No timezone found in settings.display.timezone');
      }
      
      return;
    }
    
    // Fallback to legacy settings structure in user object if no dedicated settings object
    logger('Preferences', 'No dedicated settings object, checking user.settings');
    
    if (!userData.settings) {
      logger('Preferences', 'No settings found in user object');
      return;
    }
    
    // Try settings.display.theme (newer format in user object)
    if (userData.settings.display && userData.settings.display.theme) {
      const newTheme = userData.settings.display.theme;
      const currentTheme = getCurrentTheme();
      logger('Preferences', 'Processing theme from user.settings.display.theme', { 
        newTheme, 
        currentTheme 
      });
      
      if (newTheme !== currentTheme) {
        logger('Preferences', 'Theme changed, applying');
        saveUserTheme(newTheme);
        applyThemeDirectly(newTheme);
      }
    } 
    // Try settings.interfaceTheme (legacy format)
    else if (userData.settings.interfaceTheme) {
      const newTheme = userData.settings.interfaceTheme;
      const currentTheme = getCurrentTheme();
      logger('Preferences', 'Processing theme from user.settings.interfaceTheme (legacy)', { 
        newTheme, 
        currentTheme 
      });

      if (newTheme !== currentTheme) {
        logger('Preferences', 'Theme changed, applying');
        saveUserTheme(newTheme);
        applyThemeDirectly(newTheme);
      }
    } else {
      logger('Preferences', 'No theme information found in user settings');
    }
    
    // Handle timezone settings
    if (userData.settings.display && userData.settings.display.timezone) {
      logger('Preferences', 'Saving timezone from user.settings.display.timezone', { 
        timezone: userData.settings.display.timezone 
      });
      saveUserTimezone(userData.settings.display.timezone);
    } else if (userData.settings.timezone) {
      logger('Preferences', 'Saving timezone from user.settings.timezone (legacy)', { 
        timezone: userData.settings.timezone 
      });
      saveUserTimezone(userData.settings.timezone);
    } else {
      logger('Preferences', 'No timezone information found in user settings');
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
      setSettings(null);
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
      // Use getCurrentUser which internally calls getDashboardSections with all needed sections including settings
      const response = await userAPI.getCurrentUser();
      
      if (response && response.success && response.data) {
        logger('API', 'User data fetch successful', { 
          hasUserData: !!response.data.user,
          hasStats: !!response.data.stats,
          hasNotifications: !!response.data.notifications,
          hasSettings: !!response.data.settings
        });

        // Extract the data we need
        const userData = response.data.user || null;
        const statsData = response.data.stats || null;
        const notificationsData = response.data.notifications || null;
        const settingsData = response.data.settings || null;
        if (!preserveUIState) {
          logger('State', 'Setting full user state (UI reset)');
          setUser(userData);
          setStats(statsData);
          setNotifications(notificationsData);
          setSettings(settingsData);
        } else {
          logger('State', 'Merging user state (preserving UI state)');
          // When preserving UI state, we still need to update user data, but we do it
          // carefully to avoid UI resets
          setUser(prevUser => ({
            ...prevUser,
            ...userData
          }));
          
          setStats(prevStats => ({
            ...prevStats,
            ...statsData
          }));
          
          setNotifications(prevNotifications => ({
            ...prevNotifications,
            ...notificationsData
          }));
          
          setSettings(prevSettings => ({
            ...prevSettings,
            ...settingsData
          }));
        }

        logger('Preferences', 'Syncing user preferences after successful fetch');
        // First try to use the dedicated settings object, then fall back to user's settings
        syncUserPreferences(userData, settingsData);
        
        authFailCount.current = 0;
        return {
          user: userData,
          stats: statsData,
          notifications: notificationsData,
          settings: settingsData
        };
      } else {
        logger('API', 'User fetch unsuccessful or empty response');
        if (!preserveUIState) {
          logger('State', 'Clearing user state after failed fetch');
          setUser(null);
          setStats(null);
          setNotifications(null);
          setSettings(null);
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
        setSettings(null);
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
      setSettings(null);
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
      setSettings(null);
      
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

  /**
   * Refresh user data from the API
   * @param {boolean} preserveUIState - Whether to preserve the UI state (avoid flicker)
   * @param {Array<string>} sections - Specific sections to refresh (defaults to all)
   * @returns {Promise} Promise that resolves with user data
   */
  const refreshUser = useCallback((preserveUIState = false, sections = ['user', 'stats', 'notifications', 'settings']) => {
    logger('Auth', 'Manual user refresh requested', { preserveUIState, sections });
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
    
    if (token) {
      logger('Storage', 'Storing auth token');
      localStorage.setItem('auth_token', token);
      // Don't set has_valid_token until we've actually validated the token
      // by successfully fetching user data
    }
    
    // Reset auth failure tracking
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
    
    // We only set the basic user data from the login response
    // The complete data will be loaded via getCurrentUser
    if (userData && !hasSession) {
      // Set only the basic user data, don't try to use other properties from userData
      // that might not exist in the login response
      const userObj = userData.user || userData;
      logger('State', 'Setting basic user data from login response');
      setUser(userObj || null);
    }
    
    // Always fetch the full user data from the API to get settings, stats, notifications
    logger('API', 'Fetching complete user data after login');
    fetchCurrentUser(true, true)
      .then(result => {
        if (result && result.user) {
          // Now that we know the token is valid, we can set the flag
          localStorage.setItem('has_valid_token', 'true');
          logger('Auth', 'Token validated successfully, setting has_valid_token flag');
        } else {
          logger('Auth', 'Failed to validate token with user data fetch');
          // Don't set has_valid_token if the fetch fails
          localStorage.removeItem('has_valid_token');
        }
      })
      .catch(err => {
        logger('Error', 'Error fetching user data during login', { message: err.message });
        // Don't set has_valid_token if the fetch fails
        localStorage.removeItem('has_valid_token');
      });
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
    settings,
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