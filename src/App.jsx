import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import { UIProvider } from './contexts/UIContext.jsx';
import { AuthProvider } from './contexts/AuthContext.jsx';
import { ThemeProvider } from './contexts/ThemeContext.jsx';
import { ToastProvider } from './contexts/ToastContext.jsx';
import styled from 'styled-components';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import LoginPage from './pages/LoginPage.jsx';
import HomePage from './pages/HomePage.jsx';
import SchedulePage from './pages/SchedulePage.jsx';
import AnimePage from './pages/AnimePage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import PlaylistDetailPage from './pages/PlaylistDetailPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import NewsPage from './pages/NewsPage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import AuthCallback from './components/auth/AuthCallback.jsx';
import GlobalStyles from './styles/GlobalStyles.js';
import { useEffect, useState } from 'react';
import { DEFAULT_TIMEZONE } from './utils/simpleTimezoneUtils.js';
import useAuth from './hooks/useAuth.js';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import SocketInitializer from './components/common/SocketInitializer.jsx';
import GameScreenLoader from './components/settings/GameScreenLoader.jsx';
import { NotificationProvider } from './contexts/NotificationContext.jsx';
import genreAPI from './services/modules/genreAPI.js';
import userAPI from './services/modules/userAPI.js';
import { resetAuthFailedState } from './services/axiosInstance.js';

