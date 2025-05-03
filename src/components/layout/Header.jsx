import styled from 'styled-components';
import { Menu, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import useUI from '../../hooks/useUI';
import useAuth from '../../hooks/useAuth';
import ThemeSwitcher from './ThemeSwitcher';

const HeaderContainer = styled.header`
  display: none;
  background-color: ${props => props.transparent ? 'transparent' : 'var(--cardBackground)'};
  border-bottom: ${props => props.transparent ? 'none' : '1px solid var(--borderColor)'};
  padding: 0 1rem;
  height: var(--header-height);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: ${props => props.transparent ? 'none' : 'blur(10px)'};
  box-shadow: ${props => props.transparent ? 'none' : '0 2px 10px rgba(0,0,0,0.1)'};
  
  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
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
`;

const NavActions = styled.div`
  display: flex;
  align-items: center;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--textPrimary);
  margin-left: 1rem;
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
`;

const UserIconLink = styled(Link)`
  margin-left: 1rem;
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
`;

const Header = ({ transparent = false }) => {
  const { toggleSidebar } = useUI();
  const { isAuthenticated, user } = useAuth();
  
  return (
    <HeaderContainer transparent={transparent}>
      <LogoContainer>
        {/* <img src="/favicon.ico" alt="Anime-Share" /> */}
        <span>OtakuList</span>
      </LogoContainer>
      
      <NavActions>
        <ThemeSwitcher />
        
        {isAuthenticated && (
          <UserIconLink to={`/user/${user.username}`} aria-label="Profile">
            <User size={22} />
          </UserIconLink>
        )}
        
        <IconButton onClick={toggleSidebar} aria-label="Menu">
          <Menu size={22} />
        </IconButton>
      </NavActions>
    </HeaderContainer>
  );
};

export default Header; 