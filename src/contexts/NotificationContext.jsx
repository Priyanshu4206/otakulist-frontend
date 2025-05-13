import React, { createContext, useContext, useReducer, useEffect, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import useNotifications, { disconnectSocket, getGlobalSocket } from '../hooks/useNotifications';
import { userAPI } from '../services/api';
import { ToastContext } from './ToastContext';

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
      const unreadCount = action.notifications.filter(n => !n.read).length;
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
      const unreadCount = notifications.filter(n => !n.read).length;
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
      
      console.log('[NotificationContext] Added notification to state, new unread count:', unreadCount);
      
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
    console.log('[NotificationContext] State updated:', { 
      notificationCount: state.notifications.length,
      unreadCount: state.unreadCount,
      hydrated: state.hydrated
    });
  }, [state]);

  // Clear notification timeouts on unmount
  useEffect(() => {
    return () => {
      // Clean up any pending timeouts
      notificationTimeoutsRef.current.forEach(timeout => clearTimeout(timeout));
      notificationTimeoutsRef.current = [];
    };
  }, []);

  // Helper to show a notification toast
  const showNotificationToast = useCallback((notif) => {
    // Create and store timeout ID for cleanup
    const timeoutId = setTimeout(() => {
      showToast({
        type: 'notification',
        message: notif.message,
        duration: 4000,
        notificationId: notif._id,
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
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
      return;
    }
    
    const checkToken = () => {
      const currentToken = localStorage.getItem('auth_token');
      const socket = getGlobalSocket();
      
      // Check if token has changed AND we have a connected socket
      if (currentToken && 
          currentToken !== previousTokenRef.current && 
          socket && 
          socket.connected) {
        
        console.log('[NotificationContext] Auth token changed, reconnecting WebSocket');
        // Disconnect current socket - this will trigger reconnection
        disconnectSocket();
        // Update the token reference
        previousTokenRef.current = currentToken;
      } else if (currentToken && currentToken !== previousTokenRef.current) {
        // Token changed but no socket exists or not connected
        // Just update the reference, the socket will be created with new token
        console.log('[NotificationContext] Auth token changed, will use new token on next connection');
        previousTokenRef.current = currentToken;
      }
    };
    
    // Check token every 10 seconds (reduced frequency)
    tokenCheckIntervalRef.current = setInterval(checkToken, 10000);
    
    return () => {
      if (tokenCheckIntervalRef.current) {
        clearInterval(tokenCheckIntervalRef.current);
        tokenCheckIntervalRef.current = null;
      }
    };
  }, [isAuthenticated]);

  // Paginated fetchNotifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20, { append = false } = {}) => {
    try {
      console.log(`[NotificationContext] Fetching notifications, page ${page}, limit ${limit}, append: ${append}`);
      const res = await userAPI.getNotifications(page, limit);
      const notifications = res.data?.notifications || [];
      const pagination = res.data?.pagination || { page, limit, total: notifications.length, hasMore: false };
      
      if (append) {
        dispatch({ type: 'APPEND_NOTIFICATIONS', notifications, pagination });
      } else {
        dispatch({ type: 'SET_NOTIFICATIONS', notifications, pagination });
      }
      
      console.log(`[NotificationContext] Fetched ${notifications.length} notifications, unread: ${notifications.filter(n => !n.read).length}`);
      return { notifications, pagination };
    } catch (err) {
      console.error('[NotificationContext] Error fetching notifications:', err);
      return { notifications: [], pagination: { page, limit, total: 0, hasMore: false } };
    }
  }, []);

  // Hydrate from backend on mount (if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    console.log('[NotificationContext] User authenticated, hydrating notifications');
    fetchNotifications(1, 20, { append: false }).then(({ notifications }) => {
      const unread = notifications.filter(n => !n.read);
      if (unread.length === 1) {
        showNotificationToast(unread[0]);
      } else if (unread.length > 1) {
        showToast({
          type: 'notification',
          message: `You have ${unread.length} unread notifications`,
          duration: 4000,
          notificationId: 'unread-summary',
          onClose: null,
          notificationType: 'system',
        });
      }
      console.log('[NotificationContext] Hydrated notifications:', notifications);
    });
  }, [isAuthenticated, showNotificationToast, showToast, fetchNotifications]);

  // Listen for real-time notifications
  useNotifications(
    useCallback((notif) => {
      console.log('[NotificationContext] Received real-time notification:', notif);
      
      // Check for duplicate notification before adding
      const exists = state.notifications.some(n => n._id === notif._id);
      if (!exists) {
        // Force a state update with the new notification
        dispatch({ type: 'ADD_NOTIFICATION', notification: notif });
        
        // Show toast for unread notifications
        if (!notif.read) {
          // Slight delay to ensure UI is ready
          setTimeout(() => {
            showNotificationToast(notif);
            console.log('[NotificationContext] Showing toast for notification:', notif._id);
          }, 300);
        }
      } else {
        console.log('[NotificationContext] Duplicate notification ignored:', notif._id);
      }
    }, [showNotificationToast, state.notifications])
  );

  // Actions
  const addNotification = useCallback((notification) => {
    dispatch({ type: 'ADD_NOTIFICATION', notification });
    console.log('[NotificationContext] Notification added:', notification);
  }, []);

  const markRead = useCallback((id) => {
    dispatch({ type: 'MARK_READ', id });
    userAPI.markNotificationRead(id)
      .then(() => console.log('[NotificationContext] Marked as read:', id))
      .catch(err => console.error('[NotificationContext] Error marking as read:', err));
  }, []);

  const markAllRead = useCallback(() => {
    dispatch({ type: 'MARK_ALL_READ' });
    userAPI.markAllNotificationsRead()
      .then(() => console.log('[NotificationContext] Marked all as read'))
      .catch(err => console.error('[NotificationContext] Error marking all as read:', err));
  }, []);

  const deleteNotification = useCallback((id) => {
    dispatch({ type: 'DELETE_NOTIFICATION', id });
    userAPI.deleteNotification(id)
      .then(() => console.log('[NotificationContext] Deleted notification:', id))
      .catch(err => console.error('[NotificationContext] Error deleting notification:', err));
  }, []);

  const clearAll = useCallback(() => {
    dispatch({ type: 'CLEAR_ALL' });
    // Optionally, call backend to delete all
    userAPI.markAllNotificationsRead()
      .then(() => console.log('[NotificationContext] Cleared all (marked as read)'))
      .catch(err => console.error('[NotificationContext] Error clearing all:', err));
  }, []);

  // Force a refresh of the unread count every minute (as an extra precaution)
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      const unreadCount = state.notifications.filter(n => !n.read).length;
      if (unreadCount !== state.unreadCount) {
        console.log('[NotificationContext] Correcting unread count:', unreadCount);
        dispatch({ 
          type: 'SET_NOTIFICATIONS', 
          notifications: state.notifications,
          pagination: state.pagination 
        });
      }
    }, 60000); // every minute
    
    return () => clearInterval(interval);
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