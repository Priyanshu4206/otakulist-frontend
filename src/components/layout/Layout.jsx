import styled from 'styled-components';
import { useEffect } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import useUI from '../../hooks/useUI';

const Main = styled.main`
  flex: 1;
  margin-left: var(--sidebar-collapsed-width);
  transition: margin-left 0.3s ease;
  min-height: 100vh;
  background: ${props => props.transparent ? 'transparent' : 'var(--background)'};
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding-top: var(--header-height);
  }
`;

const Layout = ({ children, transparentHeader = false }) => {
  const { isMobileView, isSidebarOpen } = useUI();
  
  // Prevent body scroll when mobile sidebar is open
  useEffect(() => {
    if (isMobileView && isSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileView, isSidebarOpen]);
  
  return (
    <div className="app-container" style={{ background: transparentHeader ? 'transparent' : 'var(--background)' }}>
      <Sidebar />
      <Header transparent={transparentHeader} />
      <Main transparent={transparentHeader}>
        {children}
      </Main>
    </div>
  );
};

export default Layout; 