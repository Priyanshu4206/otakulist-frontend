import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
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
`;
const EmptyMsg = styled.div`
  color: var(--textSecondary);
  padding: 1rem;
  text-align: center;
`;

const TrendingPlaylistsSection = () => {
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
            limit: 5
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
        return (
            <Container>
                  <Title>Trending Playlists</Title> 
                  <PlaylistsContainer>
                  <PlaylistsContainer>{Array(8).fill(0).map((_, idx) => <ShimmerCard height='1rem' key={idx} type="playlist" />)}</PlaylistsContainer>
                  </PlaylistsContainer>
              </Container>
          )
    }
    if (error) {
        return (
            <Container>
                  <Title>Trending Playlists</Title> 
                  <PlaylistsContainer>
                      <ErrorMsg>{error}</ErrorMsg>
                  </PlaylistsContainer>
              </Container>
          )
        }
    return (
        <Container>
            <Title>Trending Playlists</Title>
            <PlaylistsContainer>
              {playlists.length !== 0 ? 
                playlists.map(playlist => <TrendingPlaylistCard key={playlist._id} playlist={playlist} />)
                : <EmptyMsg>No playlists found.</EmptyMsg>
              }
            </PlaylistsContainer>
        </Container>
    );
};

export default TrendingPlaylistsSection;