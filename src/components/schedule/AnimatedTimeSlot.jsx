import styled from 'styled-components';
import { Clock } from 'lucide-react';
import ScheduleAnimeCard from './ScheduleAnimeCard';
import useAuth from '../../hooks/useAuth';

const TimeSlotContainer = styled.div`
  display: flex;
  margin-bottom: 3rem;
  position: relative;
`;

const TimeLabel = styled.div`
  width: 120px;
  position: sticky;
  top: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    width: 80px;
  }
`;

const TimeCircle = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--gradientPrimary);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: 800;
  box-shadow: 0 8px 15px rgba(var(--primary-rgb), 0.3);
  
  @media (max-width: 768px) {
    width: 60px;
    height: 60px;
    font-size: 1.2rem;
  }
`;

const TimeMeta = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 0.5rem;
  font-size: 0.8rem;
  color: var(--textSecondary);
`;

const TimeZoneInfo = styled.div`
  font-weight: 600;
  color: var(--textPrimary);
  background: rgba(var(--cardBackground-rgb), 0.7);
  padding: 0.3rem 0.6rem;
  border-radius: 4px;
  margin-top: 0.5rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const OriginalTime = styled.div`
  display: flex;
  align-items: center;
  gap: 0.25rem;
  margin-top: 0.25rem;
`;

const AnimeCardsContainer = styled.div`
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  }
`;

const AnimatedTimeSlot = ({ time, animeList, formatTimeDisplay }) => {
  // Check if there's timezone conversion
  const hasTimezoneDifference = animeList[0]?.broadcast?.originalTime && 
                               animeList[0]?.broadcast?.time !== animeList[0]?.broadcast?.originalTime;
  
  const { isAuthenticated } = useAuth();
  
  // Extract the timezone code from formatted display
  const formatted = formatTimeDisplay(time);
  const timezoneCode = formatted.includes('(') ? 
    formatted.split('(')[1].replace(')', '') : 'Local';
  
  return (
    <TimeSlotContainer>
      <TimeLabel>
        <TimeCircle>
          {time}
        </TimeCircle>
        <TimeMeta>
          <TimeZoneInfo>
            <Clock size={12} />
            {timezoneCode}
          </TimeZoneInfo>
          {hasTimezoneDifference && animeList[0]?.broadcast?.originalTime && (
            <OriginalTime>
              <Clock size={12} />
              {animeList[0].broadcast.originalTime} JST
            </OriginalTime>
          )}
        </TimeMeta>
      </TimeLabel>
      
      <AnimeCardsContainer>
        {animeList.map((anime) => (
          <ScheduleAnimeCard key={anime.malId || anime._id} anime={anime} />
        ))}
      </AnimeCardsContainer>
    </TimeSlotContainer>
  );
};

export default AnimatedTimeSlot; 