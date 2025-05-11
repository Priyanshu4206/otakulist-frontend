import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { authAPI, resetAuthFailedState } from '../services/api';
import { saveUserTimezone } from '../utils/simpleTimezoneUtils';
import { saveUserTheme } from '../components/dashboard/SettingsPage';
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

// Utility to flatten user object if wrapped in { user: { ... } }
function flattenUserObject(obj) {
  if (obj && typeof obj === 'object' && 'user' in obj && Object.keys(obj).length === 1) {
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
    if (!userData) return;
    if (userData.settings && userData.settings.interfaceTheme) {
      const newTheme = userData.settings.interfaceTheme;
      const currentTheme = getCurrentTheme();
      saveUserTheme(newTheme);
      if (newTheme !== currentTheme) {
        applyThemeDirectly(newTheme);
      }
    }
    if (userData.settings && userData.settings.timezone) {
      saveUserTimezone(userData.settings.timezone);
    }
  }, []);

  // Function to fetch the current user from the API
  const fetchCurrentUser = useCallback(async (force = false, preserveUIState = false) => {
    const token = localStorage.getItem('auth_token');
    if (!token && !force) {
      if (DEBUG_AUTH) console.log('[AUTH DEBUG] No token found, skipping fetch');
      setLoading(false);
      setUser(null);
      setStats(null);
      setNotifications(null);
      setInitialAuthCheckComplete(true);
      return null;
    }
    if (fetchInProgress.current || authFailCount.current >= 3) {
      if (DEBUG_AUTH) console.log('[AUTH DEBUG] Fetch already in progress or too many failures, skipping');
      return null;
    }
    try {
      if (DEBUG_AUTH) console.log('[AUTH DEBUG] Starting fetch of current user');
      fetchInProgress.current = true;
      if (!preserveUIState) {
        setLoading(true);
      }
      setError(null);
      const response = await authAPI.getCurrentUser();
      if (response && response.success && response.data) {
        if (DEBUG_AUTH) console.log('[AUTH DEBUG] Fetch successful');

        if (!preserveUIState) {
          setUser(response.data.user || null);
          setStats(response.data.stats || null);
          setNotifications(response.data.notifications || null);
        } else {
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

        syncUserPreferences(response.data.user);
        authFailCount.current = 0;
        return {
          user: response.data.user || null,
          stats: response.data.stats || null,
          notifications: response.data.notifications || null
        };
      } else {
        if (DEBUG_AUTH) console.log('[AUTH DEBUG] Fetch failed, no data or success flag');
        if (!preserveUIState) {
          setUser(null);
          setStats(null);
          setNotifications(null);
        }
        authFailCount.current++;
        return null;
      }
    } catch (err) {
      if (err?.throttled) {
        if (DEBUG_AUTH) console.log('[AUTH DEBUG] Auth request was throttled to prevent API spam');
        return null;
      }
      console.error('[AUTH DEBUG] Error fetching current user:', err);
      if (!preserveUIState) {
        setUser(null);
        setStats(null);
        setNotifications(null);
      }
      setError(err.message || 'Failed to authenticate');
      authFailCount.current++;
      throw err;
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
  const logout = async () => {
    try {
      setLoading(true);
      setUser(null);
      setStats(null);
      setNotifications(null);
      authFailCount.current = 0;
      resetAuthFailedState();
      await authAPI.logout();
      showToast({ type: 'success', message: 'Successfully logged out' });
      window.location.href = '/login';
    } catch (err) {
      console.error('[AUTH DEBUG] Error during logout:', err);
      setUser(null);
      setStats(null);
      setNotifications(null);
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_from_callback');
      localStorage.removeItem('auth_checked');
      localStorage.removeItem('has_valid_token');
      sessionStorage.removeItem('auth_callback_processed');
      sessionStorage.setItem('from_logout', 'true');
      showToast({ type: 'error', message: 'Error during logout, but session cleared' });
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = useCallback((preserveUIState = false) => {
    authFailCount.current = 0;
    return fetchCurrentUser(true, preserveUIState);
  }, [fetchCurrentUser]);

  const handleLoginSuccess = (userData, token) => {
    if (userData) {
      setUser(userData.user || null);
      setStats(userData.stats || null);
      setNotifications(userData.notifications || null);
      syncUserPreferences(userData.user);
    }
    if (token) {
      localStorage.setItem('auth_token', token);
    }
    authFailCount.current = 0;
    resetAuthFailedState();
    const fromCallback = localStorage.getItem('auth_from_callback') === 'true';
    if (fromCallback) {
      localStorage.removeItem('auth_from_callback');
      setInitialAuthCheckComplete(true);
    } else {
      setTimeout(() => fetchCurrentUser(true), 100);
    }
  };

  const loginWithGoogle = () => {
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
      try {
        const data = await fetchCurrentUser(true, false);
        return data;
      } catch (error) {
        console.error('Error refreshing user data:', error);
        return null;
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext; 