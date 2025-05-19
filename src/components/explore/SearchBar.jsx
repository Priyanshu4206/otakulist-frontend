import React, { useCallback } from 'react';
import styled from 'styled-components';
import { Search, X } from 'lucide-react';
import { useDebounce } from '../../hooks';

const SearchContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: ${props => props.fullWidth ? '100%' : '500px'};
  margin: ${props => props.centered ? '0 auto' : '0'};
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem 3rem;
  border-radius: 12px;
  border: 1.5px solid rgba(var(--borderColor-rgb), 0.2);
  background-color: rgba(var(--cardBackground-rgb), 0.8);
  color: var(--textPrimary);
  font-size: 1rem;
  transition: all 0.3s ease;
  box-shadow: ${props => props.elevated ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none'};
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 4px 15px rgba(var(--primary-rgb), 0.2);
  }
  
  &::placeholder {
    color: var(--textSecondary);
    opacity: 0.7;
  }
`;

const IconWrapper = styled.div`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  color: ${props => props.active ? 'var(--primary)' : 'var(--textSecondary)'};
  display: flex;
  align-items: center;
  justify-content: center;
  
  ${props => props.position === 'left' && `
    left: 1rem;
  `}
  
  ${props => props.position === 'right' && `
    right: 1rem;
  `}
`;

const ClearButton = styled.button`
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(var(--danger-rgb), 0.1);
  border: none;
  color: var(--danger);
  cursor: pointer;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(var(--danger-rgb), 0.2);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

/**
 * Reusable search bar component with debounce functionality
 * 
 * @param {Object} props - Component props
 * @param {string} props.value - Current search value
 * @param {Function} props.onChange - Change handler function
 * @param {Function} props.onSubmit - Submit handler function (optional)
 * @param {Function} props.onClear - Clear handler function (optional)
 * @param {string} props.placeholder - Placeholder text
 * @param {boolean} props.fullWidth - Whether the search bar should take full width
 * @param {boolean} props.elevated - Whether to add elevation shadow
 * @param {boolean} props.centered - Whether to center the search bar
 * @param {boolean} props.autoFocus - Whether to autofocus the input
 * @param {string} props.ariaLabel - Aria label for accessibility
 * @param {Object} props.iconProps - Props for the search icon
 * @returns {JSX.Element} Search bar component
 */
const SearchBar = ({
  value = '',
  onChange,
  onSubmit,
  onClear,
  placeholder = 'Search...',
  fullWidth = false,
  elevated = false,
  centered = false,
  autoFocus = false,
  ariaLabel = 'Search input',
  iconProps = { size: 20 }
}) => {
  
  // Handle input change
  const handleChange = useCallback((e) => {
    if (onChange) {
      onChange(e.target.value);
    }
  }, [onChange]);
  
  // Handle input clear
  const handleClear = useCallback(() => {
    if (onChange) {
      onChange('');
    }
    
    if (onClear) {
      onClear();
    }
  }, [onChange, onClear]);
  
  // Handle form submit
  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    
    if (onSubmit) {
      onSubmit(value);
    }
  }, [onSubmit, value]);
  
  return (
    <SearchContainer 
      fullWidth={fullWidth} 
      centered={centered}
      as="form"
      onSubmit={handleSubmit}
    >
      <IconWrapper position="left" active={value.length > 0}>
        <Search {...iconProps} />
      </IconWrapper>
      
      <Input
        type="search"
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        elevated={elevated}
        autoFocus={autoFocus}
        aria-label={ariaLabel}
      />
      
      {value.length > 0 && (
        <ClearButton 
          type="button"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={16} />
        </ClearButton>
      )}
    </SearchContainer>
  );
};

export default SearchBar; 