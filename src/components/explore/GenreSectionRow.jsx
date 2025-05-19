import React from 'react';
import styled from 'styled-components';
import { Tag } from 'lucide-react';
import ShimmerCard from '../common/ShimmerCard';
import RecommendationCard from '../anime/RecommendationCard';

const GenreSection = styled.div`
  margin-bottom: 2rem;
  max-width: 100%;
  box-sizing: border-box;
`;

const GenreTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--textPrimary);
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const HorizontalScrollGrid = styled.div`
  display: flex;
  flex-direction: row;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 1rem;
  padding-bottom: 0.5rem;
  max-width: 100%;
  box-sizing: border-box;
  &::-webkit-scrollbar {
    height: 6px;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(var(--primary-rgb), 0.3);
    border-radius: 3px;
  }
`;

const Column = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  flex: 0 0 auto;
`;

const CardWrapper = styled.div`
  width: 250px;
  flex: 0 0 auto;
  max-width: 100%;
  box-sizing: border-box;
`;

const getTwoRowChunks = (list) => {
  const half = Math.ceil(list.length / 2);
  const top = list.slice(0, half);
  const bottom = list.slice(half);
  const maxCols = Math.max(top.length, bottom.length);

  const columns = [];
  for (let i = 0; i < maxCols; i++) {
    columns.push([top[i], bottom[i]].filter(Boolean));
  }
  return columns;
};

const GenreSectionRow = React.forwardRef(({ genre, animeList, loading }, ref) => {
  const chunks = loading
    ? Array(6).fill([null, null]) // 3 columns * 2 rows = 6
    : getTwoRowChunks(animeList || []);

  return (
    <GenreSection ref={ref}>
      <GenreTitle>
        <Tag size={18} />
        {genre.name}
      </GenreTitle>
      <HorizontalScrollGrid>
        {chunks.map((pair, colIdx) => (
          <Column key={colIdx}>
            {pair.map((anime, idx) => (
              <CardWrapper key={idx}>
                {loading ? (
                  <ShimmerCard type="anime" />
                ) : (
                  anime && <RecommendationCard anime={anime} />
                )}
              </CardWrapper>
            ))}
          </Column>
        ))}
      </HorizontalScrollGrid>
    </GenreSection>
  );
});

export default GenreSectionRow;
