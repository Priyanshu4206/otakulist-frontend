import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from './common/LoadingSpinner';
import { useEffect, useState, useRef } from 'react';

/**
 * ProtectedRoute component
 * 
 * Ensures that a user is authenticated before allowing access to a route
 * If not authenticated, redirects to login page with redirect path
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components to render if authenticated
 */
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading, initialAuthCheckComplete, refreshUser } = useAuth();
  const location = useLocation();
  const refreshAttempted = useRef(false);
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);
  
  // Store a timestamp to prevent redirect loops
  const lastRefreshAttempt = useRef(0);
  const MIN_REFRESH_INTERVAL = 3000; // 3 seconds

  // When a protected route is accessed, try to refresh user data once
  // This helps with cookie-based auth where we rely on httpOnly cookies
  useEffect(() => {
    // Only try to refresh if needed, not authenticated, not currently loading,
    // and minimum time interval has passed since last attempt
    const now = Date.now();
    const shouldRefresh = 
      !isAuthenticated && 
      !loading && 
      !hasTriedRefresh && 
      initialAuthCheckComplete && 
      !refreshAttempted.current && 
      (now - lastRefreshAttempt.current > MIN_REFRESH_INTERVAL);
    
    if (shouldRefresh) {
      // Prevent multiple refreshes with a ref to avoid state update cycles
      refreshAttempted.current = true;
      lastRefreshAttempt.current = now;
      
      // Attempt to refresh user data when entering a protected route
      refreshUser()
        .then(() => {
          // Success handling
        })
        .catch(err => {
          if (err?.throttled) {
            // Throttled request handling
          } else {
            // Error handling
          }
        })
        .finally(() => {
          setHasTriedRefresh(true);
        });
    }
  }, [refreshUser, isAuthenticated, loading, hasTriedRefresh, initialAuthCheckComplete]);

  // If still checking auth status or if initial auth check is not complete, show loading spinner
  if (loading || !initialAuthCheckComplete) {
    return <LoadingSpinner fullScreen />;
  }

  // After trying to refresh, if still loading, show spinner
  if (loading && hasTriedRefresh) {
    return <LoadingSpinner fullScreen />;
  }

  // If auth check is complete and not authenticated, redirect to login
  if (!isAuthenticated && initialAuthCheckComplete && hasTriedRefresh) {
    // Store the current location for redirect after login
    const redirectPath = location.pathname + location.search + location.hash;
    
    // Use replace to avoid populating history
    return <Navigate to={`/login?redirect=${encodeURIComponent(redirectPath)}`} replace />;
  }

  // If authenticated, render the protected route content
  return children;
};

export default ProtectedRoute; 