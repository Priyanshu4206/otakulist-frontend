import styled, { keyframes } from 'styled-components';
import { useState } from 'react';
import { Calendar, Clock, Globe, Star, Tv, Users, Award, Hash, Calendar as CalendarIcon, Heart, Eye, Bookmark, X } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { watchlistAPI } from '../../services/api';
import WatchStatusBadge from '../common/WatchStatusBadge';
import WatchlistModal from '../common/WatchlistModal';

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

const pulse = keyframes`
  0% {
    box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0.4);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(var(--accent-rgb), 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0);
  }
`;

const InfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
  background-color: rgba(var(--cardBackground-rgb), 0.7);
  padding: 1.5rem;
  border-radius: 12px;
  backdrop-filter: blur(10px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
  overflow: hidden;
  animation: ${fadeIn} 0.5s ease-out;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 100%;
    background: var(--gradientPrimary);
    transform: scaleY(1);
    transform-origin: bottom;
    transition: transform 0.4s ease;
  }
`;

const InfoRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.5rem;
  flex-wrap: wrap;
  animation: ${fadeIn} 0.5s ease-out;
  animation-delay: ${props => props.delay || '0s'};
  opacity: 0;
  animation-fill-mode: forwards;
`;

const InfoBlock = styled.div`
  flex: 1;
  min-width: 150px;
  display: flex;
  align-items: center;
  
  @media (max-width: 768px) {
    min-width: 120px;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
  transition: transform 0.3s ease;
  
  svg {
    color: var(--secondary);
    width: 20px;
    height: 20px;
    margin-right: 0.8rem;
    transition: transform 0.3s ease;
    
    &:hover {
      transform: scale(1.2);
    }
  }
`;

const InfoLabel = styled.span`
  font-size: 0.9rem;
  color: var(--textSecondary);
  margin-right: 0.5rem;
`;

const InfoValue = styled.span`
  font-size: 1rem;
  color: var(--textPrimary);
  font-weight: 500;
`;

const TopActionBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(var(--backgroundLight-rgb), 0.3);
  padding: 0.75rem 1rem;
  border-radius: 10px;
  margin-bottom: 1rem;
  width: 100%;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }
`;

const ActionGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  
  @media (max-width: 768px) {
    width: 100%;
    justify-content: ${props => props.end ? 'flex-end' : 'flex-start'};
  }
`;

const ScoreBlock = styled.div`
  display: flex;
  align-items: center;
  background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.1), rgba(var(--accentLight-rgb), 0.05));
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
  
  &:hover {
    background: linear-gradient(135deg, rgba(var(--accent-rgb), 0.15), rgba(var(--accentLight-rgb), 0.08));
  }
  
  svg {
    color: var(--accent);
    width: 18px;
    height: 18px;
    margin-right: 0.6rem;
  }
`;

const ScoreValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--textPrimary);
  background: linear-gradient(to right, var(--primary), var(--accent));
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const ScoreDetails = styled.div`
  display: flex;
  flex-direction: column;
  margin-left: 0.5rem;
`;

const ScoreLabel = styled.span`
  font-size: 0.7rem;
  color: var(--textSecondary);
`;

const NoScoreBlock = styled.div`
  display: flex;
  align-items: center;
  background: rgba(var(--backgroundLight-rgb), 0.3);
  padding: 0.6rem 0.8rem;
  border-radius: 8px;
  color: var(--textSecondary);
  font-size: 0.9rem;
  font-style: italic;
  
  svg {
    color: var(--textSecondary);
    opacity: 0.7;
    width: 18px;
    height: 18px;
    margin-right: 0.6rem;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.4rem 0.8rem;
  border-radius: 8px;
  font-size: 0.85rem;
  font-weight: 600;
  background: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'airing':
      case 'currently airing':
        return 'linear-gradient(135deg, var(--success), var(--successLight))';
      case 'finished airing':
      case 'completed':
        return 'linear-gradient(135deg, var(--primary), var(--primaryLight))';
      case 'not yet aired':
      case 'upcoming':
        return 'linear-gradient(135deg, var(--info), var(--infoLight))';
      default:
        return 'linear-gradient(135deg, var(--textSecondary), var(--borderColor))';
    }
  }};
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  }
`;

