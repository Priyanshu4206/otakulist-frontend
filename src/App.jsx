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
import NotFoundPage from './pages/NotFoundPage.jsx';
import AuthCallback from './components/auth/AuthCallback.jsx';
import GlobalStyles from './styles/GlobalStyles.js';
import { resetAuthFailedState } from './services/api.js';
import { useEffect } from 'react';
import { DEFAULT_TIMEZONE } from './utils/simpleTimezoneUtils.js';
import InitialLoadingScreen from './components/common/InitialLoadingScreen.jsx';
import useAuth from './hooks/useAuth.js';

const AppWrapper = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
  // background-color: var(--background);
`;

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
      console.log('Initialized default timezone:', DEFAULT_TIMEZONE);
    }
  }, [location]);
  
  return null;
}

function AppRoutes() {
  return (
    <>
      <RouteChangeHandler />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/schedule" element={<SchedulePage />} />
        <Route path="/anime/:id" element={<AnimePage />} />
        <Route path="/user/:username" element={<ProfilePage />} />
        <Route path="/auth-callback" element={<AuthCallback />} />
        
        <Route path="/dashboard" element={
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
function AppContent() {
  const { initialAuthCheckComplete } = useAuth();
  
  // Initialize timezone on app load if not already set
  useEffect(() => {
    if (!localStorage.getItem('user_timezone')) {
      localStorage.setItem('user_timezone', DEFAULT_TIMEZONE);
      console.log('Initialized default timezone on app load:', DEFAULT_TIMEZONE);
    }
  }, []);
  
  // Show loading screen until initial auth check is complete
  if (!initialAuthCheckComplete) {
    return <InitialLoadingScreen />;
  }
  
  return (
    <AppWrapper>
      <GlobalStyles />
      <AppRoutes />
    </AppWrapper>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ThemeProvider>
          <ToastProvider>
            <UIProvider>
              <AppContent />
            </UIProvider>
          </ToastProvider>
        </ThemeProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
