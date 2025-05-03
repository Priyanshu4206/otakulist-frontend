import { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { PlayCircle, ChevronLeft, ChevronRight, Loader } from 'lucide-react';
import { animeAPI } from '../../services/api';
import useApiCache from '../../hooks/useApiCache';

const EpisodesContainer = styled.div`
  margin: 1.5rem 0;
`;

const EpisodesHeader = styled.div`
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

const EpisodeCount = styled.span`
  color: var(--textSecondary);
  font-size: 0.875rem;
  font-weight: normal;
  margin-left: 0.5rem;
`;

const EpisodesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1rem;
`;

const EpisodeCard = styled.div`
  background-color: var(--cardBackground);
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid var(--borderColor);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }
`;

const EpisodeInfo = styled.div`
  padding: 1rem;
`;

const EpisodeNumber = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--textSecondary);
  margin-bottom: 0.25rem;
`;

const EpisodeTitle = styled.h4`
  font-size: 0.95rem;
  font-weight: 600;
  margin: 0;
  color: var(--textPrimary);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  height: 2.8em;
`;

const EpisodeDate = styled.div`
  font-size: 0.75rem;
  color: var(--textSecondary);
  margin-top: 0.5rem;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: 1.5rem;
  gap: 0.25rem;
`;

const PageButton = styled.button`
  width: 38px;
  height: 38px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.active ? 'var(--tertiary)' : 'var(--cardBackground)'};
  color: ${props => props.active ? 'white' : 'var(--textPrimary)'};
  border: 1px solid ${props => props.active ? 'var(--tertiary)' : 'var(--borderColor)'};
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: ${props => props.active ? '600' : '400'};
  transition: background-color 0.2s ease, color 0.2s ease, border-color 0.2s ease;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--tertiary)' : 'var(--backgroundLight)'};
    border-color: ${props => props.active ? 'var(--tertiary)' : 'var(--tertiary)'};
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${props => props.active ? 'var(--tertiary)' : 'var(--tertiaryLight)'};
  }
  
  &:disabled {
    background-color: var(--backgroundLight);
    color: var(--textSecondary);
    cursor: not-allowed;
    border-color: var(--borderColor);
    opacity: 0.7;
  }
`;

const NavigationButton = styled(PageButton)`
  width: 38px;
`;

const MorePagesButton = styled.button`
  background: none;
  border: none;
  padding: 0 0.5rem;
  color: var(--textSecondary);
  font-size: 0.875rem;
  cursor: pointer;
  
  &:hover {
    color: var(--textPrimary);
  }
  
  &:disabled {
    color: var(--borderColor);
    cursor: not-allowed;
  }
