import React, { useState, useEffect, memo } from 'react';
import styled from 'styled-components';
import { List } from 'lucide-react';
import GenreButton from './GenreButton';
import PlaylistAnimeCard from '../playlist/PlaylistAnimeCard';
import ShimmerLoader from '../common/ShimmerLoader';
import { genreAPI, exploreAPI } from '../../services/modules';

const Section = styled.section`
  margin-bottom: 3rem;
  position: relative;
`;

const SectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const SectionTitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  margin-bottom: 2rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 60px;
    height: 3px;
    background: var(--gradientPrimary);
    border-radius: 2px;
  }
  
  svg {
    color: var(--primary);
  }
`;

const SectionSubtitle = styled.p`
  font-size: 0.95rem;
  color: var(--textSecondary);
  margin-top: -0.5rem;
  margin-bottom: 1.5rem;
`;

const GenreContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    flex-wrap: nowrap;
    overflow-x: auto;
    padding-bottom: 0.5rem;
    
    /* Scrollbar styling */
    &::-webkit-scrollbar {
      height: 4px;
      background: rgba(60, 60, 60, 0.1);
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: var(--primaryLight);
      border-radius: 2px;
    }
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
`;

const LoadMoreButton = styled.button`
  display: block;
  width: 60%;
  margin: 1.5rem auto;
  padding: 0.75rem 1.5rem;
  background: rgba(var(--primary-rgb), 0.1);
  color: var(--primary);
  border: 1px solid rgba(var(--primary-rgb), 0.2);
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(var(--primary-rgb), 0.2);
    transform: translateY(-2px);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(var(--danger-rgb), 0.1);
  border-left: 3px solid var(--danger);
  color: var(--textSecondary);
  padding: 1rem;
  margin: 1rem 0;
`;

const NoResultsMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--textSecondary);
  font-style: italic;
  width: 100%;
