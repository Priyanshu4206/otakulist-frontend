import { useEffect, useState, useRef } from 'react';
import { Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { User, Settings, Trophy, List, BookOpen, Activity } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import useAuth from '../hooks/useAuth.js';

// Import dashboard pages
import ProfilePage from '../components/dashboard/ProfilePage.jsx';
import SettingsPage from '../components/dashboard/SettingsPage.jsx';
import StatsPage from '../components/dashboard/StatsPage.jsx';
import WatchlistPage from '../components/dashboard/WatchlistPage.jsx';
import PlaylistsPage from '../components/dashboard/PlaylistsPage.jsx';
import ActivityPage from '../components/dashboard/ActivityPage.jsx';

const PageContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  margin-top: 80px;
  padding: 0;
  position: relative;
  overflow: visible !important;
  z-index: 1;
  
  @media (max-width: 768px) {
    margin-top: 60px;
  }
  
  @media (max-width: 480px) {
    margin-top: 50px;
  }
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
  
  @media (max-width: 480px) {
    padding: 0;
  }
`;

const NavWrapper = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 100;
  width: 100%;
  margin-left: var(--sidebar-collapsed-width);
  transition: padding 0.3s ease, margin-left 0.3s ease;
  background: rgba(var(--background-rgb), 0.75);
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.1);
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    top: var(--header-height);
  }
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
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS */
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    padding: ${props => props.expanded ? '0.5rem 1rem' : '0.5rem'};
    gap: 0.5rem;
    justify-content: flex-start;
  }
  
  @media (max-width: 480px) {
    padding: 0.35rem 0.5rem;
    gap: 0.25rem;
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
  flex-shrink: 0;
  
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
    padding: 0.85rem 1rem;
    font-size: 0.9rem;
    gap: 0.5rem;
    border-radius: 8px;
  }
  
  @media (max-width: 480px) {
    padding: 0.75rem 0.85rem;
    font-size: 0.85rem;
    gap: 0.35rem;
  }
`;

const TabLabel = styled.span`
  @media (max-width: 480px) {
    display: ${props => props.$active ? 'inline' : 'none'};
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
    border-radius: 16px;
  }
  
  @media (max-width: 480px) {
    padding: 1rem;
    border-radius: 12px;
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
  
  const tabsRef = useRef(null);
  
  // Scroll active tab into view
  useEffect(() => {
    if (tabsRef.current) {
      const activeTab = tabsRef.current.querySelector('[data-active="true"]');
      if (activeTab) {
        // Calculate scroll position to center the active tab
        const tabsRect = tabsRef.current.getBoundingClientRect();
        const activeTabRect = activeTab.getBoundingClientRect();
        const scrollLeft = activeTabRect.left - tabsRect.left - (tabsRect.width / 2) + (activeTabRect.width / 2);
        
        tabsRef.current.scrollTo({
          left: Math.max(0, scrollLeft),
          behavior: 'smooth'
        });
      }
    }
  }, [currentPath]);
  
  const handleScroll = () => {
    if (window.scrollY > 10) {
      setScrolled(true);
    } else {
      setScrolled(false);
    }
  };
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  
  return (
    <NavWrapper
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        boxShadow: scrolled ? '0 4px 20px rgba(0, 0, 0, 0.1)' : 'none',
      }}
    >
      <DashboardTabs ref={tabsRef}>
        <Tab 
          to="/dashboard" 
          $active={currentPath === '/dashboard'} 
          data-active={currentPath === '/dashboard'}
        >
          <User size={20} />
          <TabLabel $active={currentPath === '/dashboard'}>Profile</TabLabel>
        </Tab>
        
        <Tab 
          to="/dashboard/stats" 
          $active={isActive('/dashboard/stats')} 
          data-active={isActive('/dashboard/stats')}
        >
          <Trophy size={20} />
          <TabLabel $active={isActive('/dashboard/stats')}>Stats</TabLabel>
        </Tab>
        
        <Tab 
          to="/dashboard/watchlist" 
          $active={isActive('/dashboard/watchlist')} 
          data-active={isActive('/dashboard/watchlist')}
        >
          <List size={20} />
          <TabLabel $active={isActive('/dashboard/watchlist')}>Watchlist</TabLabel>
        </Tab>
        
        <Tab 
          to="/dashboard/playlists" 
          $active={isActive('/dashboard/playlists')} 
          data-active={isActive('/dashboard/playlists')}
        >
          <BookOpen size={20} />
          <TabLabel $active={isActive('/dashboard/playlists')}>Playlists</TabLabel>
        </Tab>
        
        <Tab 
          to="/dashboard/activity" 
          $active={isActive('/dashboard/activity')} 
          data-active={isActive('/dashboard/activity')}
        >
          <Activity size={20} />
          <TabLabel $active={isActive('/dashboard/activity')}>Activity</TabLabel>
        </Tab>
        
        <Tab 
          to="/dashboard/settings" 
          $active={isActive('/dashboard/settings')} 
          data-active={isActive('/dashboard/settings')}
        >
          <Settings size={20} />
          <TabLabel $active={isActive('/dashboard/settings')}>Settings</TabLabel>
        </Tab>
      </DashboardTabs>
    </NavWrapper>
  );
};

const DashboardLayout = ({ children }) => {
  return (
    <PageContainer>
      <DashboardNavigation />
      <ScrollArea>
        <TabContent
          variants={contentVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
        >
          {children}
        </TabContent>
      </ScrollArea>
    </PageContainer>
  );
};

const DashboardPage = () => {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <Layout>
        <LoadingContainer>
          <div>Loading...</div>
        </LoadingContainer>
      </Layout>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return (
    <Layout fullWidth>
      <Routes>
        <Route path="/" element={<DashboardLayout><ProfilePage /></DashboardLayout>} />
        <Route path="/stats" element={<DashboardLayout><StatsPage /></DashboardLayout>} />
        <Route path="/watchlist/*" element={<DashboardLayout><WatchlistPage /></DashboardLayout>} />
        <Route path="/playlists/*" element={<DashboardLayout><PlaylistsPage /></DashboardLayout>} />
        <Route path="/activity" element={<DashboardLayout><ActivityPage /></DashboardLayout>} />
        <Route path="/settings" element={<DashboardLayout><SettingsPage /></DashboardLayout>} />
      </Routes>
    </Layout>
  );
};

export default DashboardPage; 