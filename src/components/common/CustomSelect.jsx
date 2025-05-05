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
    border-color: var(--primary);
    box-shadow: 0 2px 6px rgba(var(--primary-rgb), 0.1);
  }
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
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
  z-index: 1000;
  backdrop-filter: blur(10px);
  touch-action: auto;
  -webkit-overflow-scrolling: touch;
  filter: none;
  isolation: isolate; /* Create a new stacking context */
  transform-style: preserve-3d; /* Forces a new rendering context */
  
  /* Fixed portal position to ensure dropdown is rendered on top of other elements */
  position: fixed;
  transform-origin: top left;
  
  /* Custom scrollbar styling */
  &::-webkit-scrollbar {
    display: block;
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(var(--borderColor-rgb), 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(var(--primary-rgb), 0.3);
    border-radius: 3px;
    transition: background-color 0.3s ease;
    
    &:hover {
      background-color: rgba(var(--primary-rgb), 0.5);
    }
  }
  
  /* Firefox scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: rgba(var(--primary-rgb), 0.3) rgba(var(--borderColor-rgb), 0.05);
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
  const [dropdownStyle, setDropdownStyle] = useState({});
  
  const selectedOption = options.find(option => option.value === value);
  
  // Update dropdown position based on container position
  useEffect(() => {
    if (isOpen) {
      setDropdownStyle({
        position: 'absolute',
        top: `3.1rem`,
        maxHeight: '250px',
      });
    }
  }, [isOpen]);
  
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
            style={dropdownStyle}
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