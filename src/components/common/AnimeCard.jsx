import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { Clock, Star, Calendar, Award, Users, Tv, ThumbsUp, Bookmark, X } from 'lucide-react';
import { useState } from 'react';
import { watchlistAPI } from '../../services/api';
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

const tilt = keyframes`
  0% {
    transform: perspective(1000px) rotateY(0deg);
  }
  100% {
    transform: perspective(1000px) rotateY(3deg);
  }
`;

const Card = styled.div`
  width: 100%;
  background-color: var(--cardBackground);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1);
  position: relative;
  
  &:hover {
    animation: ${tilt} 5s infinite alternate ease-in-out;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, 
      rgba(var(--primary-rgb), 0.05) 0%, 
      rgba(var(--secondary-rgb), 0.1) 100%
    );
    opacity: 0;
    transition: opacity 0.5s ease;
    z-index: 1;
    pointer-events: none;
  }
  
  &:hover::before {
    opacity: 1;
  }
`;

const CardLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  position: relative;
  z-index: 2;
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
  transition: transform 0.7s cubic-bezier(0.19, 1, 0.22, 1);
  filter: brightness(0.95);
  
  ${Card}:hover & {
    transform: scale(1.1);
    filter: brightness(1.1) contrast(1.05);
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

const CardContent = styled.div`
  padding: 1.2rem;
  position: relative;
  background: rgba(var(--cardBackground-rgb), 0.95);
  backdrop-filter: blur(5px);
  z-index: 3;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0;
    width: 0;
    height: 3px;
    background: var(--gradientPrimary);
    transition: width 0.4s ease;
  }
  
  ${Card}:hover &::before {
    width: 100%;
  }
`;

const Title = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 0.8rem;
  color: var(--textPrimary);
  font-weight: 700;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  line-height: 1.4;
  height: auto;
  max-height: 3.1rem;
  transition: all 0.3s ease;
  background: var(--textPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  
  ${Card}:hover & {
    background: var(--gradientText);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    color: transparent;
  }
`;

const MetaInfo = styled.div`
  display: flex;
  align-items: center;
  color: var(--textSecondary);
  font-size: 0.85rem;
  margin-bottom: 0.8rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const MetaItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  background-color: rgba(var(--backgroundLight-rgb), 0.5);
  border-radius: 6px;
  transition: all 0.3s ease;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  
  ${Card}:hover & {
    background-color: rgba(var(--secondary-rgb), 0.1);
    transform: translateY(-2px);
  }
  
  svg {
    margin-right: 0.35rem;
    width: 14px;
    height: 14px;
    color: var(--secondary);
    transition: transform 0.3s ease;
    flex-shrink: 0;
  }
`;

const MetaRows = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const GenreBadge = styled.span`
  background: ${props => props.index === 0 
    ? 'var(--gradientPrimary)' 
    : 'var(--gradientSecondary)'};
  color: white;
  padding: 0.3rem 0.6rem;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 500;
  margin-right: 0.5rem;
  margin-bottom: 0.5rem;
  display: inline-block;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  ${Card}:hover & {
    transform: translateY(-3px);
    box-shadow: 0 5px 10px rgba(0, 0, 0, 0.2);
  }
`;

const GenreContainer = styled.div`
  margin-top: 0.8rem;
  display: flex;
  flex-wrap: wrap;
`;

const ScoreBadge = styled.div`
  position: absolute;
  top: 0.8rem;
  right: 0.8rem;
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
  transition: transform 0.3s ease;
  
  svg {
    color: white;
    margin-right: 0.4rem;
    width: 16px;
    height: 16px;
  }
  
  ${Card}:hover & {
    transform: translateY(-5px) scale(1.05);
  }
`;

const StatusBadge = styled.div`
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
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
  transition: transform 0.3s ease;
  
  ${Card}:hover & {
    transform: translateY(-5px) scale(1.05);
  }
`;

const AdditionalInfo = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 0.5rem;
  padding-top: 0.5rem;
  border-top: 1px dashed rgba(var(--borderColor-rgb), 0.5);
`;

const InfoValue = styled.span`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  color: var(--textSecondary);
  margin-right: 0.8rem;
  
  svg {
    margin-right: 0.35rem;
    width: 14px;
    height: 14px;
    color: var(--accent);
  }
  
  ${Card}:hover & {
    color: var(--textPrimary);
  }
`;

const WatchlistButton = styled.button`
  position: absolute;
  top: 0.8rem;
  left: 0.8rem;
  background: rgba(var(--cardBackground-rgb), 0.8);
  backdrop-filter: blur(4px);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  cursor: pointer;
  transition: all 0.3s ease;
  color: var(--textSecondary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.15);
  
  &:hover {
    background: var(--primary);
    color: white;
    transform: translateY(-2px);
  }
`;

const AnimeCard = ({ anime }) => {
  const [watchlistModalOpen, setWatchlistModalOpen] = useState(false);
  const [animeStatus, setAnimeStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const { isAuthenticated } = useAuth();  
  const { showToast } = useToast();
  // Extract anime data based on API response format
  // Handle both schedule endpoint and anime detail endpoint formats
  const {
    _id,
    malId, // This is used for routing to the detail page
    mal_id, // Alternative ID from recommendations endpoint
    titles,
    title_english,
    title, // Fallback if titles not available
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

  // Get the correct image URL based on available format
  const getImageUrl = () => {
    // For schedule endpoint format
    if (images?.jpg?.imageUrl || images?.jpg?.image_url) {
      return images.jpg.imageUrl || images.jpg.image_url;
    }
    // For anime detail endpoint format
    if (images?.jpg?.large_image_url) {
      return images.jpg.large_image_url;
    }
    // Fallback
    return 'https://via.placeholder.com/225x350?text=No+Image';
  };

  // Get the correct title based on available format
  const getTitle = () => {
    // For schedule endpoint format
    if (titles?.default) {
      return titles.default;
    }
    // For anime detail endpoint format
    if (title_english) {
      return title_english;
    }
    // Fallback to any available title
    return title || 'Untitled Anime';
  };

  // Format time from broadcast data
  const formatTime = (time, timezone) => {
    if (!time) return 'TBA';
    return `${time} ${timezone ? `(${timezone.split('/')[1] || timezone})` : ''}`;
  };
  
  // Format season and year
  const formatSeason = (season, year) => {
    if (!season && !year) return null;
    return `${season ? season.charAt(0).toUpperCase() + season.slice(1) : ''} ${year || ''}`.trim();
  };
  
  // Get anime ID for routing (malId is preferred since it's consistent across endpoints)
  const animeId = malId || mal_id || _id;
  
  // Get display title
  const displayTitle = getTitle();
  
  // Get image URL
  const imageUrl = getImageUrl();
  
  // Get anime score (might be null for upcoming anime)
  const animeScore = score || null;
  
  // Format duration
  const formatDuration = (duration) => {
    if (!duration) return null;
    return duration.includes('hr') || duration.includes('min') ? duration : `${duration} min`;
  };
  
  // Get season info
  const seasonInfo = formatSeason(season, year);
  
  // Format episode count
  const episodeInfo = episodes ? `${episodes} eps` : null;

  const handleWatchlistClick = async (e) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    
    if (!isAuthenticated) return;
    
    setLoading(true);
    try {
      // Use the correct ID property depending on what's available
      const animeId = anime.mal_id || anime.id;
      const response = await watchlistAPI.getAnimeStatus(animeId);
      
      if (response && response.success) {
        setAnimeStatus(response.data);
        setWatchlistModalOpen(true);
      } else {
        // Show error toast
        showToast({
          type: 'error',
          message: 'Failed to fetch anime status'
        });
      }
    } catch (error) {
      console.error('Error fetching anime status:', error);
      // Show error toast
      showToast({
        type: 'error',
        message: 'Error loading anime status. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardLink to={`/anime/${animeId}`}>
        <ImageContainer>
          <Image src={imageUrl} alt={displayTitle} loading="lazy" />
          <ShimmerOverlay />
          {isAuthenticated && (
            <WatchlistButton 
              title="Add to watchlist"
              onClick={handleWatchlistClick}
            >
              <Bookmark size={16} />
            </WatchlistButton>
          )}
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
        </ImageContainer>
        
        <CardContent>
          <Title>{displayTitle}</Title>
          
          <MetaRows>
            <MetaInfo>
              <MetaItem>
                <Tv size={14} />
                {type}
              </MetaItem>
              
              {episodeInfo && (
                <MetaItem>
                  <Award size={14} />
                  {episodeInfo}
                </MetaItem>
              )}
              
              {broadcast?.time && (
                <MetaItem>
                  <Clock size={14} />
                  {formatTime(broadcast.time, broadcast.timezone)}
                </MetaItem>
              )}
            </MetaInfo>
            
            <MetaInfo>
              {seasonInfo && (
                <MetaItem>
                  <Calendar size={14} />
                  {seasonInfo}
                </MetaItem>
              )}
              
              {formatDuration(duration) && (
                <MetaItem>
                  <Clock size={14} />
                  {formatDuration(duration)}
                </MetaItem>
              )}
            </MetaInfo>
          </MetaRows>
          
          {genres && genres.length > 0 && (
            <GenreContainer>
              {genres.slice(0, 3).map((genre, index) => (
                <GenreBadge key={index} index={index}>
                  {typeof genre === 'object' ? genre.name : genre}
                </GenreBadge>
              ))}
            </GenreContainer>
          )}
          
          {(scored_by || popularity) && (
            <AdditionalInfo>
              {scored_by && (
                <InfoValue>
                  <ThumbsUp size={14} />
                  {new Intl.NumberFormat().format(scored_by)}
                </InfoValue>
              )}
              
              {popularity && (
                <InfoValue>
                  <Users size={14} />
                  #{popularity}
                </InfoValue>
              )}
            </AdditionalInfo>
          )}
        </CardContent>
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
