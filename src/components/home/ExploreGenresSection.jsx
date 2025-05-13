import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import AnimeCard from './AnimeCard';
import useApiCache from '../../hooks/useApiCache';
import { genreAPI } from '../../services/api';
import { GENRE_DESCRIPTIONS } from '../../constants/genres';

const Section = styled.section`
  width: 100%;
  margin-top: 2rem;
  margin-bottom: 2.5rem;
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1.5rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--textPrimary);
  position: relative;
  
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
`;

const Description = styled.p`
  color: var(--textSecondary);
  font-size: 0.95rem;
  margin-top: 0.5rem;
  margin-bottom: 1.5rem;
  max-width: 80%;
`;

const GenreRow = styled.div`
  display: flex;
  gap: 0.75rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  padding-bottom: 0.5rem;
`;

const GenreButton = styled.button`
  background: ${({ active }) => (active ? 'var(--gradientPrimary)' : 'var(--background)')};
  color: ${({ active }) => (active ? 'var(--textPrimary)' : 'var(--textSecondary)')};
  border: 1.5px solid ${({ active }) => (active ? 'var(--primaryLight)' : 'var(--borderColor)')};
  border-radius: 8px;
  padding: 0.75rem 1.2rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: ${({ active }) => (active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none')};
  
  &:hover {
    background: var(--gradientAccent);
    color: var(--textPrimary);
    border-color: var(--primaryLight);
    transform: translateY(-2px);
  }
  
  &:active {
    transform: translateY(0);
  }

  @media (max-width: 768px) {
    padding: 0.5rem 1rem;
    font-size: 0.875rem;
  }
`;

const CardRowContainer = styled.div`
  position: relative;
`;

const CardRow = styled.div`
  display: flex;
  gap: 1.5rem;
  overflow-x: auto;
  padding: 1rem 0;
  scroll-snap-type: x mandatory;
  scroll-behavior: smooth;
  
  &::-webkit-scrollbar {
    height: 6px;
    background: rgba(60, 60, 60, 0.1);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--primaryLight);
    border-radius: 3px;
  }
`;

const ViewAllLink = styled.a`
  color: var(--primaryLight);
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  display: flex;
  align-items: center;
  transition: color 0.2s;
  
  &:hover {
    color: var(--primary);
    text-decoration: underline;
  }
  
  &::after {
    content: '→';
    margin-left: 6px;
    transition: transform 0.2s;
  }
  
  &:hover::after {
    transform: translateX(3px);
  }
`;

const shimmer = keyframes`
  0% { background-position: -400px 0; }
  100% { background-position: 400px 0; }
`;

const ShimmerCard = styled.div`
  width: 260px;
  min-width: 260px;
  max-width: 320px;
  height: 340px;
  border-radius: 16px;
  background: #222;
  position: relative;
  overflow: hidden;
  margin-right: 1.5rem;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  
  &::after {
    content: '';
    display: block;
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: linear-gradient(90deg, rgba(34,34,34,0.9) 0%, rgba(60,60,60,0.2) 50%, rgba(34,34,34,0.9) 100%);
    animation: ${shimmer} 1.2s infinite;
    z-index: 2;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--textSecondary);
  width: 100%;
  
  p {
    margin-bottom: 1rem;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(255, 100, 100, 0.1);
  border-left: 3px solid rgba(255, 100, 100, 0.5);
  padding: 1rem;
  color: var(--textSecondary);
  margin: 1rem 0;
`;

// Limit the number of anime to display in the home page
const ANIME_DISPLAY_LIMIT = 10;

