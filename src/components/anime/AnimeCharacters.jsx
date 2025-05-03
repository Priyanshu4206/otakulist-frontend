import { useState, useEffect, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { UserRound, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { characterAPI } from '../../services/api';
import useApiCache from '../../hooks/useApiCache';

const CharactersContainer = styled.div`
  margin: 1.5rem 0;
`;

const CharactersHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h3`
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--textPrimary);
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CharacterCount = styled.span`
  color: var(--textSecondary);
  font-size: 0.875rem;
  font-weight: normal;
  margin-left: 0.5rem;
`;

const ScrollContainer = styled.div`
  position: relative;
`;

const CharactersList = styled.div`
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0;
  scrollbar-width: thin;
  scroll-behavior: smooth;
  
  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    height: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: var(--backgroundLight);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: var(--borderColor);
    border-radius: 4px;
  }
  
  &::-webkit-scrollbar-thumb:hover {
    background: var(--textSecondary);
  }
`;

const CharacterCard = styled.div`
  width: 140px;
  flex-shrink: 0;
  border-radius: 8px;
  overflow: hidden;
  background-color: var(--cardBackground);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--borderColor);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const CharacterImage = styled.div`
  width: 100%;
  height: 190px;
  background-color: var(--backgroundLight);
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--backgroundLight);
  color: var(--textSecondary);
`;

const CharacterInfo = styled.div`
  padding: 0.75rem;
`;

const CharacterName = styled.h4`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: var(--textPrimary);
`;

const CharacterRole = styled.div`
  font-size: 0.75rem;
  color: ${props => 
    props.role === 'Main' 
      ? 'var(--tertiary)' 
      : props.role === 'Supporting' 
        ? 'var(--secondary)' 
        : 'var(--textSecondary)'
  };
  font-weight: ${props => props.role === 'Main' ? '600' : '400'};
`;

const ScrollButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction === 'left' ? 'left: -10px' : 'right: -10px'};
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: var(--cardBackground);
  border: 1px solid var(--borderColor);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 2;
  opacity: ${props => props.visible ? '1' : '0'};
  pointer-events: ${props => props.visible ? 'auto' : 'none'};
  transition: opacity 0.2s ease, background-color 0.2s ease;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: var(--backgroundLight);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px var(--tertiary);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 230px;
  width: 100%;
  color: var(--textSecondary);
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--textSecondary);
  font-size: 0.875rem;
`;

const LoadMoreButton = styled.button`
  margin: 1rem auto;
  padding: 0.5rem 1rem;
  background-color: var(--tertiaryLight);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.875rem;
  transition: background-color 0.2s ease;
  
  &:hover {
    background-color: var(--tertiary);
  }
  
  &:disabled {
    background-color: var(--borderColor);
    cursor: not-allowed;
  }
