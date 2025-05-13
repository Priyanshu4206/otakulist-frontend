import { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, Calendar, Search, User, LogOut, Settings, Tv, LogIn, Bell } from 'lucide-react';
import useUI from '../../hooks/useUI';
import useAuth from '../../hooks/useAuth';

const SidebarContainer = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  height: 100dvh;

  @supports not (height: 100dvh) {
    height: 100vh;
    padding-bottom: env(safe-area-inset-bottom, 20px);
  }

  background-color: var(--cardBackground);
  border-right: 1px solid var(--borderColor);
  transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  width: var(--sidebar-collapsed-width);
  z-index: 1050;
  overflow-x: hidden;
  overflow-y: auto;
  backdrop-filter: blur(10px);
  
  /* Hide scrollbar */
  &::-webkit-scrollbar {
    width: 0;
    background: transparent;
  }
  
  /* When nav items are hovered or sidebar is explicitly opened, expand the sidebar */
  ${props => 
    ((props.isNavHovered && !props.isMobileView) || props.isOpen) && `
    width: var(--sidebar-width);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  `}
  
  @media (max-width: 768px) {
    transform: translateX(${props => props.isOpen ? '0' : '-100%'});
    width: var(--sidebar-width);
    box-shadow: ${props => props.isOpen ? '0 0 20px rgba(0,0,0,0.2)' : 'none'};
  }
`;

const SidebarHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1.5rem 1rem;
  border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.5);
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  
  img {
    height: 32px;
    width: 32px;
    filter: drop-shadow(0 2px 5px rgba(0, 0, 0, 0.1));
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.1);
    }
  }
  
  span {
    margin-left: 12px;
    font-weight: 800;
    font-size: 1.5rem;
    display: ${props => (!props.isNavHovered && !props.isOpen) ? 'none' : 'block'};
    white-space: nowrap;
    background: var(--gradientPrimary);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    transition: opacity 0.3s ease;
  }
`;

const NavList = styled.div`
  list-style: none;
  padding: 1.5rem 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const NavItemContainer = styled.div`
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    width: 0;
    height: 2px;
    background: var(--gradientPrimary);
    transition: width 0.3s ease, left 0.3s ease;
    border-radius: 2px;
  }
  
  &:hover::after {
    width: 80%;
    left: 10%;
  }
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: -10px;
  right: -10px;
  background: rgba(var(--primary-rgb), 0.8);
  color: var(--textPrimary);
  border-radius: 50%;
  min-width: 20px;
  height: 20px;
  font-size: 0.7rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`;


const StyledNavLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: ${props => (!props.isNavHovered && !props.isOpen) ? '0.75rem 0' : '0.75rem 1.25rem'};
  justify-content: ${props => (!props.isNavHovered && !props.isOpen) ? 'center' : 'flex-start'};
  color: var(--textPrimary);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    
    &::before {
      transform: translateX(0);
    }
    
    svg {
      color: var(--primary);
      transform: scale(1.1);
    }
  }
  
  &.active {
    color: var(--primary);
    background: linear-gradient(
      to right,
      rgba(var(--primary-rgb), 0.08), 
      rgba(var(--secondary-rgb), 0.08)
    );
    font-weight: 600;
    box-shadow: 0 2px 10px rgba(var(--primary-rgb), 0.15);
    
    &::before {
      transform: translateX(0);
    }
    
    svg {
      color: var(--primary);
    }
  }
  
  svg {
    min-width: 22px;
    height: 22px;
    transition: all 0.3s ease;
    stroke-width: 2px;
  }
  
  span {
    margin-left: 15px;
    white-space: nowrap;
    display: ${props => (!props.isNavHovered && !props.isOpen) ? 'none' : 'block'};
    transition: opacity 0.3s ease;
    opacity: ${props => (!props.isNavHovered && !props.isOpen) ? 0 : 1};
  }
`;

const StyledButton = styled(StyledNavLink)`
  &.active {
    color: var(--textPrimary);
    background: none;
    font-weight: 600;
    box-shadow: none;
    
    &::before {
      transform: translateX(0);
    }
    
    svg {
      color: var(--textPrimary);
    }
  }
`;

const IconWrapper = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;


