import styled from 'styled-components';
import { useEffect, useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import useUI from '../../hooks/useUI';
import { useNotificationContext } from '../../contexts/NotificationContext';
import NotificationSidePanel from '../common/NotificationSidePanel';

// Define CSS variables for layout
const layoutCSSVars = `
  :root {
    --sidebar-width: 240px;
    --sidebar-collapsed-width: 70px;
    --header-height: 60px;
    --content-max-width: 1600px;
    --content-padding-desktop: 2rem;
    --content-padding-tablet: 1.5rem;
    --content-padding-mobile: 1rem;
  }
`;

// Inject CSS variables into document head
(() => {
  if (typeof document !== 'undefined') {
    const style = document.createElement('style');
    style.innerHTML = layoutCSSVars;
    document.head.appendChild(style);
  }
})();

const AppContainer = styled.div`
  display: flex;
  min-height: 100dvh;
  background: ${props => props.transparent ? 'transparent' : 'var(--background)'};
  position: relative;
`;

const Main = styled.main`
  flex: 1;
  margin-left: var(--sidebar-collapsed-width);
  transition: margin-left 0.3s ease, padding-top 0.3s ease;
  min-height: 100dvh;
  background: ${props => props.transparent ? 'transparent' : 'var(--background)'};
  overflow-x: hidden;
  overflow-y: auto;
  width: calc(100% - var(--sidebar-collapsed-width));
  position: relative;
  z-index: 1;
  
  /* Hide scrollbars but keep functionality */
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
  
  scrollbar-width: none;
  -ms-overflow-style: none;
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding-top: var(--header-height);
    width: 100%;
  }
`;

const ContentContainer = styled.div`
  max-width: var(--content-max-width);
  margin: 0 auto;
`;

const Layout = ({ children, transparentHeader = false, fullWidth = false }) => {
  const { isMobileView, isSidebarOpen } = useUI();
  const { unreadCount } = useNotificationContext();
  const [isNotificationPanelOpen, setNotificationPanelOpen] = useState(false);

  const openNotificationPanel = useCallback(() => setNotificationPanelOpen(true), []);
  const closeNotificationPanel = useCallback(() => setNotificationPanelOpen(false), []);

  // Prevent body scroll when mobile sidebar or notification panel is open
  useEffect(() => {
    if ((isMobileView && isSidebarOpen) || isNotificationPanelOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileView, isSidebarOpen, isNotificationPanelOpen]);
  
  return (
    <AppContainer transparent={transparentHeader}>
      <Sidebar unreadCount={unreadCount} openNotificationPanel={openNotificationPanel} />
      <Header transparent={transparentHeader} unreadCount={unreadCount} openNotificationPanel={openNotificationPanel} />
      <NotificationSidePanel open={isNotificationPanelOpen} onClose={closeNotificationPanel} />
      <Main transparent={transparentHeader}>
        {fullWidth ? children : <ContentContainer>{children}</ContentContainer>}
      </Main>
    </AppContainer>
  );
};

export default Layout; 