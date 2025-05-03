import { useState, useRef, useEffect, useContext } from 'react';
import styled, { keyframes } from 'styled-components';
import { Sun, Moon, Palette, ChevronDown } from 'lucide-react';
import ThemeContext from '../../contexts/ThemeContext';

const popIn = keyframes`
  0% {
    transform: translateY(10px);
    opacity: 0;
  }
  100% {
    transform: translateY(0);
    opacity: 1;
  }
`;

const Container = styled.div`
  position: relative;
  margin-left: 1rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--textPrimary);
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: all 0.3s ease;
  position: relative;
  
  &:hover {
    background-color: rgba(var(--primary-rgb), 0.1);
    color: var(--primary);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  svg {
    stroke-width: 2px;
  }
`;

const ThemeIcon = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    stroke-width: 2px;
  }
  
  .arrow {
    margin-left: 0.25rem;
    transition: transform 0.3s ease;
    opacity: 0.8;
  }
  
  ${({ $isOpen }) => $isOpen && `
    .arrow {
      transform: rotate(180deg);
    }
  `}
`;

const ThemeMenu = styled.div`
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  background: var(--cardBackground);
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  width: 240px;
  z-index: 200;
  padding: 1rem;
  border: 1px solid rgba(var(--borderColor-rgb), 0.2);
  animation: ${popIn} 0.3s ease forwards;
  backdrop-filter: blur(10px);
  
  &::before {
    content: '';
    position: absolute;
    top: -6px;
    right: 16px;
    width: 12px;
    height: 12px;
    background: var(--cardBackground);
    border-top: 1px solid rgba(var(--borderColor-rgb), 0.2);
    border-left: 1px solid rgba(var(--borderColor-rgb), 0.2);
    transform: rotate(45deg);
  }
`;

const ThemeTitle = styled.h4`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: var(--textPrimary);
  font-weight: 600;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: var(--secondary);
  }
`;

const ThemeOptions = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.8rem;
`;

const ThemeOption = styled.button`
  background: ${props => props.$isActive 
    ? 'linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--secondary-rgb), 0.1))'
    : 'transparent'};
  border: 1px solid rgba(var(--borderColor-rgb), 0.2);
  border-radius: 10px;
  padding: 0.8rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
    border-color: rgba(var(--primary-rgb), 0.3);
  }
  
  ${props => props.$isActive && `
    border-color: var(--primary);
    
    &::after {
      content: '';
      position: absolute;
      top: 8px;
      right: 8px;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--primary);
    }
  `}
`;

const ThemePreview = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-bottom: 0.5rem;
  background: ${props => props.$gradient || props.$color};
  background-size: cover;
  border: 2px solid ${props => 
    props.$isActive ? 'var(--primary)' : 'rgba(var(--borderColor-rgb), 0.3)'};
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  
  ${ThemeOption}:hover & {
    transform: scale(1.1);
  }
`;

const ThemeName = styled.span`
  font-size: 0.75rem;
  color: var(--textPrimary);
  text-align: center;
`;

// Main themes to display in the dropdown - limiting to a reasonable number
const MAIN_THEMES = [
  'naruto-dark', 
  'default', 
  'dark', 
  'light', 
  'one-piece', 
  'attack-on-titan',
  'demon-slayer',
  'jujutsu-kaisen'
];

const ThemeSwitcher = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { currentTheme, availableThemes, changeTheme } = useContext(ThemeContext);
  const menuRef = useRef(null);
  
  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };
  
  const handleThemeChange = (themeKey) => {
    changeTheme(themeKey);
    setIsOpen(false);
  };
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);
  
  // Get current theme icon
  const getCurrentThemeIcon = () => {
    const theme = currentTheme.toLowerCase();
    if (theme === 'light' || theme === 'one-piece') return <Sun size={20} />;
    return <Moon size={20} />;
  };
  
  // Get filtered theme entries to display
  const getThemesToDisplay = () => {
    // Filter to only show main themes in the dropdown
    return Object.entries(availableThemes)
      .filter(([key]) => MAIN_THEMES.includes(key));
  };
  
  return (
    <Container ref={menuRef}>
      <IconButton onClick={toggleMenu} aria-label="Change theme">
        <ThemeIcon $isOpen={isOpen}>
          {getCurrentThemeIcon()}
          <ChevronDown size={14} className="arrow" />
        </ThemeIcon>
      </IconButton>
      
      {isOpen && (
        <ThemeMenu>
          <ThemeTitle>
            <Palette size={18} />
            Choose Theme
          </ThemeTitle>
          
          <ThemeOptions>
            {getThemesToDisplay().map(([key, theme]) => (
              <ThemeOption 
                key={key}
                onClick={() => handleThemeChange(key)} 
                $isActive={currentTheme === key}
              >
                <ThemePreview 
                  $color={theme.background}
                  $gradient={theme.gradientPrimary}
                  $isActive={currentTheme === key}
                />
                <ThemeName>{theme.name}</ThemeName>
              </ThemeOption>
            ))}
          </ThemeOptions>
        </ThemeMenu>
      )}
    </Container>
  );
};

export default ThemeSwitcher; 