`;

const PagesDropdown = styled.select`
  padding: 0.5rem;
  border-radius: 6px;
  border: 1px solid var(--borderColor);
  background-color: var(--cardBackground);
  color: var(--textPrimary);
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1em;
  padding-right: 2rem;
  
  &:focus {
    outline: none;
    border-color: var(--tertiary);
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
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

const formatDate = (dateString) => {
  if (!dateString) return 'Unknown date';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Unknown date';
  
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const AnimeEpisodes = ({ animeId, totalEpisodes = 0 }) => {
  const [episodes, setEpisodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [paginationButtons, setPaginationButtons] = useState([]);
  
  const MAX_BUTTONS = 7; // Maximum number of page buttons to show
  const { fetchWithCache } = useApiCache('sessionStorage', 30 * 60 * 1000); // 30 minutes
  
  // Calculate pagination when totalPages changes
  const calculatePagination = useCallback((page, total) => {
    let buttons = [];
    
    if (total <= MAX_BUTTONS) {
      // If we have fewer pages than max buttons, show all
      buttons = Array.from({ length: total }, (_, i) => i + 1);
    } else {
      // Always include page 1
      buttons.push(1);
      
      // Calculate start and end for visible buttons
      let startPage = Math.max(2, page - Math.floor((MAX_BUTTONS - 2) / 2));
      let endPage = Math.min(total - 1, startPage + MAX_BUTTONS - 4);
      
      // Adjust if we're near the end
      if (endPage === total - 1) {
        startPage = Math.max(2, endPage - (MAX_BUTTONS - 4));
      }
      
      // Add ellipsis after page 1 if necessary
      if (startPage > 2) {
        buttons.push('ellipsis-start');
      }
      
      // Add middle pages
      for (let i = startPage; i <= endPage; i++) {
        buttons.push(i);
      }
      
      // Add ellipsis before last page if necessary
      if (endPage < total - 1) {
        buttons.push('ellipsis-end');
      }
      
      // Always include last page
      buttons.push(total);
    }
    
    return buttons;
  }, []);
  
  // Fetch episodes
  const fetchEpisodes = useCallback(async (page) => {
    setLoading(true);
    
    try {
      const response = await fetchWithCache(
        `anime_episodes_${animeId}_${page}`,
        () => animeAPI.getAnimeEpisodes(animeId, page)
      );
      
      if (response && response.success) {
        setEpisodes(response.data.episodes || []);
        
        if (response.data.pagination) {
          setTotalPages(response.data.pagination.lastPage || 1);
          setPaginationButtons(calculatePagination(page, response.data.pagination.lastPage || 1));
        } else {
          setTotalPages(1);
          setPaginationButtons([1]);
        }
      } else {
        setError('Failed to load episodes');
      }
    } catch (err) {
      console.error('Error fetching episodes:', err);
      setError('Failed to load episodes');
    } finally {
      setLoading(false);
    }
  }, [animeId, fetchWithCache, calculatePagination]);
  
  useEffect(() => {
    if (animeId) {
      fetchEpisodes(currentPage);
    }
  }, [animeId, currentPage, fetchEpisodes]);
  
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };
  
  const handlePageSelect = (e) => {
    const page = parseInt(e.target.value);
    if (page) {
      handlePageChange(page);
    }
  };
  
  if (loading) {
    return (
      <EpisodesContainer>
        <EpisodesHeader>
          <Title>
            <PlayCircle size={18} /> Episodes
          </Title>
        </EpisodesHeader>
        <LoadingContainer>
          <LoadingIndicator>
            <Loader size={16} className="animate-spin" />
            Loading episodes...
          </LoadingIndicator>
        </LoadingContainer>
      </EpisodesContainer>
    );
  }
  
  if (error) {
    return (
      <EpisodesContainer>
        <EpisodesHeader>
          <Title>
            <PlayCircle size={18} /> Episodes
          </Title>
        </EpisodesHeader>
        <div style={{ padding: '1rem', color: 'var(--error)' }}>
          Error: {error}
        </div>
      </EpisodesContainer>
    );
  }
  
  if (episodes.length === 0) {
    return (
      <EpisodesContainer>
        <EpisodesHeader>
          <Title>
            <PlayCircle size={18} /> Episodes
          </Title>
        </EpisodesHeader>
        <div style={{ padding: '1rem', color: 'var(--textSecondary)' }}>
          No episode information available.
        </div>
      </EpisodesContainer>
    );
  }
  
  return (
    <EpisodesContainer>
      <EpisodesHeader>
        <Title>
          <PlayCircle size={18} /> Episodes
          <EpisodeCount>({totalEpisodes || episodes.length})</EpisodeCount>
        </Title>
      </EpisodesHeader>
      
      <EpisodesGrid>
        {episodes.map((episode) => (
          <EpisodeCard key={episode.id || episode.number}>
            <EpisodeInfo>
              <EpisodeNumber>
                Episode {episode.number}
              </EpisodeNumber>
              <EpisodeTitle title={episode.title}>
                {episode.title || `Episode ${episode.number}`}
              </EpisodeTitle>
              <EpisodeDate>
                {formatDate(episode.aired)}
              </EpisodeDate>
            </EpisodeInfo>
          </EpisodeCard>
        ))}
      </EpisodesGrid>
      
      {totalPages > 1 && (
        <PaginationContainer>
          <NavigationButton
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={16} />
          </NavigationButton>
          
          {paginationButtons.map((button, index) => {
            if (button === 'ellipsis-start') {
              return (
                <MorePagesButton key={`ellipsis-start-${index}`}>
                  {totalPages > 25 ? (
                    <PagesDropdown
                      onChange={handlePageSelect}
                      value=""
                      aria-label="Select page"
                    >
                      <option value="" disabled>...</option>
                      {Array.from(
                        { length: Math.min(20, paginationButtons[index + 1] - 2) },
                        (_, i) => i + 2
                      ).map(page => (
                        <option key={page} value={page}>
                          Page {page}
                        </option>
                      ))}
                    </PagesDropdown>
                  ) : (
                    "..."
                  )}
                </MorePagesButton>
              );
            } else if (button === 'ellipsis-end') {
              return (
                <MorePagesButton key={`ellipsis-end-${index}`}>
                  {totalPages > 25 ? (
                    <PagesDropdown
                      onChange={handlePageSelect}
                      value=""
                      aria-label="Select page"
                    >
                      <option value="" disabled>...</option>
                      {Array.from(
                        { length: Math.min(20, totalPages - paginationButtons[index - 1] - 1) },
                        (_, i) => i + paginationButtons[index - 1] + 1
                      ).map(page => (
                        <option key={page} value={page}>
                          Page {page}
                        </option>
                      ))}
                    </PagesDropdown>
                  ) : (
                    "..."
                  )}
                </MorePagesButton>
              );
            } else {
              return (
                <PageButton
                  key={`page-${button}`}
                  onClick={() => handlePageChange(button)}
                  active={currentPage === button}
                  aria-label={`Page ${button}`}
                  aria-current={currentPage === button ? 'page' : undefined}
                >
                  {button}
                </PageButton>
              );
            }
          })}
          
          <NavigationButton
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={16} />
          </NavigationButton>
        </PaginationContainer>
      )}
    </EpisodesContainer>
  );
};

export default AnimeEpisodes; 