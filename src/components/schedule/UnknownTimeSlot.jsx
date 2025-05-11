import styled from 'styled-components';
import { Info } from 'lucide-react';
import ScheduleAnimeCard from './ScheduleAnimeCard';

const Container = styled.div`
  margin-top: 2rem;
  
  @media (max-width: 768px) {
    margin-top: 1.5rem;
  }
  
  @media (max-width: 480px) {
    margin-top: 1rem;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--borderColor);
  
  @media (max-width: 480px) {
    margin-bottom: 0.75rem;
    padding-bottom: 0.4rem;
  }
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--textPrimary);
  
  @media (max-width: 768px) {
    font-size: 1.1rem;
  }
  
  @media (max-width: 480px) {
    font-size: 1rem;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  
  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }
`;

const UnknownTimeSlot = ({ animeList, formatTimeDisplay }) => {
  return (
    <Container>
      <Header>
        <Info size={18} />
        <Title>No Specific Broadcast Time ({animeList.length})</Title>
      </Header>
      <Grid>
        {animeList.map(anime => (
          <ScheduleAnimeCard key={anime.malId || anime._id} anime={anime} />
        ))}
      </Grid>
    </Container>
  );
};

export default UnknownTimeSlot; 