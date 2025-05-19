import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { animeAPI } from '../../services/modules';
import { Loader, RefreshCw, CheckCircle, AlertCircle } from 'lucide-react';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  width: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 600;
  color: var(--textPrimary);
`;

const RefreshButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background-color: var(--backgroundLight);
  border: none;
  border-radius: 8px;
  color: var(--textPrimary);
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--backgroundLighter);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const AnimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 1rem;
  }
`;

const AnimeCard = styled.div`
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  background-color: var(--backgroundLight);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.12);
  }
`;

const AnimeImage = styled.div`
  width: 100%;
  height: 280px;
  background-image: url(${props => props.src});
  background-size: cover;
  background-position: center;
  background-color: var(--backgroundLighter);
  
  @media (max-width: 768px) {
    height: 220px;
  }
`;

const AnimeInfo = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const AnimeName = styled.h3`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--textPrimary);
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const AnimeMeta = styled.p`
  font-size: 0.85rem;
  color: var(--textSecondary);
  margin-top: auto;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--backgroundLight);
  border-radius: 12px;
  text-align: center;
`;

const EmptyStateText = styled.p`
  font-size: 1.1rem;
  color: var(--textSecondary);
  margin-top: 1rem;
`;

const CacheStatus = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background-color: ${props => 
    props.fromCache ? 'rgba(var(--info-rgb), 0.1)' : 
    props.notModified ? 'rgba(var(--success-rgb), 0.1)' : 
    props.offlineMode ? 'rgba(var(--warning-rgb), 0.1)' : 'transparent'};
  color: ${props => 
    props.fromCache ? 'var(--info)' : 
    props.notModified ? 'var(--success)' : 
    props.offlineMode ? 'var(--warning)' : 'var(--textSecondary)'};
  padding: 0.4rem 0.8rem;
  border-radius: 6px;
  font-size: 0.85rem;
  font-weight: 500;
  margin-left: auto;
`;

const LoadingIndicator = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 200px;
  width: 100%;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * SeasonalAnimeList component that demonstrates caching with the anime API
 */
const SeasonalAnimeList = () => {
  const [anime, setAnime] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cacheStatus, setCacheStatus] = useState({
    fromCache: false,
    notModified: false,
    offlineMode: false
  });
  const [error, setError] = useState(null);
  
  // Get current season and year
  const getCurrentSeason = () => {
    const date = new Date();
    const month = date.getMonth();
    
    if (month >= 0 && month <= 2) return 'winter';
    if (month >= 3 && month <= 5) return 'spring';
    if (month >= 6 && month <= 8) return 'summer';
    return 'fall';
  };
  
  const currentSeason = getCurrentSeason();
  const currentYear = new Date().getFullYear();
  
  // Function to fetch seasonal anime with caching
  const fetchSeasonalAnime = async (forceRefresh = false) => {
    try {
      setRefreshing(forceRefresh);
      
      // Call the enhanced API with caching options
      const response = await animeAPI.getSeasonal(
        currentSeason,
        currentYear,
        1, // page
        20, // limit
        { 
          useCache: true, 
          forceRefresh 
        }
      );
      
      if (response.success && response.data) {
        setAnime(response.data.results || []);
        
        // Update cache status indicators
        setCacheStatus({
          fromCache: !!response.fromCache,
          notModified: !!response.notModified,
          offlineMode: !!response.offlineMode
        });
      } else {
        setError('Failed to fetch seasonal anime');
      }
    } catch (error) {
      console.error('Error fetching seasonal anime:', error);
      setError('An error occurred while fetching seasonal anime');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };
  
  // Initial data fetch
  useEffect(() => {
    fetchSeasonalAnime();
  }, []);
  
  // Handle manual refresh
  const handleRefresh = () => {
    fetchSeasonalAnime(true);
  };
  
  // Determine cache status message
  const getCacheStatusMessage = () => {
    if (cacheStatus.fromCache && cacheStatus.offlineMode) return 'Using cached data (offline)';
    if (cacheStatus.fromCache) return 'Using cached data';
    if (cacheStatus.notModified) return 'Data unchanged (304)';
    return 'Fresh data';
  };
  
  // Determine cache status icon
  const getCacheStatusIcon = () => {
    if (cacheStatus.offlineMode) return <AlertCircle size={16} />;
    if (cacheStatus.fromCache || cacheStatus.notModified) return <CheckCircle size={16} />;
    return null;
  };
  
  return (
    <Container>
      <Header>
        <Title>{`${currentSeason.charAt(0).toUpperCase() + currentSeason.slice(1)} ${currentYear} Anime`}</Title>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          {!loading && (
            <CacheStatus 
              fromCache={cacheStatus.fromCache} 
              notModified={cacheStatus.notModified}
              offlineMode={cacheStatus.offlineMode}
            >
              {getCacheStatusIcon()}
              {getCacheStatusMessage()}
            </CacheStatus>
          )}
          <RefreshButton onClick={handleRefresh} disabled={refreshing || loading}>
            <RefreshCw size={16} style={{ transform: refreshing ? 'rotate(360deg)' : 'none', transition: 'transform 0.5s' }} />
            {refreshing ? 'Refreshing...' : 'Refresh'}
          </RefreshButton>
        </div>
      </Header>
      
      {loading ? (
        <LoadingIndicator>
          <Loader size={32} />
        </LoadingIndicator>
      ) : error ? (
        <EmptyState>
          <AlertCircle size={48} color="var(--error)" />
          <EmptyStateText>{error}</EmptyStateText>
        </EmptyState>
      ) : anime.length === 0 ? (
        <EmptyState>
          <AlertCircle size={48} color="var(--textSecondary)" />
          <EmptyStateText>No anime found for this season</EmptyStateText>
        </EmptyState>
      ) : (
        <AnimeGrid>
          {anime.map((item) => (
            <AnimeCard key={item.id}>
              <AnimeImage src={item.coverImage || item.image} />
              <AnimeInfo>
                <AnimeName>{item.title}</AnimeName>
                <AnimeMeta>
                  {item.episodes ? `${item.episodes} episodes` : 'TBA'} • {item.status || 'Unknown'}
                </AnimeMeta>
              </AnimeInfo>
            </AnimeCard>
          ))}
        </AnimeGrid>
      )}
    </Container>
  );
};

export default SeasonalAnimeList; 