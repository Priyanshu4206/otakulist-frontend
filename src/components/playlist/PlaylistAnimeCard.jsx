import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { ExternalLink, Trash2, Star } from 'lucide-react';

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

const Card = styled.div`
  width: 100%;
  max-width: 300px;
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
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 50%;
    background: linear-gradient(to top, rgba(0,0,0,0.7), transparent);
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
`;

const ExternalButton = styled(ActionButton)`
  &:hover {
    background: var(--secondary);
  }
`;

const DeleteButton = styled(ActionButton)`
  &:hover {
    background: var(--error);
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

const PlaylistAnimeCard = ({ anime, isOwner, onOpenMAL, onDeleteAnime }) => {
  // Extract anime data with proper fallbacks
  const {
    id,
    malId,
    mal_id,
    titles,
    title_english,
    title,
    imageUrl: animeImageUrl,
    images,
    score,
    scored
  } = anime;
  
  // Get the anime ID for linking
  const animeId = id || malId || mal_id;
  // Get the appropriate image URL
  const getImageUrl = () => {
    if (animeImageUrl) return animeImageUrl;
    if (!images) return '';
    // Handle different API response structures
    if (images.jpg) return  images.jpg.largeImageUrl || images.jpg.smallImageUrl ||images.jpg.large_image_url || images.jpg.image_url || images.jpg.imageUrl ;
    if (images.webp) return images.webp.largeImageUrl || images.webp.smallImageUrl || images.webp.large_image_url || images.webp.image_url || images.webp.imageUrl;
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
  
  // The score to display (handle different API response formats)
  const animeScore = score || scored;
  
  // The display title
  const displayTitle = getTitle();
  
  // The image URL
  const displayImageUrl = getImageUrl();
  
  return (
    <Card>
      <CardLink to={`/anime/${animeId}`}>
        <ImageContainer>
          <Image src={displayImageUrl} alt={displayTitle} loading="lazy" />
          <ShimmerOverlay />
          
          {animeScore && (
            <ScoreBadge>
              <Star size={16} strokeWidth={2.5} />
              {typeof animeScore === 'number' ? animeScore.toFixed(1) : animeScore}
            </ScoreBadge>
          )}
          
          <Title>{displayTitle}</Title>
          
          <ActionButtonsContainer>
            <ExternalButton
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenMAL(animeId);
              }}
              title="View on MyAnimeList"
            >
              <ExternalLink size={16} />
            </ExternalButton>
            
            {isOwner && (
              <DeleteButton
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onDeleteAnime(animeId);
                }}
                title="Remove from playlist"
              >
                <Trash2 size={16} />
              </DeleteButton>
            )}
          </ActionButtonsContainer>
        </ImageContainer>
      </CardLink>
    </Card>
  );
};

export default PlaylistAnimeCard; 