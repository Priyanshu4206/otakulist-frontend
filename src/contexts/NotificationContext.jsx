import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import useNotifications, { disconnectSocket, getGlobalSocket, setGlobalSocket } from '../hooks/useNotifications';
import { ToastContext } from './ToastContext';
import { io } from 'socket.io-client';
import { notificationAPI } from '../services/modules';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[NotificationContext] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

const NotificationContext = createContext();

const initialState = {
  notifications: [],
  unreadCount: 0,
  hydrated: false,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    hasMore: true,
  },
};

function notificationReducer(state, action) {
  switch (action.type) {
    case 'SET_NOTIFICATIONS': {
      const unreadCount = action.unreadCount !== undefined 
        ? action.unreadCount 
        : action.notifications.filter(n => !n.read).length;
      
      return {
        ...state,
        notifications: action.notifications,
        unreadCount,
        hydrated: true,
        pagination: action.pagination || state.pagination,
      };
    }
    case 'APPEND_NOTIFICATIONS': {
      // Avoid duplicates
      const existingIds = new Set(state.notifications.map(n => n._id));
      const newNotifications = action.notifications.filter(n => !existingIds.has(n._id));
      const notifications = [...state.notifications, ...newNotifications];
      
      // Use provided unreadCount or calculate it
      const unreadCount = action.unreadCount !== undefined 
        ? action.unreadCount 
        : notifications.filter(n => !n.read).length;
      
      return {
        ...state,
        notifications,
        unreadCount,
        hydrated: true,
        pagination: action.pagination || state.pagination,
      };
    }
    case 'ADD_NOTIFICATION': {
      // Check if notification already exists to avoid duplicates
      const exists = state.notifications.some(n => n._id === action.notification._id);
      if (exists) return state;
      
      // Add new notification at the beginning of the list
      const notifications = [action.notification, ...state.notifications];
      
      // Update unread count
      const unreadCount = action.notification.read 
        ? state.unreadCount 
        : state.unreadCount + 1;
      
      logger('State Update', 'Added new notification', { 
        notificationId: action.notification._id,
        newUnreadCount: unreadCount
      });
      
      return { 
        ...state, 
        notifications, 
        unreadCount,
        hydrated: true 
      };
    }
    case 'MARK_READ': {
      const notifications = state.notifications.map(n => n._id === action.id ? { ...n, read: true } : n);
      const unreadCount = notifications.filter(n => !n.read).length;
      return { ...state, notifications, unreadCount };
    }
    case 'MARK_ALL_READ': {
      const notifications = state.notifications.map(n => ({ ...n, read: true }));
      return { ...state, notifications, unreadCount: 0 };
    }
    case 'DELETE_NOTIFICATION': {
      const notifications = state.notifications.filter(n => n._id !== action.id);
      const unreadCount = notifications.filter(n => !n.read).length;
      return { ...state, notifications, unreadCount };
    }
    case 'CLEAR_ALL': {
      return { ...state, notifications: [], unreadCount: 0 };
    }
    default:
      return state;
  }
}

