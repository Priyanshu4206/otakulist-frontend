import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styled, { keyframes } from 'styled-components';
import Layout from '../components/layout/Layout';
import AnimeInfo from '../components/anime/AnimeInfo';
import CharactersList from '../components/anime/CharactersList';
import RecommendationsList from '../components/anime/RecommendationsList';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { animeAPI } from '../services/api';
import useApiCache from '../hooks/useApiCache';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const scaleIn = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const shimmer = keyframes`
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
`;

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
  animation: ${fadeIn} 0.6s ease-out;
  
  @media (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const AnimeHeader = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2.5rem;
  margin-bottom: 3rem;
  position: relative;
  
  @media (min-width: 768px) {
    grid-template-columns: 350px 1fr;
  }
`;

const PosterContainer = styled.div`
  position: relative;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  animation: ${scaleIn} 0.7s ease-out;
  height: fit-content;

  &:hover {
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
  }
  
  @media (min-width: 768px) {
    max-width: 350px;
  }
  
  &::before {
    content: '';
    display: block;
    padding-top: 140%;
  }
  
  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: contain;
    transition: transform 0.5s ease;
  }
`;

const ShimmerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0) 0%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0) 100%
  );
  background-size: 200% 100%;
  animation: ${shimmer} 3s infinite linear;
  pointer-events: none;
`;

const AnimeContent = styled.div`
  display: flex;
  flex-direction: column;
  animation: ${fadeIn} 0.8s ease-out;
`;

const AnimeTitle = styled.h1`
  font-size: 2.5rem;
  color: var(--textPrimary);
  margin-bottom: 0.6rem;
  font-weight: 800;
  background: var(--gradientPrimary);
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  
  @media (max-width: 768px) {
    font-size: 1.8rem;
  }
`;

const AlternativeTitles = styled.div`
  margin-bottom: 1.5rem;
  color: var(--textSecondary);
  font-size: 1rem;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  border-left: 4px solid var(--secondary);
  backdrop-filter: blur(5px);
  
  div {
    margin: 0.5rem 0;
  }
`;

const SectionHeading = styled.h2`
  font-size: 1.8rem;
  margin-bottom: 1.2rem;
  position: relative;
  color: var(--textPrimary);
  padding-bottom: 0.6rem;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 60px;
    height: 4px;
    background: var(--gradientSecondary);
    border-radius: 2px;
  }
`;

const Synopsis = styled.div`
  margin: 2rem 0;
  color: var(--textPrimary);
  line-height: 1.8;
  position: relative;
  background-color: var(--cardBackground);
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  animation: ${fadeIn} 0.9s ease-out;
  
  p {
    margin-bottom: 1.2rem;
    font-size: 1.05rem;
  }
`;

const VideoContainer = styled.div`
  position: relative;
  padding-bottom: 56.25%; /* 16:9 Aspect Ratio */
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 15px 25px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 20px 30px rgba(0, 0, 0, 0.3);
  }
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: 0;
  }
`;

const GradientBackground = styled.div`
  position: absolute;
  top: -100px;
  left: 0;
  right: 0;
  height: 500px;
  background: linear-gradient(180deg, var(--backgroundDark) 0%, transparent 100%);
  z-index: -1;
  opacity: 0.6;
`;

const ContentSection = styled.section`
  position: relative;
  margin: 3rem 0;
  animation: ${fadeIn} ${props => props.delay || '0.8s'} ease-out;
  border-radius: 16px;
  overflow: hidden;
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 3rem;
  color: var(--error);
  background-color: var(--cardBackground);
  border-radius: 12px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  max-width: 800px;
  margin: 0 auto;
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 1rem;
  }
`;

