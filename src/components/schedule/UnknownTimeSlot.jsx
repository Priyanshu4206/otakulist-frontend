import styled from 'styled-components';
import { Info } from 'lucide-react';
import ScheduleAnimeCard from './ScheduleAnimeCard';

const Container = styled.div`
  margin-top: 2rem;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--borderColor);
`;

const Title = styled.h3`
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--textPrimary);
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
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