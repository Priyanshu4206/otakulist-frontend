import React, { useEffect, useState } from 'react';
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

const TrendingPlaylistsMainSection = ({ limit = 8 }) => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch trending playlists
  useEffect(() => {
    const fetchTrendingPlaylists = async () => {
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
      }
    };
    fetchTrendingPlaylists();
  }, [limit]);

  if (loading) {
    return (
      <PlaylistGrid>
        {Array(limit).fill(0).map((_, idx) => (
          <ShimmerCard key={idx} type="playlist" />
        ))}
      </PlaylistGrid>
    );
  }
  
  if (error) {
    return <ErrorMsg>{error}</ErrorMsg>;
  }
  
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
  
  return (
    <PlaylistGrid>
      {playlists.map(playlist => (
        <PlaylistCard key={playlist.id || playlist._id} playlist={playlist} />
      ))}
    </PlaylistGrid>
  );
};

export default TrendingPlaylistsMainSection; 