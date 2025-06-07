import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Clock, Star, Calendar, Award, Users, Tv, ThumbsUp, Bookmark, X } from 'lucide-react';
import { useState } from 'react';
import { watchlistAPI } from '../../services/modules';
import useAuth from '../../hooks/useAuth';
import WatchlistModal from './WatchlistModal';
import useToast from '../../hooks/useToast';

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const Card = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 3/4;
  border-radius: 16px;
  overflow: hidden;
  background: var(--cardBackground);
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  transition: box-shadow 0.3s cubic-bezier(0.23, 1, 0.32, 1), transform 0.3s cubic-bezier(0.23, 1, 0.32, 1);
  cursor: pointer;
  &:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.18);
    transform: translateY(-4px) scale(1.025);
    z-index: 2;
  }
`;

const CardLink = styled(Link)`
  display: block;
  width: 100%;
  height: 100%;
  color: inherit;
  text-decoration: none;
`;

const BgImage = styled.img`
  position: absolute;
  top: 0; left: 0; width: 100%; height: 100%;
  object-fit: cover;
  z-index: 1;
  filter: brightness(0.85) blur(0px);
  transition: filter 0.4s;
  ${Card}:hover & {
    filter: brightness(1) blur(2px);
  }
`;

const Overlay = styled.div`
  position: absolute;
  bottom: 0; left: 0; width: 100%;
  min-height: 38%;
  background: linear-gradient(0deg, rgba(20,20,30,0.92) 70%, rgba(20,20,30,0.5) 100%, rgba(20,20,30,0.0) 100%);
  color: #fff;
  z-index: 3;
  padding: 1.1rem 1rem 1rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  transition: background 0.3s, min-height 0.3s;
  pointer-events: none;
  ${Card}:hover & {
    background: linear-gradient(0deg, rgba(20,20,30,0.98) 80%, rgba(20,20,30,0.7) 100%, rgba(20,20,30,0.0) 100%);
    min-height: 55%;
  }
`;

const Title = styled.h3`
  font-size: 1.08rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: #fff;
  line-height: 1.3;
  text-shadow: 0 2px 8px rgba(0,0,0,0.25);
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  font-size: 0.92rem;
  color: #e0e0e0;
  margin-bottom: 0.3rem;
  flex-wrap: wrap;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.3rem;
  background: rgba(255,255,255,0.08);
  border-radius: 5px;
  padding: 0.18rem 0.55rem;
  font-size: 0.85em;
  svg { width: 15px; height: 15px; color: var(--accent); }
`;

const GenreList = styled.div`
  display: flex;
  gap: 0.4rem;
  flex-wrap: wrap;
  margin-top: 0.2rem;
`;

const GenreBadge = styled.span`
  background: rgba(255,255,255,0.13);
  color: #fff;
  font-size: 0.78em;
  padding: 0.18rem 0.7rem;
  border-radius: 5px;
  font-weight: 500;
  text-shadow: 0 1px 4px rgba(0,0,0,0.18);
`;

const Badge = styled.div`
  position: absolute;
  top: 0.9rem;
  right: 0.9rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accentLight) 100%);
  color: #fff;
  padding: 0.38rem 0.7rem;
  border-radius: 7px;
  font-size: 0.93em;
  font-weight: 600;
  display: flex;
  align-items: center;
  z-index: 4;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
  svg { margin-right: 0.3rem; }
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 0.9rem;
  left: 0.9rem;
  background: ${props => {
    switch ((props.status || '').toLowerCase()) {
      case 'airing':
      case 'currently airing':
        return 'linear-gradient(135deg, var(--success), var(--secondaryLight))';
      case 'finished airing':
      case 'completed':
        return 'linear-gradient(135deg, var(--primary), var(--primaryLight))';
      case 'not yet aired':
      case 'upcoming':
        return 'linear-gradient(135deg, var(--info), var(--secondary))';
      default:
        return 'linear-gradient(135deg, var(--textSecondary), var(--borderColor))';
    }
  }};
  color: #fff;
  padding: 0.28rem 0.7rem;
  border-radius: 7px;
  font-size: 0.78em;
  font-weight: 600;
  z-index: 4;
  box-shadow: 0 2px 8px rgba(0,0,0,0.18);
