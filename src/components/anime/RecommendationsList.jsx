import { useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { ChevronRight, ChevronLeft, ThumbsUp } from 'lucide-react';
import ShimmerCard from '../common/ShimmerCard';
import RecommendationCard from './RecommendationCard';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Section = styled.section`
  margin: 2rem 0;
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
  color: var(--textPrimary);
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  position: relative;
  padding-bottom: 0.6rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: var(--gradientAccent);
    border-radius: 2px;
  }
`;

const ScrollControls = styled.div`
  display: flex;
  gap: 0.8rem;
`;

const ScrollButton = styled.button`
  background-color: var(--cardBackground);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--textPrimary);
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.2);
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--gradientAccent);
    color: white;
    transform: translateY(-3px);
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    color: var(--textSecondary);
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const ScrollContainer = styled.div`
  display: flex;
  overflow-x: auto;
  gap: 1.5rem;
  padding: 1rem 0.25rem;
  scroll-behavior: smooth;
  position: relative;
  
  /* Custom scrollbar */
  scrollbar-width: thin;
  scrollbar-color: var(--accent) var(--backgroundLight);
  
  &::-webkit-scrollbar {
    height: 5px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--backgroundLight);
    border-radius: 5px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--accent);
    border-radius: 5px;
  }
`;

const CardWrapper = styled.div`
  min-width: 280px;
  max-width: 280px;
  animation: ${fadeIn} 0.5s ease-out forwards;
  animation-delay: ${props => props.index * 0.1}s;
  opacity: 0;
  transform: translateY(10px);
  
  &:hover {
    z-index: 10;
  }
`;

const VotesBadge = styled.div`
  position: absolute;
  top: 15px;
  right: 15px;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accentLight) 100%);
  color: white;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.4rem;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  z-index: 5;
  transform: translateY(0);
  transition: transform 0.3s ease;
  
  svg {
    stroke-width: 2.5px;
  }
  
  ${CardWrapper}:hover & {
    transform: translateY(-5px);
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--textSecondary);
  font-size: 1rem;
  background-color: var(--cardBackground);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
`;

const RecommendationsList = ({ recommendations, loading }) => {
  const containerRef = useRef(null);
  
  // Handle scroll left
  const scrollLeft = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: -900, behavior: 'smooth' });
    }
  };
  
  // Handle scroll right
  const scrollRight = () => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: 900, behavior: 'smooth' });
    }
  };
  
  // Render loading state
  if (loading) {
    return (
      <Section>
        <SectionTitle>You May Also Like</SectionTitle>
        <ScrollContainer>
          {[...Array(5)].map((_, index) => (
            <ShimmerCard key={index} width="280px" height="380px" />
          ))}
        </ScrollContainer>
      </Section>
    );
  }
  
  // Render empty state
  if (!recommendations || recommendations.length === 0) {
    return (
      <Section>
        <SectionTitle>You May Also Like</SectionTitle>
        <EmptyState>No recommendations available.</EmptyState>
      </Section>
    );
  }
  
  // Check if we have data property in recommendations (from the new API format)
  const recommendationItems = recommendations.data || recommendations;
  
  return (
    <Section>
      <SectionTitle>
      You May Also Like
        <ScrollControls>
          <ScrollButton onClick={scrollLeft}>
            <ChevronLeft size={20} />
          </ScrollButton>
          <ScrollButton onClick={scrollRight}>
            <ChevronRight size={20} />
          </ScrollButton>
        </ScrollControls>
      </SectionTitle>
      
      <ScrollContainer ref={containerRef}>
        {recommendationItems.map((rec, index) => {
          // Extract the anime entry from the recommendation
          const anime = rec.entry || rec.anime || rec;
          
          // Add recommendation note if present
          if (rec.votes && !anime.recommendationNote) {
            anime.recommendationNote = rec.votes > 0 
              ? `Recommended by ${rec.votes} anime fans`
              : '';
          }
          
          return (
            <CardWrapper key={anime.mal_id || anime.id || anime.malId} index={index}>
              <RecommendationCard anime={anime} />
            </CardWrapper>
          );
        })}
      </ScrollContainer>
    </Section>
  );
};

export default RecommendationsList; 