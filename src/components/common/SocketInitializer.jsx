import { useEffect, useRef } from 'react';
import useAuth from '../../hooks/useAuth';
import { io } from 'socket.io-client';
import { getGlobalSocket, setGlobalSocket } from '../../hooks/useNotifications';

/**
 * SocketInitializer - Silent component that ensures WebSocket connection 
 * is established and maintained throughout the application lifecycle
 * 
 * Only initializes socket after complete auth validation to prevent premature connections
 */
const SocketInitializer = () => {
  const { isAuthenticated, user, initialAuthCheckComplete } = useAuth();
  const connectionAttemptRef = useRef(0);
  const initializedRef = useRef(false);
  const userConfirmedRef = useRef(false);

  // Initialize socket connection on app load or auth change
  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    if (!initialAuthCheckComplete) {
      return;
    }

    if (!user || !user?.id || user?._id) {
      return;
    }

    // Check if we have a valid token
    const token = localStorage.getItem('auth_token');
    if (!token) {
      return;
    }

    // If we already have a socket instance that's connected, ensure it has the correct token
    const existingSocket = getGlobalSocket();
    if (existingSocket && existingSocket.connected) {
      
      // Check if the socket is using the current token
      if (existingSocket.auth && existingSocket.auth.token === token) {
        initializedRef.current = true;
        return;
      }
      
      // Token has changed, need to recreate socket
      existingSocket.disconnect();
    }

    // Ensure we don't initialize multiple times
    if (initializedRef.current && existingSocket && existingSocket.connecting) {
      return;
    }

    initializedRef.current = true;
    userConfirmedRef.current = true;
    connectionAttemptRef.current++;
    
    // Get socket URL based on environment
    const SOCKET_URL = import.meta.env.DEV
      ? 'http://localhost:3000'
      : import.meta.env.VITE_API_URL?.replace(/\/api.*/, '') || 'https://otaku-backend.jumpingcrab.com';
    
    // Create a new socket connection with improved options
    const socket = io(SOCKET_URL, {
      path: '/socket.io',
      auth: { token, userId: user?.id || user?._id }, // Include userId in socket auth
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
      connectionAttemptRef.current = 0; // Reset counter on successful connection
    });
    
    socket.on('connect_error', (err) => {
      console.error(`[SocketInitializer] Socket connection error:`, err.message);
      // If we've tried more than 5 times, back off
      if (connectionAttemptRef.current > 5) {
      }
    });
    
    socket.on('disconnect', (reason) => {
      console.log(`[SocketInitializer] Socket disconnected: ${reason}`);
    });
        
  }, [isAuthenticated, user, initialAuthCheckComplete]); // Include initialAuthCheckComplete in dependency array

  // This component doesn't render anything
  return null;
};

export default SocketInitializer; 