const LogoutLink = styled.a`
  display: flex;
  align-items: center;
  padding: ${props => (!props.isNavHovered && !props.isOpen) ? '0.75rem 0' : '0.75rem 1.25rem'};
  justify-content: ${props => (!props.isNavHovered && !props.isOpen) ? 'center' : 'flex-start'};
  color: var(--textPrimary);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, 
      rgba(var(--error-rgb), 0), 
      rgba(var(--error-rgb), 0.1)
    );
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  
  &:hover {
    color: var(--error);
    transform: translateY(-2px);
    
    &::before {
      transform: translateX(0);
    }
    
    svg {
      color: var(--error);
      transform: scale(1.1);
    }
  }
  
  svg {
    min-width: 22px;
    height: 22px;
    transition: all 0.3s ease;
    stroke-width: 2px;
  }
  
  span {
    margin-left: 15px;
    white-space: nowrap;
    display: ${props => (!props.isNavHovered && !props.isOpen) ? 'none' : 'block'};
    transition: opacity 0.3s ease;
    opacity: ${props => (!props.isNavHovered && !props.isOpen) ? 0 : 1};
  }
`;

const Footer = styled.div`
  position: absolute;
  bottom: 0;
  width: 100%;
  padding: ${props => (!props.isNavHovered && !props.isOpen) ? '1.5rem 0' : '1.5rem 0'};
  border-top: 1px solid rgba(var(--borderColor-rgb), 0.5);
  background-color: rgba(var(--cardBackground-rgb), 0.8);
  backdrop-filter: blur(5px);
`;

const FooterNav = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

// LoginLink styled component
const LoginLink = styled(NavLink)`
  display: flex;
  align-items: center;
  padding: ${props => (!props.isNavHovered && !props.isOpen) ? '0.75rem 0' : '0.75rem 1.25rem'};
  justify-content: ${props => (!props.isNavHovered && !props.isOpen) ? 'center' : 'flex-start'};
  color: var(--primary);
  transition: all 0.3s ease;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  font-weight: 600;
  background: rgba(var(--primary-rgb), 0.1);
  border: 1px solid rgba(var(--primary-rgb), 0.2);
  box-shadow: 0 4px 10px rgba(var(--primary-rgb), 0.1);
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(to right, 
      rgba(var(--primary-rgb), 0), 
      rgba(var(--primary-rgb), 0.1)
    );
    transform: translateX(-100%);
    transition: transform 0.5s ease;
  }
  
  &:hover {
    transform: translateY(-2px);
    background: rgba(var(--primary-rgb), 0.15);
    box-shadow: 0 6px 15px rgba(var(--primary-rgb), 0.2);
    
    &::before {
      transform: translateX(0);
    }
    
    svg {
      color: var(--primary);
      transform: scale(1.1);
    }
  }
  
  svg {
    min-width: 22px;
    height: 22px;
    transition: all 0.3s ease;
    stroke-width: 2px;
  }
  
  span {
    margin-left: 15px;
    white-space: nowrap;
    display: ${props => (!props.isNavHovered && !props.isOpen) ? 'none' : 'block'};
    transition: opacity 0.3s ease;
    opacity: ${props => (!props.isNavHovered && !props.isOpen) ? 0 : 1};
  }
`;

