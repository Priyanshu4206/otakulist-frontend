import React from 'react';
import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -468px 0;
  }
  100% {
    background-position: 468px 0;
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

const ShimmerWrapper = styled.div`
  width: 100%;
  height: ${props => (props.height ? `${props.height}px` : 'auto')};
  background: var(--cardBackground);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
  position: relative;
  display: ${props => (props.type === 'anime' || props.type === 'playlist' ? 'flex' : 'block')};
  flex-direction: column;
  
  @media (max-width: 768px) {
    border-radius: 10px;
  }
`;

const ShimmerEffect = styled.div`
  animation-duration: 1.5s;
  animation-fill-mode: forwards;
  animation-iteration-count: infinite;
  animation-name: ${shimmer};
  animation-timing-function: linear;
  background: linear-gradient(to right, #f6f7f8 8%, #edeef1 18%, #f6f7f8 33%);
  background-size: 800px 104px;
  position: relative;
`;

const AnimeCardContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const AnimeShimmerImage = styled(ShimmerEffect)`
  width: 100%;
  height: 140px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    height: 120px;
  }
  
  @media (max-width: 480px) {
    height: 100px;
  }
`;

const AnimeShimmerTitle = styled(ShimmerEffect)`
  margin: 1rem;
  height: 1rem;
  width: 80%;
  border-radius: 4px;
  
  @media (max-width: 768px) {
    margin: 0.75rem;
    height: 0.9rem;
  }
`;

const AnimeShimmerRating = styled(ShimmerEffect)`
  margin: 0 1rem 1rem;
  height: 0.8rem;
  width: 50%;
  border-radius: 4px;
  
  @media (max-width: 768px) {
    margin: 0 0.75rem 0.75rem;
    height: 0.7rem;
  }
`;

const PlaylistShimmerImage = styled(ShimmerEffect)`
  width: 100%;
  height: 150px;
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    height: 130px;
  }
  
  @media (max-width: 480px) {
    height: 110px;
  }
`;

const PlaylistShimmerTitle = styled(ShimmerEffect)`
  margin: 1rem;
  height: 1rem;
  width: 80%;
  border-radius: 4px;
  
  @media (max-width: 768px) {
    margin: 0.75rem;
    height: 0.9rem;
  }
`;

const PlaylistShimmerDesc = styled(ShimmerEffect)`
  margin: 0 1rem 1rem;
  height: 0.8rem;
  width: 60%;
  border-radius: 4px;
  
  @media (max-width: 768px) {
    margin: 0 0.75rem 0.75rem;
    height: 0.7rem;
  }
`;

const UserShimmerImage = styled(ShimmerEffect)`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  margin: 1rem;
  
  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
    margin: 0.75rem;
  }
`;

const UserShimmerUsername = styled(ShimmerEffect)`
  margin: 1rem;
  height: 0.9rem;
  width: 70%;
  border-radius: 4px;
  
  @media (max-width: 768px) {
    margin: 0.75rem;
    height: 0.8rem;
  }
`;

const UserShimmerBio = styled(ShimmerEffect)`
  margin: 0 1rem 1rem;
  height: 0.7rem;
  width: 85%;
  border-radius: 4px;
  
  @media (max-width: 768px) {
    margin: 0 0.75rem 0.75rem;
    height: 0.6rem;
  }
`;

const ShimmerCard = ({ type, height }) => {
  const renderContent = () => {
    switch (type) {
      case 'anime':
        return (
          <AnimeCardContent>
            <AnimeShimmerImage />
            <AnimeShimmerTitle />
            <AnimeShimmerRating />
          </AnimeCardContent>
        );
      case 'playlist':
        return (
          <>
            <PlaylistShimmerImage />
            <PlaylistShimmerTitle />
            <PlaylistShimmerDesc />
          </>
        );
      case 'user-card':
        return (
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <UserShimmerImage />
            <div>
              <UserShimmerUsername />
              <UserShimmerBio />
            </div>
          </div>
        );
      default:
        return <AnimeShimmerImage style={{ height: height || 150 }} />;
    }
  };

  return <ShimmerWrapper type={type} height={height}>{renderContent()}</ShimmerWrapper>;
};

export default ShimmerCard; 