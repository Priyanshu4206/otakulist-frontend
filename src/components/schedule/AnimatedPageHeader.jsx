import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Calendar, Clock, Filter } from 'lucide-react';
import { getIANATimezone } from '../../utils/simpleTimezoneUtils';

const HeaderContainer = styled(motion.header)`
  margin-bottom: 2.5rem;
  position: relative;
`;

const TitleContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
`;

const IconWrapper = styled(motion.div)`
  background: var(--gradientPrimary);
  color: white;
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 10px 20px rgba(var(--primary-rgb), 0.3);
  
  @media (max-width: 768px) {
    width: 45px;
    height: 45px;
  }
`;

const PageTitle = styled(motion.h1)`
  font-size: 2.8rem;
  font-weight: 800;
  color: var(--textPrimary);
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  margin: 0;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const PageDescription = styled(motion.p)`
  font-size: 1.2rem;
  color: var(--textSecondary);
  margin-bottom: 2rem;
  max-width: 700px;
  line-height: 1.6;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
`;

const HeaderCards = styled(motion.div)`
  display: flex;
  gap: 1.5rem;
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const InfoCard = styled(motion.div)`
  background: rgba(var(--cardBackground-rgb), 0.7);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  flex: 1;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(var(--border-rgb), 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  }
`;

const CardTitle = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  color: var(--textSecondary);
  margin-bottom: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  svg {
    color: var(--primary);
  }
`;

const CardContent = styled.div`
  font-size: 1.8rem;
  font-weight: 700;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 1.4rem;
  }
`;

const CardDescription = styled.p`
  font-size: 0.9rem;
  color: var(--textSecondary);
  margin-top: 0.5rem;
`;

const getLocalDay = () => {
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const now = new Date();
  return days[now.getDay()];
};

const AnimatedPageHeader = ({ title = "Anime Schedule", subtitle, timezoneCode }) => {
  const [currentTime, setCurrentTime] = useState('');
  
  useEffect(() => {
    const updateTime = () => {
      try {
        const now = new Date();
        const options = { 
          hour: '2-digit', 
          minute: '2-digit',
          hour12: true
        };
        
        // Get the IANA timezone for formatting
        const ianaTimezone = getIANATimezone(timezoneCode);
        
        const timeString = new Intl.DateTimeFormat('en-US', {
          ...options,
          timeZone: ianaTimezone
        }).format(now);
        
        setCurrentTime(timeString);
      } catch (error) {
        console.error('Error updating time display:', error);
        setCurrentTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      }
    };
    
    // Update immediately and then every minute
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, [timezoneCode]);
  
  return (
    <HeaderContainer
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <TitleContainer>
        <IconWrapper
          initial={{ scale: 0, rotate: -30 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            type: "spring", 
            stiffness: 260, 
            damping: 20,
            delay: 0.1
          }}
        >
          <Calendar size={28} />
        </IconWrapper>
        
        <PageTitle
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {title}
        </PageTitle>
      </TitleContainer>
      
      <PageDescription
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        {subtitle || "Browse the weekly anime release schedule to keep track of your favorite shows. Select a day to view all anime airing on that day, or filter by genre and status."}
      </PageDescription>
      
      <HeaderCards
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ 
          duration: 0.5, 
          delay: 0.4,
          staggerChildren: 0.1
        }}
      >
        <InfoCard
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <CardTitle>
            <Clock size={18} />
            Current Time
          </CardTitle>
          <CardContent>{currentTime}</CardContent>
          <CardDescription>Timezone: {timezoneCode}</CardDescription>
        </InfoCard>
        
        <InfoCard
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <CardTitle>
            <Calendar size={18} />
            Current Day
          </CardTitle>
          <CardContent>{getLocalDay()}</CardContent>
          <CardDescription>Showing today's anime by default</CardDescription>
        </InfoCard>
        
        <InfoCard
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
        >
          <CardTitle>
            <Filter size={18} />
            Customization
          </CardTitle>
          <CardContent>Available</CardContent>
          <CardDescription>Filter by genre, status, and more</CardDescription>
        </InfoCard>
      </HeaderCards>
    </HeaderContainer>
  );
};

export default AnimatedPageHeader; 