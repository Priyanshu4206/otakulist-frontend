import { useEffect, useState, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { User, Settings, Trophy, List, BookOpen, Activity } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import useAuth from '../hooks/useAuth.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';

// Import dashboard pages
import ProfileSection from '../components/dashboard/ProfileSection.jsx';
import SettingsSection from '../components/dashboard/SettingsSection.jsx';
import StatsSection from '../components/dashboard/StatsSection.jsx';
import WatchlistSection from '../components/dashboard/WatchlistSection.jsx';
import PlaylistsSection from '../components/dashboard/PlaylistsSection.jsx';
import ActivitySection from '../components/dashboard/ActivitySection.jsx';

const PageContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  margin-top: 80px;
  padding: 0;
  position: relative;
  overflow: visible !important;
  z-index: 1;
`;

const ScrollArea = styled.div`
  padding: 0 2rem 2.5rem;
  position: relative;
  min-height: 100vh;
  background-color: var(--background);
  overflow: visible !important;
  z-index: 1;
  
  @media (max-width: 768px) {
    padding: 0 1rem 1.5rem;
  }
`;

const NavWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  margin-left: var(--sidebar-collapsed-width);
  transition: padding 0.3s ease;
  background: rgba(var(--background-rgb), 0.75);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.1);
`;

const DashboardTabs = styled(motion.div)`
  display: flex;
  overflow-x: auto;
  width: 100%;
  gap: 1rem;
  scrollbar-width: none;
  background: var(--cardBackground);
  padding: 9px 2rem;
  transition: all 0.3s ease;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.expanded ? '0.5rem 1rem' : '0.5rem'};
  }
`;

const Tab = styled(Link)`
  padding: 1.25rem 1.5rem;
  background: ${props => props.$active ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: ${props => props.$active ? 'var(--primary)' : 'var(--textSecondary)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--gradientPrimary);
    transform: scaleX(${props => props.$active ? '1' : '0'});
    transform-origin: left;
    transition: transform 0.3s ease;
  }
  
  &:hover {
    color: var(--primary);
    background: rgba(var(--primary-rgb), 0.05);
    
    &::after {
      transform: scaleX(1);
    }
  }
  
  svg {
    stroke-width: ${props => props.$active ? 2.5 : 2};
    color: ${props => props.$active ? 'var(--primary)' : 'var(--textSecondary)'};
    transition: all 0.3s ease;
  }
  
  @media (max-width: 768px) {
    padding: 1rem 1.25rem;
    font-size: 0.95rem;
  }
`;

const TabContent = styled(motion.div)`
  background: rgba(var(--cardBackground-rgb), 0.8);
  border-radius: 20px;
  border-top-left-radius: 0;
  border-top-right-radius: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  border: 1px solid rgba(var(--borderColor-rgb), 0.2);
  backdrop-filter: blur(5px);
  position: relative;
  min-height: calc(100vh - 200px);
  z-index: 1;
  overflow: visible !important;
  
  /* Ensure dropdown menus can overflow */
  transform-style: preserve-3d;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 5rem 1rem;
  height: 60vh;
`;

// Animation variants
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: {
      duration: 0.3
    }
  }
};

// Dashboard navigation component
const DashboardNavigation = () => {
  const location = useLocation();
  const currentPath = location.pathname;
  
  const isActive = (path) => {
    return currentPath === path || 
      (path !== '/dashboard' && currentPath.startsWith(path));
  };
  
  const [scrolled, setScrolled] = useState(false);
  
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);
  
  return (
    <NavWrapper>
      <DashboardTabs expanded={scrolled}>
        <Tab 
          to="/dashboard" 
          $active={isActive('/dashboard')}
        >
          <User size={20} />
          Profile
        </Tab>
        
        <Tab 
          to="/dashboard/stats" 
          $active={isActive('/dashboard/stats')}
        >
          <Trophy size={20} />
          Stats & Achievements
        </Tab>
        
        <Tab 
          to="/dashboard/activity" 
          $active={isActive('/dashboard/activity')}
        >
          <Activity size={20} />
          Activity
        </Tab>
        
        <Tab 
          to="/dashboard/watchlist" 
          $active={isActive('/dashboard/watchlist')}
        >
          <List size={20} />
          Watchlist
        </Tab>
        
        <Tab 
          to="/dashboard/playlists" 
          $active={isActive('/dashboard/playlists')}
        >
          <BookOpen size={20} />
          Playlists
        </Tab>
        
        <Tab 
          to="/dashboard/settings" 
          $active={isActive('/dashboard/settings')}
        >
          <Settings size={20} />
          Settings
        </Tab>
      </DashboardTabs>
    </NavWrapper>
  );
};

