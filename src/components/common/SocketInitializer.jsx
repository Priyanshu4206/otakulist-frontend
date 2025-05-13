import { useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import { io } from 'socket.io-client';
import { getGlobalSocket, setGlobalSocket } from '../../hooks/useNotifications';

/**
 * SocketInitializer - Silent component that ensures WebSocket connection 
 * is established and maintained throughout the application lifecycle
 */
const SocketInitializer = () => {
  const { isAuthenticated, user } = useAuth();
  const connectionAttemptRef = useRef(0);
  const initializedRef = useRef(false);

  // Initialize socket connection on app load or auth change
  useEffect(() => {
    // Only attempt connection if user is authenticated
    if (!isAuthenticated) {
      console.log('[SocketInitializer] Not authenticated, skipping socket initialization');
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (!token) {
      console.log('[SocketInitializer] No auth token found, skipping socket initialization');
      return;
    }

    // If we already have a socket instance that's connected, ensure it has the correct token
    const existingSocket = getGlobalSocket();
    if (existingSocket && existingSocket.connected) {
      console.log('[SocketInitializer] Socket already connected:', existingSocket.id);
      
      // Check if the socket is using the current token
      if (existingSocket.auth && existingSocket.auth.token === token) {
        console.log('[SocketInitializer] Socket already using current token');
        initializedRef.current = true;
        return;
      }
      
      // Token has changed, need to recreate socket
      console.log('[SocketInitializer] Token changed, will recreate socket');
      existingSocket.disconnect();
    }

    // Ensure we don't initialize multiple times
    if (initializedRef.current && existingSocket && existingSocket.connecting) {
      console.log('[SocketInitializer] Socket already connecting, skipping initialization');
      return;
    }

    console.log('[SocketInitializer] Initializing socket connection');
    initializedRef.current = true;
    connectionAttemptRef.current++;
    
    // Get socket URL based on environment
    const SOCKET_URL = import.meta.env.DEV
      ? 'http://localhost:3000'
      : import.meta.env.VITE_API_URL?.replace(/\/api.*/, '') || 'https://otaku-backend.jumpingcrab.com';
    
    // Create a new socket connection with improved options
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token },
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      forceNew: false, // Reuse existing connection if possible
    });
    
    // Store the socket instance globally
    setGlobalSocket(socket);
    
    // Enhanced logging
    socket.on('connect', () => {
      console.log(`[SocketInitializer] Socket connected: ${socket.id} (attempt ${connectionAttemptRef.current})`);
      connectionAttemptRef.current = 0; // Reset counter on successful connection
    });
    
    socket.on('connect_error', (err) => {
      console.error(`[SocketInitializer] Socket connection error: ${err.message}`);
      // If we've tried more than 5 times, back off
      if (connectionAttemptRef.current > 5) {
        console.log('[SocketInitializer] Multiple connection attempts failed, will retry on user interaction');
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`[SocketInitializer] Socket disconnected: ${reason}`);
    });
    
    // No need to disconnect the socket on component unmount
    // as we want it to persist throughout the app lifecycle
    
  }, [isAuthenticated, user?.id]); // Include user.id to reinitialize on user change

  // This component doesn't render anything
  return null;
};

export default SocketInitializer; 