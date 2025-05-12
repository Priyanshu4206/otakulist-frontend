import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import useAuth from './useAuth';

/**
 * useNotifications - React hook for real-time notifications via socket.io
 * @param {function} onNotification - Callback for incoming notification payloads
 * @returns {void}
 */
const SOCKET_URL = import.meta.env.DEV
  ? 'http://localhost:3000'
  : import.meta.env.VITE_API_URL?.replace(/\/api.*/, '') || 'https://otaku-backend.jumpingcrab.com';

function useNotifications(onNotification) {
  const { isAuthenticated } = useAuth();
  const socketRef = useRef(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    const token = localStorage.getItem('auth_token');
    if (!token) return;

    console.log('[Socket] Connecting to', SOCKET_URL);
    // Connect to socket.io server
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
    });
    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
    });
    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err);
    });

    // Listen for notification events
    if (onNotification) {
      socket.on('notification', (notif) => {
        console.log('[Socket] Notification received:', notif);
        onNotification(notif);
      });
    }

    // Cleanup on unmount or logout
    return () => {
      if (onNotification) socket.off('notification', onNotification);
      socket.off('connect');
      socket.off('disconnect');
      socket.off('connect_error');
      socket.disconnect();
      console.log('[Socket] Cleanup and disconnect');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, onNotification]);
}

export default useNotifications; 