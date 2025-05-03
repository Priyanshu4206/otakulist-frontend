import styled from 'styled-components';

const TabsContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1rem;
  margin-bottom: 1.5rem;
  
  /* Hide scrollbar but allow scrolling */
  scrollbar-width: none;
  &::-webkit-scrollbar {
    display: none;
  }
`;

const Tab = styled.button`
  font-size: 1rem;
  font-weight: ${props => props.active ? '700' : '500'};
  color: ${props => {
    if (props.active) return 'var(--textPrimary)';
    if (props.isToday) return 'var(--primary)';
    return 'var(--textSecondary)';
  }};
  background: transparent;
  border: none;
  padding: 0.5rem 0.25rem;
  cursor: pointer;
  position: relative;
  letter-spacing: 0.5px;
  text-transform: uppercase;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 2px;
    background-color: ${props => props.active ? 'var(--primary)' : 'transparent'};
  }
  
  &:hover {
    color: var(--primary);
  }
  
  &:focus {
    outline: none;
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
    
    return {
      day,
      dayName: day.toUpperCase(),
      date: dayNumber,
      isToday: index === currentDay
    };
  });
};

const DayTab = ({ activeDay, onChange }) => {
  const dayTabs = getDayTabs();
  
  return (
    <TabsContainer>
      {dayTabs.map(({ day, dayName, isToday }) => (
        <Tab
          key={day}
          active={activeDay === day}
          isToday={isToday}
          onClick={() => onChange(day)}
        >
          {dayName}
        </Tab>
      ))}
    </TabsContainer>
  );
};

export default DayTab; 