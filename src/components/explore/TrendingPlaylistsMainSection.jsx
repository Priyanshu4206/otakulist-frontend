import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import exploreAPI from '../../services/modules/exploreAPI';
import PlaylistCard from '../common/PlaylistCard';
import ShimmerCard from '../common/ShimmerCard';

const PlaylistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
`;
const ErrorMsg = styled.div`
  color: var(--danger);
  padding: 1rem;
  text-align: center;
`;
const EmptyMsg = styled.div`
  color: var(--textSecondary);
  padding: 1rem;
  text-align: center;
`;

const TrendingPlaylistsMainSection = () => {
  const [playlists, setPlaylists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Fetch trending playlists (right section)
  useEffect(() => {
    const fetchTrendingPlaylists = async () => {
      try {
        setLoading(true);
        const response = await exploreAPI.getPublicPlaylists({
          sort: 'popularity',
          limit: 50
        });
        
        if (response.success && response.data) {
          setPlaylists(response.data.items || []);
        }
      } catch (error) {
        setError("Error Fetching Playlists");
        console.error('Error fetching trending playlists:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTrendingPlaylists();
  }, []);

  if (loading) {
    return <PlaylistGrid>{Array(8).fill(0).map((_, idx) => <ShimmerCard key={idx} type="playlist" />)}</PlaylistGrid>;
  }
  if (error) {
    return <ErrorMsg>{error}</ErrorMsg>;
  }
  if (!playlists.length) {
    return <EmptyMsg>No playlists found.</EmptyMsg>;
  }
  return (
    <PlaylistGrid>
      {playlists.map(playlist => <PlaylistCard key={playlist.id} playlist={playlist} />)}
    </PlaylistGrid>
  );
};

export default TrendingPlaylistsMainSection; 