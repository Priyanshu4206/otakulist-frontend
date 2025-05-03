import { Navigate, useLocation } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from './common/LoadingSpinner';
import { useEffect, useState } from 'react';

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
  const [hasTriedRefresh, setHasTriedRefresh] = useState(false);

  console.log('[AUTH DEBUG] ProtectedRoute:', {
    path: location.pathname,
    isAuthenticated,
    loading,
    initialAuthCheckComplete,
    hasTriedRefresh
  });

  // When a protected route is accessed, try to refresh user data once
  // This helps with cookie-based auth where we rely on httpOnly cookies
  useEffect(() => {
    if (!isAuthenticated && !loading && !hasTriedRefresh && initialAuthCheckComplete) {
      console.log('[AUTH DEBUG] Protected route not authenticated, trying to refresh user data');
      // Attempt to refresh user data when entering a protected route
      // With cookie-based auth, this should work if the user has valid cookies
      refreshUser();
      setHasTriedRefresh(true);
    }
  }, [refreshUser, isAuthenticated, loading, hasTriedRefresh, initialAuthCheckComplete]);

  // If still checking auth status or if initial auth check is not complete, show loading spinner
  if (loading || !initialAuthCheckComplete) {
    console.log('[AUTH DEBUG] Protected route showing loading spinner - still checking auth');
    return <LoadingSpinner fullScreen />;
  }

  // After trying to refresh, if still loading, show spinner
  if (loading && hasTriedRefresh) {
    console.log('[AUTH DEBUG] Protected route showing loading spinner after refresh attempt');
    return <LoadingSpinner fullScreen />;
  }

  // If auth check is complete and not authenticated, redirect to login
  if (!isAuthenticated && initialAuthCheckComplete) {
    console.log('[AUTH DEBUG] Protected route redirecting to login - not authenticated after checks');
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // If authenticated, render the protected route content
  console.log('[AUTH DEBUG] Protected route rendering children - user is authenticated');
  return children;
};

export default ProtectedRoute; 