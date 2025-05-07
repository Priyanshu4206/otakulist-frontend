import React from 'react';
import styled from 'styled-components';
import { Palette } from 'lucide-react';

const BadgeContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--cardBackground);
  border: 1px solid var(--borderColor);
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin-bottom: 1rem;
  width: fit-content;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--primary);
`;

const ThemeText = styled.span`
  font-weight: 500;
`;

const UserName = styled.span`
  color: var(--primary);
  font-weight: 600;
`;

/**
 * A badge component that shows which theme is currently being viewed
 * 
 * @param {Object} props Component props
 * @param {string} props.themeName Name of the theme to display
 * @param {string} props.userName Name of the user whose theme is displayed
 */
const ThemeBadge = ({ themeName, userName }) => {
  if (!themeName) return null;
  
  return (
    <BadgeContainer>
      <IconWrapper>
        <Palette size={16} />
      </IconWrapper>
      <div>
        Viewing <UserName>{userName}'s</UserName> theme: <ThemeText>{themeName}</ThemeText>
      </div>
    </BadgeContainer>
  );
};

export default ThemeBadge; 