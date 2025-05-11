import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
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
import AuthCallback from './components/auth/AuthCallback.jsx';
import GlobalStyles from './styles/GlobalStyles.js';
import { resetAuthFailedState } from './services/api.js';
import { useEffect, useState } from 'react';
import { DEFAULT_TIMEZONE } from './utils/simpleTimezoneUtils.js';
import useAuth from './hooks/useAuth.js';
import ScrollToTop from './components/common/ScrollToTop.jsx';
import GameScreenLoader from './components/settings/GameScreenLoader.jsx';

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

function AppRoutes() {
  return (
    <>
      <RouteChangeHandler />
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/anime/:id" element={<AnimePage />} />
        <Route path="/user/:username" element={<ProfilePage />} />
        
        {/* Playlist routes - ID route must come before slug route for correct matching */}
        <Route path="/playlist/id/:id" element={<PlaylistDetailPage />} />
        <Route path="/playlist/:slug" element={<PlaylistDetailPage />} />
        
        <Route path="/auth-callback" element={<AuthCallback />} />
        
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
  
  // Show loading screen until initial auth check is complete
  if (!initialAuthCheckComplete) {
    return <GameScreenLoader text="Loading Otakulist..." />;
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
            <ThemeProvider>
              <UIProvider>
                <AppContent />
              </UIProvider>
            </ThemeProvider>
          </AuthProvider>
        </ToastProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
