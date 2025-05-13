import styled from 'styled-components';
import { Menu, User, Bell } from 'lucide-react';
import { Link } from 'react-router-dom';
import useUI from '../../hooks/useUI';
import useAuth from '../../hooks/useAuth';
import ThemeSwitcher from './ThemeSwitcher';
import { useEffect } from 'react';

const HeaderContainer = styled.header`
  display: none;
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-color: ${props => props.transparent ? 'transparent' : 'var(--cardBackground)'};
    border-bottom: ${props => props.transparent ? 'none' : '1px solid var(--borderColor)'};
    padding: 0 1rem;
    height: var(--header-height);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 1030;
    backdrop-filter: ${props => props.transparent ? 'none' : 'blur(10px)'};
    box-shadow: ${props => props.transparent ? 'none' : '0 2px 10px rgba(0,0,0,0.1)'};
    width: 100%;
    transition: all 0.3s ease;
  }
  
  @media (max-width: 480px) {
    padding: 0 0.75rem;
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  img {
    height: 28px;
    width: 28px;
    margin-right: 8px;
  }
  span {
    font-weight: 700;
    font-size: 1.2rem;
    background: var(--gradientPrimary);
    background-clip: text;
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
  
  @media (max-width: 480px) {
    span {
      font-size: 1.1rem;
    }
  }
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--textPrimary);
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  border-radius: 50%;
  &:hover {
    color: var(--primary);
    background-color: rgba(var(--primary-rgb), 0.1);
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }
  svg {
    stroke-width: 2px;
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem;
  }
`;

const UserIconLink = styled(Link)`
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem;
  border-radius: 50%;
  transition: all 0.3s ease;
  &:hover {
    color: var(--primary);
    background-color: rgba(var(--primary-rgb), 0.1);
    transform: translateY(-2px);
  }
  &:active {
    transform: translateY(0);
  }
  svg {
    stroke-width: 2px;
  }
  
  @media (max-width: 480px) {
    padding: 0.4rem;
  }
`;

const Header = ({ transparent = false, unreadCount = 0, openNotificationPanel }) => {
  const { toggleSidebar } = useUI();
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    console.log('[Header] Rendering with unreadCount:', unreadCount);
  }, [unreadCount]);

  return (
    <HeaderContainer transparent={transparent}>
      <LogoContainer>
        {/* <img src="/favicon.ico" alt="Anime-Share" /> */}
        <span>OtakuList</span>
      </LogoContainer>
      <NavActions>
        <ThemeSwitcher />
        {isAuthenticated && (
          <>
            <IconButton onClick={openNotificationPanel} aria-label="Notifications" style={{ position: 'relative' }}>
              <Bell size={22} />
              {unreadCount > 0 && (
                <div style={{
                  position: 'absolute',
                  top: 2,
                  right: 2,
                  background: 'rgba(var(--primary-rgb), 0.8)',
                  color: 'var(--textPrimary)',
                  borderRadius: '50%',
                  minWidth: 16,
                  height: 16,
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 4px',
                }}>{unreadCount}</div>
              )}
            </IconButton>
            <UserIconLink to={`/user/${user?.username || ''}`} aria-label="Profile">
              <User size={22} />
            </UserIconLink>
          </>
        )}
        <IconButton onClick={toggleSidebar} aria-label="Menu">
          <Menu size={22} />
        </IconButton>
      </NavActions>
    </HeaderContainer>
  );
};

export default Header;