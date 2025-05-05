import React from 'react';
import styled from 'styled-components';
import { ArrowUp, ArrowDown } from 'lucide-react';
import CustomSelect from '../common/CustomSelect';

const SortControlsWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const SortButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--borderColor);
  background-color: var(--inputBackground);
  color: var(--textPrimary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--primary);
    color: var(--primary);
    background-color: rgba(var(--primary-rgb), 0.05);
    transform: translateY(-2px);
  }
`;

const SORT_OPTIONS = [
  { value: 'title', label: 'Title' },
  { value: 'rating', label: 'Rating' },
  { value: 'date_added', label: 'Date Added' },
  { value: 'last_updated', label: 'Last Updated' }
];

const SortingControls = ({ sortBy, sortOrder, onSortChange, onSortOrderToggle }) => {
  return (
    <SortControlsWrapper>
      <CustomSelect
        options={SORT_OPTIONS}
        value={sortBy}
        onChange={onSortChange}
        minWidth="160px"
        placeholder="Sort by"
      />
      
      <SortButton onClick={onSortOrderToggle} title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}>
        {sortOrder === 'asc' ? <ArrowUp size={16} /> : <ArrowDown size={16} />}
      </SortButton>
    </SortControlsWrapper>
  );
};

export default SortingControls; 