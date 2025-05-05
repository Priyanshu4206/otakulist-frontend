import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const TabsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  padding: 0.5rem;
  background: rgba(var(--cardBackground-rgb), 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  
  /* Hide scrollbar but allow scrolling */
  scrollbar-width: none;
  overflow: visible;
  
  &::-webkit-scrollbar {
    display: none;
  }
  
  @media (max-width: 768px) {
    gap: 0.25rem;
  }
`;

const TabWrapper = styled.div`
  position: relative;
`;

const Tab = styled(motion.button)`
  font-size: 1rem;
  font-weight: 600;
  color: ${props => props.active ? 'var(--textPrimary)' : 'var(--textSecondary)'};
  background: transparent;
  border: none;
  padding: 0.75rem 1.2rem;
  cursor: pointer;
  position: relative;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  transition: all 0.3s ease;
  
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  border-radius: 8px;
  
  &:hover {
    color: var(--primary);
    background: rgba(var(--primary-rgb), 0.05);
  }
  
  &:focus {
    outline: none;
  }
  
  @media (max-width: 768px) {
    padding: 0.6rem 0.8rem;
    font-size: 0.9rem;
  }
`;

const ActiveTabIndicator = styled(motion.div)`
  position: absolute;
  bottom: -3px;
  left: 0;
  right: 0;
  height: 3px;
  background: var(--gradientPrimary);
  border-radius: 3px;
`;

const DayName = styled.span`
  font-weight: 700;
`;

const DateNumber = styled.span`
  font-size: 1.3rem;
  font-weight: 800;
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

const TodayIndicator = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 8px;
  border: 2px solid var(--primary);
  z-index: -1;
`;

const TodayLabel = styled(motion.div)`
  position: absolute;
  top: -15px;
  left: 50%;
  transform: translateX(-50%);
  background: var(--primary);
  color: white;
  font-size: 0.7rem;
  font-weight: 600;
  padding: 0.15rem 0.5rem;
  border-radius: 4px;
  z-index: 1;
  
  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    transform: translateX(-50%);
    border: 4px solid transparent;
    border-top-color: var(--primary);
  }
`;

// Helper to get formatted day tabs
const getDayTabs = () => {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = new Date();
  const currentDay = today.getDay(); // 0 is Sunday
  
  return days.map((day, index) => {
    // Get the date for this day
    const date = new Date(today);
    const diff = index - currentDay;
    date.setDate(today.getDate() + diff);
    
    // Format the date
    const dayNumber = date.getDate();
    const month = date.getMonth() + 1; // Month is 0-indexed
    
    return {
      day,
      dayName: day.slice(0, 3).toUpperCase(),
      date: dayNumber,
      month,
      isToday: index === currentDay
    };
  });
};

const AnimatedDayTabs = ({ activeDay, onDayChange }) => {
  const dayTabs = getDayTabs();
  const [hoveredDay, setHoveredDay] = useState(null);
  
  // Create a memoized callback for changing days to prevent unnecessary renders
  const handleDayChange = (day) => {
    if (day !== activeDay) {
      onDayChange(day);
    }
  };
  
  return (
    <TabsContainer>
      {dayTabs.map(({ day, dayName, date, isToday }) => (
        <TabWrapper key={day}>
          <Tab
            active={activeDay === day}
            onClick={() => handleDayChange(day)}
            onHoverStart={() => setHoveredDay(day)}
            onHoverEnd={() => setHoveredDay(null)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              backgroundColor: activeDay === day 
                ? 'rgba(var(--primary-rgb), 0.1)' 
                : hoveredDay === day 
                  ? 'rgba(var(--primary-rgb), 0.05)' 
                  : 'transparent' 
            }}
            transition={{ duration: 0.2 }}
          >
            <DayName>{dayName}</DayName>
            <DateNumber>{date}</DateNumber>
            
            {/* Active indicator */}
            {activeDay === day && (
              <ActiveTabIndicator 
                layoutId="activeTabIndicator"
                transition={{ type: "spring", stiffness: 300, damping: 30 }}
              />
            )}
            
            {/* Today indicator */}
            {isToday && (
              <>
                <TodayIndicator
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.7, 1, 0.7] 
                  }}
                  transition={{ 
                    duration: 3,
                    repeat: Infinity,
                    repeatType: "reverse" 
                  }}
                />
                <TodayLabel
                  initial={{ opacity: 0, y: -5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  TODAY
                </TodayLabel>
              </>
            )}
          </Tab>
        </TabWrapper>
      ))}
    </TabsContainer>
  );
};

export default AnimatedDayTabs; 