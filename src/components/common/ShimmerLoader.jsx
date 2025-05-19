import React, { memo } from 'react';
import styled from 'styled-components';
import ShimmerCard from './ShimmerCard';

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
`;

const RowContainer = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 1rem 0;
  margin-bottom: 1.5rem;
  scroll-behavior: smooth;
  
  & > * {
    flex-shrink: 0;
    width: 180px;
    
    @media (max-width: 768px) {
      width: 140px;
    }
  }
`;

const SidebarContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/**
 * ShimmerLoader Component
 * 
 * Displays multiple shimmer cards in different layouts
 * 
 * @param {Object} props - Component props
 * @param {string} props.type - Layout type: 'grid', 'row', or 'sidebar'
 * @param {number} props.count - Number of shimmer cards to display
 * @param {string} props.height - Height of each shimmer card
 * @returns {JSX.Element} - ShimmerLoader component
 */
const ShimmerLoader = ({ type = 'grid', count = 10, height }) => {
  const shimmerCards = Array(count).fill().map((_, index) => (
    <ShimmerCard key={`shimmer-${index}`} height={height} />
  ));

  switch(type) {
    case 'row':
      return <RowContainer>{shimmerCards}</RowContainer>;
    case 'sidebar':
      return <SidebarContainer>{shimmerCards}</SidebarContainer>;
    case 'grid':
    default:
      return <GridContainer>{shimmerCards}</GridContainer>;
  }
};

export default memo(ShimmerLoader); 