const AnimePage = () => {
  const { id } = useParams();
  
  // API cache hooks
  const { 
    loading: animeLoading, 
    error: animeError, 
    fetchWithCache: fetchAnime 
  } = useApiCache('sessionStorage');
  
  const { 
    loading: charactersLoading,
    fetchWithCache: fetchCharacters 
  } = useApiCache('sessionStorage');
  
  const { 
    loading: recommendationsLoading,
    fetchWithCache: fetchRecommendations 
  } = useApiCache('sessionStorage');
  
  // State for anime data
  const [anime, setAnime] = useState(null);
  const [characters, setCharacters] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  
  // Create cache keys
  const animeCacheKey = `anime_${id}`;
  const charactersCacheKey = `anime_${id}_characters`;
  const recommendationsCacheKey = `anime_${id}_recommendations`;
  
  // Fetch anime details
  useEffect(() => {
    const getAnimeDetails = async () => {
      try {
        // Fetch anime details
        const animeResponse = await fetchAnime(
          animeCacheKey,
          () => animeAPI.getAnimeById(id)
        );
        
        // Extract anime data from response
        const animeData = animeResponse.data || animeResponse;
        setAnime(animeData);
        
        // Fetch characters
        try {
          const charactersResponse = await fetchCharacters(
            charactersCacheKey,
            () => animeAPI.getAnimeCharacters(id)
          );
          
          // Extract characters data from response
          const charactersData = charactersResponse.data || charactersResponse || [];
          setCharacters(charactersData);
        } catch (err) {
          console.error('Error fetching anime characters:', err);
          setCharacters([]);
        }
        
        // Fetch recommendations
        try {
          const recommendationsResponse = await fetchRecommendations(
            recommendationsCacheKey,
            () => animeAPI.getAnimeRecommendations(id)
          );
          
          // Extract recommendations data from response
          const recommendationsData = recommendationsResponse.data || recommendationsResponse || [];
          setRecommendations(recommendationsData);
        } catch (err) {
          console.error('Error fetching anime recommendations:', err);
          setRecommendations([]);
        }
      } catch (err) {
        console.error('Error fetching anime details:', err);
      }
    };
    
    getAnimeDetails();
  }, [id, fetchAnime, fetchCharacters, fetchRecommendations]);
  
  // Show loading spinner when anime details are loading
  if (animeLoading && !anime) {
    return (
      <Layout>
        <LoadingSpinner fullScreen />
      </Layout>
    );
  }
  
  // Show error message if anime details failed to load
  if (animeError) {
    return (
      <Layout>
        <ErrorMessage>
          <h3>Error loading anime details</h3>
          <p>{animeError}</p>
        </ErrorMessage>
      </Layout>
    );
  }
  
  return (
    <Layout>
      <GradientBackground />
      <PageContainer>
        {anime && (
          <>
            <AnimeHeader>
              <PosterContainer>
                <img 
                  src={
                    anime.images?.jpg?.largeImageUrl || 
                    anime.images?.jpg?.large_image_url || 
                    anime.images?.jpg?.imageUrl || 
                    anime.images?.jpg?.image_url || 
                    anime.images?.webp?.largeImageUrl || 
                    anime.images?.webp?.large_image_url || 
                    'https://via.placeholder.com/225x350?text=No+Image'
                  } 
                  alt={anime.title || anime.titles?.default} 
                />
                <ShimmerOverlay />
              </PosterContainer>
              
              <AnimeContent>
                <AnimeTitle>{anime.titles?.english || anime.titles?.default || anime.title_english || anime.title}</AnimeTitle>
                
                <AlternativeTitles>
                  {/* Handle different title formats */}
                  {anime.title_japanese && <div>Japanese: {anime.title_japanese}</div>}
                  {anime.titles?.japanese && <div>Japanese: {anime.titles.japanese}</div>}
                  
                  {anime.title_english && anime.title_english !== anime.title && (
                    <div>English: {anime.title_english}</div>
                  )}
                  {anime.titles?.english && anime.titles.english !== anime.titles?.default && (
                    <div>English: {anime.titles.english}</div>
                  )}
                  
                  {/* Handle synonyms - format from MAL API */}
                  {anime.title_synonyms && anime.title_synonyms.length > 0 && (
                    <div>Also known as: {anime.title_synonyms.join(', ')}</div>
                  )}
                  {/* Handle synonyms - format from our backend */}
                  {anime.titles?.synonyms && anime.titles.synonyms.length > 0 && (
                    <div>Also known as: {anime.titles.synonyms.join(', ')}</div>
                  )}
                </AlternativeTitles>
                
                <AnimeInfo anime={anime} />
              </AnimeContent>
            </AnimeHeader>
            
            <Synopsis>
              <SectionHeading>Synopsis</SectionHeading>
              <p>{anime.synopsis}</p>
            </Synopsis>
            
            {/* Display trailer if available directly from the anime object */}
            {(anime.trailer?.youtubeId || anime.trailer?.youtube_id) && (
              <ContentSection delay="1s">
                <SectionHeading>Trailer</SectionHeading>
                <VideoContainer>
                  <iframe
                    src={`https://www.youtube.com/embed/${anime.trailer?.youtubeId || anime.trailer?.youtube_id}`}
                    title={`${anime.titles?.english || anime.titles?.default || anime.title} Trailer`}
                    allowFullScreen
                  />
                </VideoContainer>
              </ContentSection>
            )}
            
            {/* Display characters with their loading state */}
            {!charactersLoading && characters.length > 0 && (
              <ContentSection delay="1.1s">
                <CharactersList characters={characters} />
              </ContentSection>
            )}
            
            {/* Display recommendations with their loading state */}
            {!recommendationsLoading && recommendations.length > 0 && (
              <ContentSection delay="1.2s">
                <RecommendationsList recommendations={recommendations} />
              </ContentSection>
            )}
          </>
        )}
      </PageContainer>
    </Layout>
  );
};

export default AnimePage; 