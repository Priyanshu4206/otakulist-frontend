import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import exploreAPI from '../../services/modules/exploreAPI';
import ShimmerCard from '../common/ShimmerCard';
import RecommendationCard from '../anime/RecommendationCard';
import { useAuth } from '../../hooks';
import LoginPrompt from '../common/LoginPrompt';

const AnimeGrid = styled.div`
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

const ForYouSection = () => {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Only fetch recommendations if user is authenticated
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await exploreAPI.getPersonalizedRecommendations({ contentType: 'anime', limit: 30, forceRefresh: true });
        if (response.success && response.data) {
          const list = response.data.anime || response.data.items || [];
          setAnimeList(list);
        } else {
          setAnimeList([]);
          setError('No recommendations found.');
        }
      } catch (err) {
        setAnimeList([]);
        setError('Failed to load recommendations.');
        console.error('ForYouSection API error:', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [isAuthenticated]);

  // If user is not authenticated, render login prompt
  if (!isAuthenticated) {
    return (
      <LoginPrompt 
        title="Personalized Recommendations" 
        message="Log in to get anime recommendations tailored just for you based on your preferences and watch history." 
      />
    );
  }

  if (loading) {
    return <AnimeGrid>{Array(8).fill(0).map((_, idx) => <ShimmerCard key={idx} type="anime" />)}</AnimeGrid>;
  }
  
  if (error) {
    return <ErrorMsg>{error}</ErrorMsg>;
  }
  
  if (!animeList.length) {
    return <EmptyMsg>No recommendations found.</EmptyMsg>;
  }
  
  return (
    <AnimeGrid>
      {animeList.map(anime => <RecommendationCard key={anime.id} anime={anime} />)}
    </AnimeGrid>
  );
};

export default ForYouSection; 