import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import AnimeCard from './AnimeCard';
import { GENRE_DESCRIPTIONS } from '../../constants/genres';
import { getETag, setETag } from '../../services/etagManager';
import { genreAPI } from '../../services/modules';
import { Link } from 'react-router-dom';

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

const ViewAllLink = styled(Link)`
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
  display: flex;
  align-items: center;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 1rem;
  color: var(--textSecondary);
  font-style: italic;
`;

const RetryButton = styled.button`
  background: none;
  border: none;
  color: var(--primary);
  font-weight: 600;
  margin-left: 0.5rem;
  cursor: pointer;
  text-decoration: underline;
  
  &:hover {
    color: var(--primaryDark);
  }
`;

// Limit the number of anime to display in the home page
const ANIME_DISPLAY_LIMIT = 10;

const ExploreGenresSection = () => {
  const [activeGenre, setActiveGenre] = useState(null);
  const [genres, setGenres] = useState([]);
  const [animeList, setAnimeList] = useState([]);
  const [animeLoading, setAnimeLoading] = useState(false);
  const [animeError, setAnimeError] = useState(null);
  const [genresLoading, setGenresLoading] = useState(false);
  const [genresError, setGenresError] = useState(null);
  
  // Ref for the card row to control scrolling
  const cardRowRef = useRef(null);

  // Cache keys for ETag-based caching
  const GENRES_CACHE_KEY = 'all_genres';
  const ANIME_BY_GENRE_CACHE_PREFIX = 'anime_by_genre';

  // Helper to get the ID from a genre object
  const getGenreId = (genre) => {
    return genre?.id || genre?.malId || genre?._id;
  };

  // Helper to generate a consistent cache key for a genre
  const getGenreCacheKey = (genre) => {
    const id = getGenreId(genre);
    return `${ANIME_BY_GENRE_CACHE_PREFIX}_${id}`;
  };

  // Helper to scroll to the beginning of the card row
  const scrollToStart = () => {
    if (cardRowRef.current) {
      cardRowRef.current.scrollLeft = 0;
    }
  };
  
  // Helper to get cached data from localStorage
  const getCachedData = (cacheKey) => {
    try {
      const cachedData = localStorage.getItem(cacheKey);
      return cachedData ? JSON.parse(cachedData) : null;
    } catch (error) {
      console.error('Error retrieving cached data:', error);
      return null;
    }
  };
  
  // Helper to set cached data in localStorage
  const setCachedData = (cacheKey, data) => {
    try {
      localStorage.setItem(cacheKey, JSON.stringify(data));
      localStorage.setItem(`${cacheKey}_timestamp`, Date.now().toString());
    } catch (error) {
      console.error('Error setting cached data:', error);
    }
  };

  // Function to fetch genres - extracted for reusability
  const getGenres = async () => {
    setGenresLoading(true);
    setGenresError(null);
    
    try {
      // Use the genreAPI with ETag support
      const response = await genreAPI.getAllGenres({
        useCache: true,
        forceRefresh: false
      });
      
      if (response.success && response.data) {
        const data = response.data;
        
        if (Array.isArray(data) && data.length > 0) {
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
      } else {
        setGenresError('Failed to fetch genres');
      }
    } catch (err) {
      console.error('Error fetching genres:', err);
      setGenresError('Error fetching genres');
    } finally {
      setGenresLoading(false);
    }
  };
  
  // Fetch genres on mount only
  useEffect(() => {
    let isMounted = true;
    
    const fetchGenres = async () => {
      if (!isMounted) return;
      await getGenres();
    };
    
    fetchGenres();
    
    return () => { isMounted = false; };
  }, []); // No dependencies as we're using the new approach

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
        const etagKey = `${cacheKey}_etag`;
        
        // Get the current ETag if it exists
        const etag = getETag(etagKey);
        
        // Prepare headers for conditional request
        const headers = {};
        if (etag) {
          headers['If-None-Match'] = etag;
        }
        
        // Try to get data from cache first
        const cachedData = getCachedData(cacheKey);
        
        // Make the API request with proper options
        const response = await genreAPI.getAnimeByGenre(genreId, 1, ANIME_DISPLAY_LIMIT);
        
        if (!isMounted) return;
        
        // Handle the response
        let anime = [];
        
        // If we got a 304 Not Modified and have cached data, use the cached data
        if (response.status === 304 && cachedData) {
          anime = cachedData;
        } 
        // Otherwise use the new data from the response
        else if (response.success && response.data) {
          
          // Store the new ETag if present
          const newEtag = response.headers?.etag;
          if (newEtag) {
            setETag(etagKey, newEtag);
          }
          
          // Extract anime from the response
          if (response.data && Array.isArray(response.data.anime)) {
            anime = response.data.anime;
          } else if (Array.isArray(response.data)) {
            anime = response.data;
          }
          
          // Cache the new data
          setCachedData(cacheKey, anime);
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
          
          // Try to use cached data as fallback on error
          const cacheKey = getGenreCacheKey(activeGenre);
          const cachedData = getCachedData(cacheKey);
          
          if (cachedData) {
            setAnimeList(cachedData);
          } else {
            setAnimeError('Failed to load anime for this genre.');
          }
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
  }, [activeGenre]); // Only depend on activeGenre, not fetchAnimeByGenre anymore

  const handleGenreClick = (genre) => {
    if (!activeGenre || (getGenreId(activeGenre) !== getGenreId(genre))) {
      // Set the new active genre
      setActiveGenre(genre);
      
      // Reset any previous errors
      setAnimeError(null);
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
        <div style={{ padding: '1rem 0', color: 'var(--textSecondary)' }}>
          <LoadingIndicator>Loading genres...</LoadingIndicator>
        </div>
      ) : genresError ? (
        <ErrorMessage>
          Error loading genres. 
          <RetryButton onClick={getGenres}>Try again</RetryButton>
        </ErrorMessage>
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
            <ErrorMessage>
              {animeError}
              <RetryButton onClick={() => {
                if (activeGenre) {
                  // Reset error and trigger a fresh fetch
                  setAnimeError(null);
                  // We can reuse handleGenreClick to fetch anime for the current genre
                  handleGenreClick(activeGenre);
                }
              }}>Try again</RetryButton>
            </ErrorMessage>
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