import { useState, useEffect, useRef, useMemo } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check, X, Search } from 'lucide-react';

const SelectContainer = styled.div`
  position: relative;
  width: 100%;
  min-width: ${props => props.minWidth || '180px'};
  user-select: none;
`;

const SelectTrigger = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.7rem 1rem;
  background: ${props => props.variant === 'filled' 
    ? 'rgba(var(--cardBackground-rgb), 0.8)' 
    : 'transparent'};
  border: 1px solid rgba(var(--borderColor-rgb), 0.3);
  border-radius: 8px;
  color: var(--textPrimary);
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    border-color: var(--primary);
    box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.1);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
  }
`;

const SelectDisplay = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  overflow: hidden;
  max-height: 80px;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 4px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(var(--primary-rgb), 0.3);
    border-radius: 2px;
  }
`;

const Tag = styled.div`
  display: flex;
  align-items: center;
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  font-size: 0.85rem;
  gap: 0.3rem;
`;

const TagRemove = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  color: var(--primary);
  cursor: pointer;
  padding: 0;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    color: var(--danger);
  }
  
  &:active {
    transform: scale(0.9);
  }
`;

const SelectedCount = styled.span`
  background: rgba(var(--primary-rgb), 0.2);
  color: var(--primary);
  font-size: 0.8rem;
  font-weight: 500;
  padding: 0.1rem 0.4rem;
  border-radius: 10px;
  margin-left: 0.5rem;
`;

const Placeholder = styled.span`
  color: var(--textSecondary);
`;

const ChevronIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  color: var(--textSecondary);
  min-width: 18px;
  margin-left: 8px;
`;

const DropdownMenu = styled(motion.div)`
  position: absolute;
  top: calc(100% + 5px);
  left: 0;
  width: 100%;
  max-height: 250px;
  overflow-y: auto;
  background: rgba(var(--cardBackground-rgb), 0.95);
  border: 1px solid rgba(var(--borderColor-rgb), 0.2);
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  z-index: 100;
  backdrop-filter: blur(10px);
  touch-action: auto;
  -webkit-overflow-scrolling: touch; /* Smooth scrolling on iOS devices */
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(var(--primary-rgb), 0.3);
    border-radius: 3px;
  }
`;

const SearchContainer = styled.div`
  padding: 0.5rem;
  position: sticky;
  top: 0;
  background: rgba(var(--cardBackground-rgb), 0.95);
  border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.1);
  z-index: 1;
`;

const SearchInput = styled.div`
  display: flex;
  align-items: center;
  background: rgba(var(--bgSecondary-rgb), 0.8);
  border: 1px solid rgba(var(--borderColor-rgb), 0.2);
  border-radius: 4px;
  padding: 0.4rem 0.7rem;
  
  svg {
    color: var(--textSecondary);
    margin-right: 0.5rem;
  }
  
  input {
    background: transparent;
    border: none;
    color: var(--textPrimary);
    font-size: 0.9rem;
    width: 100%;
    outline: none;
    
    &::placeholder {
      color: var(--textSecondary);
    }
  }
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  color: ${props => props.selected ? 'var(--primary)' : 'var(--textPrimary)'};
  background: ${props => props.selected ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    background: rgba(var(--primary-rgb), 0.05);
    color: var(--primary);
  }
  
  &:active {
    background: rgba(var(--primary-rgb), 0.15);
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.1);
  }
`;

const OptionText = styled.span`
  font-size: 0.95rem;
`;

const CheckIcon = styled.div`
  display: flex;
  align-items: center;
  color: var(--primary);
`;

const EmptyState = styled.div`
  padding: 1rem;
  text-align: center;
  color: var(--textSecondary);
  font-size: 0.9rem;
`;

const SelectActions = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 0.5rem 1rem;
  background: rgba(var(--bgSecondary-rgb), 0.5);
  border-top: 1px solid rgba(var(--borderColor-rgb), 0.1);
  position: sticky;
  bottom: 0;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-size: 0.85rem;
  cursor: pointer;
  padding: 0.3rem 0.5rem;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(var(--primary-rgb), 0.1);
  }
  
  &:disabled {
    color: var(--textSecondary);
    cursor: not-allowed;
    opacity: 0.5;
  }
