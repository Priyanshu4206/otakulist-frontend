import React from 'react';
import styled from 'styled-components';

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid var(--borderColor);
  margin-bottom: 1.5rem;
  overflow-x: auto;
  scrollbar-width: none;
  gap: 0.5rem;
  padding-bottom: 0.25rem;
  
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  padding: 0.75rem 1.25rem;
  background: none;
  border: none;
  border-radius: 6px 6px 0 0;
  border-bottom: 3px solid ${props => props.active ? 'var(--primary)' : 'transparent'};
  color: ${props => props.active ? 'var(--primary)' : 'var(--textSecondary)'};
  font-weight: ${props => props.active ? '600' : '400'};
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  overflow: hidden;
  
  &:hover {
    color: var(--primary);
    background-color: rgba(var(--primary-rgb), 0.05);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 3px;
    background-color: ${props => props.active ? 'transparent' : 'var(--primary)'};
    transition: width 0.3s ease;
  }
  
  &:hover::after {
    width: ${props => props.active ? '0' : '100%'};
  }
`;

const TabCount = styled.span`
  background-color: ${props => props.active ? 'var(--primary)' : 'var(--backgroundLight)'};
  color: ${props => props.active ? 'white' : 'var(--textSecondary)'};
  font-size: 0.7rem;
  border-radius: 999px;
  padding: 0.15rem 0.5rem;
  min-width: 1.5rem;
  text-align: center;
  font-weight: 500;
  box-shadow: ${props => props.active ? '0 2px 4px rgba(var(--primary-rgb), 0.2)' : 'none'};
  transition: all 0.2s ease;
  
  ${Tab}:hover & {
    background-color: ${props => props.active ? 'var(--primary)' : 'rgba(var(--primary-rgb), 0.1)'};
  }
`;

const STATUSES = [
  { id: 'watching', label: 'Watching' },
  { id: 'completed', label: 'Completed' },
  { id: 'on_hold', label: 'On Hold' },
  { id: 'dropped', label: 'Dropped' },
  { id: 'plan_to_watch', label: 'Plan to Watch' },
];

const WatchlistTabs = ({ activeTab, counts, onTabChange }) => {
  return (
    <TabsContainer>
      <Tab 
        active={activeTab === 'all'} 
        onClick={() => onTabChange('all')}
      >
        All
        <TabCount active={activeTab === 'all'}>
          {counts.all || 0}
        </TabCount>
      </Tab>
      
      {STATUSES.map(status => (
        <Tab 
          key={status.id}
          active={activeTab === status.id} 
          onClick={() => onTabChange(status.id)}
        >
          {status.label}
          <TabCount active={activeTab === status.id}>
            {counts[status.id] || 0}
          </TabCount>
        </Tab>
      ))}
    </TabsContainer>
  );
};

export { STATUSES };
export default WatchlistTabs; 