import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuth from './useAuth';

/**
 * useNotifications - React hook for real-time notifications via socket.io
 * @param {function} onNotification - Callback for incoming notification payloads
 * @returns {void}
 */

// Maintain a global singleton socket instance
let globalSocket = null;
let activeListeners = new Map();
let reconnectAttempts = 0;
const MAX_RECONNECT_ATTEMPTS = 5;
let isConnecting = false;

// Notification queue for storing notifications that arrive during reconnection
const notificationQueue = [];

const SOCKET_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : import.meta.env.VITE_API_URL?.replace(/\/api.*/, '') || 'https://otaku-backend.jumpingcrab.com';

// Process queued notifications
const processNotificationQueue = () => {
  if (notificationQueue.length > 0) {
    console.log(`[Socket] Processing ${notificationQueue.length} queued notifications`);
    // Process all queued notifications
    while (notificationQueue.length > 0) {
      const notification = notificationQueue.shift();
      globalNotificationHandler(notification);
    }
  }
};

// Get the global socket instance
export const getGlobalSocket = () => globalSocket;

// Set the global socket instance (mainly for SocketInitializer)
export const setGlobalSocket = (socket) => {
  globalSocket = socket;
};

// Create or get the global socket instance
const getSocket = (token) => {
  if (!token) return null;
  
  // If we're in the process of connecting, don't create another socket
  if (isConnecting) return globalSocket;
  
  // If we already have a socket that's connected or connecting, return it
  if (globalSocket && (globalSocket.connected || globalSocket.connecting)) {
    return globalSocket;
  }
  
  // Disconnect any existing socket before creating a new one
  if (globalSocket) {
    globalSocket.disconnect();
  }
  
  isConnecting = true;
  console.log('[Socket] Creating new connection to', SOCKET_URL);
  
  // Create a new socket connection
  globalSocket = io(SOCKET_URL, {
    path: '/socket.io',
    auth: { token },
    transports: ['websocket'],
    reconnection: true,
    reconnectionAttempts: MAX_RECONNECT_ATTEMPTS,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    timeout: 20000,
  });
  
  // Set up global listeners that stay regardless of component lifecycle
  globalSocket.on('connect', () => {
    console.log('[Socket] Connected:', globalSocket.id);
    reconnectAttempts = 0;
    isConnecting = false;
    
    // Re-register all active listeners after reconnection
    activeListeners.forEach((handler, event) => {
      globalSocket.on(event, handler);
      console.log(`[Socket] Re-registered listener for event: ${event} after reconnection`);
    });
    
    // Process any queued notifications
    processNotificationQueue();
  });
  
  globalSocket.on('disconnect', (reason) => {
    console.log('[Socket] Disconnected:', reason);
    
    // If the server disconnected us, don't try to reconnect automatically
    if (reason === 'io server disconnect') {
      // The disconnection was initiated by the server, need to reconnect manually
      setTimeout(() => {
        if (globalSocket && reconnectAttempts < MAX_RECONNECT_ATTEMPTS) {
          reconnectAttempts++;
          console.log(`[Socket] Manual reconnect attempt ${reconnectAttempts}...`);
          globalSocket.connect();
        }
      }, 2000);
    }
  });
  
  globalSocket.on('connect_error', (err) => {
    console.error('[Socket] Connection error:', err);
    isConnecting = false;
    
    // If authentication error, we shouldn't retry connecting
    if (err.message?.includes('authentication')) {
      console.error('[Socket] Authentication failed, not retrying');
      globalSocket.disconnect();
      globalSocket = null;
    }
  });
  
  // Always register the notification handler directly on the socket too
  // This allows us to queue notifications that arrive before components mount
  globalSocket.on('notification', (notification) => {
    console.log('[Socket] Notification received at socket level:', notification);
    
    // If we have active callbacks, process immediately
    if (notificationCallbacks.size > 0) {
      globalNotificationHandler(notification);
    } else {
      // Otherwise, queue for later processing
      console.log('[Socket] No active callbacks, queuing notification for later');
      notificationQueue.push(notification);
    }
  });
  
  return globalSocket;
};

// Store all notification callbacks
const notificationCallbacks = new Set();

