import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Globe } from 'lucide-react';
import { getUserTimezone, getTimezoneValue, saveUserTimezone } from '../../utils/simpleTimezoneUtils';

const TimezoneContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const TimezoneButton = styled.button`
  display: flex;
  align-items: center;
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  padding: 0.5rem 1rem;
  font-size: 0.9rem;
  cursor: pointer;
  gap: 0.5rem;
  
  &:hover {
    background-color: var(--backgroundLight);
  }
`;

const DropdownContainer = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  width: 250px;
  max-height: 300px;
  overflow-y: auto;
  background-color: var(--cardBackground);
  border: 1px solid var(--borderColor);
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 10;
  margin-top: 0.5rem;
  padding: 0.5rem 0;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const TimezoneGroup = styled.div`
  padding: 0 0.5rem;
`;

const TimezoneGroupTitle = styled.h4`
  font-size: 0.8rem;
  color: var(--textSecondary);
  padding: 0.5rem;
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TimezoneOption = styled.button`
  width: 100%;
  text-align: left;
  padding: 0.5rem 1rem;
  background-color: ${props => props.isSelected ? 'var(--primaryLight)' : 'transparent'};
  color: var(--textPrimary);
  border: none;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background-color: var(--backgroundLight);
  }
  
  span {
    color: var(--textSecondary);
    margin-left: 0.5rem;
    font-size: 0.8rem;
  }
`;

// Common timezones grouped by region
const TIMEZONE_GROUPS = {
  "Asia & Pacific": [
    { code: "JST", label: "Japan (UTC+9)", region: "Asia/Tokyo" },
    { code: "KST", label: "Korea (UTC+9)", region: "Asia/Seoul" },
    { code: "CST-CHINA", label: "China (UTC+8)", region: "Asia/Shanghai" },
    { code: "SGT", label: "Singapore (UTC+8)", region: "Asia/Singapore" },
    { code: "IST", label: "India (UTC+5:30)", region: "Asia/Kolkata" },
    { code: "AEST", label: "Australia Eastern (UTC+10)", region: "Australia/Sydney" },
    { code: "NZST", label: "New Zealand (UTC+12)", region: "Pacific/Auckland" }
  ],
  "Europe & Africa": [
    { code: "GMT", label: "GMT (UTC+0)", region: "Europe/London" },
    { code: "BST", label: "UK (UTC+1)", region: "Europe/London" },
    { code: "CEST", label: "Central Europe (UTC+2)", region: "Europe/Berlin" },
    { code: "MSK", label: "Moscow (UTC+3)", region: "Europe/Moscow" }
  ],
  "Americas": [
    { code: "EST", label: "Eastern (UTC-5)", region: "America/New_York" },
    { code: "CST", label: "Central (UTC-6)", region: "America/Chicago" },
    { code: "MST", label: "Mountain (UTC-7)", region: "America/Denver" },
    { code: "PST", label: "Pacific (UTC-8)", region: "America/Los_Angeles" }
  ]
};

// Export the timezone groups for potential use in other components
export const TIMEZONES = TIMEZONE_GROUPS;

const TimezoneSelect = ({ selectedTimezone, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userTimezone, setUserTimezone] = useState("");
  
  // Initialize user timezone detection on mount
  useEffect(() => {
    const storedTimezone = getUserTimezone();
    setUserTimezone(storedTimezone);
    
    // Initialize the selected timezone if not provided
    if (!selectedTimezone) {
      onChange(storedTimezone);
    }
  }, [selectedTimezone, onChange]);
  
  // Toggle dropdown
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };
  
  // Handle timezone selection
  const handleTimezoneSelect = (tzCode) => {
    // Save to localStorage directly in addition to calling onChange
    saveUserTimezone(tzCode);
    onChange(tzCode);
    setIsOpen(false);
    
    // Force a page reload to refresh schedule data if we're on the schedule page
    if (window.location.pathname.includes('/schedule')) {
      window.location.reload();
    }
  };
  
  // Find the selected timezone object
  const findSelectedTimezone = () => {
    for (const groupName in TIMEZONE_GROUPS) {
      const group = TIMEZONE_GROUPS[groupName];
      const found = group.find(tz => tz.code === selectedTimezone);
      if (found) return found;
    }
    return { code: selectedTimezone, label: selectedTimezone };
  };
  
  // Get the display name for the current timezone
  const selectedTz = findSelectedTimezone();
  
  return (
    <TimezoneContainer>
      <TimezoneButton onClick={toggleDropdown}>
        <Globe size={16} />
        {selectedTz.label || selectedTimezone}
      </TimezoneButton>
      
      <DropdownContainer isOpen={isOpen}>
        {Object.entries(TIMEZONE_GROUPS).map(([groupName, timezones]) => (
          <TimezoneGroup key={groupName}>
            <TimezoneGroupTitle>{groupName}</TimezoneGroupTitle>
            {timezones.map(tz => (
              <TimezoneOption 
                key={tz.code}
                isSelected={selectedTimezone === tz.code}
                onClick={() => handleTimezoneSelect(tz.code)}
              >
                {tz.label}
                {userTimezone === tz.code && <span>(Local)</span>}
              </TimezoneOption>
            ))}
          </TimezoneGroup>
        ))}
      </DropdownContainer>
    </TimezoneContainer>
  );
};

export default TimezoneSelect; 