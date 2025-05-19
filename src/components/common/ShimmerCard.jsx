import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200px 0;
  }
  100% {
    background-position: 200px 0;
  }
`;

const breathe = keyframes`
  0% {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
  }
  50% {
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
    transform: translateY(-3px);
  }
  100% {
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
    transform: translateY(0);
  }
`;

const ShimmerContainer = styled.div`
  width: 100%;
  border-radius: 10px;
  overflow: hidden;
  background: rgba(var(--cardBackground-rgb), 0.8);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  height: ${props => props.height || '280px'};
  position: relative;
`;

const ShimmerEffect = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: ${shimmer} 1.5s infinite linear;
  background: linear-gradient(to right, 
    rgba(255, 255, 255, 0.05) 8%, 
    rgba(255, 255, 255, 0.15) 18%, 
    rgba(255, 255, 255, 0.05) 33%
  );
  background-size: 800px 100%;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 62%;
  background-color: rgba(var(--cardBackground-rgb), 0.5);
`;

const ContentPlaceholder = styled.div`
  padding: 12px;
`;

const TitlePlaceholder = styled.div`
  height: 14px;
  width: 90%;
  background-color: rgba(var(--cardBackground-rgb), 0.5);
  border-radius: 3px;
  margin-bottom: 8px;
`;

const SubtitlePlaceholder = styled.div`
  height: 12px;
  width: 60%;
  background-color: rgba(var(--cardBackground-rgb), 0.5);
  border-radius: 3px;
  margin-bottom: 8px;
`;

const DetailsPlaceholder = styled.div`
  height: 10px;
  width: 40%;
  background-color: rgba(var(--cardBackground-rgb), 0.5);
  border-radius: 3px;
`;

const ShimmerElement = styled.div`
  display: inline-block;
  position: relative;
  background: var(--cardBackground);
  border-radius: ${props => props.borderRadius || '4px'};
  height: ${props => props.height || '16px'};
  width: ${props => props.width || '100%'};
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    transform: translateX(-100%);
    background-image: linear-gradient(
      90deg,
      rgba(var(--cardBackground-rgb), 0) 0,
      rgba(var(--textPrimary-rgb), 0.2) 20%,
      rgba(var(--cardBackground-rgb), 0.3) 60%,
      rgba(var(--cardBackground-rgb), 0)
    );
    animation: ${shimmer} 2s infinite;
    background-size: 200% 100%;
  }
`;

const ShimmerShape = styled(ShimmerElement)`
  mask-image: ${props => props.maskImage};
  -webkit-mask: linear-gradient(var(--textPrimary) 0 0) content-box, linear-gradient(var(--textPrimary) 0 0);
  mask-composite: add;
  -webkit-mask-composite: source-out;
`;

const ShimmerCardContainer = styled.div`
  width: ${props => props.width || '280px'};
  height: ${props => props.height || '380px'};
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
  background-color: var(--cardBackground);
  margin: ${props => props.margin || '0'};
  padding: 0;
  position: relative;
  animation: ${breathe} 3s infinite ease-in-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius: 12px;
    padding: 2px;
    background: linear-gradient(
      -45deg,
      rgba(var(--primary-rgb), 0.1),
      rgba(var(--secondary-rgb), 0.1),
      rgba(var(--accent-rgb), 0.1)
    );
    -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
    -webkit-mask-composite: xor;
    mask-composite: exclude;
  }
`;

const ShimmerImage = styled(ShimmerElement)`
  width: 100%;
  height: 65%;
  border-radius: 12px 12px 0 0;
`;

const ShimmerContent = styled.div`
  padding: 1rem;
`;

const ShimmerBadge = styled(ShimmerShape)`
  position: absolute;
  top: 10px;
  right: 10px;
  width: 50px;
  height: 24px;
  border-radius: 6px;
`;

const ShimmerStatusBadge = styled(ShimmerShape)`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 70px;
  height: 24px;
  border-radius: 6px;
`;

const ShimmerGenres = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const ShimmerGenre = styled(ShimmerShape)`
  width: 60px;
  height: 24px;
  border-radius: 6px;
`;

/**
 * ShimmerCard Component
 * 
 * A loading placeholder with shimmer effect for card components
 * 
 * @param {Object} props - Component props
 * @param {string} props.height - Height of the card (default: '280px')
 * @returns {JSX.Element} - ShimmerCard component
 */
const ShimmerCard = ({ height }) => {
  return (
    <ShimmerContainer height={height}>
      <ShimmerEffect />
      <ImagePlaceholder />
      <ContentPlaceholder>
        <TitlePlaceholder />
        <SubtitlePlaceholder />
        <DetailsPlaceholder />
      </ContentPlaceholder>
    </ShimmerContainer>
  );
};

export default ShimmerCard; 