export const NotificationProvider = ({ children }) => {
  const { isAuthenticated, user } = useAuth();
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { showToast } = useContext(ToastContext);
  const previousTokenRef = useRef(localStorage.getItem('auth_token'));
  const tokenCheckIntervalRef = useRef(null);
  const notificationTimeoutsRef = useRef([]);

  // DEBUG: Monitor state changes
  useEffect(() => {
    logger('State', 'Updated', { 
      notificationCount: state.notifications.length,
      unreadCount: state.unreadCount,
      hydrated: state.hydrated,
      pagination: state.pagination
    });
  }, [state]);

  // Clear notification timeouts on unmount
  useEffect(() => {
    return () => {
      // Clean up any pending timeouts
      logger('Cleanup', 'Clearing notification timeouts', { count: notificationTimeoutsRef.current.length });
      notificationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      notificationTimeoutsRef.current = [];
    };
  }, []);

  // Helper to show a notification toast
  const showNotificationToast = useCallback((notif) => {
    // Create and store timeout ID for cleanup
    logger('Toast', 'Scheduling notification toast', { 
      notificationId: notif._id, 
      type: notif.type
    });
    
    const timeoutId = setTimeout(() => {
      showToast({
        type: 'notification',
        message: notif.message,
        duration: 4000,
        id: notif._id,
        onClose: () => markRead(notif._id),
        notificationType: notif.type,
      });
    }, 300);
    
    notificationTimeoutsRef.current.push(timeoutId);
  }, [showToast]);

  // Monitor auth token changes and reconnect WebSocket if needed
  useEffect(() => {
    if (!isAuthenticated) {
      // Clear any existing interval when not authenticated
      if (tokenCheckIntervalRef.current) {
        logger('Auth', 'Clearing token check interval (not authenticated)');
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
      return;
    }
    
    const checkToken = () => {
      const currentToken = localStorage.getItem('auth_token');
      const socket = getGlobalSocket();
      
      // Token status logging
      logger('Auth', 'Token check', { 
        tokenChanged: currentToken !== previousTokenRef.current,
        socketConnected: socket?.connected,
        hasToken: !!currentToken
      });
      
      if (currentToken && 
          currentToken !== previousTokenRef.current && 
          socket && 
          socket.connected) {
        logger('Socket', 'Token changed - reconnecting WebSocket');
        // Disconnect current socket - this will trigger reconnection
        disconnectSocket();
        // Update the token reference
        previousTokenRef.current = currentToken;
        
        // Force immediate reconnection with new token after a short delay
        setTimeout(() => {
          if (currentToken) {
            logger('Socket', 'Initiating reconnection with new token');
            const newSocket = io(import.meta.env.DEV
              ? 'http://localhost:3000'
              : import.meta.env.VITE_API_URL?.replace(/\/api.*/, '') || 'https://otaku-backend.jumpingcrab.com', {
                path: '/socket.io',
                auth: { token: currentToken },
                transports: ['websocket']
              });
            setGlobalSocket(newSocket);
          }
        }, 500);
      } else if (currentToken && currentToken !== previousTokenRef.current) {
        // Token changed but no socket exists or not connected
        logger('Auth', 'Token changed - will use on next connection');
        previousTokenRef.current = currentToken;
      }
    };
    
    // Check token every 10 seconds (reduced frequency)
    logger('Auth', 'Starting token check interval (10s)');
    tokenCheckIntervalRef.current = setInterval(checkToken, 10000);
    
    return () => {
      if (tokenCheckIntervalRef.current) {
        logger('Auth', 'Cleaning up token check interval');
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
    };
  }, [isAuthenticated]);

  // Paginated fetchNotifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20, { append = false } = {}) => {
    try {
      logger('API', `Fetching notifications (page: ${page}, limit: ${limit}, append: ${append})`);
      
      const result = await notificationAPI.getNotifications(page, limit);
      const { notifications = [], pagination = { page, limit, total: 0, hasMore: false } } = result;
      
      // Extract unread count if available in response
      const responseUnreadCount = result.unreadCount !== undefined ? result.unreadCount : null;
      
      logger('API', 'Fetch successful', { 
        count: notifications.length, 
        unreadCount: responseUnreadCount !== null 
          ? responseUnreadCount 
          : notifications.filter(n => !n.read).length,
        pagination
      });
      
      if (append) {
        dispatch({ 
          type: 'APPEND_NOTIFICATIONS', 
          notifications, 
          pagination,
          unreadCount: responseUnreadCount
        });
      } else {
        dispatch({ 
          type: 'SET_NOTIFICATIONS', 
          notifications, 
          pagination,
          unreadCount: responseUnreadCount
        });
      }
      
      return result;
    } catch (err) {
      logger('API', 'Error fetching notifications', { error: err.message });
      return { notifications: [], pagination: { page, limit, total: 0, hasMore: false } };
    }
  }, []);

  // Hydrate from backend on mount (if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    logger('Lifecycle', 'User authenticated - hydrating notifications');
    
    fetchNotifications(1, 20, { append: false }).then(({ notifications }) => {
      const unread = notifications.filter(n => !n.read);
      logger('Lifecycle', 'Hydration complete', { 
        total: notifications.length,
        unreadCount: unread.length
      });
      
      if (unread.length === 1) {
        logger('Toast', 'Showing single unread notification');
        showNotificationToast(unread[0]);
      } else if (unread.length > 1) {
        logger('Toast', 'Showing unread summary toast', { count: unread.length });
        showToast({
          type: 'notification',
          message: `You have ${unread.length} unread notifications`,
          duration: 4000,
          id: 'unread-summary',
          onClose: null,
          notificationType: 'system',
        });
      }
    });
  }, [isAuthenticated, showNotificationToast, showToast, fetchNotifications]);

  // Listen for real-time notifications
  useNotifications(
    useCallback((notif) => {
      logger('Socket', 'Received real-time notification', { 
        id: notif._id,
        type: notif.type,
        read: notif.read
      });
      
      // Check for duplicate notification before adding
      const exists = state.notifications.some(n => n._id === notif._id);
      
      if (!exists) {
        // Force a state update with the new notification
        dispatch({ type: 'ADD_NOTIFICATION', notification: notif });
        
        // Show toast for unread notifications
        if (!notif.read) {
          // Slight delay to ensure UI is ready
          setTimeout(() => {
            logger('Toast', 'Showing toast for real-time notification', { id: notif._id });
            showNotificationToast(notif);
          }, 300);
        }
      } else {
        logger('Socket', 'Duplicate notification ignored', { id: notif._id });
      }
    }, [showNotificationToast, state.notifications])
  );

  // Actions
  const addNotification = useCallback((notification) => {
    logger('Action', 'Manual notification addition', { id: notification._id });
    dispatch({ type: 'ADD_NOTIFICATION', notification });
  }, []);

  const markRead = useCallback((id) => {
    logger('Action', 'Marking notification as read', { id });
    dispatch({ type: 'MARK_READ', id });
    notificationAPI.markNotificationRead(id)
      .then(() => logger('API', 'Successfully marked as read', { id }))
      .catch(err => logger('API', 'Error marking as read', { id, error: err.message }));
  }, []);

  const markAllRead = useCallback(() => {
    logger('Action', 'Marking all notifications as read');
    dispatch({ type: 'MARK_ALL_READ' });
    notificationAPI.markAllAsRead()
      .then(() => logger('API', 'Successfully marked all as read'))
      .catch(err => logger('API', 'Error marking all as read', { error: err.message }));
  }, []);

  const deleteNotification = useCallback((id) => {
    logger('Action', 'Deleting notification', { id });
    dispatch({ type: 'DELETE_NOTIFICATION', id });
    notificationAPI.deleteNotification(id)
      .then(() => logger('API', 'Successfully deleted notification', { id }))
      .catch(err => logger('API', 'Error deleting notification', { id, error: err.message }));
  }, []);

  const clearAll = useCallback(() => {
    logger('Action', 'Clearing all notifications');
    dispatch({ type: 'CLEAR_ALL' });
    // Optionally, call backend to delete all
    notificationAPI.markAllAsRead()
      .then(() => logger('API', 'Successfully cleared all (marked as read)'))
      .catch(err => logger('API', 'Error clearing all', { error: err.message }));
  }, []);

  // Force a refresh of the unread count every minute (as an extra precaution)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    logger('Lifecycle', 'Starting unread count verification interval (60s)');
    const interval = setInterval(() => {
      const unreadCount = state.notifications.filter(n => !n.read).length;
      if (unreadCount !== state.unreadCount) {
        logger('State', 'Correcting unread count', { 
          calculated: unreadCount, 
          current: state.unreadCount 
        });
        dispatch({ 
          type: 'SET_NOTIFICATIONS', 
          notifications: state.notifications,
          pagination: state.pagination 
        });
      }
    }, 60000); // every minute
    
    return () => {
      logger('Lifecycle', 'Cleaning up unread count verification interval');
      clearInterval(interval);
    }
  }, [isAuthenticated, state.notifications, state.unreadCount]);

  return (
    <NotificationContext.Provider
      value={{
        notifications: state.notifications,
        unreadCount: state.unreadCount,
        hydrated: state.hydrated,
        pagination: state.pagination,
        addNotification,
        markRead,
        markAllRead,
        deleteNotification,
        clearAll,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

NotificationProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export const useNotificationContext = () => useContext(NotificationContext);