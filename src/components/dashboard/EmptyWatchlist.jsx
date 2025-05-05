import React from 'react';
import styled from 'styled-components';
import { Eye, Plus } from 'lucide-react';

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
  background-color: var(--cardBackground);
  border-radius: 12px;
  border: 1px dashed var(--borderColor);
  margin: 2rem 0;
  
  p {
    margin: 0.5rem 0;
    color: var(--textSecondary);
  }
  
  svg {
    margin-bottom: 1rem;
    opacity: 0.7;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: var(--primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.75rem 1.5rem;
  margin-top: 1.25rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 6px rgba(var(--primary-rgb), 0.2);
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(var(--primary-rgb), 0.25);
  }
`;

const EmptyWatchlist = ({ onAddAnime }) => {
  return (
    <EmptyState>
      <Eye size={48} color="var(--textSecondary)" />
      <p>Your watchlist is empty for this status.</p>
      <p>Explore the schedule to find some anime to add.</p>
      <AddButton onClick={onAddAnime}>
        <Plus size={16} />
        Add Anime
      </AddButton>
    </EmptyState>
  );
};

export default EmptyWatchlist; 