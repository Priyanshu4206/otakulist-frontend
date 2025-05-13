import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const AnimeCardContainer = styled(Link)`
  position: relative;
  width: 260px;
  min-width: 260px;
  max-width: 320px;
  height: 340px;
  border-radius: 16px;
  overflow: hidden;
  color: white;
  scroll-snap-align: start;
  background: #000;
  animation: fadeInCard 0.7s cubic-bezier(0.23, 1, 0.32, 1);
  transition: transform 0.3s;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: url(${({ image }) => image}) center/cover no-repeat;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 12px 25px rgba(var(--primary-rgb), 0.2);
  }
`;

const Overlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(to top, rgba(0,0,0,0.62) 15%, rgba(0,0,0,0.1) 100%);
  z-index: 1;
`;

const CardContent = styled.div`
  position: relative;
  z-index: 2;
  padding: 1.1rem 1rem 1.1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
`;

const AnimeTitle = styled.div`
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--textPrimary);
  line-height: 1.2;
  min-height: 2.2em;
  margin-bottom: 0.2rem;
`;

const TypeBadge = styled.span`
  display: inline-block;
  background: var(--primaryDark);
  color: var(--textPrimary);
  font-size: 0.8rem;
  font-weight: 600;
  border-radius: 6px;
  padding: 0.18rem 0.7rem;
  margin-bottom: 0.2rem;
  margin-right: 0.5rem;
`;

const FloatingBadge = styled.span`
  position: absolute;
  top: 1rem;
  font-size: 0.93rem;
  font-weight: 700;
  border-radius: 6px;
  padding: 0.13rem 0.7rem;
  z-index: 3;
`;

const RankBadge = styled(FloatingBadge)`
  left: 1rem;
  background: var(--primaryDark);
  color: #fff;
`;

const ScoreBadge = styled(FloatingBadge)`
  right: 1rem;
  background: var(--primaryDark);
  color: #fff;
`;

const GenresRow = styled.div`
  display: flex;
  gap: 0.3rem;
  margin-bottom: 0.2rem;
  flex-wrap: nowrap;
  overflow: hidden;
  width: 100%;
`;

const GenreChip = styled.span`
  background: var(--accentDark);
  color: var(--textSecondary);
  font-size: 0.78rem;
  font-weight: 500;
  border-radius: 5px;
  padding: 0.25rem 0.6rem;
  white-space: nowrap;
`;

const FALLBACK_IMAGE = '/images/fallback-anime.png';

const getAnimeImage = (anime) =>
  anime?.images?.jpg?.largeImageUrl || anime?.images?.jpg?.imageUrl || anime?.images?.jpg?.image_url || anime?.img || anime?.image_url || FALLBACK_IMAGE;

const getAnimeTitle = (anime) =>
  anime?.titles?.english || anime?.title_english || anime?.title || anime?.titles?.default || anime?.name || 'Untitled';

const getAnimeId = (anime) => anime?.malId || anime?.id || anime?._id;

const getAnimeYear = (anime) => anime?.year || (anime?.aired?.from ? new Date(anime.aired.from).getFullYear() : null);

const getAnimeScore = (anime) => anime?.score || anime?.rating || null;

const getAnimeGenres = (anime) => {
  if (Array.isArray(anime?.genres) && anime.genres.length > 0) {
    return anime.genres.map(g => g.name);
  }
  return [];
};

// Maximum number of genres to show before using "+n" chip
const MAX_VISIBLE_GENRES = 2;

const AnimeCard = ({ anime }) => {
  const genres = getAnimeGenres(anime);
  
  // Use simple slicing instead of DOM manipulation
  const visibleGenres = genres.slice(0, MAX_VISIBLE_GENRES);
  const extraCount = Math.max(0, genres.length - MAX_VISIBLE_GENRES);

  return (
    <AnimeCardContainer to={`/anime/${getAnimeId(anime)}`} image={getAnimeImage(anime)}>
      <Overlay />
      {typeof anime.rank === 'number' && <RankBadge>#{anime.rank}</RankBadge>}
      {getAnimeScore(anime) && <ScoreBadge>⭐ {getAnimeScore(anime)}</ScoreBadge>}
      <CardContent>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 2 }}>
          {anime.type && <TypeBadge>{anime.type}</TypeBadge>}
          {getAnimeYear(anime) && <span>{getAnimeYear(anime)}</span>}
        </div>
        <AnimeTitle>{getAnimeTitle(anime)}</AnimeTitle>
        <GenresRow>
          {visibleGenres.map((genre, idx) => (
            <GenreChip key={`${genre}-${idx}`}>{genre}</GenreChip>
          ))}
          {extraCount > 0 && <GenreChip>+{extraCount}</GenreChip>}
        </GenresRow>
      </CardContent>
    </AnimeCardContainer>
  );
};

export default AnimeCard;