const GenreBadge = styled.span`
  display: inline-block;
  margin-right: 0.6rem;
  margin-bottom: 0.6rem;
  padding: 0.4rem 0.8rem;
  background: ${props => props.index % 3 === 0 
    ? 'linear-gradient(135deg, var(--primary), var(--primaryLight))' 
    : props.index % 3 === 1
    ? 'linear-gradient(135deg, var(--secondary), var(--secondaryLight))'
    : 'linear-gradient(135deg, var(--accent), var(--accentLight))'};
  color: white;
  border-radius: 8px;
  font-size: 0.8rem;
  font-weight: 500;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.2);
    cursor: default;
  }
`;

const GenresContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-top: 0.5rem;
`;

const StatisticsRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-top: 0.5rem;
`;

const StatCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(var(--backgroundLight-rgb), 0.3);
  min-width: 85px;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(var(--primary-rgb), 0.1);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
  
  svg {
    color: ${props => props.iconColor || 'var(--secondary)'};
    margin-bottom: 0.5rem;
  }
`;

const StatValue = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--textPrimary);
`;

const StatLabel = styled.span`
  font-size: 0.75rem;
  color: var(--textSecondary);
  margin-top: 0.25rem;
`;

const StudioTag = styled.span`
  display: inline-block;
  margin-right: 0.6rem;
  padding: 0.4rem 0.8rem;
  background: linear-gradient(135deg, rgba(var(--backgroundLight-rgb), 0.5), rgba(var(--primary-rgb), 0.1));
  border-radius: 6px;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
  
  &:hover {
    background: linear-gradient(135deg, rgba(var(--primary-rgb), 0.1), rgba(var(--secondary-rgb), 0.1));
  }
`;

const SectionTitle = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin-bottom: 0.75rem;
  display: flex;
  align-items: center;
  
  svg {
    margin-right: 0.5rem;
    color: var(--secondary);
  }
  
  &::after {
    content: '';
    height: 1px;
    flex-grow: 1;
    background: linear-gradient(to right, var(--borderColor), transparent);
    margin-left: 0.75rem;
  }
