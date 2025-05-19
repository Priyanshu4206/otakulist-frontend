import { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { Star, Users, Clock, Tv, Bookmark, BookOpen } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { watchlistAPI } from '../../services/modules';
import WatchlistModal from '../common/WatchlistModal';
import PlaylistAddModal from '../common/PlaylistAddModal';
import useToast from '../../hooks/useToast';

const Card = styled.div`
  position: relative;
  background-color: var(--cardBackground);
  border-radius: 14px;
  overflow: hidden;
  box-shadow: 0 5px 18px rgba(0, 0, 0, 0.10);
  display: flex;
  flex-direction: row;
  align-items: stretch;
  min-height: 275px;
  width: 500px;
  transition: box-shadow 0.3s, transform 0.2s;
  &:hover {
    box-shadow: 0 10px 32px rgba(0,0,0,0.13);
    transform: translateY(-2px) scale(1.01);
  }
  @media (max-width: 600px) {
    min-height: 0;
    width: 100%;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.7rem;
    box-shadow: 0 2px 8px rgba(0,0,0,0.08);
    border-radius: 8px;
  }
`;

const ImageContainer = styled.div`
  flex: 0 0 160px;
  height: 100%;
  overflow: hidden;
  position: relative;
  background: var(--backgroundLight);
  @media (max-width: 600px) {
    display: flex;
    border-radius: 6px;
    margin-left: 0.5rem;
    margin-right: 0.7rem;
  }
`;

const Image = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const CardContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 1.2rem 1.5rem 1.2rem 1.2rem;
  position: relative;
  min-width: 0;
  height: 100%;
  
  @media (max-width: 600px) {
    padding: 0.5rem 0.5rem 0.5rem 0;
    gap: 0.2rem;
    justify-content: space-evenly;
  }
`;

const TopRow = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  
  @media (max-width: 600px) {
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.1rem;
  }
`;

const Title = styled.h3`
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--textPrimary);
  margin: 0 0 0.3rem 0;
  line-height: 1.3;
  flex: 1;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: wrap;
  overflow: hidden;
  @media (max-width: 600px) {
    font-size: 0.98rem;
    margin: 0 0 0.1rem 0;
    white-space: normal;
    text-overflow: unset;
    overflow: visible;
    line-height: 1.15;
    font-weight: 600;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  @media (max-width: 600px) {
    gap: 0.3rem;
  }
`;

const IconButton = styled.button`
  background: var(--backgroundLight);
  border: 1px solid var(--borderColor);
  color: var(--primary);
  border-radius: 50%;
  width: 34px;
  height: 34px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: background 0.2s, color 0.2s, transform 0.2s;
  &:hover {
    background: var(--primary);
    color: #fff;
    transform: translateY(-2px) scale(1.08);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
  @media (max-width: 600px) {
    width: 28px;
    height: 28px;
    svg { width: 16px; height: 16px; }
  }
`;

const StatusRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 0.3rem;
  @media (max-width: 600px) {
    gap: 0.5rem;
    margin-bottom: 0.1rem;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.7rem;
  border-radius: 30px;
  font-size: 0.82rem;
  font-weight: 600;
  color: white;
  background: ${props => {
    switch ((props.status || '').toLowerCase()) {
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
  @media (max-width: 600px) {
    font-size: 0.7rem;
    padding: 0.13rem 0.5rem;
  }
`;

const InfoCol = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 0.93rem;
  color: var(--textSecondary);
  margin-bottom: 0.2rem;
  @media (max-width: 600px) {
    gap: 0.5rem;
    font-size: 0.78rem;
    margin-bottom: 0.1rem;
  }
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  @media (max-width: 600px) {
    gap: 0.18rem;
    font-size: 0.78rem;
    svg { width: 14px; height: 14px; }
  }
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 1.2rem;
  font-size: 0.93rem;
  color: var(--textSecondary);
  margin-bottom: 0.2rem;
  @media (max-width: 600px) {
    gap: 0.5rem;
    font-size: 0.78rem;
    margin-bottom: 0.1rem;
  }
`;

const GenreList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;

  @media (max-width: 600px) {
    gap: 0.2rem;
    margin-top: 0.1rem;
  }
`;

const GenreBadge = styled.span`
  font-size: 0.8rem;
  padding: 0.13rem 0.7rem;
  background: rgba(var(--primaryLight-rgb), 0.13);
  color: var(--primary);
  border-radius: 30px;
  @media (max-width: 600px) {
    font-size: 0.7rem;
    padding: 0.08rem 0.4rem;
  }
`;

const HideOnMobile = styled.div`
  @media (max-width: 600px) {
    display: none !important;
  }
`;

const ScheduleAnimeCard = ({ anime }) => {
  const { isAuthenticated } = useAuth();
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [animeStatus, setAnimeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { showToast } = useToast();
  const navigate = useNavigate();

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
    
    if (!isAuthenticated) {
      showToast({
        type: 'warning',
        message: 'You need to be logged in to add anime to watchlist'
      });
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await watchlistAPI.getAnimeStatus(anime.malId);
      
      if (response && response.success) {
        setAnimeStatus(response.data);
        setWatchlistModalOpen(true);
      } else {
        showToast({
          type: 'error',
          message: response?.message || 'Failed to get anime status'
        });
      }
    } catch (error) {
      console.error('Error getting anime status:', error);
      showToast({
        type: 'error',
        message: 'An error occurred. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Card onClick={() => {
      navigate(`/anime/${anime.malId || anime._id}`);
    }}>
      <ImageContainer>
        <Image src={getImageUrl()} alt={getTitle()} loading="lazy" />
      </ImageContainer>
      <CardContent>
        <TopRow>
          <Title>{getTitle()}</Title>
          {isAuthenticated && (
            <ActionButtons>
              <IconButton 
                onClick={handleWatchlistClick}
                disabled={loading}
                title="Add to Watchlist"
              >
                <Bookmark size={18} />
              </IconButton>
              <IconButton
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  setPlaylistModalOpen(true);
                }}
                title="Add to Playlist"
              >
                <BookOpen size={18} />
              </IconButton>
            </ActionButtons>
          )}
        </TopRow>
        <StatusRow>
          {getStatus() && (
            <StatusBadge status={getStatus()}>{getStatus()}</StatusBadge>
          )}
          {anime.score && (
            <InfoItem><Star size={15} />{anime.score.toFixed(1)}</InfoItem>
          )}
          {anime.rating && (
            <InfoItem className="hide-on-mobile">{anime.rating.split(' - ')[0]}</InfoItem>
          )}
        </StatusRow>
        <InfoCol>
          {getBroadcastInfo() && <InfoItem><Clock size={15} />{getBroadcastInfo()}</InfoItem>}
          {getStudio() && (
            <InfoItem className="hide-on-mobile"><Tv size={15} />Studio: {getStudio()}</InfoItem>
          )}
        </InfoCol>
        <MetaRow className="hide-on-mobile">
          {anime.rank && <InfoItem>Rank #{anime.rank}</InfoItem>}
          {anime.members && (
            <InfoItem><Users size={15} />{(anime.members / 1000).toFixed(1)}k members</InfoItem>
          )}
        </MetaRow>
        <GenreList className="hide-on-mobile">
          {getGenres().slice(0, 3).map((genre, index) => (
            <GenreBadge key={index}>{genre}</GenreBadge>
          ))}
        </GenreList>
      </CardContent>
      {watchlistModalOpen && (
        <WatchlistModal
          show={watchlistModalOpen}
          onClose={() => setWatchlistModalOpen(false)}
          anime={anime}
          currentStatus={animeStatus}
          onStatusChange={setAnimeStatus}
          isScheduleAnime={true}
        />
      )}
      {playlistModalOpen && (
        <PlaylistAddModal
          show={playlistModalOpen}
          onClose={() => setPlaylistModalOpen(false)}
          anime={anime}
          isScheduleAnime={true}
        />
      )}
    </Card>
  );
};

export default ScheduleAnimeCard; 