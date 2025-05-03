import { useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { ArrowRight, Star, Heart, Calendar } from 'lucide-react';
import anime from 'animejs';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateX(-30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
`;

const HeroContainer = styled.div`
  position: relative;
  padding: 8rem 2rem;
  text-align: center;
  color: white;
  overflow: hidden;
  
  @media (max-width: 768px) {
    padding: 6rem 1.5rem;
  }
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 800;
  margin-bottom: 1.5rem;
  line-height: 1.2;
  background: var(--gradientPrimary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  text-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
  opacity: 0;
  animation: ${fadeIn} 0.8s ease-out forwards;
  animation-delay: 0.2s;
  
  @media (max-width: 768px) {
    font-size: 2.5rem;
  }

  span {
    display: block;
    background: var(--gradientAccent);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.5rem;
  line-height: 1.6;
  margin: 0 auto 2.5rem;
  max-width: 800px;
  color: rgba(255, 255, 255, 0.9);
  opacity: 0;
  animation: ${fadeIn} 0.8s ease-out forwards;
  animation-delay: 0.4s;
  
  @media (max-width: 768px) {
    font-size: 1.2rem;
  }
`;

const ButtonContainer = styled.div`
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

const ActionButton = styled.button`
  background: ${props => props.primary ? 'var(--gradientPrimary)' : 'transparent'};
  color: white;
  border: ${props => props.primary ? 'none' : '2px solid white'};
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.8rem 1.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  box-shadow: ${props => props.primary ? '0 10px 20px rgba(0, 0, 0, 0.2)' : 'none'};
  opacity: 0;
  animation: ${fadeIn} 0.8s ease-out forwards;
  animation-delay: ${props => props.delay || '0.6s'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 30px rgba(0, 0, 0, 0.3);
    background: ${props => props.primary ? 'var(--gradientAccent)' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  svg {
    transition: transform 0.3s ease;
  }
  
  &:hover svg {
    transform: translateX(4px);
  }
`;

const StatisticsContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 3rem;
  margin-top: 4rem;
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
    gap: 1.5rem;
  }
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  opacity: 0;
  animation: ${slideIn} 0.8s ease-out forwards;
  animation-delay: ${props => props.delay || '0.8s'};
  
  svg {
    color: var(--accent);
    margin-bottom: 0.5rem;
  }
`;

const StatValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 0.2rem;
  background: var(--gradientSecondary);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 2rem;
  }
`;

const StatLabel = styled.div`
  font-size: 1rem;
  opacity: 0.8;
`;

const AnimatedTextContainer = styled.div`
  position: relative;
  height: 1.6em;
  margin-top: 2rem;
  font-size: 1.2rem;
  font-style: italic;
  color: rgba(255, 255, 255, 0.8);
  overflow: hidden;
`;

const TextCycle = styled.div`
  position: absolute;
  width: 100%;
  opacity: 0;
`;

const AnimatedHero = ({ onExplore, onGetStarted }) => {
  const textElements = useRef([]);
  const counterRefs = useRef({
    anime: null,
    users: null,
    reviews: null
  });
  
  useEffect(() => {
    // Animate the cycling texts
    if (textElements.current.length > 0) {
      anime({
        targets: textElements.current,
        opacity: [0, 1],
        translateY: ['1em', 0],
        easing: 'easeOutExpo',
        duration: 1200,
        delay: (el, i) => 1000 + 2000 * i,
        endDelay: 1000,
        loop: true
      });
    }
    
    // Animate counters
    Object.entries(counterRefs.current).forEach(([key, el]) => {
      if (el) {
        const target = {
          anime: 15000,
          users: 250000,
          reviews: 1200000
        }[key] || 0;
        
        anime({
          targets: el,
          innerHTML: [0, target],
          easing: 'easeInOutExpo',
          duration: 3000,
          delay: 1000,
          round: true
        });
      }
    });
  }, []);
  
  return (
    <HeroContainer>
      <HeroTitle>
        Discover Your Next <span>Anime Adventure</span>
      </HeroTitle>
      
      <HeroSubtitle>
        Track, discover, and share your anime journey with the passionate OtakuList community.
        Your personalized anime experience starts here!
      </HeroSubtitle>
      
      <ButtonContainer>
        <ActionButton primary onClick={onGetStarted} delay="0.6s">
          Get Started <ArrowRight size={18} />
        </ActionButton>
        <ActionButton onClick={onExplore} delay="0.8s">
          Explore Anime
        </ActionButton>
      </ButtonContainer>
      
      <StatisticsContainer>
        <StatItem delay="0.9s">
          <Star size={24} />
          <StatValue ref={el => counterRefs.current.anime = el}>15,000</StatValue>
          <StatLabel>Anime Titles</StatLabel>
        </StatItem>
        
        <StatItem delay="1s">
          <Heart size={24} />
          <StatValue ref={el => counterRefs.current.users = el}>250,000</StatValue>
          <StatLabel>Active Users</StatLabel>
        </StatItem>
        
        <StatItem delay="1.1s">
          <Calendar size={24} />
          <StatValue ref={el => counterRefs.current.reviews = el}>1,200,000</StatValue>
          <StatLabel>User Reviews</StatLabel>
        </StatItem>
      </StatisticsContainer>
      
      <AnimatedTextContainer>
        <TextCycle ref={el => textElements.current[0] = el}>
          "Your ultimate anime companion for discovery and tracking."
        </TextCycle>
        <TextCycle ref={el => textElements.current[1] = el}>
          "Never miss a new episode from your favorite shows again."
        </TextCycle>
        <TextCycle ref={el => textElements.current[2] = el}>
          "Join a passionate community of anime enthusiasts like you."
        </TextCycle>
      </AnimatedTextContainer>
    </HeroContainer>
  );
};

export default AnimatedHero; 