`;

const WatchlistButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  background-color: var(--tertiary);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(var(--tertiary-rgb), 0.3);
  white-space: nowrap;
  
  &:hover {
    background-color: var(--tertiaryLight);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AnimeInfo = ({ anime }) => {
  const { isAuthenticated } = useAuth();
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [animeStatus, setAnimeStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  // Format anime data
  const formatSeason = (season, year) => {
    if (!season) return 'Unknown';
    return `${season.charAt(0).toUpperCase() + season.slice(1)} ${year || ''}`;
  };
  
  const formatDate = (dateString) => {
    if (!dateString) return 'TBA';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  
  const formatDuration = (duration) => {
    if (!duration) return 'Unknown';
    return duration.includes('hr') || duration.includes('min') ? duration : `${duration} min per ep`;
  };
  
  // Extract info from anime object
  const {
    status,
    score,
    scored_by,
    popularity,
    rank,
    favorites,
    season,
    year,
    broadcast,
    genres = [],
    duration,
    aired,
    studios = [],
    source,
    type,
    episodes,
    members
  } = anime;

  const handleWatchlistClick = async () => {
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      const animeId = anime.mal_id || anime.id || anime.malId;
      const response = await watchlistAPI.getAnimeStatus(animeId);
      setAnimeStatus(response.data);
      setWatchlistModalOpen(true);
    } catch (error) {
      console.error('Error fetching anime status:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <InfoContainer>
      {/* Improved Score, Status, and Watchlist Bar */}
      <TopActionBar>
        <ActionGroup>
          {score ? (
            <ScoreBlock>
              <Star size={18} />
              <ScoreValue>{score.toFixed(2)}</ScoreValue>
              <ScoreDetails>
                <ScoreLabel>{scored_by ? `${new Intl.NumberFormat().format(scored_by)} votes` : 'Score'}</ScoreLabel>
              </ScoreDetails>
            </ScoreBlock>
          ) : (
            <NoScoreBlock>
              <Star size={18} />
              <span>Not yet rated</span>
            </NoScoreBlock>
          )}
          
          {status && (
            <StatusBadge status={status}>
              <Award size={16} style={{ marginRight: '0.4rem' }} />
              {status}
            </StatusBadge>
          )}
        </ActionGroup>
        
        {isAuthenticated && (
          <ActionGroup end>
            <WatchlistButton onClick={handleWatchlistClick} disabled={loading}>
              <Bookmark size={16} />
              {loading ? 'Loading...' : animeStatus ? 'Update Status' : 'Add to Watchlist'}
            </WatchlistButton>
          </ActionGroup>
        )}
      </TopActionBar>
      
      {/* Statistics Cards */}
      {(rank || popularity || favorites || members) && (
        <>
          <SectionTitle>
            <Award size={18} />
            Statistics
          </SectionTitle>
          
          <StatisticsRow>
            {rank && (
              <StatCard iconColor="var(--primary)">
                <Award size={20} />
                <StatValue>#{rank}</StatValue>
                <StatLabel>Rank</StatLabel>
              </StatCard>
            )}
            
            {popularity && (
              <StatCard iconColor="var(--secondary)">
                <Eye size={20} />
                <StatValue>#{popularity}</StatValue>
                <StatLabel>Popularity</StatLabel>
              </StatCard>
            )}
            
            {favorites && (
              <StatCard iconColor="var(--accent)">
                <Heart size={20} />
                <StatValue>{new Intl.NumberFormat().format(favorites)}</StatValue>
                <StatLabel>Favorites</StatLabel>
              </StatCard>
            )}
            
            {members && (
              <StatCard iconColor="var(--accent)">
                <Users size={20} />
                <StatValue>{new Intl.NumberFormat().format(members)}</StatValue>
                <StatLabel>Members</StatLabel>
              </StatCard>
            )}
          </StatisticsRow>
        </>
      )}
      
      {/* Basic Info */}
      <InfoRow delay="0.2s">
        <SectionTitle>
          <Tv size={18} />
          Anime Details
        </SectionTitle>
      </InfoRow>
      
      <InfoRow delay="0.3s">
        <InfoBlock>
          {type && (
            <InfoItem>
              <Tv />
              <InfoLabel>Type:</InfoLabel>
              <InfoValue>{type}</InfoValue>
            </InfoItem>
          )}
          
          {episodes && (
            <InfoItem>
              <Hash />
              <InfoLabel>Episodes:</InfoLabel>
              <InfoValue>{episodes}</InfoValue>
            </InfoItem>
          )}
          
          {duration && (
            <InfoItem>
              <Clock />
              <InfoLabel>Duration:</InfoLabel>
              <InfoValue>{formatDuration(duration)}</InfoValue>
            </InfoItem>
          )}
        </InfoBlock>
        
        <InfoBlock>
          {(season || aired) && (
            <InfoItem>
              <CalendarIcon />
              <InfoLabel>Aired:</InfoLabel>
              <InfoValue>
                {season ? formatSeason(season, year) : aired?.string || aired?.from ? formatDate(aired.from) : 'TBA'}
              </InfoValue>
            </InfoItem>
          )}
          
          {broadcast?.day && (
            <InfoItem>
              <Calendar />
              <InfoLabel>Broadcast:</InfoLabel>
              <InfoValue>{`${broadcast.day}${broadcast.time ? ` at ${broadcast.time}` : ''}`}</InfoValue>
            </InfoItem>
          )}
          
          {source && (
            <InfoItem>
              <Globe />
              <InfoLabel>Source:</InfoLabel>
              <InfoValue>{source}</InfoValue>
            </InfoItem>
          )}
        </InfoBlock>
      </InfoRow>
      
      {/* Studios */}
      {studios && studios.length > 0 && (
        <InfoRow delay="0.4s">
          <InfoBlock style={{ flex: '100%' }}>
            <SectionTitle>
              <Tv size={18} />
              Studios
            </SectionTitle>
            <div>
              {studios.map((studio, index) => (
                <StudioTag key={index}>
                  {typeof studio === 'string' ? studio : studio.name || ''}
                </StudioTag>
              ))}
            </div>
          </InfoBlock>
        </InfoRow>
      )}
      
      {/* Genres */}
      {genres && genres.length > 0 && (
        <InfoRow delay="0.5s">
          <InfoBlock style={{ flex: '100%' }}>
            <SectionTitle>
              <Globe size={18} />
              Genres
            </SectionTitle>
            <GenresContainer>
              {genres.map((genre, index) => (
                <GenreBadge key={index} index={index}>
                  {typeof genre === 'object' ? genre.name : genre}
                </GenreBadge>
              ))}
            </GenresContainer>
          </InfoBlock>
        </InfoRow>
      )}
      
      {watchlistModalOpen && (
        <WatchlistModal
          anime={anime}
          isOpen={watchlistModalOpen}
          onClose={() => setWatchlistModalOpen(false)}
          currentStatus={animeStatus}
        />
      )}
    </InfoContainer>
  );
};

export default AnimeInfo;