import React, { useEffect, useState, useCallback, memo } from 'react';
import styled from 'styled-components';
import { ListMusic } from 'lucide-react';
import ShimmerCard from '../common/ShimmerCard';
import { exploreAPI } from '../../services/modules';
import TrendingPlaylistCard from './TrendingPlaylistCard';

const Container = styled.div`
    margin-bottom: 2rem;
`;

const Title = styled.h2`
    font-size: 1.5rem;
    margin-bottom: 1rem;
`;  

const PlaylistsContainer = styled.div`
  display: flex;
  flex-direction: row;
  gap: 0.5rem;
  overflow-x: auto;
  padding: 2rem 0;
  scrollbar-width: thin;
  scrollbar-color: #888 #222;
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
  width: 100%;
`;

const EmptyStateWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  background-color: var(--cardBackground);
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(var(--borderColor-rgb), 0.1);
  width: 100%;
`;

const EmptyStateIcon = styled.div`
  font-size: 2.5rem;
  color: var(--primary);
  margin-bottom: 1rem;
  opacity: 0.7;
`;

const EmptyStateText = styled.p`
  color: var(--textSecondary);
  font-size: 0.95rem;
  margin: 0;
`;

const TrendingPlaylistsSection = () => {
    const [playlists, setPlaylists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [hasAttemptedFetch, setHasAttemptedFetch] = useState(false);
  
    // Fetch trending playlists (right section)
    const fetchTrendingPlaylists = useCallback(async () => {
      // Prevent multiple fetch attempts if we already have data
      if (hasAttemptedFetch && playlists.length > 0) {
        return;
      }
      
      try {
        setLoading(true);
        const response = await exploreAPI.getPublicPlaylists({
          sort: 'popularity',
          limit: 5
        });
        if (response.success && response.data) {
          setPlaylists(response.data.items || []);
        }
      } catch (error) {
        setError("Error fetching playlists. Please try again later.");
        console.error('Error fetching trending playlists:', error);
      } finally {
        setLoading(false);
        setHasAttemptedFetch(true);
      }
    }, [hasAttemptedFetch, playlists.length]);
    
    useEffect(() => {
      fetchTrendingPlaylists();
    }, [fetchTrendingPlaylists]);
  
    if (loading) {
        return (
            <Container>
                <Title>Trending Playlists</Title> 
                <PlaylistsContainer>
                  {Array(5).fill(0).map((_, idx) => <ShimmerCard key={idx} type="playlist" />)}
                </PlaylistsContainer>
            </Container>
        );
    }
    
    if (error) {
        return (
            <Container>
                <Title>Trending Playlists</Title> 
                <PlaylistsContainer>
                    <ErrorMsg>{error}</ErrorMsg>
                </PlaylistsContainer>
            </Container>
        );
    }
    
    return (
        <Container>
            <Title>Trending Playlists</Title>
            <PlaylistsContainer>
              {playlists.length > 0 ? (
                playlists.map(playlist => <TrendingPlaylistCard key={playlist._id} playlist={playlist} />)
              ) : (
                <EmptyStateWrapper>
                  <EmptyStateIcon>
                  <ListMusic size={48} />
                  </EmptyStateIcon>
                  <EmptyStateText>No trending playlists found. Check back later or create your own!</EmptyStateText>
                </EmptyStateWrapper>
              )}
            </PlaylistsContainer>
        </Container>
    );
};

export default memo(TrendingPlaylistsSection);