const ExploreGenresSection = () => {
  const [activeGenre, setActiveGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const [animeList, setAnimeList] = useState([]);
  const [animeLoading, setAnimeLoading] = useState(false);
  const [animeError, setAnimeError] = useState(null);
  
  // Ref for the card row to control scrolling
  const cardRowRef = useRef(null);

  // 30 days in ms for genre list
  const THIRTY_DAYS = 30 * 24 * 60 * 60 * 1000;
  // 2 days in ms for anime by genre
  const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;

  const { fetchWithCache: fetchGenres, loading: genresLoading, error: genresError } = useApiCache('localStorage', THIRTY_DAYS);
  const { fetchWithCache: fetchAnimeByGenre } = useApiCache('localStorage', TWO_DAYS);

  // Helper to get the ID from a genre object
  const getGenreId = (genre) => {
    return genre?.id || genre?.malId || genre?._id;
  };

  // Helper to generate a consistent cache key for a genre
  const getGenreCacheKey = (genre) => {
    const id = getGenreId(genre);
    return `anime_by_genre_${id}`;
  };

  // Helper to scroll to the beginning of the card row
  const scrollToStart = () => {
    if (cardRowRef.current) {
      cardRowRef.current.scrollLeft = 0;
    }
  };

  // Fetch genres on mount only
  useEffect(() => {
    let isMounted = true;
    
    const getGenres = async () => {
      try {
        const data = await fetchGenres('all_genres', genreAPI.getAllGenres);
        if (isMounted && Array.isArray(data) && data.length > 0) {
          if (window.innerWidth > 768) {
            setGenres(data.slice(0, 8));
          } else {
            setGenres(data.slice(0, 5));
          }
          // Only set active genre if not already set
          if (!activeGenre) {
            setActiveGenre(data[0]);
          }
        }
      } catch (err) {
        console.error('Error fetching genres:', err);
      }
    };
    
    getGenres();
    
    return () => { isMounted = false; };
  }, [fetchGenres]); // Only depend on fetchGenres, not activeGenre

  // Fetch anime when active genre changes
  useEffect(() => {
    if (!activeGenre) return;
    
    let isMounted = true;
    
    const fetchAnimeData = async () => {
      setAnimeLoading(true);
      setAnimeError(null);
      setAnimeList([]);
      
      try {
        const genreId = getGenreId(activeGenre);
        const cacheKey = getGenreCacheKey(activeGenre);
        
        const data = await fetchAnimeByGenre(
          cacheKey,
          () => genreAPI.getAnimeByGenre(genreId, { limit: ANIME_DISPLAY_LIMIT })
        );
        
        if (!isMounted) return;
        
        let anime = [];
        if (data && Array.isArray(data.anime)) {
          anime = data.anime;
        } else if (Array.isArray(data)) {
          anime = data;
        }
        
        // Sort by rank if available
        anime.sort((a, b) => {
          if (a.rank && b.rank) return a.rank - b.rank;
          if (a.rank) return -1;
          if (b.rank) return 1;
          return 0;
        });
        
        // Limit the number of anime displayed
        anime = anime.slice(0, ANIME_DISPLAY_LIMIT);
        
        setAnimeList(anime);
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching anime:', err);
          setAnimeError('Failed to load anime for this genre.');
        }
      } finally {
        if (isMounted) {
          setAnimeLoading(false);
        }
      }
    };
    
    // Scroll back to the beginning
    scrollToStart();
    
    // Fetch anime for the new genre
    fetchAnimeData();
    
    return () => { isMounted = false; };
  }, [activeGenre, fetchAnimeByGenre]);

  const handleGenreClick = (genre) => {
    if (!activeGenre || (getGenreId(activeGenre) !== getGenreId(genre))) {
      // Set the new active genre
      setActiveGenre(genre);
    }
  };

  // Get description for the current genre
  const getGenreDescription = () => {
    if (!activeGenre) return '';
    return GENRE_DESCRIPTIONS[activeGenre.name] || 
           `Explore the best anime in the ${activeGenre.name} genre.`;
  };

  return (
    <Section>
      <TitleContainer>
        <Title>Explore genres</Title>
        {
          window.innerWidth > 768 && (
            <ViewAllLink href="/genres">View More</ViewAllLink>
          )
        }
      </TitleContainer>
      
      {activeGenre && (
        <Description>{getGenreDescription()}</Description>
      )}
      
      {genresLoading ? (
        <div>Loading genres...</div>
      ) : genresError ? (
        <ErrorMessage>Error loading genres. Please try again later.</ErrorMessage>
      ) : (
        <GenreRow>
          {genres.map((genre) => (
            <GenreButton
              key={getGenreId(genre)}
              active={activeGenre && getGenreId(activeGenre) === getGenreId(genre)}
              onClick={() => handleGenreClick(genre)}
            >
              {genre.name}
            </GenreButton>
          ))}
          {
            window.innerWidth < 768 && (
              <ViewAllLink href="/genres">View all genres</ViewAllLink>
            )
          }
        </GenreRow>
      )}
      
      <CardRowContainer>
        <CardRow ref={cardRowRef}>
          {animeLoading ? (
            // Show 4 shimmer cards as placeholders
            Array.from({ length: 4 }).map((_, idx) => <ShimmerCard key={idx} />)
          ) : animeError ? (
            <ErrorMessage>{animeError}</ErrorMessage>
          ) : animeList.length === 0 ? (
            <EmptyState>
              <p>No anime found for this genre.</p>
              <GenreButton onClick={() => genres.length > 0 && handleGenreClick(genres[0])}>
                Try another genre
              </GenreButton>
            </EmptyState>
          ) : (
            animeList.map((anime) => (
              <AnimeCard 
                key={anime.malId || anime.id || anime._id} 
                anime={anime} 
              />
            ))
          )}
        </CardRow>
      </CardRowContainer>
    </Section>
  );
};

export default ExploreGenresSection;