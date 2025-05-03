import { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { animeQuotes } from '../../assets/anime-landscape';
import useTheme from '../../hooks/useTheme';

// Text gradient animation
const gradientAnimation = keyframes`
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
`;

// Container for the hero section
const HeroContainer = styled.div`
  text-align: center;
  padding: 8rem 2rem 6rem;
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    padding: 6rem 1rem 4rem;
  }
`;

// Animated heading with gradient text
const AnimatedHeading = styled.h1`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  background: var(--gradientPrimary);
  background-size: 300% 300%;
  animation: ${gradientAnimation} 6s ease infinite;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }
`;

// Subtitle with improved visibility
const Subtitle = styled.p`
  font-size: 1.5rem;
  max-width: 800px;
  margin: 0 auto 3rem;
  line-height: 1.5;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 2rem;
  }
`;

// Stats container
const StatsContainer = styled.div`
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 2rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    gap: 1rem;
    margin-bottom: 2rem;
  }
`;

// Individual stat item
const StatItem = styled(motion.div)`
  background: ${props => props.theme === 'dark' || props.theme === 'default' ? 
    'rgba(30, 30, 50, 0.7)' : 
    'rgba(255, 255, 255, 0.7)'
  };
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 220px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 768px) {
    min-width: 140px;
    padding: 1rem;
  }
`;

// Stat number with animated counter
const StatNumber = styled(motion.div)`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  background: linear-gradient(90deg, var(--primary), var(--secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  color: transparent;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

// Stat label
const StatLabel = styled.div`
  font-size: 1rem;
  color: var(--textPrimary);
  opacity: 0.8;
`;

// CTA buttons container
const ButtonsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
`;

// Primary CTA button
const PrimaryButton = styled(motion.button)`
  background: var(--gradientPrimary);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.9rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
`;

// Secondary CTA button
const SecondaryButton = styled(motion.button)`
  background: transparent;
  color: var(--textPrimary);
  border: 2px solid var(--primary);
  border-radius: 50px;
  padding: 0.8rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
`;

// Quote container
const QuoteContainer = styled(motion.div)`
  max-width: 800px;
  margin: 0 auto;
  background: ${props => props.theme === 'dark' || props.theme === 'default' ? 
    'rgba(30, 30, 50, 0.6)' : 
    'rgba(255, 255, 255, 0.6)'
  };
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    height: 150px;
  }
`;

// Quote text
const QuoteText = styled(motion.p)`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  font-style: italic;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

// Quote author
const QuoteAuthor = styled(motion.p)`
  font-size: 1rem;
  text-align: right;
  color: var(--textSecondary);
`;

// Animation variants for stat counters
const statCountVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.2,
      duration: 0.5,
      ease: "easeOut"
    }
  })
};

const AnimatedHero = ({ onExplore, onLearnMore }) => {
  const { currentTheme } = useTheme();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);
  const [statValues, setStatValues] = useState({
    anime: 0,
    users: 0,
    reviews: 0
  });
  
  // Animate statistics when component mounts
  useEffect(() => {
    const targetValues = {
      anime: 15000,
      users: 250000,
      reviews: 1200000
    };
    
    // Animate the counters
    const interval = setInterval(() => {
      setStatValues(prev => {
        const newValues = { ...prev };
        let completed = true;
        
        // Update each stat
        Object.keys(targetValues).forEach(key => {
          if (prev[key] < targetValues[key]) {
            // Calculate increment based on value size
            const increment = Math.max(
              Math.ceil(targetValues[key] / 100),
              Math.ceil((targetValues[key] - prev[key]) / 20)
            );
            newValues[key] = Math.min(prev[key] + increment, targetValues[key]);
            
            if (newValues[key] < targetValues[key]) {
              completed = false;
            }
          }
        });
        
        // Clear interval when all counters reach their target
        if (completed) {
          clearInterval(interval);
        }
        
        return newValues;
      });
    }, 30);
    
    return () => clearInterval(interval);
  }, []);
  
  // Rotate through anime quotes
  useEffect(() => {
    const quoteInterval = setInterval(() => {
      setCurrentQuoteIndex(prevIndex => 
        prevIndex === animeQuotes.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);
    
    return () => clearInterval(quoteInterval);
  }, []);
  
  return (
    <HeroContainer>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
      >
        <AnimatedHeading>Discover Your Next Anime Adventure</AnimatedHeading>
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.4 }}
      >
        <Subtitle>
          Your ultimate anime companion for tracking, discovering, and sharing your favorite series.
        </Subtitle>
      </motion.div>
      
      {/* Stats Counter Section */}
      <StatsContainer>
        <StatItem 
          theme={currentTheme}
          custom={0}
          initial="hidden"
          animate="visible"
          variants={statCountVariants}
          whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
        >
          <StatNumber>
            {statValues.anime.toLocaleString()}
          </StatNumber>
          <StatLabel>Anime Titles</StatLabel>
        </StatItem>
        
        <StatItem 
          theme={currentTheme}
          custom={1}
          initial="hidden"
          animate="visible"
          variants={statCountVariants}
          whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
        >
          <StatNumber>
            {statValues.users.toLocaleString()}
          </StatNumber>
          <StatLabel>Active Users</StatLabel>
        </StatItem>
        
        <StatItem 
          theme={currentTheme}
          custom={2}
          initial="hidden"
          animate="visible"
          variants={statCountVariants}
          whileHover={{ y: -5, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.15)' }}
        >
          <StatNumber>
            {statValues.reviews.toLocaleString()}
          </StatNumber>
          <StatLabel>Reviews</StatLabel>
        </StatItem>
      </StatsContainer>
      
      {/* CTA Buttons */}
      <ButtonsContainer>
        <PrimaryButton 
          onClick={onExplore}
          whileHover={{ y: -3, boxShadow: '0 8px 25px rgba(0, 0, 0, 0.4)' }}
          whileTap={{ y: 1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
        >
          Explore Anime
        </PrimaryButton>
        
        <SecondaryButton 
          onClick={onLearnMore}
          whileHover={{ y: -3, backgroundColor: 'rgba(var(--primary-rgb), 0.1)' }}
          whileTap={{ y: 1 }}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.9 }}
        >
          Learn More
        </SecondaryButton>
      </ButtonsContainer>
      
      {/* Anime Quote Section */}
      <AnimatePresence mode="wait">
        <QuoteContainer 
          key={`quote-container-${currentQuoteIndex}`}
          theme={currentTheme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <QuoteText
            key={`quote-text-${currentQuoteIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
          >
            "{animeQuotes[currentQuoteIndex].text}"
          </QuoteText>
          <QuoteAuthor
            key={`quote-author-${currentQuoteIndex}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            — {animeQuotes[currentQuoteIndex].author}
          </QuoteAuthor>
        </QuoteContainer>
      </AnimatePresence>
    </HeroContainer>
  );
};

export default AnimatedHero; 