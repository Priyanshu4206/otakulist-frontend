import { useState, useEffect, useContext } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Clock, Search, X } from 'lucide-react';
import useSimpleTimezones from '../../hooks/simpleTimezones';
import { getTimezoneValue, getIANATimezone } from '../../utils/simpleTimezoneUtils';
import { AuthContext } from '../../contexts/AuthContext';
import CustomSelect from '../common/CustomSelect';

const Container = styled.div`
  margin-bottom: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  
  h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--textPrimary);
  }
  
  svg {
    color: var(--primary);
  }
`;

const Description = styled.p`
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--textSecondary);
  font-size: 0.95rem;
  line-height: 1.5;
`;

const SearchContainer = styled.div`
  position: relative;
  margin-bottom: 1rem;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.75rem 2.5rem;
  border: 1px solid rgba(var(--borderColor-rgb), 0.3);
  border-radius: 8px;
  background-color: rgba(var(--inputBackground-rgb), 0.7);
  color: var(--textPrimary);
  font-size: 0.95rem;
  transition: all 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.1);
  }
  
  &::placeholder {
    color: var(--textSecondary);
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: var(--textSecondary);
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ClearButton = styled.button`
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(var(--danger-rgb), 0.1);
  border: none;
  color: var(--danger);
  cursor: pointer;
  padding: 0.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(var(--danger-rgb), 0.2);
    transform: translateY(-50%) scale(1.1);
  }
  
  &:active {
    transform: translateY(-50%) scale(0.95);
  }
`;

const TimezoneList = styled.div`
  max-height: 300px;
  overflow-y: auto;
  border: 1px solid rgba(var(--borderColor-rgb), 0.3);
  border-radius: 8px;
  background-color: rgba(var(--cardBackground-rgb), 0.5);
  
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

const TimezoneItem = styled(motion.button)`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 0.75rem 1rem;
  background-color: ${props => props.selected ? 'rgba(var(--primary-rgb), 0.1)' : 'transparent'};
  color: ${props => props.selected ? 'var(--primary)' : 'var(--textPrimary)'};
  border: none;
  border-bottom: 1px solid rgba(var(--borderColor-rgb), 0.1);
  transition: all 0.2s ease;
  cursor: pointer;
  
  &:last-child {
    border-bottom: none;
  }
  
  &:hover {
    background-color: rgba(var(--primary-rgb), 0.05);
  }
  
  &:active {
    background-color: rgba(var(--primary-rgb), 0.15);
  }
  
  &::before {
    content: ${props => props.selected ? "'✓'" : "' '"};
    margin-right: 0.5rem;
    font-weight: bold;
    color: var(--primary);
    width: 1rem;
  }
`;

const CurrentTime = styled.div`
  margin-top: 1rem;
  padding: 0.75rem;
  background-color: rgba(var(--primary-rgb), 0.05);
  border-radius: 8px;
  color: var(--textSecondary);
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  strong {
    color: var(--primary);
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem 0;
  color: var(--textSecondary);
`;

const ErrorMessage = styled.div`
  color: var(--danger);
  padding: 0.75rem;
  background-color: rgba(var(--danger-rgb), 0.1);
  border-radius: 8px;
  margin-bottom: 1rem;
`;

const TimezoneSelect = ({ onSave }) => {
  // Get user from auth context to access settings
  const { user } = useContext(AuthContext);
  
  const {
    timezones,
    currentTimezone,
    updateTimezone,
    loading,
    error
  } = useSimpleTimezones();
  
  const [currentTime, setCurrentTime] = useState('');
  
  // Use user.settings.timezone if available (on initial load)
  useEffect(() => {
    if (user && user.settings && user.settings.timezone) {
      updateTimezone(user.settings.timezone);
    }
  }, [user, updateTimezone]);
  
  // Update current time based on selected timezone
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const options = { 
          hour: '2-digit', 
          minute: '2-digit', 
          second: '2-digit',
          timeZoneName: 'short',
          weekday: 'long',
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        };
        
        // Get the IANA timezone value for Date functions
        const ianaTimezone = getIANATimezone(currentTimezone);
        
        const timeString = new Intl.DateTimeFormat('en-US', {
          ...options,
          timeZone: ianaTimezone
        }).format(now);
        
        setCurrentTime(timeString);
      } catch (error) {
        console.error('Error updating time:', error);
        setCurrentTime(new Date().toLocaleString());
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 1000);
    
    return () => clearInterval(interval);
  }, [currentTimezone]);
  
  // Format timezone options for CustomSelect
  const formatTimezoneOptions = () => {
    if (!timezones || !timezones.length) return [];
    
    return timezones.map(timezone => {
      // Handle both string and object formats
      const code = getTimezoneValue(timezone);
      const label = formatTimezone(timezone);
      
      return {
        value: code,
        label: label
      };
    });
  };
  
  // Format timezone for display
  const formatTimezone = (timezone) => {
    if (!timezone) return '';
    
    // If it's an object with name, use that
    if (typeof timezone === 'object' && timezone.name) {
      return timezone.name;
    }
    
    // If it's just a string code, find the matching timezone object
    if (typeof timezone === 'string') {
      const matchingTimezone = timezones.find(tz => 
        getTimezoneValue(tz) === timezone || getTimezoneValue(tz) === timezone.toUpperCase()
      );
      
      if (matchingTimezone && matchingTimezone.name) {
        return matchingTimezone.name;
      }
    }
    
    // If no matching timezone found, just return the code
    return timezone;
  };
  
  // Handle timezone selection
  const handleSelectTimezone = (timezoneCode) => {
    const selectedTimezone = timezones.find(tz => 
      getTimezoneValue(tz) === timezoneCode
    );
    
    updateTimezone(timezoneCode);
    if (onSave) {
      onSave(selectedTimezone || { code: timezoneCode });
    }
  };
  
  return (
    <Container>
      <Header>
        <Clock size={20} />
        <h3>Timezone Settings</h3>
      </Header>
      
      <Description>
        Select your timezone to see accurate broadcast times for anime in your local time.
        This setting will be used across the application.
      </Description>
      
      {error && (
        <ErrorMessage>
          Error loading timezones: {error}. Using fallback values.
        </ErrorMessage>
      )}
      
      {loading ? (
        <LoadingMessage>Loading timezones...</LoadingMessage>
      ) : (
        <>
          <CustomSelect
            options={formatTimezoneOptions()}
            value={currentTimezone}
            onChange={handleSelectTimezone}
            placeholder="Select your timezone"
          />
          
          {currentTime && (
            <CurrentTime>
              <Clock size={14} />
              Current time: <strong>{currentTime}</strong>
            </CurrentTime>
          )}
        </>
      )}
    </Container>
  );
};

export default TimezoneSelect; 