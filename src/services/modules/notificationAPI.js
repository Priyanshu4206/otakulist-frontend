import api from '../axiosInstance';
import { processResponse } from '../responseHandler';

// Logger utility for consistent logging format
const logger = (area, action, data = null) => {
  const logMessage = `[NOTIFICATION API] ${area} | ${action}`;
  // if (data) {
  //   console.log(logMessage, data);
  // } else {
  //   console.log(logMessage);
  // }
};

/**
 * Normalize notification response to a consistent format
 * @param {Object} response - API response
 * @returns {Object} Normalized notification data
 */
const normalizeNotificationResponse = (response) => {
  // If no data present, return empty result
  if (!response || !response.data) {
    return { notifications: [], pagination: { page: 1, limit: 20, total: 0, hasMore: false } };
  }

  // New format: { items: [...], pagination: {...} }
  if (response.data.items && Array.isArray(response.data.items)) {
    return {
      notifications: response.data.items,
      pagination: {
        page: response.data.pagination?.page || 1,
        limit: response.data.pagination?.limit || 20,
        total: response.data.pagination?.total || response.data.items.length,
        hasMore: response.data.pagination?.pages > response.data.pagination?.page
      }
    };
  }

  // Format with unreadCount: { unreadCount: X, items: [...] }
  if (response.data.unreadCount !== undefined && response.data.items && Array.isArray(response.data.items)) {
    return {
      notifications: response.data.items,
      unreadCount: response.data.unreadCount,
      pagination: {
        page: 1,
        limit: response.data.items.length,
        total: response.data.unreadCount,
        hasMore: false
      }
    };
  }

  // Legacy format: just an array
  if (Array.isArray(response.data)) {
    return {
      notifications: response.data,
      pagination: {
        page: 1,
        limit: response.data.length,
        total: response.data.length,
        hasMore: false
      }
    };
  }

  // Unknown format or no data
  return { 
    notifications: [], 
    pagination: { page: 1, limit: 20, total: 0, hasMore: false } 
  };
};

/**
 * Notification-related API calls
 */
const notificationAPI = {
  /**
   * Get all notifications for current user
   * @param {number} [page=1]
   * @param {number} [limit=20]
   * @returns {Promise<Object>} Notifications with pagination
   */
  getNotifications: async (page = 1, limit = 20) => {
    logger("Notifications", "Getting all notifications", { page, limit });
    const response = await processResponse(api.get('/notifications', { params: { page, limit } }));
    return normalizeNotificationResponse(response);
  },

  /**
   * Get unread notifications count
   * @returns {Promise<Object>} Unread count
   */
  getUnreadCount: async () => {
    logger("Notifications", "Getting unread count");
    const response = await processResponse(api.get('/notifications/unread-count'));
    
    // Handle different response formats
    if (response && response.data) {
      if (typeof response.data === 'number') {
        return { unreadCount: response.data };
      } else if (response.data.unreadCount !== undefined) {
        return { unreadCount: response.data.unreadCount };
      }
    }
    
    return { unreadCount: 0 };
  },

  /**
   * Mark notification as read
   * @param {string} notificationId
   * @returns {Promise<Object>} Updated notification
   */
  markAsRead: (notificationId) => {
    logger("Notifications", "Marking notification as read", { notificationId });
    return processResponse(api.patch(`/notifications/${notificationId}/read`));
  },

  /**
   * Mark all notifications as read
   * @returns {Promise<Object>} Operation result
   */
  markAllAsRead: () => {
    logger("Notifications", "Marking all notifications as read");
    return processResponse(api.patch('/notifications/read-all'));
  },

  /**
   * Delete notification
   * @param {string} notificationId
   * @returns {Promise<Object>} Deletion result
   */
  deleteNotification: (notificationId) => {
    logger("Notifications", "Deleting notification", { notificationId });
    return processResponse(api.delete(`/notifications/${notificationId}`));
  },

  /**
   * Delete all notifications
   * @returns {Promise<Object>} Deletion result
   */
  deleteAllNotifications: () => {
    logger("Notifications", "Deleting all notifications");
    return processResponse(api.delete('/notifications/all'));
  },

  /**
   * Get notification preferences
   * @returns {Promise<Object>} Notification preferences
   */
  getPreferences: () => {
    logger("Notifications", "Getting preferences");
    return processResponse(api.get('/notifications/preferences'));
  },

  /**
   * Update notification preferences
   * @param {Object} preferences - Notification preferences
   * @returns {Promise<Object>} Updated preferences
   */
  updatePreferences: (preferences) => {
    logger("Notifications", "Updating preferences", preferences);
    return processResponse(api.patch('/notifications/preferences', preferences));
  },

  /**
   * Subscribe to push notifications
   * @param {Object} subscription - Push subscription object
   * @returns {Promise<Object>} Subscription result
   */
  subscribeToPush: (subscription) => {
    logger("Push", "Subscribing to push notifications");
    return processResponse(api.post('/notifications/push-subscription', subscription));
  },

  /**
   * Unsubscribe from push notifications
   * @param {string} [endpoint] - Optional endpoint to unsubscribe from
   * @returns {Promise<Object>} Unsubscription result
   */
  unsubscribeFromPush: (endpoint) => {
    logger("Push", "Unsubscribing from push notifications", { endpoint });
    return processResponse(api.delete('/notifications/push-subscription', { 
      data: endpoint ? { endpoint } : undefined 
    }));
  },

  /**
   * Test push notification
   * @returns {Promise<Object>} Test result
   */
  testPushNotification: () => {
    logger("Push", "Testing push notification");
    return processResponse(api.post('/notifications/test-push'));
  }
};

export default notificationAPI; 