// Main dashboard layout component
const DashboardLayout = ({ children }) => {
  return (
    <Layout>
      <PageContainer>
        <ScrollArea>
          <DashboardNavigation />
          
          <TabContent
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={contentVariants}
          >
            {children}
          </TabContent>
        </ScrollArea>
      </PageContainer>
    </Layout>
  );
};

// Main Dashboard component with nested routing
const DashboardPage = () => {
  const { loading, initialAuthCheckComplete, refreshUser, isAuthenticated } = useAuth();
  const [userRefreshed, setUserRefreshed] = useState(false);
  const refreshAttemptTimestamp = useRef(0);
  const MIN_REFRESH_INTERVAL = 5000; // 5 seconds between refresh attempts
  
  // Refresh user data only once when dashboard loads
  useEffect(() => {
    const now = Date.now();
    const timeSinceLastRefresh = now - refreshAttemptTimestamp.current;
    if (!userRefreshed && 
        initialAuthCheckComplete && 
        !loading && 
        timeSinceLastRefresh > MIN_REFRESH_INTERVAL) {
      
      refreshAttemptTimestamp.current = now;
      
      refreshUser()
        .then(() => {
          setUserRefreshed(true);
        })
        .catch((err) => {
          if (err?.throttled) {
            // Handle throttled requests
          } else {
            // Handle errors
          }
          setUserRefreshed(true);
        });
    }
  }, [refreshUser, initialAuthCheckComplete, loading, userRefreshed]);
  
  if (loading || !initialAuthCheckComplete) {
    return (
      <Layout>
        <PageContainer>
          <LoadingContainer>
            <LoadingSpinner size={48} />
            <p style={{ marginTop: '1.5rem', color: 'var(--textSecondary)', fontSize: '1.1rem' }}>Loading your profile...</p>
          </LoadingContainer>
        </PageContainer>
      </Layout>
    );
  }
  
  // Add an additional check to ensure authenticated before rendering routes
  if (!isAuthenticated) {
    return (
      <Layout>
        <PageContainer>
          <LoadingContainer>
            <div style={{ textAlign: 'center' }}>
              <p style={{ color: 'var(--textSecondary)', fontSize: '1.1rem', marginBottom: '1rem' }}>
                You need to be logged in to access the dashboard.
              </p>
              <Link to="/login" style={{ 
                padding: '0.75rem 1.5rem',
                background: 'var(--primary)',
                color: 'white',
                borderRadius: '8px',
                textDecoration: 'none',
                display: 'inline-block'
              }}>
                Go to Login
              </Link>
            </div>
          </LoadingContainer>
        </PageContainer>
      </Layout>
    );
  }
  
  return (
    <Routes>
      <Route path="/" element={
        <DashboardLayout>
          <ProfileSection />
        </DashboardLayout>
      } />
      <Route path="/stats" element={
        <DashboardLayout>
          <StatsSection />
        </DashboardLayout>
      } />
      <Route path="/activity" element={
        <DashboardLayout>
          <ActivitySection />
        </DashboardLayout>
      } />
      <Route path="/watchlist" element={
        <DashboardLayout>
          <WatchlistSection />
        </DashboardLayout>
      } />
      <Route path="/playlists" element={
        <DashboardLayout>
          <PlaylistsSection />
        </DashboardLayout>
      } />
      <Route path="/settings" element={
        <DashboardLayout>
          <SettingsSection />
        </DashboardLayout>
      } />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default DashboardPage; 