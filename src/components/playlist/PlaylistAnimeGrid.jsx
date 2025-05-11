import React from 'react';
import styled from 'styled-components';
import { BookOpen } from 'lucide-react';
import Card from '../common/Card';
import PlaylistAnimeCard from './PlaylistAnimeCard';

const ContentCard = styled(Card)`
  margin: 0rem 1rem 0;
`;

const AnimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  padding: 2rem;
    
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }
`;

const EmptyMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
  
  svg {
    color: var(--textSecondary);
    margin-bottom: 1rem;
    opacity: 0.7;
  }
  
  h3 {
    font-size: 1.2rem;
    color: var(--textPrimary);
    margin-bottom: 0.5rem;
  }
  
  p {
    color: var(--textSecondary);
    max-width: 500px;
  }
`;

const PlaylistAnimeGrid = ({ playlist, isOwner, onOpenMAL, onDeleteAnime }) => {
  // Handle different API response formats
  const animeItems = playlist.items || playlist.animes || [];
  const hasAnime = animeItems.length > 0 || (playlist.animeIds && playlist.animeIds.length > 0);

  return (
    <ContentCard
      title={
        playlist.animeCount > 0 
          ? `Anime in this playlist (${playlist.animeCount})` 
          : 'No anime in this playlist yet'
      }
      icon={<BookOpen size={20} />}
    >
      {hasAnime ? (
        <AnimeGrid>
          {animeItems.map((item) => (
            <PlaylistAnimeCard 
              key={item._id || item.anime?.malId || (item.anime && item.anime.id)}
              anime={item.anime || item}
              isOwner={isOwner}
              onOpenMAL={onOpenMAL}
              onDeleteAnime={onDeleteAnime}
            />
          ))}
        </AnimeGrid>
      ) : (
        <EmptyMessage>
          <BookOpen size={40} />
          <h3>No Anime in this Playlist</h3>
          <p>This playlist doesn't have any anime yet. Add some anime to get started!</p>
        </EmptyMessage>
      )}
    </ContentCard>
  );
};

export default PlaylistAnimeGrid; 