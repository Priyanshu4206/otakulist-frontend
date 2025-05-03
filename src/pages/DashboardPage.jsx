import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, useScroll, useTransform } from 'framer-motion';
import { User, Settings, Trophy, List, BookOpen } from 'lucide-react';
import Layout from '../components/layout/Layout.jsx';
import useAuth from '../hooks/useAuth.js';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import ProfileSection from '../components/dashboard/ProfileSection.jsx';
import SettingsSection from '../components/dashboard/SettingsSection.jsx';
import StatsSection from '../components/dashboard/StatsSection.jsx';
import WatchlistSection from '../components/dashboard/WatchlistSection.jsx';
import PlaylistsSection from '../components/dashboard/PlaylistsSection.jsx';

const PageContainer = styled.div`
  max-width: 1600px;
  margin: 0 auto;
  margin-top: 80px;
  padding: 0;
  position: relative;
  overflow: hidden;
`;

const ScrollArea = styled.div`
  padding: 0 2rem 2.5rem;
  
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

const Tab = styled(motion.button)`
  padding: 1.25rem 1.5rem;
  background: ${props => props.active ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: ${props => props.active ? 'var(--primary)' : 'var(--textSecondary)'};
  font-weight: ${props => props.active ? '600' : '500'};
  font-size: 1.05rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  white-space: nowrap;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: var(--gradientPrimary);
    transform: scaleX(${props => props.active ? '1' : '0'});
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
    stroke-width: ${props => props.active ? 2.5 : 2};
    color: ${props => props.active ? 'var(--primary)' : 'var(--textSecondary)'};
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

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { user, loading, initialAuthCheckComplete } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const pageRef = useRef(null);
  
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
  
  return (
    <Layout>
      <PageContainer ref={pageRef}>
        <ScrollArea>
          
          <NavWrapper>
            <DashboardTabs expanded={scrolled}>
              <Tab 
                active={activeTab === 'profile'} 
                onClick={() => setActiveTab('profile')}
                whileTap={{ scale: 0.98 }}
              >
                <User size={20} />
                Profile
              </Tab>
              
              <Tab 
                active={activeTab === 'stats'} 
                onClick={() => setActiveTab('stats')}
                whileTap={{ scale: 0.98 }}
              >
                <Trophy size={20} />
                Stats & Achievements
              </Tab>
              
              <Tab 
                active={activeTab === 'watchlist'} 
                onClick={() => setActiveTab('watchlist')}
                whileTap={{ scale: 0.98 }}
              >
                <List size={20} />
                Watchlist
              </Tab>
              
              <Tab 
                active={activeTab === 'playlists'} 
                onClick={() => setActiveTab('playlists')}
                whileTap={{ scale: 0.98 }}
              >
                <BookOpen size={20} />
                Playlists
              </Tab>
              
              <Tab 
                active={activeTab === 'settings'} 
                onClick={() => setActiveTab('settings')}
                whileTap={{ scale: 0.98 }}
              >
                <Settings size={20} />
                Settings
              </Tab>
            </DashboardTabs>
          </NavWrapper>
          
          <TabContent
            key={activeTab}
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
          >
            {activeTab === 'profile' && <ProfileSection />}
            {activeTab === 'stats' && <StatsSection />}
            {activeTab === 'watchlist' && <WatchlistSection />}
            {activeTab === 'playlists' && <PlaylistsSection />}
            {activeTab === 'settings' && <SettingsSection />}
          </TabContent>
        </ScrollArea>
      </PageContainer>
    </Layout>
  );
};

export default DashboardPage; 