import { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { Star, Users, Clock, Tv, Bookmark } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { watchlistAPI } from '../../services/api';
import WatchlistModal from '../common/WatchlistModal';

const Card = styled.div`
  position: relative;
  background-color: var(--cardBackground);
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  margin: 0 auto;
  
  &:hover {
    box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  padding-top: 130%;
  overflow: hidden;
`;

const Image = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
  
  ${Card}:hover & {
    transform: scale(1.05);
  }
`;

const CardContent = styled.div`
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const Title = styled.h3`
  font-size: 0.85rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
  color: var(--textPrimary);
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-height: 2.6rem;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  color: var(--textSecondary);
  margin-bottom: 0.3rem;
  
  svg {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    margin-right: 0.3rem;
    color: var(--secondary);
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  font-size: 0.7rem;
  color: var(--textSecondary);
  margin-bottom: 0.3rem;
  gap: 0.4rem;
  
  svg {
    flex-shrink: 0;
    width: 12px;
    height: 12px;
    margin-right: 0.2rem;
    color: var(--secondary);
  }
`;

const GenreList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.3rem;
  margin-top: auto;
  padding-top: 0.4rem;
`;

const GenreBadge = styled.span`
  font-size: 0.65rem;
  padding: 0.1rem 0.4rem;
  background: rgba(var(--tertiaryLight-rgb), 0.1);
  color: var(--tertiary);
  border-radius: 30px;
`;

const WatchlistButton = styled.button`
  position: absolute;
  top: 0.5rem;
  left: 0.5rem;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: white;
  transition: all 0.2s ease;
  backdrop-filter: blur(2px);
  
  &:hover {
    background: var(--tertiary);
    transform: scale(1.1);
  }
  
  svg {
    width: 14px;
    height: 14px;
  }
`;

const StyledLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: 30px;
  font-size: 0.7rem;
  font-weight: 600;
  color: white;
  background: ${props => {
    switch (props.status?.toLowerCase()) {
      case 'airing':
      case 'currently airing':
        return 'var(--success)';
      case 'finished airing':
      case 'completed':
        return 'var(--primary)';
      case 'not yet aired':
      case 'upcoming':
        return 'var(--info)';
      default:
        return 'var(--textSecondary)';
    }
  }};
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.4rem;
  flex-wrap: wrap;
  gap: 0.4rem;
  justify-content: space-between;
`;

const RatingInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  color: var(--textSecondary);
`;

const ScoreInfo = styled.div`
  display: flex;
  align-items: center;
  font-size: 0.7rem;
  color: var(--textSecondary);
  
  svg {
    color: var(--warning);
    margin-right: 0.25rem;
  }
`;

const ScheduleAnimeCard = ({ anime }) => {
  const { isAuthenticated } = useAuth();
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [animeStatus, setAnimeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  
  // Get anime details
  const animeId = anime.malId || anime._id;
  
  // Get image
  const getImageUrl = () => {
    if (anime.images?.jpg?.largeImageUrl) {
      return anime.images.jpg.largeImageUrl;
    }
    if (anime.images?.jpg?.imageUrl) {
      return anime.images.jpg.imageUrl;
    }
    if (anime.images?.webp?.largeImageUrl) {
      return anime.images.webp.largeImageUrl;
    }
    return 'https://via.placeholder.com/225x350?text=No+Image';
  };
  
  // Get title
  const getTitle = () => {
    if (anime.titles?.english) return anime.titles.english;
    if (anime.titles?.default) return anime.titles.default;
    if (anime.title_english) return anime.title_english;
    return anime.title || 'Unknown Anime';
  };
  
  // Get primary studio
  const getStudio = () => {
    if (!anime.studios || anime.studios.length === 0) return null;
    const studio = anime.studios[0];
    return typeof studio === 'string' ? studio : studio.name;
  };
  
  // Get genres
  const getGenres = () => {
    if (!anime.genres || anime.genres.length === 0) return [];
    return anime.genres.map(genre => 
      typeof genre === 'string' ? genre : genre.name
    );
  };
  
  // Get broadcast info
  const getBroadcastInfo = () => {
    if (!anime.broadcast) return null;
    const { day, time, timezone } = anime.broadcast;
    if (!day || !time) return null;
    return `${day} ${time} ${timezone || ''}`;
  };
  
  // Format status
  const getStatus = () => {
    if (!anime.status) return null;
    if (anime.status === 'Currently Airing') return 'Airing';
    if (anime.status === 'Not yet aired') return 'Upcoming';
    if (anime.status === 'Finished Airing') return 'Completed';
    return anime.status;
  };
  
  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
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
    <Card>
      <StyledLink to={`/anime/${animeId}`}>
        <ImageContainer>
          <Image src={getImageUrl()} alt={getTitle()} loading="lazy" />
          {isAuthenticated && (
            <WatchlistButton 
              title="Add to watchlist"
              onClick={handleWatchlistClick}
            >
              <Bookmark size={16} />
            </WatchlistButton>
          )}
        </ImageContainer>
        
        <CardContent>
          <Title>{getTitle()}</Title>
          
          <StatusRow>
            {getStatus() && (
              <StatusBadge status={getStatus()}>
                {getStatus()}
              </StatusBadge>
            )}
            
            {anime.rating && (
              <RatingInfo>{anime.rating.split(' - ')[0]}</RatingInfo>
            )}
            
            {anime.score && (
              <ScoreInfo>
                <Star size={12} />
                {anime.score.toFixed(1)}
              </ScoreInfo>
            )}
          </StatusRow>
          
          {anime.duration && (
            <InfoItem>
              <Clock size={14} />
              {anime.duration}
              {getBroadcastInfo() && ` | ${getBroadcastInfo()}`}
            </InfoItem>
          )}
          
          {getStudio() && (
            <InfoItem>
              <Tv size={14} />
              Studio: {getStudio()}
            </InfoItem>
          )}
          
          <MetaRow>
            {anime.rank && (
              <span>
                Rank #{anime.rank}
              </span>
            )}
            {anime.members && (
              <span>
                <Users size={14} />
                {(anime.members / 1000).toFixed(1)}k members
              </span>
            )}
          </MetaRow>
          
          <GenreList>
            {getGenres().slice(0, 2).map((genre, index) => (
              <GenreBadge key={index}>
                {genre}
              </GenreBadge>
            ))}
          </GenreList>
        </CardContent>
      </StyledLink>
      
      {watchlistModalOpen && (
        <WatchlistModal
          anime={anime}
          isOpen={watchlistModalOpen}
          onClose={() => setWatchlistModalOpen(false)}
          currentStatus={animeStatus}
        />
      )}
    </Card>
  );
};

export default ScheduleAnimeCard; 