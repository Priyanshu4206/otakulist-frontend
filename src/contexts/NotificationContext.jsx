import React, { createContext, useContext, useReducer, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import useAuth from '../hooks/useAuth';
import useNotifications from '../hooks/useNotifications';
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
      const exists = state.notifications.some(n => n._id === action.notification._id);
      if (exists) return state;
      const notifications = [action.notification, ...state.notifications];
      const unreadCount = notifications.filter(n => !n.read).length;
      return { ...state, notifications, unreadCount };
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
  const { isAuthenticated } = useAuth();
  const [state, dispatch] = useReducer(notificationReducer, initialState);
  const { showToast } = useContext(ToastContext);

  // Helper to show a notification toast
  const showNotificationToast = useCallback((notif) => {
    showToast({
      type: 'notification',
      message: notif.message,
      duration: 4000,
      notificationId: notif._id,
      onClose: () => markRead(notif._id),
      notificationType: notif.type,
    });
  }, [showToast]);

  // Paginated fetchNotifications
  const fetchNotifications = useCallback(async (page = 1, limit = 20, { append = false } = {}) => {
    try {
      const res = await userAPI.getNotifications(page, limit);
      const notifications = res.data?.notifications || [];
      const pagination = res.data?.pagination || { page, limit, total: notifications.length, hasMore: false };
      if (append) {
        dispatch({ type: 'APPEND_NOTIFICATIONS', notifications, pagination });
      } else {
        dispatch({ type: 'SET_NOTIFICATIONS', notifications, pagination });
      }
      return { notifications, pagination };
    } catch (err) {
      console.error('[NotificationContext] Error fetching notifications:', err);
      return { notifications: [], pagination: { page, limit, total: 0, hasMore: false } };
    }
  }, []);

  // Hydrate from backend on mount (if authenticated)
  useEffect(() => {
    if (!isAuthenticated) return;
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
      dispatch({ type: 'ADD_NOTIFICATION', notification: notif });
      if (!notif.read) showNotificationToast(notif);
      console.log('[NotificationContext] Real-time notification added:', notif);
    }, [showNotificationToast])
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