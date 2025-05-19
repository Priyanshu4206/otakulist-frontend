import React from 'react';
import styled from 'styled-components';

const NavigationTabs = styled.div`
  display: flex;
  border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.2);
  margin-bottom: 2rem;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar { display: none; }
`;
const NavTab = styled.button`
  padding: 1rem 1.5rem;
  background: transparent;
  border: none;
  border-bottom: 3px solid ${props => props.active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary)' : 'var(--textSecondary)'};
  font-weight: ${props => props.active ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  &:hover { color: var(--primary); }
`;

const TABS = [
  { key: 'genres', label: 'GENRES' },
  { key: 'top-rated', label: 'TOP RATED' },
  { key: 'trending-playlists', label: 'TRENDING PLAYLISTS' },
  { key: 'season-preview', label: 'SEASON PREVIEW' },
  { key: 'for-you', label: 'FOR YOU' },
];

const ExploreTopNav = ({ activeTab, onTabChange }) => (
  <NavigationTabs>
    {TABS.map(tab => (
      <NavTab
        key={tab.key}
        active={activeTab === tab.key}
        onClick={() => onTabChange(tab.key)}
      >
        {tab.label}
      </NavTab>
    ))}
  </NavigationTabs>
);

export default ExploreTopNav; 