`;

/**
 * GenreSection Component
 * 
 * Displays a list of genres and anime for the selected genre
 * 
 * @returns {JSX.Element} - GenreSection component
 */
const GenreSection = () => {
  // State for genres
  const [genres, setGenres] = useState([]);
  const [activeGenre, setActiveGenre] = useState("Action");
  const [activeGenreId, setActiveGenreId] = useState(null);
  const [genresLoading, setGenresLoading] = useState(false);
  const [genresError, setGenresError] = useState(null);
  
  // State for anime by genre
  const [genreAnime, setGenreAnime] = useState([]);
  const [genreAnimeLoading, setGenreAnimeLoading] = useState(false);
  const [genreAnimeError, setGenreAnimeError] = useState(null);
  const [genrePagination, setGenrePagination] = useState({
    page: 1,
    limit: 20,
    total: 0, 
    pages: 0
  });
  
  // Fetch genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      setGenresLoading(true);
      setGenresError(null);
      try {
        const response = await genreAPI.getAllGenres({ useCache: true });
        if (response && response.success && Array.isArray(response.data)) {
          setGenres(response.data);
          
          // Find Action genre ID
          const actionGenre = response.data.find(
            genre => typeof genre === 'object' 
              ? genre.name.toLowerCase() === 'action' 
              : genre.toLowerCase() === 'action'
          );
          
          if (actionGenre) {
            const actionId = typeof actionGenre === 'object' 
              ? actionGenre.id || actionGenre._id 
              : null;
              
            if (actionId) {
              setActiveGenreId(actionId);
            }
          }
        } else {
          throw new Error('Failed to fetch genres from API');
        }
      } catch (error) {
        console.error('Error fetching genres:', error);
        setGenresError('Error loading genres. Please try again.');
      } finally {
        setGenresLoading(false);
      }
    };
    
    fetchGenres();
  }, []);
  
  // Fetch anime by genre when active genre changes
  useEffect(() => {
    if (!activeGenre) {
      setGenreAnime([]);
      return;
    }
    
    const fetchAnimeByGenre = async () => {
      setGenreAnimeLoading(true);
      setGenreAnimeError(null);
      
      try {
        // Get the genre ID - either directly if available or extract from the activeGenre object
        const genreId = activeGenreId || (typeof activeGenre === 'object' ? activeGenre.id || activeGenre._id : null);
        
        if (!genreId) {
          throw new Error('Invalid genre ID');
        }
        
        const response = await exploreAPI.getAnimeByGenre(
          genreId, 
          { page: genrePagination.page, limit: genrePagination.limit }
        );
        
        if (response && response.success) {
          // Handle the standardized response format for genre anime
          const animeList = response.data.anime || response.data.items || [];
          const pagination = response.data.pagination || {};
          
          if (genrePagination.page === 1) {
            setGenreAnime(animeList);
          } else {
            setGenreAnime(prev => [...prev, ...animeList]);
          }
          
          // Update pagination if available
          if (pagination) {
            setGenrePagination({
              page: pagination.page || genrePagination.page,
              limit: pagination.limit || genrePagination.limit,
              total: pagination.total || 0,
              pages: pagination.pages || 1
            });
          }
        } else {
          throw new Error(response?.error?.message || `Failed to load anime for ${activeGenre} genre`);
        }
      } catch (error) {
        console.error(`Error fetching anime for genre ${activeGenre}:`, error);
        setGenreAnimeError(`Failed to load anime for ${activeGenre} genre. Please try again.`);
        setGenreAnime([]);
      } finally {
        setGenreAnimeLoading(false);
      }
    };
    
    fetchAnimeByGenre();
  }, [activeGenre, activeGenreId, genrePagination.page, genrePagination.limit]);
  
  // Load more genre anime results
  const loadMoreGenreAnime = () => {
    if (genreAnimeLoading || !activeGenre || genrePagination.page >= genrePagination.pages) {
      return;
    }
    
    setGenrePagination(prev => ({
      ...prev,
      page: prev.page + 1
    }));
  };
  
  // Handle genre selection
  const handleGenreClick = (genreName, genreId) => {
    // If clicking the active genre, deselect it
    if (activeGenreId === genreId) {
      setActiveGenre("Action");
      const actionGenre = genres.find(
        genre => typeof genre === 'object' 
          ? genre.name.toLowerCase() === 'action' 
          : genre.toLowerCase() === 'action'
      );
      
      if (actionGenre) {
        const actionId = typeof actionGenre === 'object' 
          ? actionGenre.id || actionGenre._id 
          : null;
          
        if (actionId) {
          setActiveGenreId(actionId);
        }
      } else {
        setActiveGenreId(null);
      }
      setGenreAnime([]);
      setGenrePagination({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0
      });
      return;
    }
    
    // Otherwise, set the new active genre
    setActiveGenre(genreName);
    setActiveGenreId(genreId);
    setGenreAnime([]);
    setGenrePagination({
      page: 1,
      limit: 20,
      total: 0,
      pages: 0
    });
  };
  
  return (
    <>
      <Section>
        <SectionTitle>
          <List size={22} />
          Genres
        </SectionTitle>
        <GenreContainer>
          {genresLoading ? (
            <div>Loading genres...</div>
          ) : genresError ? (
            <ErrorMessage>{genresError}</ErrorMessage>
          ) : (
            genres.map((genre) => (
              <GenreButton
                key={typeof genre === 'string' ? genre : genre.id || genre._id || genre.name}
                genre={genre}
                active={activeGenre === (typeof genre === 'string' ? genre : genre.name)}
                onClick={handleGenreClick}
                showCount={true}
              />
            ))
          )}
        </GenreContainer>
      </Section>
      
      {/* Genre results section */}
      {activeGenre && (
        <Section id="genre-results">
          <SectionHeader>
            <SectionTitle>
              {activeGenre} Anime
            </SectionTitle>
          </SectionHeader>
          <SectionSubtitle>
            Discover popular {activeGenre} anime
          </SectionSubtitle>
          
          {genreAnimeLoading && genreAnime.length === 0 ? (
            <ShimmerLoader type="grid" count={12} height="260px" />
          ) : genreAnimeError ? (
            <ErrorMessage>{genreAnimeError}</ErrorMessage>
          ) : genreAnime.length === 0 ? (
            <NoResultsMessage>No anime found for the {activeGenre} genre</NoResultsMessage>
          ) : (
            <>
              <CardGrid>
                {genreAnime.map((anime) => (
                  <PlaylistAnimeCard 
                    key={anime._id || anime.malId || anime.animeId} 
                    anime={{
                      id: anime._id || anime.malId || anime.animeId,
                      malId: anime.malId,
                      titles: anime.titles || {
                        english: anime.title,
                        default: anime.title
                      },
                      images: anime.images || {
                        jpg: {
                          image_url: anime.imageUrl || anime.coverImage
                        }
                      },
                      score: anime.score || anime.rating,
                      genres: anime.genres
                    }}
                    isOwner={false}
                    onOpenMAL={() => {}}
                    onDeleteAnime={() => {}}
                  />
                ))}
              </CardGrid>
              {genrePagination.page < genrePagination.pages && (
                <LoadMoreButton 
                  onClick={loadMoreGenreAnime} 
                  disabled={genreAnimeLoading}
                >
                  {genreAnimeLoading ? 'Loading...' : `Load More ${activeGenre} Anime`}
                </LoadMoreButton>
              )}
            </>
          )}
        </Section>
      )}
    </>
  );
};

export default memo(GenreSection); 