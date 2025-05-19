import { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { Link, useNavigate } from 'react-router-dom';
import { Star, Bookmark, BookOpen, ExternalLink, Tv } from 'lucide-react';
import useAuth from '../../hooks/useAuth';
import { watchlistAPI } from '../../services/modules';
import WatchlistModal from '../common/WatchlistModal';
import PlaylistAddModal from '../common/PlaylistAddModal';
import useToast from '../../hooks/useToast';

// Animations
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

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

// Styled Components
const Card = styled.div`
  width: 100%;
  background-color: var(--cardBackground);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  position: relative;
  animation: ${fadeIn} 0.6s ease-out;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(var(--primary-rgb), 0.2);
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 140%; /* Aspect ratio */
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
  filter: brightness(0.9);
  
  ${Card}:hover & {
    transform: scale(1.05);
    filter: brightness(1);
  }
`;

const ShimmerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.15) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 3s infinite linear;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
  
  ${Card}:hover & {
    opacity: 1;
  }
`;

const Title = styled.h3`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1rem 0.75rem 1.5rem 0.75rem;
  font-size: 0.9rem;
  font-weight: 600;
  color: white;
  margin: 0;
  z-index: 2;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  min-height: 5.5rem;
  max-height: 5.5rem;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -2rem;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.9), rgba(0,0,0,0.6), rgba(0,0,0,0.3), transparent);
    z-index: -1;
  }
`;

const ActionButtonsContainer = styled.div`
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
  display: flex;
  gap: 0.5rem;
  z-index: 10;
`;

const ActionButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(var(--cardBackground-rgb), 0.85);
  backdrop-filter: blur(4px);
  border: none;
  color: var(--textSecondary);
  cursor: pointer;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-3px);
  }
  
  &:active {
    transform: translateY(-1px);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const WatchlistButton = styled(ActionButton)`
  &:hover {
    background: var(--accent);
  }
`;

const PlaylistButton = styled(ActionButton)`
  &:hover {
    background: var(--secondary);
  }
`;

const ExternalButton = styled(ActionButton)`
  &:hover {
    background: var(--info);
  }
`;

const ScoreBadge = styled.div`
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accentLight) 100%);
  color: white;
  padding: 0.4rem 0.6rem;
  border-radius: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  z-index: 5;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
  
  svg {
    color: white;
    margin-right: 0.4rem;
    width: 16px;
    height: 16px;
  }
`;

const StatusBadge = styled.div`
  position: absolute;
  bottom: 4.5rem; /* Position above the title */
  right: 0.8rem;
  background: ${props => {
    switch (props.status?.toLowerCase()) {
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
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  z-index: 5;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.2);
`;

const RecommendationCard = ({ anime }) => {
  const { isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const [watchlistOpen, setWatchlistOpen] = useState(false);
  const [playlistModalOpen, setPlaylistModalOpen] = useState(false);
  const [animeWatchStatus, setAnimeWatchStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Extract anime data with proper fallbacks
  const {
    id,
    malId,
    mal_id,
    titles,
    title_english,
    title,
    images,
    score,
    scored,
    status,
    url,
  } = anime;

  // Get the anime ID for linking
  const animeId = id || malId || mal_id;
  // Get the appropriate image URL
  const getImageUrl = () => {
    if (!images) return '';

    // Handle different API response structures
    if (images.jpg) return images.jpg.largeImageUrl || images.jpg.large_image_url || images.jpg.imageUrl || images.jpg.image_url;
    if (images.webp) return images.webp.largeImageUrl || images.webp.large_image_url || images.webp.imageUrl || images.webp.image_url;
    if (images.image_url) return images.image_url;
    if (images.large) return images.large;
    if (images.medium) return images.medium;

    // Fallback if we can't find a good image
    return '';
  };

  // Get the appropriate title with proper fallback
  const getTitle = () => {
    if (titles) {
      return titles.english || titles.romaji || titles.native || titles.default;
    }

    return title_english || title || 'Unknown Anime';
  };

  // Format the duration
  const formatDuration = (duration) => {
    if (!duration) return 'Unknown';

    // If duration is already in minutes (e.g. "24 min per ep")
    if (typeof duration === 'string' && duration.includes('min')) {
      return duration;
    }

    // If duration is a number (assumed to be minutes)
    if (typeof duration === 'number' || !isNaN(parseInt(duration))) {
      const mins = parseInt(duration);
      return `${mins} min per ep`;
    }

    return duration;
  };

  // Format the season and year
  const formatSeason = (season, year) => {
    if (!season && !year) return 'Unknown';

    if (season && year) {
      return `${season.charAt(0).toUpperCase() + season.slice(1)} ${year}`;
    }

    return season ? `${season.charAt(0).toUpperCase() + season.slice(1)}` : `${year}`;
  };

  // Handle watchlist button click
  const handleWatchlistClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast({
        type: 'warning',
        message: 'You need to be logged in to add to your watchlist'
      });
      return;
    }

    setLoading(true);

    try {
      const response = await watchlistAPI.getAnimeStatus(animeId);

      if (response && response.success) {
        setAnimeWatchStatus(response.data);
        setWatchlistOpen(true);
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
        message: 'An error occurred while checking anime status'
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePlaylistClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isAuthenticated) {
      showToast({
        type: 'warning',
        message: 'You need to be logged in to add to a playlist'
      });
      return;
    }

    setPlaylistModalOpen(true);
  };

  const handleExternalLink = (e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/anime/${animeId}`, { target: '_blank' });
  };

  // The score to display (handle different API response formats)
  const animeScore = score || scored;

  // The display title
  const displayTitle = getTitle();

  // The image URL
  const imageUrl = getImageUrl();

  return (
    <Card>
      <CardLink to={`/anime/${animeId}`}>
        <ImageContainer>
          <Image src={imageUrl} alt={displayTitle} loading="lazy" />
          <ShimmerOverlay />

          {animeScore && (
            <ScoreBadge>
              <Star size={16} strokeWidth={2.5} />
              {typeof animeScore === 'number' ? animeScore.toFixed(1) : animeScore}
            </ScoreBadge>
          )}

          {status && (
            <StatusBadge status={status}>
              {status.replace('Airing', 'Airing').replace('Finished Airing', 'Completed')}
            </StatusBadge>
          )}

          <Title>{displayTitle}</Title>

          <ActionButtonsContainer>
            {isAuthenticated && (
              <>
                <WatchlistButton
                  onClick={handleWatchlistClick}
                  disabled={loading}
                  title="Add to watchlist"
                >
                  <Bookmark size={16} />
                </WatchlistButton>

                <PlaylistButton
                  onClick={handlePlaylistClick}
                  title="Add to playlist"
                >
                  <BookOpen size={16} />
                </PlaylistButton>
              </>
            )}

            {url && (
              <ExternalButton
                onClick={handleExternalLink}
                title="View Anime"
              >
                <ExternalLink size={16} />
              </ExternalButton>
            )}
          </ActionButtonsContainer>
        </ImageContainer>
      </CardLink>

      {/* Watchlist Modal */}
      {watchlistOpen && (
        <WatchlistModal
          show={watchlistOpen}
          onClose={() => setWatchlistOpen(false)}
          anime={anime}
          currentStatus={animeWatchStatus}
          onStatusChange={setAnimeWatchStatus}
        />
      )}

      {/* Playlist Modal */}
      {playlistModalOpen && (
        <PlaylistAddModal
          show={playlistModalOpen}
          onClose={() => setPlaylistModalOpen(false)}
          anime={anime}
        />
      )}
    </Card>
  );
};

export default RecommendationCard; 