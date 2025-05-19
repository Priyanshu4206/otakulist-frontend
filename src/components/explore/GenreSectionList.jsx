import React, { useEffect, useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import genreAPI from '../../services/modules/genreAPI';
import exploreAPI from '../../services/modules/exploreAPI';
import GenreSectionRow from './GenreSectionRow';

const GenreListContainer = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const GenreSectionList = () => {
  const [genres, setGenres] = useState([]);
  const [visibleGenres, setVisibleGenres] = useState(2);
  const [animeByGenre, setAnimeByGenre] = useState({});
  const [loadingGenres, setLoadingGenres] = useState(false);
  const [loadingAnime, setLoadingAnime] = useState({});
  const lastGenreSectionRef = useRef(null);

  // Fetch all genres on mount
  useEffect(() => {
    const fetchGenres = async () => {
      setLoadingGenres(true);
      try {
        const response = await genreAPI.getAllGenres();
        if (response.success && response.data) {
          setGenres(response.data);
        }
      } catch (error) {
        console.log("Error", error);
      } finally {
        setLoadingGenres(false);
      }
    };
    fetchGenres();
  }, []);

  // Fetch anime for a genre
  const fetchAnimeForGenre = useCallback(async (genre) => {
    if (!genre || animeByGenre[genre.id] || loadingAnime[genre.id]) return;
    setLoadingAnime(prev => ({ ...prev, [genre.id]: true }));
    try {
      const response = await exploreAPI.getAnimeByGenre(genre.id, { limit: 20 });
      if (response.success && response.data) {
        setAnimeByGenre(prev => ({ ...prev, [genre.id]: response.data.anime || [] }));
      }
    } catch (error) {
      // handle error
      console.log("Error", error);
    } finally {
      setLoadingAnime(prev => ({ ...prev, [genre.id]: false }));
    }
  }, [animeByGenre, loadingAnime]);

  // Load initial genres' anime
  useEffect(() => {
    genres.slice(0, visibleGenres).forEach(genre => {
      fetchAnimeForGenre(genre);
    });
  }, [genres, visibleGenres, fetchAnimeForGenre]);

  // Lazy load more genres when last visible genre is in view
  useEffect(() => {
    if (genres.length <= visibleGenres) return;
    const observer = new window.IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setVisibleGenres(prev => prev + 2);
      }
    }, { threshold: 0.1 });
    if (lastGenreSectionRef.current) {
      observer.observe(lastGenreSectionRef.current);
    }
    return () => observer.disconnect();
  }, [genres, visibleGenres]);

  if (loadingGenres) {
    return (
      <GenreListContainer>
        {Array(2).fill(0).map((_, idx) => (
          <GenreSectionRow key={idx} genre={{ name: 'Loading...' }} animeList={[]} loading />
        ))}
      </GenreListContainer>
    );
  }

  return (
    <GenreListContainer>
      {genres.slice(0, visibleGenres).map((genre, idx) => (
        <GenreSectionRow
          key={genre.id}
          genre={genre}
          animeList={animeByGenre[genre.id] || []}
          loading={loadingAnime[genre.id]}
          ref={idx === visibleGenres - 1 ? lastGenreSectionRef : null}
        />
      ))}
    </GenreListContainer>
  );
};

export default GenreSectionList; 