`;

const WatchlistButton = styled.button`
  position: absolute;
  bottom: 1rem;
  right: 1rem;
  background: rgba(255,255,255,0.13);
  border: none;
  border-radius: 50%;
  width: 38px;
  height: 38px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  cursor: pointer;
  color: #fff;
  box-shadow: 0 2px 6px rgba(0,0,0,0.13);
  transition: background 0.2s, color 0.2s, transform 0.2s;
  &:hover {
    background: var(--primary);
    color: #fff;
    transform: scale(1.08);
  }
`;

const AnimeCard = ({ anime }) => {
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [animeStatus, setAnimeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();  
  const { showToast } = useToast();
  // Extract anime data based on API response format
  const {
    _id,
    malId,
    mal_id,
    titles,
    title_english,
    title,
    images,
    score,
    scored_by,
    popularity,
    genres = [],
    type = 'TV',
    broadcast = {},
    duration,
    status,
    episodes,
    season,
    year
  } = anime;

  const getImageUrl = () => {
    if (images?.jpg?.largeImageUrl || images?.jpg?.large_image_url || images?.jpg?.imageUrl || images?.jpg?.image_url) {
      return images.jpg.largeImageUrl || images.jpg.large_image_url || images.jpg.imageUrl || images.jpg.image_url;
    }
    return 'https://via.placeholder.com/225x350?text=No+Image';
  };

  const getTitle = () => {
    if (titles?.default) {
      return titles.default;
    }
    if (title_english) {
      return title_english;
    }
    return title || 'Untitled Anime';
  };

  const formatTime = (time, timezone) => {
    if (!time) return 'TBA';
    return `${time} ${timezone ? `(${timezone.split('/')[1] || timezone})` : ''}`;
  };
  
  const formatSeason = (season, year) => {
    if (!season && !year) return null;
    return `${season ? season.charAt(0).toUpperCase() + season.slice(1) : ''} ${year || ''}`.trim();
  };
  
  const animeId = malId || mal_id || _id || null;
  const displayTitle = getTitle();
  const imageUrl = getImageUrl();
  const animeScore = score || null;
  const formatDuration = (duration) => {
    if (!duration) return null;
    return duration.includes('hr') || duration.includes('min') ? duration : `${duration} min`;
  };
  const seasonInfo = formatSeason(season, year);
  const episodeInfo = episodes ? `${episodes} eps` : null;

  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const animeId = anime.mal_id || anime.id;
      const response = await watchlistAPI.getAnimeStatus(animeId);
      if (response && response.success) {
        setAnimeStatus(response.data);
        setWatchlistModalOpen(true);
      } else {
        showToast({ type: 'error', message: 'Failed to fetch anime status' });
      }
    } catch (error) {
      console.error('Error fetching anime status:', error);
      showToast({ type: 'error', message: 'Error loading anime status. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardLink to={`/anime/${animeId}`}>
        <BgImage src={imageUrl} alt={displayTitle} loading="lazy" />
        {animeScore && (
          <Badge>
            <Star size={15} strokeWidth={2.2} />
            {typeof animeScore === 'number' ? animeScore.toFixed(1) : animeScore}
          </Badge>
        )}
        {status && (
          <StatusBadge status={status}>{status.replace('Airing', 'Airing').replace('Finished Airing', 'Completed')}</StatusBadge>
        )}
        <Overlay>
          <Title>{displayTitle}</Title>
          <MetaInfo>
            <MetaItem><Tv size={15} />{type}</MetaItem>
            {episodeInfo && <MetaItem><Award size={15} />{episodeInfo}</MetaItem>}
            {seasonInfo && <MetaItem><Calendar size={15} />{seasonInfo}</MetaItem>}
            {formatDuration(duration) && <MetaItem><Clock size={15} />{formatDuration(duration)}</MetaItem>}
          </MetaInfo>
          {genres && genres.length > 0 && (
            <GenreList>
              {genres.slice(0, 3).map((genre, idx) => (
                <GenreBadge key={idx}>{typeof genre === 'object' ? genre.name : genre}</GenreBadge>
              ))}
            </GenreList>
          )}
          <MetaInfo style={{marginTop: '0.4rem'}}>
            {scored_by && <MetaItem><ThumbsUp size={15} />{new Intl.NumberFormat().format(scored_by)}</MetaItem>}
            {popularity && <MetaItem><Users size={15} />#{popularity}</MetaItem>}
          </MetaInfo>
        </Overlay>
        {isAuthenticated && (
          <WatchlistButton title="Add to watchlist" onClick={handleWatchlistClick}>
            <Bookmark size={17} />
          </WatchlistButton>
        )}
      </CardLink>
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

export default AnimeCard; 