// Constants for static data cache expiry (1 week in milliseconds)
const STATIC_DATA_CACHE_TTL = 7 * 24 * 60 * 60 * 1000;

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100dvh;
  width: 100%;
  position: relative;
  overflow-x: hidden;
  overflow-y: auto;
  
  /* Custom scrollbar - hidden but functional */
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;
`;

// Simple error boundary component
function ErrorFallback({ error }) {
  return (
    <div style={{
      padding: '20px',
      margin: '20px',
      backgroundColor: '#ffeeee',
      border: '1px solid #ff6666',
      borderRadius: '5px'
    }}>
      <h2>Something went wrong</h2>
      <pre style={{ whiteSpace: 'pre-wrap' }}>{error.message}</pre>
      <button
        onClick={() => window.location.reload()}
        style={{
          padding: '8px 16px',
          backgroundColor: '#4466ee',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '10px'
        }}
      >
        Reload Page
      </button>
    </div>
  );
}

// Error boundary wrapper component
function ErrorBoundary({ children }) {
  const [hasError, setHasError] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const handleError = (event) => {
      console.error('Caught in error boundary:', event.error);
      setHasError(true);
      setError(event.error);
      event.preventDefault();
    };

    window.addEventListener('error', handleError);
    return () => window.removeEventListener('error', handleError);
  }, []);

  if (hasError) {
    return <ErrorFallback error={error} />;
  }

  return children;
}

// Component to handle route changes and reset auth state
function RouteChangeHandler() {
  const location = useLocation();

  useEffect(() => {
    // Reset auth failed state on route changes, especially to login page
    if (location.pathname === '/login') {
      resetAuthFailedState();
    }

    // Initialize timezone if not set in localStorage
    if (!localStorage.getItem('user_timezone')) {
      localStorage.setItem('user_timezone', DEFAULT_TIMEZONE);
    }
  }, [location]);

  return null;
}

// Function to check if cached static data needs refresh
function isCacheExpired(lastFetchTimeKey) {
  const lastFetchTime = localStorage.getItem(lastFetchTimeKey);
  if (!lastFetchTime) return true;

  const now = Date.now();
  return now - parseInt(lastFetchTime, 10) > STATIC_DATA_CACHE_TTL;
}

// Component to fetch static application data
function StaticDataLoader() {
  useEffect(() => {
    const fetchStaticData = async () => {

      try {
        // Fetch genres if needed
        const genresLastFetchKey = 'genres_last_fetch_time';
        if (isCacheExpired(genresLastFetchKey)) {
          const genresResponse = await genreAPI.getAllGenres({ useCache: true });
          if (genresResponse.success) {
            localStorage.setItem(genresLastFetchKey, Date.now().toString());
          }
        }

        // Fetch achievements if needed
        const achievementsLastFetchKey = 'achievements_last_fetch_time';
        if (isCacheExpired(achievementsLastFetchKey)) {
          const achievementsResponse = await userAPI.getAllAchievements({ useCache: true });
          if (achievementsResponse.success) {
            localStorage.setItem(achievementsLastFetchKey, Date.now().toString());
          }
        }

        // Fetch timezones if needed
        const timezonesLastFetchKey = 'timezones_last_fetch_time';
        if (isCacheExpired(timezonesLastFetchKey)) {
          const timezonesResponse = await userAPI.getAvailableTimezones({ useCache: true });
          if (timezonesResponse.success) {
            localStorage.setItem(timezonesLastFetchKey, Date.now().toString());
          }
        }
      } catch (error) {
        console.error('[App] Error fetching static data:', error);
      }
    };

    fetchStaticData();
  }, []);

  return null;
}

function AppRoutes() {
  // Access auth state for route decisions
  const { isAuthenticated } = useAuth();

  return (
    <>
      <RouteChangeHandler />
      <ScrollToTop />
      <SocketInitializer />
      <StaticDataLoader />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/anime/:id" element={<AnimePage />} />
        <Route path="/user/:username" element={<ProfilePage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/explore" element={<ExplorePage />} />

        {/* Playlist routes - ID route must come before slug route for correct matching */}
        <Route path="/playlist/id/:id" element={<PlaylistDetailPage />} />
        <Route path="/playlist/:slug" element={<PlaylistDetailPage />} />

        {/* Auth Callback routes with high priority and ensuring they render even with hash */}
        <Route path="/auth-callback" element={
          isAuthenticated
            ? <Navigate to="/dashboard" replace />
            : <AuthCallback />
        } />
        <Route path="/api/auth/google/callback" element={<AuthCallback />} />

        {/* Dashboard routes with nested routing */}
        <Route path="/dashboard/*" element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        } />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </>
  );
}

// Main App component with loading state management
function AuthContent() {
  const { initialAuthCheckComplete } = useAuth();
  const [forceLoad, setForceLoad] = useState(false);
  const [loadingKey] = useState(`loader-${Math.random().toString(36).substring(2, 9)}`);

  // Safety timeout to prevent getting stuck in loading state
  useEffect(() => {
    const loaderTimeout = setTimeout(() => {
      if (!initialAuthCheckComplete && !forceLoad) {
        console.warn('[APP] Auth check taking too long, forcing content to load');
        setForceLoad(true);
      }
    }, 5000); // 5 second safety timeout

    return () => clearTimeout(loaderTimeout);
  }, [initialAuthCheckComplete, forceLoad]);

  // Check if we have a hard redirect attempt in progress
  const hardRedirectInProgress = localStorage.getItem('hard_redirect_attempted') === 'pending';

  // If a hard redirect is in progress, don't show loader to avoid flickering
  if (hardRedirectInProgress) {
    return (
      <AppWrapper>
        <GlobalStyles />
        <AppRoutes />
      </AppWrapper>
    );
  }

  // Show loading screen until initial auth check is complete
  if (!initialAuthCheckComplete && !forceLoad) {
    return <GameScreenLoader key={loadingKey} text="Loading Otakulist..." />;
  }

  return (
    <AppWrapper>
      <GlobalStyles />
      <AppRoutes />
    </AppWrapper>
  );
}

function AppContent() {
  // Initialize timezone on app load if not already set
  useEffect(() => {
    if (!localStorage.getItem('user_timezone')) {
      localStorage.setItem('user_timezone', DEFAULT_TIMEZONE);
    }
  }, []);

  return <AuthContent />;
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ToastProvider>
          <AuthProvider>
            <NotificationProvider>
              <ThemeProvider>
                <UIProvider>
                  <AppContent />
                </UIProvider>
              </ThemeProvider>
            </NotificationProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
