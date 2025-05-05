import { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { animeQuotes } from '../../assets/anime-landscape';
import useTheme from '../../hooks/useTheme';

// Simple text gradient animation
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
  max-width: 1600px;
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
const StatItem = styled.div`
  background: ${props => props.theme === 'dark' || props.theme === 'default' ? 
    'rgba(30, 30, 50, 0.7)' : 
    'rgba(255, 255, 255, 0.7)'
  };
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  min-width: 220px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
  
  @media (max-width: 768px) {
    min-width: 140px;
    padding: 1rem;
  }
`;

// Stat number
const StatNumber = styled.div`
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
const PrimaryButton = styled.button`
  background: var(--gradientPrimary);
  color: white;
  border: none;
  border-radius: 50px;
  padding: 0.9rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.4);
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

// Secondary CTA button
const SecondaryButton = styled.button`
  background: transparent;
  color: var(--textPrimary);
  border: 2px solid var(--primary);
  border-radius: 50px;
  padding: 0.8rem 2.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.3s ease, background-color 0.3s ease, color 0.3s ease;
  
  &:hover {
    transform: translateY(-3px);
    background-color: var(--primary);
    color: white;
  }
  
  &:active {
    transform: translateY(-1px);
  }
`;

// Quote container
const QuoteContainer = styled.div`
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
  transition: opacity 0.5s ease;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
    height: 150px;
  }
`;

// Quote text
const QuoteText = styled.p`
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  font-style: italic;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
`;

// Quote author
const QuoteAuthor = styled.p`
  font-size: 1rem;
  text-align: right;
  color: var(--textSecondary);
`;

const SimplifiedHero = ({ onExplore, onLearnMore }) => {
  const { currentTheme } = useTheme();
  const [currentQuoteIndex, setCurrentQuoteIndex] = useState(0);

  // Simple stats with fixed values instead of animations
  const stats = [
    { value: '15,000+', label: 'Anime Titles' },
    { value: '250K+', label: 'Active Users' },
    { value: '1.2M+', label: 'Reviews' }
  ];
  
  // Rotate quotes on a fixed interval
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuoteIndex(prevIndex => 
        prevIndex === animeQuotes.length - 1 ? 0 : prevIndex + 1
      );
    }, 8000);
    
    return () => clearInterval(interval);
  }, []);
  
  return (
    <HeroContainer>
      <AnimatedHeading>
        Your Personal Anime Tracker
      </AnimatedHeading>
      
      <Subtitle>
        Discover, track, and share your favorite anime series with our 
        comprehensive library and personalized recommendations.
      </Subtitle>
      
      <StatsContainer>
        {stats.map((stat, index) => (
          <StatItem key={index} theme={currentTheme}>
            <StatNumber>{stat.value}</StatNumber>
            <StatLabel>{stat.label}</StatLabel>
          </StatItem>
        ))}
      </StatsContainer>
      
      <ButtonsContainer>
        <PrimaryButton onClick={onExplore}>
          Explore Anime
        </PrimaryButton>
        <SecondaryButton onClick={onLearnMore}>
          Learn More
        </SecondaryButton>
      </ButtonsContainer>
      
      <QuoteContainer theme={currentTheme}>
        <QuoteText>"{animeQuotes[currentQuoteIndex].text}"</QuoteText>
        <QuoteAuthor>— {animeQuotes[currentQuoteIndex].author}</QuoteAuthor>
      </QuoteContainer>
    </HeroContainer>
  );
};

export default SimplifiedHero; 