`;

const AnimeCharacters = ({ animeId }) => {
  const [characters, setCharacters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  
  const charactersListRef = useRef(null);
  const { fetchWithCache } = useApiCache('sessionStorage', 30 * 60 * 1000); // 30 minutes
  
  // Fetch characters
  const fetchCharacters = useCallback(async (pageNum = 1) => {
    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }
    
    try {
      const response = await fetchWithCache(
        `anime_characters_${animeId}_${pageNum}`,
        () => characterAPI.getCharactersByAnime(animeId, pageNum)
      );
      
      if (response && response.success) {
        if (pageNum === 1) {
          setCharacters(response.data);
        } else {
          setCharacters(prev => [...prev, ...response.data]);
        }
        
        if (response.pagination) {
          setTotalCount(response.pagination.total || 0);
          setHasMore(response.pagination.page < response.pagination.pages);
        } else {
          setHasMore(false);
        }
      } else {
        setError('Failed to load characters');
      }
    } catch (err) {
      console.error('Error fetching characters:', err);
      setError('Failed to load characters');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [animeId, fetchWithCache]);
  
  useEffect(() => {
    if (animeId) {
      fetchCharacters(1);
    }
  }, [animeId, fetchCharacters]);
  
  const handleLoadMore = () => {
    if (hasMore && !loadingMore) {
      setPage(prev => prev + 1);
      fetchCharacters(page + 1);
    }
  };
  
  // Handle scroll buttons visibility
  const checkScrollPosition = useCallback(() => {
    if (!charactersListRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = charactersListRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
  }, []);
  
  useEffect(() => {
    const listElement = charactersListRef.current;
    if (listElement) {
      listElement.addEventListener('scroll', checkScrollPosition);
      // Initial check
      checkScrollPosition();
      
      return () => {
        listElement.removeEventListener('scroll', checkScrollPosition);
      };
    }
  }, [checkScrollPosition, characters]);
  
  const handleScroll = (direction) => {
    if (!charactersListRef.current) return;
    
    const scrollAmount = 440; // Approximate width of 3 cards
    const currentScroll = charactersListRef.current.scrollLeft;
    
    charactersListRef.current.scrollTo({
      left: direction === 'left' ? currentScroll - scrollAmount : currentScroll + scrollAmount,
      behavior: 'smooth'
    });
  };
  
  if (loading) {
    return (
      <CharactersContainer>
        <CharactersHeader>
          <Title>
            <UserRound size={18} /> Characters
          </Title>
        </CharactersHeader>
        <LoadingContainer>
          <LoadingIndicator>
            <Loader size={16} className="animate-spin" />
            Loading characters...
          </LoadingIndicator>
        </LoadingContainer>
      </CharactersContainer>
    );
  }
  
  if (error) {
    return (
      <CharactersContainer>
        <CharactersHeader>
          <Title>
            <UserRound size={18} /> Characters
          </Title>
        </CharactersHeader>
        <div style={{ padding: '1rem', color: 'var(--error)' }}>
          Error: {error}
        </div>
      </CharactersContainer>
    );
  }
  
  if (characters.length === 0) {
    return (
      <CharactersContainer>
        <CharactersHeader>
          <Title>
            <UserRound size={18} /> Characters
          </Title>
        </CharactersHeader>
        <div style={{ padding: '1rem', color: 'var(--textSecondary)' }}>
          No character information available.
        </div>
      </CharactersContainer>
    );
  }
  
  return (
    <CharactersContainer>
      <CharactersHeader>
        <Title>
          <UserRound size={18} /> Characters
          <CharacterCount>({totalCount})</CharacterCount>
        </Title>
      </CharactersHeader>
      
      <ScrollContainer>
        <ScrollButton 
          direction="left"
          visible={canScrollLeft}
          onClick={() => handleScroll('left')}
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </ScrollButton>
        
        <CharactersList ref={charactersListRef} onScroll={checkScrollPosition}>
          {characters.map((character) => (
            <CharacterCard key={character.id}>
              <CharacterImage>
                {character.image ? (
                  <img 
                    src={character.image} 
                    alt={character.name} 
                    loading="lazy"
                  />
                ) : (
                  <ImagePlaceholder>
                    <UserRound size={40} />
                  </ImagePlaceholder>
                )}
              </CharacterImage>
              <CharacterInfo>
                <CharacterName title={character.name}>
                  {character.name}
                </CharacterName>
                <CharacterRole role={character.role}>
                  {character.role}
                </CharacterRole>
              </CharacterInfo>
            </CharacterCard>
          ))}
        </CharactersList>
        
        <ScrollButton 
          direction="right"
          visible={canScrollRight}
          onClick={() => handleScroll('right')}
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </ScrollButton>
      </ScrollContainer>
      
      {hasMore && (
        <LoadMoreButton 
          onClick={handleLoadMore} 
          disabled={loadingMore}
        >
          {loadingMore ? (
            <>
              <Loader size={14} className="animate-spin" />
              Loading more...
            </>
          ) : (
            <>Show more characters</>
          )}
        </LoadMoreButton>
      )}
    </CharactersContainer>
  );
};

export default AnimeCharacters; 