import styled from 'styled-components';
import { Clock } from 'lucide-react';
import ScheduleAnimeCard from './ScheduleAnimeCard';

const TimeSlotContainer = styled.div`
  display: flex;
  margin-bottom: 1.5rem;
  position: relative;
`;

const TimeLabel = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--textPrimary);
  width: 120px;
  padding-top: 1rem;
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;

  @media (max-width: 768px) {
    width: 80px;
    font-size: 1.4rem;
  }
`;

const TimeZoneInfo = styled.div`
  font-size: 0.7rem;
  color: var(--textSecondary);
  margin-top: 0.25rem;
  font-weight: normal;
`;

const OriginalTime = styled.div`
  font-size: 0.8rem;
  color: var(--textSecondary);
  margin-top: 0.25rem;
  font-weight: normal;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const AnimeCardsContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.2rem;
  
  @media (max-width: 576px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
  }
`;

const TimeSlot = ({ time, animeList, timezone }) => {
  // Check if there's timezone conversion
  const hasTimezoneDifference = animeList[0]?.broadcast?.originalTime && 
                               animeList[0]?.broadcast?.time !== animeList[0]?.broadcast?.originalTime;
  
  // Get timezone string for display
  const getTimezoneDisplay = () => {
    // If we have JST as original, show that
    if (animeList[0]?.broadcast?.originalTime) {
      const original = animeList[0].broadcast.timezone?.split('/')[1] || 'JST';
      return timezone || original;
    }
    return timezone || 'JST';
  };

  return (
    <TimeSlotContainer>
      <TimeLabel>
        {time}
        <TimeZoneInfo>{getTimezoneDisplay()}</TimeZoneInfo>
        {hasTimezoneDifference && animeList[0]?.broadcast?.originalTime && (
          <OriginalTime>
            <Clock size={12} />
            {animeList[0].broadcast.originalTime} JST
          </OriginalTime>
        )}
      </TimeLabel>
      <AnimeCardsContainer>
        {animeList.map(anime => (
          <ScheduleAnimeCard key={anime.malId || anime._id} anime={anime} />
        ))}
      </AnimeCardsContainer>
    </TimeSlotContainer>
  );
};

export default TimeSlot; 