const SidebarOverlay = styled.div`
  display: ${({ show }) => (show ? 'block' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100dvh;
  background: rgba(0,0,0,0.4);
  z-index: 1040;
  backdrop-filter: blur(2px);
  transition: opacity 0.3s ease;
  opacity: ${({ show }) => (show ? 1 : 0)};
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const Sidebar = ({ unreadCount = 0, openNotificationPanel }) => {
  const { 
    isSidebarOpen, 
    isMobileView, 
    closeSidebar, 
    isNavHovered, 
    handleNavMouseEnter, 
    handleNavMouseLeave 
  } = useUI();
  const { isAuthenticated, logout, user } = useAuth();
  const location = useLocation();
  const sidebarRef = useRef();
  
  // Close sidebar on route change (mobile only)
  useEffect(() => {
    if (isMobileView && isSidebarOpen) {
      closeSidebar();
    }
    // eslint-disable-next-line
  }, [location.pathname]);

  // Click outside to close (mobile only)
  useEffect(() => {
    if (!isMobileView) return;
    
    function handleClick(e) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        closeSidebar();
      }
    }
    
    if (isSidebarOpen) {
      document.addEventListener('mousedown', handleClick);
      document.addEventListener('touchstart', handleClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [isSidebarOpen, isMobileView, closeSidebar]);
  
  // Close sidebar on mobile when clicking a link
  const handleNavClick = () => {
    if (isMobileView) {
      closeSidebar();
    }
  };

  // Add this useEffect for debugging
  useEffect(() => {
    console.log('[Sidebar] Rendering with unreadCount:', unreadCount);
  }, [unreadCount]);

  return (
    <>
      {/* Overlay for mobile click-outside */}
      <SidebarOverlay show={isSidebarOpen && isMobileView} onClick={closeSidebar} />
      <SidebarContainer 
        ref={sidebarRef}
        isOpen={isSidebarOpen} 
        isNavHovered={isNavHovered}
        isMobileView={isMobileView}
      >
        <SidebarHeader isOpen={isSidebarOpen} isNavHovered={isNavHovered}>
          <LogoContainer isOpen={isSidebarOpen} isNavHovered={isNavHovered}>
            <Tv size={32} color="var(--primary)" />
            <span>OtakuList</span>
          </LogoContainer>
        </SidebarHeader>
        
        <NavList onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave}>
          <NavItemContainer>
            <StyledNavLink 
              to="/" 
              onClick={handleNavClick}
              isOpen={isSidebarOpen} 
              isNavHovered={isNavHovered}
            >
              <Home size={22} />
              <span>Home</span>
            </StyledNavLink>
          </NavItemContainer>
          
          <NavItemContainer>
            <StyledNavLink 
              to="/schedule" 
              onClick={handleNavClick}
              isOpen={isSidebarOpen} 
              isNavHovered={isNavHovered}
            >
              <Calendar size={22} />
              <span>Schedule</span>
            </StyledNavLink>
          </NavItemContainer>
          
          <NavItemContainer>
            <StyledNavLink 
              to="/search" 
              onClick={handleNavClick}
              isOpen={isSidebarOpen} 
              isNavHovered={isNavHovered}
            >
              <Search size={22} />
              <span>Search</span>
            </StyledNavLink>
          </NavItemContainer>

          {isAuthenticated && (
            <NavItemContainer style={{ position: 'relative' }}>
              <StyledButton
                type="button"
                onClick={openNotificationPanel}
                isOpen={isSidebarOpen} 
                isNavHovered={isNavHovered}
              >
                <IconWrapper>
                  <Bell size={22} />
                  {unreadCount > 0 && <NotificationBadge>{unreadCount}</NotificationBadge>}
                </IconWrapper>
                <span>Notifications</span>
              </StyledButton>
            </NavItemContainer>
          )}

          {isAuthenticated && (
            <NavItemContainer>
              <StyledNavLink 
                to={`/user/${user ? user.username : ''}`} 
                onClick={handleNavClick}
                isOpen={isSidebarOpen} 
                isNavHovered={isNavHovered}
              >
                <User size={22} />
                <span>Profile</span>
              </StyledNavLink>
            </NavItemContainer>
          )}
        </NavList>
        
        {/* Footer with conditionally rendered content based on authentication status */}
        <Footer isOpen={isSidebarOpen} isNavHovered={isNavHovered}>
          <FooterNav onMouseEnter={handleNavMouseEnter} onMouseLeave={handleNavMouseLeave}>
            {isAuthenticated ? (
              <>
                <NavItemContainer>
                  <StyledNavLink 
                    to="/dashboard" 
                    onClick={handleNavClick}
                    isOpen={isSidebarOpen} 
                    isNavHovered={isNavHovered}
                  >
                    <Settings size={22} />
                    <span>Dashboard</span>
                  </StyledNavLink>
                </NavItemContainer>
                
                <NavItemContainer>
                  <LogoutLink 
                    href="#" 
                    onClick={(e) => { e.preventDefault(); logout(); handleNavClick(); }}
                    isOpen={isSidebarOpen} 
                    isNavHovered={isNavHovered}
                  >
                    <LogOut size={22} />
                    <span>Logout</span>
                  </LogoutLink>
                </NavItemContainer>
              </>
            ) : (
              <NavItemContainer>
                <LoginLink
                  to="/login"
                  onClick={handleNavClick}
                  isOpen={isSidebarOpen}
                  isNavHovered={isNavHovered}
                >
                  <LogIn size={22} />
                  <span>Login</span>
                </LoginLink>
              </NavItemContainer>
            )}
          </FooterNav>
        </Footer>
      </SidebarContainer>
    </>
  );
};

export default Sidebar; 