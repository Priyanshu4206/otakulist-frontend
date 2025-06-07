import React, { useEffect, useState, useCallback, memo } from 'react';
import styled from 'styled-components';
import { ListMusic } from 'lucide-react';
import exploreAPI from '../../services/modules/exploreAPI';
import PlaylistCard from '../common/PlaylistCard';
import ShimmerCard from '../common/ShimmerCard';

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  }
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 1rem;
  }
  
  @media (max-width: 480px) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: 0.8rem;
  }
`;

const PlaylistFlexbox = styled.div`
  display: flex;
  gap: 2rem;
  align-items: stretch;
  overflow-x: scroll;
  padding: 0.5rem 0 1.5rem;
  scrollbar-width: none;
  
  &::-webkit-scrollbar {
    height: 8px;
    background: #222;
  }
  
  &::-webkit-scrollbar-thumb {
    background: #888;
    border-radius: 4px;
  }
`;

const ErrorMsg = styled.div`
  color: var(--danger);
  padding: 1rem;
  text-align: center;
  background: rgba(var(--danger-rgb), 0.1);
  border-radius: 8px;
  margin: 1rem 0;
`;

const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  background-color: var(--cardBackground);
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(var(--borderColor-rgb), 0.1);
  grid-column: 1 / -1;
  margin: 1rem 0;
  width: 100%;
`;

const EmptyStateIcon = styled.div`
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1.5rem;
  opacity: 0.7;
`;

const EmptyStateText = styled.p`
  color: var(--textSecondary);
  font-size: 1rem;
  margin: 0;
  max-width: 450px;
`;

// Custom styled wrapper for PlaylistCard in flexbox layout
const FlexCardWrapper = styled.div`
  position: relative;
  background: var(--cardBackground);
  border-radius: 12px;
  overflow: hidden;
  box-shadow: rgba(0, 0, 0, 0.1) 0px 4px 15px;
  transition: 0.3s;
  display: flex;
  flex-direction: column;
  flex: 1;
  min-width: 250px;
  max-width: 250px;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: rgba(0, 0, 0, 0.2) 0px 8px 20px;
  }
  
  /* Override the max-width from the PlaylistCard's CardContainer */
  > div {
    max-width: none;
    width: 100%;
  }
`;

const FlexShimmerWrapper = styled.div`
  flex: 1;
  min-width: 250px;
  max-width: 250px;
`;

const TrendingPlaylistsMainSection = ({ limit = 8, layout = 'grid' }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);

  // Fetch trending playlists
  const fetchTrendingPlaylists = useCallback(async () => {
    // Skip fetch if we already have data and limit hasn't changed
    if (hasAttemptedFetch && playlists.length > 0 && playlists.length === limit) {
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      const response = await exploreAPI.getPublicPlaylists({
        sort: 'popularity',
        limit: limit
      });
      
      if (response.success && response.data) {
        setPlaylists(response.data.items || []);
      } else {
        throw new Error(response.message || 'Failed to fetch playlists');
      }
    } catch (error) {
      console.error('Error fetching trending playlists:', error);
      setError("Error fetching playlists. Please try again later.");
    } finally {
      setLoading(false);
      setHasAttemptedFetch(true);
    }
  }, [limit, hasAttemptedFetch, playlists.length]);
  
  useEffect(() => {
    fetchTrendingPlaylists();
  }, [fetchTrendingPlaylists]);

  // Render loading state
  if (loading) {
    if (layout === 'flexbox') {
      return (
        <PlaylistFlexbox>
          {Array(limit).fill(0).map((_, idx) => (
            <FlexShimmerWrapper key={idx}>
              <ShimmerCard type="playlist" />
            </FlexShimmerWrapper>
          ))}
        </PlaylistFlexbox>
      );
    }
    
    return (
      <PlaylistGrid>
        {Array(limit).fill(0).map((_, idx) => (
          <ShimmerCard key={idx} type="playlist" />
        ))}
      </PlaylistGrid>
    );
  }
  
  // Render error state
  if (error) {
    return <ErrorMsg>{error}</ErrorMsg>;
  }
  
  // Render empty state
  if (!playlists.length) {
    return (
      <EmptyStateWrapper>
        <EmptyStateIcon>
          <ListMusic size={64} />
        </EmptyStateIcon>
        <EmptyStateText>
          No trending playlists found. Create one and be the trendsetter!
        </EmptyStateText>
      </EmptyStateWrapper>
    );
  }
  
  // Render playlists based on layout
  if (layout === 'flexbox') {
    return (
      <PlaylistFlexbox>
        {playlists.map(playlist => (
          <FlexCardWrapper key={playlist.id || playlist._id}>
            <PlaylistCard playlist={playlist} />
          </FlexCardWrapper>
        ))}
      </PlaylistFlexbox>
    );
  }
  
  // Default grid layout
  return (
    <PlaylistGrid>
      {playlists.map(playlist => (
        <PlaylistCard key={playlist.id || playlist._id} playlist={playlist} />
      ))}
    </PlaylistGrid>
  );
};

export default memo(TrendingPlaylistsMainSection); 