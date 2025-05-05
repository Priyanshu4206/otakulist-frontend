import { useState } from 'react';
import styled from 'styled-components';
import { Star, Calendar, Clock, Tv, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import CustomSelect from '../common/CustomSelect';

const ListItem = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background-color: var(--cardBackground);
  border-bottom: 1px solid var(--borderColor);
  transition: all 0.2s ease;
  position: relative; /* Create a stacking context */
  
  &:last-child {
    border-bottom: none;
  }
  
  @media (max-width: 768px) {
    flex-wrap: wrap;
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 80px;
  min-width: 80px;
  height: 120px;
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  
  @media (max-width: 480px) {
    width: 70px;
    min-width: 70px;
    height: 100px;
  }
`;

const AnimeImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
  
  ${ListItem}:hover & {
    transform: scale(1.03);
  }
`;

const PlaceholderImage = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--backgroundLight);
  color: var(--textSecondary);
  font-size: 0.7rem;
  text-align: center;
  padding: 0.25rem;
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  min-width: 0; /* For text truncation to work */
`;

const Title = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  margin: 0;
  color: var(--textPrimary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  ${ListItem}:hover & {
    color: var(--primary);
  }
  
  @media (max-width: 480px) {
    font-size: 0.95rem;
  }
`;

const MetadataSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
`;

const MetadataItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.4rem;
  font-size: 0.8rem;
  color: var(--textSecondary);
  
  svg {
    color: var(--primary);
    min-width: 14px;
  }
`;

const GenreTag = styled.span`
  background-color: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  font-size: 0.7rem;
  padding: 0.15rem 0.4rem;
  border-radius: 4px;
  display: inline-block;
  margin-right: 0.4rem;
`;

const GenresSection = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.25rem;
  margin-top: 0.2rem;
`;

const ActionsSection = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: auto;
  
  @media (max-width: 768px) {
    width: 100%;
    margin-top: 0.5rem;
    justify-content: flex-end;
  }
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  border: 1px solid var(--borderColor);
  background-color: var(--cardBackground);
  color: var(--textSecondary);
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    color: var(--danger);
    border-color: var(--danger);
    background-color: rgba(var(--danger-rgb), 0.05);
  }
`;

const StatusSelectWrapper = styled.div`
  width: 140px;
  position: relative; /* Ensures proper stacking context for dropdown */
  z-index: 5; /* Gives enough z-index to work with dropdown */
  
  @media (max-width: 480px) {
    width: 120px;
  }
`;

const statusOptions = [
  { value: 'watching', label: 'Watching' },
  { value: 'completed', label: 'Completed' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'dropped', label: 'Dropped' },
  { value: 'plan_to_watch', label: 'Plan to Watch' },
];

const WatchlistAnimeItem = ({ anime, onStatusChange, onDelete }) => {
  const [changing, setChanging] = useState(false);
  
  // Extract anime data for cleaner code
  const animeData = anime.anime || anime;
  
  const getImageUrl = () => {
    if (!animeData || !animeData.images) return null;
    
    if (animeData.images?.jpg?.largeImageUrl) return animeData.images.jpg.largeImageUrl;
    if (animeData.images?.jpg?.imageUrl) return animeData.images.jpg.imageUrl;
    if (animeData.images?.webp?.largeImageUrl) return animeData.images.webp.largeImageUrl;
    if (animeData.images?.webp?.imageUrl) return animeData.images.webp.imageUrl;
    
    return null;
  };
  
  const getTitle = () => {
    if (!animeData) return "Unknown Anime";
    
    if (animeData.titles?.english) return animeData.titles.english;
    if (animeData.titles?.default) return animeData.titles.default;
    if (animeData.title) return animeData.title;
    
    return "Unknown Anime";
  };
  
  const getStudio = () => {
    if (!animeData || !animeData.studios || animeData.studios.length === 0) return null;
    
    const studio = animeData.studios[0];
    return typeof studio === 'string' ? studio : studio.name;
  };
  
  const getSeasonYear = () => {
    const season = animeData?.season ? animeData.season.charAt(0).toUpperCase() + animeData.season.slice(1) : '';
    const year = animeData?.year || '';
    
    if (season && year) return `${season} ${year}`;
    if (season) return season;
    if (year) return year;
    
    return null;
  };
  
  const getBroadcastInfo = () => {
    if (!animeData || !animeData.broadcast) return null;
    
    const { day, time } = animeData.broadcast;
    if (!day || !time) return null;
    
    return `${day} at ${time}`;
  };
  
  const getGenres = () => {
    if (!animeData || !animeData.genres || animeData.genres.length === 0) return [];
    
    return animeData.genres.map(genre => 
      typeof genre === 'string' ? genre : genre.name
    );
  };
  
  // Format progress display
  const formatProgress = () => {
    const progress = anime.progress || 0;
    const episodes = animeData.episodes;
    
    if (episodes) {
      return `${progress} / ${episodes}`;
    }
    
    return `${progress} eps`;
  };
  
  const handleStatusChange = async (value) => {
    setChanging(true);
    try {
      await onStatusChange(anime, value);
    } catch (error) {
      console.error('Error updating status:', error);
    } finally {
      setChanging(false);
    }
  };
  
  return (
    <ListItem 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }}
      layout
    >
      <ImageContainer>
        {getImageUrl() ? (
          <AnimeImage src={getImageUrl()} alt={getTitle()} loading="lazy" />
        ) : (
          <PlaceholderImage>No Image</PlaceholderImage>
        )}
      </ImageContainer>
      
      <Content>
        <Title title={getTitle()}>{getTitle()}</Title>
        
        <MetadataSection>
          {animeData.score && (
            <MetadataItem>
              <Star size={14} />
              {animeData.score.toFixed(1)}
            </MetadataItem>
          )}
          
          {getSeasonYear() && (
            <MetadataItem>
              <Calendar size={14} />
              {getSeasonYear()}
            </MetadataItem>
          )}
          
          {getBroadcastInfo() && (
            <MetadataItem>
              <Clock size={14} />
              {getBroadcastInfo()}
            </MetadataItem>
          )}
          
          {getStudio() && (
            <MetadataItem>
              <Tv size={14} />
              {getStudio()}
            </MetadataItem>
          )}
          
          {anime.status === 'watching' && (
            <MetadataItem>
              {formatProgress()}
            </MetadataItem>
          )}
        </MetadataSection>
        
        {getGenres().length > 0 && (
          <GenresSection>
            {getGenres().slice(0, 3).map((genre, index) => (
              <GenreTag key={index}>{genre}</GenreTag>
            ))}
            {getGenres().length > 3 && <GenreTag>+{getGenres().length - 3}</GenreTag>}
          </GenresSection>
        )}
      </Content>
      
      <ActionsSection>
          <CustomSelect
            options={statusOptions}
            value={anime.status}
            onChange={handleStatusChange}
            placeholder="Status"
            variant="filled"
            isLoading={changing}
          />
        
        <DeleteButton onClick={() => onDelete(anime)} title="Remove from watchlist">
          <Trash2 size={16} />
        </DeleteButton>
      </ActionsSection>
    </ListItem>
  );
};

export default WatchlistAnimeItem; 