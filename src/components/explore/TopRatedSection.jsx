import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import exploreAPI from '../../services/modules/exploreAPI';
import AnimeCard from '../common/AnimeCard';
import ShimmerCard from '../common/ShimmerCard';

const AnimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
    gap: 1rem;
  }
`;

const TopRatedSection = () => {
  const [animeList, setAnimeList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await exploreAPI.getTopRatedAnime({ limit: 12, sort: 'score' });
        if (response.success && response.data) {
          setAnimeList(response.data.anime || []);
        }
      } catch (error) {
        setAnimeList([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <AnimeGrid>
      {loading
        ? Array(8).fill(0).map((_, idx) => <ShimmerCard key={idx} type="anime" />)
        : animeList.map(anime => <AnimeCard key={anime.id} anime={anime} />)
      }
    </AnimeGrid>
  );
};

export default TopRatedSection; 