import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';

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
    border-color: var(--tertiary);
    box-shadow: 0 2px 6px rgba(var(--tertiary-rgb), 0.1);
  }
  
  &:focus {
    outline: none;
    border-color: var(--tertiary);
    box-shadow: 0 0 0 2px rgba(var(--tertiary-rgb), 0.1);
  }
`;

const ChevronIcon = styled(motion.div)`
  display: flex;
  align-items: center;
  color: var(--textSecondary);
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
    background-color: rgba(var(--tertiary-rgb), 0.3);
    border-radius: 3px;
  }
`;

const OptionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 1rem;
  color: ${props => props.selected ? 'var(--tertiary)' : 'var(--textPrimary)'};
  background: ${props => props.selected ? 'rgba(var(--tertiary-rgb), 0.1)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  
  &:hover {
    background: rgba(var(--tertiary-rgb), 0.05);
    color: var(--tertiary);
  }
  
  &:active {
    background: rgba(var(--tertiary-rgb), 0.15);
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
  color: var(--tertiary);
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

const CustomSelect = ({ 
  options, 
  value, 
  onChange, 
  placeholder = "Select an option",
  variant = "filled",
  minWidth,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);
  
  const selectedOption = options.find(option => option.value === value);
  
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  const handleOptionClick = (option) => {
    onChange(option.value);
    setIsOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
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
  
  return (
    <SelectContainer ref={containerRef} minWidth={minWidth} className={className}>
      <SelectTrigger 
        onClick={toggleDropdown} 
        variant={variant}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {selectedOption ? selectedOption.label : placeholder}
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
          >
            {options.map((option) => (
              <OptionItem
                key={option.value}
                selected={option.value === value}
                onClick={() => handleOptionClick(option)}
                onTouchEnd={(e) => {
                  e.preventDefault(); // Prevent double firing on touch devices
                  handleOptionClick(option);
                }}
                role="option"
                aria-selected={option.value === value}
              >
                <OptionText>{option.label}</OptionText>
                {option.value === value && (
                  <CheckIcon>
                    <Check size={16} />
                  </CheckIcon>
                )}
              </OptionItem>
            ))}
          </DropdownMenu>
        )}
      </AnimatePresence>
    </SelectContainer>
  );
};

export default CustomSelect; 