// Global notification handler that forwards to all registered callbacks
const globalNotificationHandler = (notification) => {
  console.log('[Socket] Notification received globally:', notification);
  
  if (notificationCallbacks.size === 0) {
    console.log('[Socket] No active callbacks, queuing notification');
    notificationQueue.push(notification);
    return;
  }
  
  notificationCallbacks.forEach(callback => {
    try {
      callback(notification);
    } catch (err) {
      console.error('[Socket] Error in notification callback:', err);
    }
  });
};

function useNotifications(onNotification) {
  const { isAuthenticated, user } = useAuth();
  const callbackRef = useRef(onNotification);
  
  // Update the callback reference when it changes
  useEffect(() => {
    callbackRef.current = onNotification;
  }, [onNotification]);
  
  // Create a stable callback that uses the ref
  const stableCallback = useCallback((notification) => {
    console.log('[Socket] Notification received, forwarding to component:', notification);
    if (callbackRef.current) {
      callbackRef.current(notification);
    }
  }, []);
  
  // Setup socket connection and register the notification handler
  useEffect(() => {
    // Exit early if user isn't authenticated
    if (!isAuthenticated) return;
    
    const token = localStorage.getItem('auth_token');
    if (!token) return;
    
    // Get or create the socket
    const socket = getSocket(token);
    if (!socket) return;
    
    // Add this component's callback to the global set
    notificationCallbacks.add(stableCallback);
    console.log('[Socket] Registered notification callback, total:', notificationCallbacks.size);
    
    // Register the global handler only once
    if (!activeListeners.has('notification')) {
      socket.on('notification', globalNotificationHandler);
      activeListeners.set('notification', globalNotificationHandler);
      console.log('[Socket] Registered global notification handler');
    }
    
    // Process any queued notifications now that we have a handler
    if (notificationQueue.length > 0) {
      console.log(`[Socket] Processing ${notificationQueue.length} queued notifications after registration`);
      // Make a copy of the queue and clear it
      const queueCopy = [...notificationQueue];
      notificationQueue.length = 0;
      
      // Process all queued notifications
      queueCopy.forEach(notification => {
        stableCallback(notification);
      });
    }
    
    // Keep track of removal timeout
    let removalTimeout;
    
    // Clean up this specific listener when the component unmounts
    return () => {
      // Delay removal to handle component re-mounting
      clearTimeout(removalTimeout);
      removalTimeout = setTimeout(() => {
        // Only remove if we're not registering it again (check if it exists in the set)
        if (!notificationCallbacks.has(stableCallback)) {
          // Remove this component's callback
          notificationCallbacks.delete(stableCallback);
          console.log('[Socket] Removed notification callback after delay, remaining:', notificationCallbacks.size);
          
          // If no callbacks remain, remove the global handler
          if (notificationCallbacks.size === 0 && globalSocket) {
            globalSocket.off('notification', globalNotificationHandler);
            activeListeners.delete('notification');
            console.log('[Socket] Removed global notification handler after delay');
          }
        }
      }, 2000); // 2 second delay to handle remounts
    };
  }, [isAuthenticated, stableCallback, user?.id]);
  
  // Setup reconnection logic on app refresh/load
  useEffect(() => {
    const checkConnection = () => {
      if (isAuthenticated) {
        const token = localStorage.getItem('auth_token');
        if (token && (!globalSocket || !globalSocket.connected)) {
          console.log('[Socket] Initializing connection on app focus/visibility');
          getSocket(token);
        }
      }
    };
    
    // Check connection when page becomes visible again
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        checkConnection();
      }
    });
    
    // Check connection on window focus
    window.addEventListener('focus', checkConnection);
    
    // Initial connection check
    checkConnection();
    
    return () => {
      document.removeEventListener('visibilitychange', checkConnection);
      window.removeEventListener('focus', checkConnection);
    };
  }, [isAuthenticated]);
}

// Export a method to manually disconnect the socket (for logout, etc.)
export const disconnectSocket = () => {
  if (globalSocket) {
    console.log('[Socket] Manually disconnecting socket');
    globalSocket.disconnect();
    globalSocket = null;
    activeListeners.clear();
    notificationCallbacks.clear();
    isConnecting = false;
    // Clear any queued notifications
    notificationQueue.length = 0;
  }
};

export default useNotifications; 