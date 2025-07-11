import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import exploreAPI from '../../services/modules/exploreAPI';
import ShimmerCard from '../common/ShimmerCard';
import RecommendationCard from '../anime/RecommendationCard';

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

const SeasonPreviewSection = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const response = await exploreAPI.getSeasonalAnime({ season: 'spring', year: 2025, limit: 50 });
        if (response.success && response.data) {
          const list = response.data.anime || response.data.items || [];
          setAnimeList(list);
        } else {
          setAnimeList([]);
          setError('No seasonal anime found.');
        }
      } catch (err) {
        setAnimeList([]);
        setError('Failed to load seasonal anime.');
        console.error('SeasonPreviewSection API error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <AnimeGrid>{Array(8).fill(0).map((_, idx) => <ShimmerCard key={idx} type="anime" />)}</AnimeGrid>;
  }
  if (error) {
    return <ErrorMsg>{error}</ErrorMsg>;
  }
  if (!animeList.length) {
    return <EmptyMsg>No seasonal anime found.</EmptyMsg>;
  }
  return (
    <AnimeGrid>
      {animeList.map(anime => <RecommendationCard key={anime.id} anime={anime} />)}
    </AnimeGrid>
  );
};

export default SeasonPreviewSection; 