`;

const dropdownVariants = {
  hidden: { 
    opacity: 0,
    y: -5,
    transition: {
      duration: 0.2
    }
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.2
    }
  }
};

const MultiSelect = ({ 
  options, 
  value = [], 
  onChange, 
  placeholder = "Select options",
  variant = "filled",
  minWidth,
  className,
  maxVisibleTags = 3,
  maxSelections = null,
  searchable = true,
  enableSelectAll = true
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const containerRef = useRef(null);
  const searchInputRef = useRef(null);
  
  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen, searchable]);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    
    // Clear search when closing
    if (isOpen) {
      setSearchTerm('');
    }
  };
  
  const handleOptionClick = (option) => {
    let newValue;
    
    // Check if maximum selections reached
    if (!value.includes(option.value) && maxSelections && value.length >= maxSelections) {
      // Don't add if max reached
      return;
    }
    
    if (value.includes(option.value)) {
      newValue = value.filter(v => v !== option.value);
    } else {
      newValue = [...value, option.value];
    }
    
    onChange(newValue);
  };
  
  const handleTagRemove = (e, optionValue) => {
    e.stopPropagation();
    const newValue = value.filter(v => v !== optionValue);
    onChange(newValue);
  };
  
  const handleSelectAll = () => {
    // Only select from filtered options if searching
    const optionsToSelect = filteredOptions.map(option => option.value);
    const allSelected = optionsToSelect.every(optValue => value.includes(optValue));
    
    if (allSelected) {
      // If all are selected, deselect all filtered options
      const newValue = value.filter(v => !optionsToSelect.includes(v));
      onChange(newValue);
    } else {
      // If not all selected, select all filtered options
      // Respect maxSelections if set
      if (maxSelections) {
        // How many more can we select?
        const remainingSlots = maxSelections - value.length;
        if (remainingSlots <= 0) return;
        
        // Only select up to the maximum allowed
        const valuesToAdd = optionsToSelect
          .filter(v => !value.includes(v))
          .slice(0, remainingSlots);
          
        onChange([...value, ...valuesToAdd]);
      } else {
        // No maximum, select all filtered options
        const newValue = Array.from(new Set([...value, ...optionsToSelect]));
        onChange(newValue);
      }
    }
  };
  
  const handleClearAll = () => {
    onChange([]);
    setIsOpen(false);
  };
  
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };
  
  // Filter options based on search term
  const filteredOptions = useMemo(() => {
    if (!searchTerm.trim()) return options;
    
    return options.filter(option => 
      option.label.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [options, searchTerm]);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };
    
    // Handle both mouse and touch events
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchend', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, []);
  
  // Get selected options with their labels
  const selectedLabels = useMemo(() => {
    return options
      .filter(option => value.includes(option.value))
      .map(option => option);
  }, [options, value]);
  
  // For select all button state
  const allFilteredSelected = useMemo(() => {
    if (filteredOptions.length === 0) return false;
    return filteredOptions.every(option => value.includes(option.value));
  }, [filteredOptions, value]);
  
  // Format display tags
  const displayTags = useMemo(() => {
    if (selectedLabels.length <= maxVisibleTags) {
      return selectedLabels;
    }
    
    return selectedLabels.slice(0, maxVisibleTags);
  }, [selectedLabels, maxVisibleTags]);
  
  return (
    <SelectContainer ref={containerRef} minWidth={minWidth} className={className}>
      <SelectTrigger 
        onClick={toggleDropdown} 
        variant={variant}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <SelectDisplay>
          {selectedLabels.length > 0 ? (
            <>
              {displayTags.map(option => (
                <Tag key={option.value}>
                  {option.label}
                  <TagRemove 
                    onClick={(e) => handleTagRemove(e, option.value)}
                    onTouchEnd={(e) => {
                      e.stopPropagation();
                      handleTagRemove(e, option.value);
                    }}
                    aria-label={`Remove ${option.label}`}
                  >
                    <X size={14} />
                  </TagRemove>
                </Tag>
              ))}
              {selectedLabels.length > maxVisibleTags && (
                <SelectedCount>+{selectedLabels.length - maxVisibleTags}</SelectedCount>
              )}
            </>
          ) : (
            <Placeholder>{placeholder}</Placeholder>
          )}
        </SelectDisplay>
        <ChevronIcon
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={18} />
        </ChevronIcon>
      </SelectTrigger>
      
      <AnimatePresence>
        {isOpen && (
          <DropdownMenu
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={dropdownVariants}
            role="listbox"
            aria-multiselectable="true"
          >
            {searchable && (
              <SearchContainer>
                <SearchInput>
                  <Search size={16} />
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    onClick={(e) => e.stopPropagation()}
                  />
                </SearchInput>
              </SearchContainer>
            )}
            
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <OptionItem
                  key={option.value}
                  selected={value.includes(option.value)}
                  onClick={() => handleOptionClick(option)}
                  onTouchEnd={(e) => {
                    e.preventDefault(); // Prevent double firing on touch devices
                    handleOptionClick(option);
                  }}
                  role="option"
                  aria-selected={value.includes(option.value)}
                >
                  <OptionText>{option.label}</OptionText>
                  {value.includes(option.value) && (
                    <CheckIcon>
                      <Check size={16} />
                    </CheckIcon>
                  )}
                </OptionItem>
              ))
            ) : (
              <EmptyState>
                {searchTerm ? 'No matches found' : 'No options available'}
              </EmptyState>
            )}
            
            {(enableSelectAll || selectedLabels.length > 0) && filteredOptions.length > 0 && (
              <SelectActions>
                {enableSelectAll && (
                  <ActionButton 
                    onClick={handleSelectAll}
                    disabled={maxSelections && value.length >= maxSelections && !allFilteredSelected}
                  >
                    {allFilteredSelected ? 'Deselect All' : 'Select All'}
                  </ActionButton>
                )}
                
                {selectedLabels.length > 0 && (
                  <ActionButton onClick={handleClearAll}>
                    Clear All
                  </ActionButton>
                )}
              </SelectActions>
            )}
          </DropdownMenu>
        )}
      </AnimatePresence>
    </SelectContainer>
  );
};

export default MultiSelect; 