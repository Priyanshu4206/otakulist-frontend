import styled, { keyframes } from 'styled-components';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const TimeSlotContainer = styled.div`
  display: flex;
  margin-bottom: 2rem;
  gap: 2rem;
`;

const TimeLabel = styled.div`
  width: 120px;
  height: 40px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--backgroundLight) 25%, var(--backgroundDark) 50%, var(--backgroundLight) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  
  @media (max-width: 768px) {
    width: 80px;
  }
`;

const AnimeCardsContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const ShimmerCard = styled.div`
  display: flex;
  border-radius: 8px;
  overflow: hidden;
  height: 170px;
  background-color: var(--cardBackground);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 576px) {
    height: 120px;
  }
`;

const ShimmerPoster = styled.div`
  width: 120px;
  height: 100%;
  background: linear-gradient(90deg, var(--backgroundLight) 25%, var(--backgroundDark) 50%, var(--backgroundLight) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
  
  @media (max-width: 576px) {
    width: 80px;
  }
`;

const ShimmerInfo = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const ShimmerTitle = styled.div`
  height: 1.5rem;
  width: 70%;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--backgroundLight) 25%, var(--backgroundDark) 50%, var(--backgroundLight) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ShimmerGenres = styled.div`
  display: flex;
  gap: 0.5rem;
`;

const ShimmerGenre = styled.div`
  height: 1.2rem;
  width: 60px;
  border-radius: 20px;
  background: linear-gradient(90deg, var(--backgroundLight) 25%, var(--backgroundDark) 50%, var(--backgroundLight) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ShimmerMetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-top: 0.3rem;
`;

const ShimmerMeta = styled.div`
  height: 1rem;
  width: 50px;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--backgroundLight) 25%, var(--backgroundDark) 50%, var(--backgroundLight) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ShimmerScore = styled.div`
  height: 1.2rem;
  width: 40px;
  border-radius: 8px;
  background: linear-gradient(90deg, var(--backgroundLight) 25%, var(--backgroundDark) 50%, var(--backgroundLight) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ShimmerStatus = styled.div`
  height: 1rem;
  width: 40%;
  margin-top: auto;
  border-radius: 4px;
  background: linear-gradient(90deg, var(--backgroundLight) 25%, var(--backgroundDark) 50%, var(--backgroundLight) 75%);
  background-size: 200% 100%;
  animation: ${shimmer} 1.5s infinite;
`;

const ShimmerTimeSlot = ({ cardsCount = 2 }) => {
  return (
    <TimeSlotContainer>
      <TimeLabel />
      <AnimeCardsContainer>
        {Array(cardsCount).fill(0).map((_, index) => (
          <ShimmerCard key={index}>
            <ShimmerPoster />
            <ShimmerInfo>
              <ShimmerTitle />
              <ShimmerGenres>
                <ShimmerGenre />
                <ShimmerGenre />
                <ShimmerGenre />
              </ShimmerGenres>
              <ShimmerMetaRow>
                <ShimmerMeta />
                <ShimmerScore />
                <ShimmerMeta />
              </ShimmerMetaRow>
              <ShimmerStatus />
            </ShimmerInfo>
          </ShimmerCard>
        ))}
      </AnimeCardsContainer>
    </TimeSlotContainer>
  );
};

export default ShimmerTimeSlot; 