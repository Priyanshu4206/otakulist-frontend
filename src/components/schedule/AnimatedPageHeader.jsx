import { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Calendar, Clock, Filter } from 'lucide-react';
import { getIANATimezone } from '../../utils/simpleTimezoneUtils';

const HeaderContainer = styled(motion.header)`
  margin-bottom: 2.5rem;
  position: relative;
  
  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
  
  @media (max-width: 480px) {
    margin-bottom: 1.5rem;
  }
`;

const TitleContainer = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  
  @media (max-width: 480px) {
    gap: 0.75rem;
  }
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
  box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.3);
  
  svg {
    width: 30px;
    height: 30px;
  }
  
  @media (max-width: 768px) {
    width: 50px;
    height: 50px;
    border-radius: 10px;
    
    svg {
      width: 26px;
      height: 26px;
    }
  }
  
  @media (max-width: 480px) {
    width: 40px;
    height: 40px;
    border-radius: 8px;
    
    svg {
      width: 22px;
      height: 22px;
    }
  }
`;

const TitleContent = styled.div`
  flex: 1;
`;

const Title = styled(motion.h1)`
  font-size: 2.2rem;
  font-weight: 700;
  margin: 0;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1.5rem;
  }
`;

const Subtitle = styled(motion.p)`
  font-size: 1.1rem;
  color: var(--textSecondary);
  margin: 0.3rem 0 0;
  
  @media (max-width: 768px) {
    font-size: 1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.9rem;
  }
`;

const InfoContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  margin-top: 1.5rem;
  
  @media (max-width: 768px) {
    gap: 1.2rem;
    margin-top: 1.2rem;
  }
  
  @media (max-width: 480px) {
    gap: 1rem;
    margin-top: 1rem;
  }
`;

const InfoItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--textSecondary);
  font-size: 1rem;
  
  svg {
    color: var(--primary);
  }
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    gap: 0.4rem;
  }
  
  @media (max-width: 480px) {
    font-size: 0.85rem;
    gap: 0.3rem;
  }
`;

const HideOnMobile = styled.span`
  @media (max-width: 480px) {
    display: none;
  }
`;

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 20
    }
  }
};

const AnimatedPageHeader = ({ timezone }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [localTimezone, setLocalTimezone] = useState('');
  
  // Update current date every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 60000);
    
    // Get local timezone
    const tz = getIANATimezone();
    setLocalTimezone(tz);
    
    return () => clearInterval(timer);
  }, []);
  
  // Format date
  const formatDate = (date) => {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  // Format time
  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };
  
  return (
    <HeaderContainer
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <TitleContainer variants={containerVariants}>
        <IconWrapper variants={itemVariants}>
          <Calendar />
        </IconWrapper>
        
        <TitleContent>
          <Title variants={itemVariants}>Anime Schedule</Title>
          <Subtitle variants={itemVariants}>
            <HideOnMobile>Find upcoming and currently airing anime</HideOnMobile>
            <span className="mobile-only">Airing schedule</span>
          </Subtitle>
        </TitleContent>
      </TitleContainer>
      
      <InfoContainer variants={containerVariants}>
        <InfoItem variants={itemVariants}>
          <Calendar size={18} />
          {formatDate(currentDate)}
        </InfoItem>
        
        <InfoItem variants={itemVariants} className="hide-on-mobile">
          <Clock size={18} />
          <HideOnMobile>{formatTime(currentDate)}</HideOnMobile>
        </InfoItem>
        
        <InfoItem variants={itemVariants} className="hide-on-mobile">
          <Filter size={18} />
          <HideOnMobile>
            Timezone: {timezone || localTimezone || 'UTC'}
          </HideOnMobile>
        </InfoItem>
      </InfoContainer>
    </HeaderContainer>
  );
};

export default AnimatedPageHeader; 